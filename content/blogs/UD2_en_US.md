---
title = "Underneath Docker (1): Isolate Everything"
created = 2023-08-03
license = "CC BY 4.0"
---

> **Prerequisites**: C Programming Language

In [Underneath Docker (1)](#UD01_en_US,md), we have an isolated filesystem for the command we run. Now, let's isolate everything.

### PID Namespace

Let's recap the namespaces and its flags first:

| Isolation  | Linux namespace       | `clone` flag    |
| ---------- | --------------------- | --------------- |
| Filesystem | **Mount Namespace**   | `CLONE_NEWNS`   |
| Process    | **PID Namespace**     | `CLONE_NEWPID`  |
| User       | **User Namespace**    | `CLONE_NEWUSER` |
| IPC        | **IPC Namespace**     | `CLONE_NEWIPC`  |
| Network    | **Network Namespace** | `CLONE_NEWNET`  |
| Hostname   | **UTS Namespace**     | `CLONE_NEWUTS`  |

We set the corresponding flags all at once first:

```c
// main.c

// create new namespaces
int clone_flags = CLONE_NEWNS | CLONE_NEWPID | CLONE_NEWUSER | CLONE_NEWIPC | CLONE_NEWNET | CLONE_NEWUTS | SIGCHLD;
```

The introduction of `CLONE_NEWUSER` eliminate the need of sudo when using `mini-container`, which brings a lot of convenience.

In addition to `CLONE_NEWPID` flag, we have to mount the processes into the filesystem at `/proc` as well.

Since everything is a file in Linux, programs like `ps` accesses process information by reading files under `/proc`. But how to let `/proc` be filled with process information?

The answer is, just like mounting a disk to some point, we mount the process table with `mount()`. With this syscall: 

```c
// main.c

mount("proc", "/proc", "proc", 0, "");
```

the processes information would be automatically loaded into `/proc`!

But, we have to mount it under the new filesystem, so `mount` should place after we `chroot` and `chdir`.

```c
// main.c

// mount "./rootfs" as filesystem root
if (chroot("rootfs") < 0)
    ERR("chroot failed!");

// change directory to "/"
if (chdir("/") < 0)
    ERR("chdir failed!\n");
    
// mount processes to "/proc"
if (mount("proc", "/proc", "proc", 0, "") < 0)
    ERR("mount failed!\n");
```

At this point, you can copy `/bin/ps` and its dependencies into `rootfs`'s corresponding directory.

Let's try:

```bash
$ ./mini-container /bin/bash
bash-5.2$ ps aux
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
65534          1  0.0  0.0   3924  3112 ?        S    03:25   0:00 /bin/bash
65534          2  0.0  0.0   8044  3776 ?        R+   03:25   0:00 ps aux
```

Now we have a clear process view. We have an initial process `/bin/bash` with PID 1, and the `ps` we run with PID 2.

### User Namespace

Let's first copy all the utilities we need to verify the namespaces first. We need `hostname` for UTS namespace, `ip` for network namespace, `ipcs` / `ipcmk` / `ipcrm` for IPC namespace, and `id` for user namespace.

Now we have a filesystem tree like this. **Just for reference, things are different on various distros and architecture**:

```
rootfs
├── bin
│   ├── bash
│   ├── hostname
│   ├── id
│   ├── ip
│   ├── ipcmk
│   ├── ipcrm
│   ├── ipcs
│   ├── ls
│   └── ps
├── lib
│   ├── aarch64-linux-gnu
│   │   ├── libbpf.so.1
│   │   ├── libbsd.so.0
│   │   ├── libcap.so.2
│   │   ├── libc.so.6
│   │   ├── libelf.so.1
│   │   ├── libgcrypt.so.20
│   │   ├── libgpg-error.so.0
│   │   ├── liblz4.so.1
│   │   ├── liblzma.so.5
│   │   ├── libmd.so.0
│   │   ├── libmnl.so.0
│   │   ├── libpcre2-8.so.0
│   │   ├── libproc2.so.0
│   │   ├── libselinux.so.1
│   │   ├── libsystemd.so.0
│   │   ├── libtinfo.so.6
│   │   ├── libz.so.1
│   │   └── libzstd.so.1
│   └── ld-linux-aarch64.so.1
└── proc
```

Let's find out whether the namespaces are working.

First is IPC. Let's add a message to queue outside the container:

```bash
$ ipcmk -Q
Message queue id: 2
$ ipcs

------ Message Queues --------
key        msqid      owner      perms      used-bytes   messages    
0xcec0c0ac 2          endaytrer  644        0            0           

------ Shared Memory Segments --------
key        shmid      owner      perms      bytes      nattch     status      

------ Semaphore Arrays --------
key        semid      owner      perms      nsems
```

Let's see if we can see the message inside the container:

```bash
bash-5.2$ ipcs

------ Message Queues --------
key        msqid      owner      perms      used-bytes   messages    

------ Shared Memory Segments --------
key        shmid      owner      perms      bytes      nattch     status      

------ Semaphore Arrays --------
key        semid      owner      perms      nsems  
```

The message disappears! When you quit the container, you can see the message again. That is to say, the IPC namespace is successfully isolated.

It is simple to see if network namespace is isolated: just use `ip link`:

Outside the container:

```
$ ip link
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
2: enp0s1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP mode DEFAULT group default qlen 1000
    link/ether 72:40:9b:62:9a:b1 brd ff:ff:ff:ff:ff:ff
```

We can see both loopback interface `lo` and other NICs `enp0s1` here, but inside the container:

```
bash-5.2$ ip link
1: lo: <LOOPBACK> mtu 65536 qdisc noop state DOWN mode DEFAULT group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
```

We can only see the loopback interface `lo`.

Next, let's see if user namespace is isolated:

Outside the container:

```
$ id
uid=1000(endaytrer) gid=1000(endaytrer) groups=1000(endaytrer),27(sudo)
```

Inside the container:

```
bash-5.2$ id  
uid=65534 gid=65534 groups=65534
```

We have a different group of `uid` and `gid`, and that's what we want to see.

Finally, the hostname namespace. Let us change the hostname inside the container:

```
bash-5.2$ hostname container
hostname: you must be root to change the host name
```

Since we have uid `65534` in the container which is not root (0), we cannot change hostname! We cannot change, so after we create the user namespace, we have to set the user to 0 (root) **in the parent process**.

In every process we created, we have two **mappings**: `uid_map` and `gid_map` that make it possible for a user in the host to be mapped to a different user inside the namespace. They maps a user (or a group) of host to a different user in container. If you map a ordinary user to root in container, you effectively get root privilege in the container.

Since everything is a file in Linux, the mappings are stored in the process directory: `/proc/$pid/uid_map` and `/proc/$pid/gid_map`. Notice that the `pid` here are the PID **outside the namespace**, so we must use the PID returned by `clone`: PID returned by `getpid` inside container will always be 1, since PID is isolated. Here is the way to find the correspondent files:

```c
int pid;
if ((pid = clone(child, stack_top, clone_flags, (void *)(argv + 1))) < 0)
    ERR("Clone failed!\n");

// parent process

// update uid / gid map in child;
char uid_map_path[MAX_PATH_LEN];
char gid_map_path[MAX_PATH_LEN];
snprintf(uid_map_path, MAP_FIXED_NOREPLACE, "/proc/%ld/uid_map", pid);
snprintf(gid_map_path, MAP_FIXED_NOREPLACE, "/proc/%ld/gid_map", pid);
```

Those files have the same format:

```
dst_id_1	src_id_1	size_1
dst_id_2	src_id_2	size_2
```

We write destination uid/gid first, then source uid/gid, then the size of mapping range (in this case, 1). Multiple mappings are seperated by new lines; uid/gid and size are separated by other whitespaces.

You can edit those files in any way you like, here is my approach:

```c
// map.h

#ifndef __MAP_H__
#define __MAP_H__
#include <stdlib.h>
#include <stdint.h>

typedef struct {
    uid_t dst_id;
    uid_t src_id;
    uint32_t size;
} map_t;

void update_map(map_t mapping[], size_t mapsize, const char *mappath);

#endif
```

```c
// map.c

#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>

#include "map.h"
void update_map(map_t mapping[], size_t mapsize, const char *mappath) {
    FILE *fs = fopen(mappath, "w");
    for (size_t i = 0; i < mapsize; i++) {
        fprintf(fs, "%ld %ld %ld\n", mapping[i].dst_id, mapping[i].src_id, mapping[i].size);
    }
    fclose(fs);
}
```

```c
// main.c

map_t uid_map = {
    .dst_id = 0,
    .src_id = getuid(),
    .size = 1
};
map_t gid_map = {
    .dst_id = 0,
    .src_id = getgid(),
    .size = 1
};


update_map(&uid_map, 1, uid_map_path);
update_map(&gid_map, 1, gid_map_path);
    
```

I defined a struct to store mapping data, and use `getuid()`, `getgid()` to retrieve uid/gid.

Since we've added a new source file, let's modify the makefile to inclue `map.o`:

```makefile
# Makefile

OBJS = main.o map.o
```

Let's try if we can use root privileges now:

```
$ ./mini-container /bin/bash
bash-5.2#
```

First thing to notice is that the prompting `$` turns into a `#`! That indicates we are the root now. Let's try to modify the hostname:

```
bash-5.2# hostname
bar
bash-5.2# hostname foo
bash-5.2# hostname
foo
```

Let's try if UTC namespace is correctly isolated by the way:

```bash
bash-5.2# hostname
foo
bash-5.2# exit
exit
$ hostname
bar
```

### Set-GID Capability

We didn't tried to view UID and GID yet, so let's use `id` to verify that.:

```bash
$ ./mini-container /bin/bash
bash-5.2# id
uid=0 gid=65534 groups=65534
```

We successfully set UID = 1, but GID is not set! Let's run the container with root:

```bash
$ sudo ./mini-container /bin/bash
bash-5.2# id
uid=0 gid=0 groups=0,65534
```

It works if we run the container with root. But, considering that we have seperated the user namespaces, why would this happen?

A non-root process can establish a new user namespace and set a mapping in `/proc/pid/uid_map` that maps its own UID in the parent namespace to any UID in the new namespace. This allows the process to have a sort of "root" inside the namespace. However, the process is only allowed to specify its own UID in this mapping.

But for GID, a process without the `CAP_SETGID` capability (like a regular user) cannot write to `/proc/pid/gid_map`. This is a security precaution, ensuring that a user without appropriate permissions can't change its GID in a way that would allow it to gain access to group-owned resources outside its own namespace. But, if the process in the new user namespace has been given the `CAP_SETGID` capability (relative to its namespace), it can write to its own `/proc/pid/gid_map`.

Linux set up this protection since user namespace isolation are not necessarily coupled with mounting namespace, thus the new user might modify the files owned by other people in the group, which is not intended.

Granting the executable with `CAP_SETGID` capability is going to help, but **there might be unintentional security risks in the program, so don't use it in production, or with containers that have programs you don't trust.** Thus, I keep the gid unchanged here.

(p.s. I've tried to change it, but my filesystem is corrupted :( )

