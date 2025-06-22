---
title = "Underneath Docker (1): Isolated Filesystem"
created = 2023-08-02
license = "CC BY 4.0"
---

> **Prerequisites**: C Programming Language

In [Underneath Docker (0)](#UD1_en_US,md), we successfully implemented a program to run other programs, but there is no isolations so far. So this time, we will implement the basis of all isolations: **isolated filesystem**.

### Cleanup & Makefile

We are left with a messy code base from episode 0, so let's make it more like a formal project. 

First, let's add a **Makefile**, so that we can avoid typing `gcc -o main main.c` all the time.

```makefile
# Makefile
CC = gcc
LD = gcc
CFLAGS = -g -O0

OBJS = main.o
TARGET = mini-container

.PHONY: all clean

all: $(TARGET)

$(TARGET): $(OBJS)
	$(LD) $(LDFLAGS) -o $@ $(OBJS)

%.o: %.c
	$(CC) $(CFLAGS) -c -o $@ $^

clean:
	rm -f $(TARGET) $(OBJS)
```

This is a pretty standard C makefile, but for those who is not familiar with makefiles, here is a glimpse about how makefile works.

First off, we use `XX = y`to define aliases, so whenever you see `$(XX)`, replace it with `y`. We have not defined `LDFLAGS` yet, so `$(LDFLAGS)` is left empty.

The basic syntax other than alias definition, a.k.a "rules", is like this:

```makefile
target: dependency list
	commands to build target
```

Which means:

> In order to build `target`, build `dependency list` using rules recursively. then, execute the `commands to build target` below it to build target.

And there are two more aliases not explained yet: `$@` and `$^`, simply means `target` and `dependency list` respectively.

`%` in `target` and `dependency list` means **wildcard**, and they must represent exactly the same thing in `target` and `dependency list`.

So, the rule `$(TARGET): $(OBJS)` can be explained as:

> In order to build `mini-container`, build `main.o` first.

Then `make` tries to find rules to make `main.o`. We have not defined rules like `main.o: main.c`, but we have a wildcard `%.o: %.c`, so it tries to find the C file with same prefix `main.c`. After expanding the aliases, the rule translate into:

> In order to build `main.o`, build `main.c` first. then, execute `gcc -g -O0 -c -o main.o main.c`.

Since we have `main.c` in the project directory, we do not need rules to build it. It then use the command after it to make `main.o`.

After having `main.o`, we can finally make `mini-container`, a.k.a. the `TARGET`, since we have all dependencies fulfilled. The `command to build target` part of the rule `$(TARGET): $(OBJS)`  is:

```bash
gcc -o mini-container main.o
```

The very first `.PHONY` means, the items in `dependency list` are not real files that we need to build. So, we are not building a file called `all` or `clean`, we are just building all targets, or cleaning the output of building. `.PHONY` is also not a target to build, not even a rule.

The last thing to mention is that by default, using `make` builds the very first rule in makefile. in this case, the first rule to build is `all`, which has dependency `$(TARGET)`, or `mini-container`.

#### Refactoring

We use a lot of error procedures in last episode: printing error, then return -1. We can use a macro to make it simpler.

```c
#define ERR(msg) \
do { \
    fprintf(stderr, msg);\
    return -1; \
} while (0)
```

We use a `do ... while(0)` wrapper, so that it can be treat like one single sentence. So, this can be used after `if`, even if there are no braces surround it. I did not add a semicolon after `while(0)`, so that we have to add it after `ERR`, making it feels more like a function.

```c
if (argc <= 1)
    ERR("Usage: mini-container PROGRAM [args]\n");    
```

Since we've learned the principles, we don't need those `printf`s for debugging anymore. Now, we have a clean codebase.

```c
// main.c
#define _GNU_SOURCE
#include <sched.h>
#include <stdint.h>
#include <sys/mman.h>
#include <unistd.h>
#include <sys/wait.h>
#include <stdlib.h>
#include <stdio.h>
#define STACK_SIZE 0x100000

#define ERR(msg) \
do { \
    fprintf(stderr, msg);\
    return -1; \
} while (0)


int child(void *arg) {
    char **argv = (char **)arg;
    execv(argv[0], argv);
    ERR("Exec failed!\n");
}

int main(int argc, char *argv[]) {
    if (argc <= 1)
        ERR("Usage: mini-container PROGRAM [args]\n");
    
    void *child_stack = mmap(NULL, STACK_SIZE, PROT_READ | PROT_WRITE, MAP_PRIVATE | MAP_ANONYMOUS | MAP_STACK, -1, 0);
    
    if (child_stack == MAP_FAILED)
        ERR("Mmap failed!\n");
    
    void *stack_top = (void *)((uint64_t)child_stack + STACK_SIZE);
    int clone_flags = SIGCHLD;
    int pid;

    if ((pid = clone(child, stack_top, clone_flags, (void *)(argv + 1))) < 0)
        ERR("Clone failed!\n");
    
    // parent process
    if (wait(NULL) < 0)
        ERR("Wait failed!\n");
    
    return 0;
}
```

### Isolated Mounting Namespace

We have introduced **6 isolations** in last episode: **filesystem**, **process**, **user**, **IPC**, **network**, **hostname**. Their namespaces and flags in `clone` syscall is listed below:

| Isolation  | Linux namespace       | `clone` flag    |
| ---------- | --------------------- | --------------- |
| Filesystem | **Mount Namespace**   | `CLONE_NEWNS`   |
| Process    | **PID Namespace**     | `CLONE_NEWPID`  |
| User       | **User Namespace**    | `CLONE_NEWUSER` |
| IPC        | **IPC Namespace**     | `CLONE_NEWIPC`  |
| Network    | **Network Namespace** | `CLONE_NEWNET`  |
| Hostname   | **UTS Namespace**     | `CLONE_NEWUTS`  |

Let's first add a new mount namespace to `clone` call:

```c
// main.c
int clone_flags = CLONE_NEWNS | SIGCHLD;
int pid = clone(child, stack_top, clone_flags, (void *)(argv + 1));
```

Now, we need `sudo` privilege to run our program, since new namespaces are not allowed to be created without `root`.

```bash
$ make
gcc -g -O0 -c -o main.o main.c
gcc  -o mini-container main.o
$ sudo ./mini-container /bin/ps aux
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.2 178136 11576 ?        Ss   Aug11   0:07 /sbin/init
root           2  0.0  0.0      0     0 ?        S    Aug11   0:00 [kthreadd]
root           3  0.0  0.0      0     0 ?        I<   Aug11   0:00 [rcu_gp]
root           4  0.0  0.0      0     0 ?        I<   Aug11   0:00 [rcu_par_gp]
root           5  0.0  0.0      0     0 ?        I<   Aug11   0:00 [slub_flushwq]
root           6  0.0  0.0      0     0 ?        I<   Aug11   0:00 [netns]
root          10  0.0  0.0      0     0 ?        I<   Aug11   0:00 [mm_percpu_wq]
...
root       81780  0.0  0.1  10728  4216 pts/2    S+   07:50   0:00 sudo ./mini-container /bin/ps aux
root       81781  0.0  0.0  10728   484 pts/3    Ss   07:50   0:00 sudo ./mini-container /bin/ps aux
root       81782  0.0  0.0   3084   752 pts/3    S+   07:50   0:00 ./mini-container /bin/ps aux
root       81783  0.0  0.1  11268  4448 pts/3    R+   07:50   0:00 /bin/ps aux
```

We have set up a new namespace, but we did not change anything. let's change its filesystem mounting point to `./rootfs` using `chroot()`. One more step is to change the directory to root `/` using `chdir`, otherwise the present working directory cannot be found in our new `rootfs`

```shell
$ mkdir rootfs
```

```c
// main.c
int child(void *arg) {
    // mount "./rootfs" as filesystem root
    if (chroot("rootfs") < 0)
        ERR("chroot failed!");

    // change directory to "/"
    if (chdir("/") < 0)
        ERR("chdir failed!");
        
    char **argv = (char **)arg;
    execv(argv[0], argv);
    ERR("Exec failed!\n");
}
```

Let's try again.

```bash
$ sudo ./mini-container /bin/ps aux
Exec failed!
```

We cannot call exec anymore! The reason is that we have changed our filesystem root to an empty directory, and it cannot find `/bin/ps` anymore. To keep it simple, we will run `/bin/bash` and `/bin/ls`instead of `/bin/ps`, Let's fix that by adding all the necessary files of `/bin/bash` and `/bin/ls`.

```bash
$ mkdir -p rootfs/bin
$ sudo cp /bin/bash /bin/ls rootfs/bin/
```

To find the shared library dependencies, use `ldd`:

```bash
$ ldd rootfs/bin/bash
        linux-vdso.so.1 (0x0000ffff9a665000)
        libtinfo.so.6 => /lib/aarch64-linux-gnu/libtinfo.so.6 (0x0000ffff9a460000)
        libc.so.6 => /lib/aarch64-linux-gnu/libc.so.6 (0x0000ffff9a2b0000)
        /lib/ld-linux-aarch64.so.1 (0x0000ffff9a628000)
```

第一行所展示的`linux-vdso.so.1`是一个虚拟的共享库, 并不再实际的文件系统中存在, 我们只需要处理其他的共享库即可.

`linux-vdso.so.1` shown in first line is a virtual shared library, which does not exist in real filesystems. We only have to deal with the remaining shared libraries.

Notice that libraries in different architecture and distributions have different locations. Copy and paste all dependencies in corresponding place in `rootfs/`. **Don't copy these commands, write on your own.**

```bash
$ mkdir -p rootfs/bin rootfs/lib rootfs/lib/aarch64-linux-gnu
$ sudo cp /lib/aarch64-linux-gnu/libtinfo.so.6 \
	/lib/aarch64-linux-gnu/libc.so.6 \
	/lib/aarch64-linux-gnu/libselinux.so.1 \
	/lib/aarch64-linux-gnu/libpcre2-8.so.0 \
	rootfs/lib/aarch64-linux-gnu/
$ sudo cp /lib/ld-linux-aarch64.so.1 rootfs/lib/
```

Now `bash` and `ls` works!

```bash
$ make
gcc -g -O0 -c -o main.o main.c
gcc  -o mini-container main.o
$ sudo ./mini-container /bin/bash
bash-5.2# ls
bin  lib
bash-5.2# ls -alh
total 16K
drwxr-xr-x 4 1000 1000 4.0K Aug 14 13:00 .
drwxr-xr-x 4 1000 1000 4.0K Aug 14 13:00 ..
drwxr-xr-x 2 1000 1000 4.0K Aug 14 13:01 bin
drwxr-xr-x 3 1000 1000 4.0K Aug 14 13:07 lib
bash-5.2# 
```

Here is the code of filesystem isolation:

```c
// main.c
#define _GNU_SOURCE
#include <sched.h>
#include <stdint.h>
#include <sys/mman.h>
#include <unistd.h>
#include <sys/wait.h>
#include <stdlib.h>
#include <stdio.h>
#define STACK_SIZE 0x100000

#define ERR(msg) \
do { \
    fprintf(stderr, msg);\
    return -1; \
} while (0)


int child(void *arg) {
    // mount "./rootfs" as filesystem root
    if (chroot("rootfs") < 0)
        ERR("chroot failed!");

    // change directory to "/"
    if (chdir("/") < 0)
        ERR("chdir failed!");

    char **argv = (char **)arg;
    execv(argv[0], argv);
    ERR("Exec failed!\n");
}

int main(int argc, char *argv[]) {
    if (argc <= 1)
        ERR("Usage: mini-container PROGRAM [args]\n");
    
    void *child_stack = mmap(NULL, STACK_SIZE, PROT_READ | PROT_WRITE, MAP_PRIVATE | MAP_ANONYMOUS | MAP_STACK, -1, 0);
    
    if (child_stack == MAP_FAILED)
        ERR("Mmap failed!\n");
    
    void *stack_top = (void *)((uint64_t)child_stack + STACK_SIZE);
    // create new mount namespace
    int clone_flags = CLONE_NEWNS | SIGCHLD;
    int pid;

    if ((pid = clone(child, stack_top, clone_flags, (void *)(argv + 1))) < 0) {
        printf("%d\n", pid);
        ERR("Clone failed!\n");
    }
    
    // parent process
    if (wait(NULL) < 0)
        ERR("Wait failed!\n");
    
    return 0;
}
```

Now we have a working isolated filesystem. In next episode, let's make it more isolated using other namespaces!

