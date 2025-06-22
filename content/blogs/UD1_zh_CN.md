---
title = "Underneath Docker (1): Isolated Filesystem (中文)"
created = 2023-08-02
lang = "zh-Hans"
license = "CC BY 4.0"
---

> **Prerequisites**: C Programming Language

在 [Underneath Docker (0)](#UD1_zh_CN,md) 中, 我们已经成功实现了一个运行其他程序的程序, 但我们还未实现任何的隔离. 这次, 我们将实现所有隔离环境的基础: **隔离文件系统**.

### Cleanup & Makefile

上一遍我们遗留下了一个挺乱的codebase, 让我们把它变得更像一个正式的项目吧.

首先添加一个**Makefile**, 这样我们就不用一遍一遍地使用`gcc -o main main.c`了.

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

这是一个挺标准的C makefile, 但如果你对makefiles不熟悉, 以下会对makefile的原理做一个简单的介绍.

首先, 我们使用`XX = y`的语法来定义别名. 在之后所有的`$(XX)`你只要将其替换为`y`即可. 我们并没有定义`LDFLAGS`, 那么将`$(LDFLAGS)`替换为空即可.

Makefile剩下的部分称为规则. 规则基本的语法是这样的:

```makefile
target: dependency list
	commands to build target
```

这个是什么意思呢?

> 为了去build `target`, 我们先要递归地使用规则, 去build `dependency list`中的每一项. 然后, 执行`commands to build target`中的所有命令去build `target`.

介绍了规则之后, 在这个makefile中剩下的两个别名就很好理解了: `$@`代表build目标`target`, `@^`代表依赖列表`dependency list`.

`%`在`target` 和 `dependency list`中代表**通配符**, 它们在两处匹配相同的字符串.

我们来模拟一个make规则的执行: `$(TARGET): $(OBJS)` . 这个规则可解释为:

> 为了去build `mini-container`, 我们先要build `main.o`.

现在, `make`指令会尝试去build `main.o`. 虽然我们并没有定义形似`main.o: main.c`这样的规则, 但是我们有一个通配符规则: `%.o: %.c`. 这时候, `make`就会去找通配符同样匹配`main`的c源代码: `main.c`. 这样我们就有一条合适的make `main.o`的规则. 让我们继续把别名展开, 这条规则就可以翻译为:

> 为了去build `main.o`, 我们先要build `main.c`. 然后, 执行 `gcc -g -O0 -c -o main.o main.c`.

我们已经有`main.c`文件了, 所以不需要任何规则去build它, 只需要执行`gcc -g -O0 -c -o main.o main.c`就可以了; 这样我们就有了`main.o`.

此后, 我们满足了`$(TARGET): $(OBJS)`的所有依赖列表, 接下来就可以去build`mini-container`, 即`TARGET`了. Makefile中这条规则对应的build命令展开如下: 

```bash
gcc -o mini-container main.o
```

这样, 我们就通过makefile的方式, 自动化了编译连接的过程.

Makefile一开始的`.PHONY`的含义是, 其依赖列表中的所有目标并不是真实存在的、需要build的文件, 而仅仅是一个名字. 所以, 我们并不是要build一个叫all或者clean的文件, 我们只是要build所有目标, 或者清除build出来的二进制文件. `.PHONY`本身也不是一个要build的目标, 甚至这都不是一条规则.

最后要提的一点是, 使用make指令会默认去make Makefile中第一条规则; 在这里, 这个规则是`all: $(TARGET)`, 即需要build `mini-container`.

#### Refactoring

在上一章中, 我们使用了很多的错误处理流程: 往stderr中打印错误, 然后返回-1. 我们可以使用宏定义来简化我们的代码.

```c
#define ERR(msg) \
do { \
    fprintf(stderr, msg);\
    return -1; \
} while (0)
```

我们用`do ... while(0)`来包装它, 这样的话中间的内容就可以被当成一句语句, 以被用在没有大括号的if语句之后. 我并没有在while(0)后加入分号, 这样我们就必须在`ERR()`后加入, 让它更像一个函数调用一些.

```c
if (argc <= 1)
    ERR("Usage: mini-container PROGRAM [args]\n");    
```

在我们已经了解到这些原理之后, 这些用于调试的`printf`已经不再被需要了. 现在, codebase变得更加整洁了.

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

上次介绍了为达到容器化所需要的六大系统的隔离: **文件系统**、**进程空间**、**用户空间**、**IPC**、**网络栈**、**主机名**. 他们对应的namespace和clone syscall标志位如下:

| 隔离系统   | namespace                            | `clone` 标志位  |
| ---------- | ------------------------------------ | --------------- |
| Filesystem | 挂载视图命名空间 **Mount Namespace** | `CLONE_NEWNS`   |
| Process    | 进程ID命名空间  **PID Namespace**    | `CLONE_NEWPID`  |
| User       | 用户组命名空间 **User Namespace**    | `CLONE_NEWUSER` |
| IPC        | 进程间通讯命名空间 **IPC Namespace** | `CLONE_NEWIPC`  |
| Network    | 网络栈命名空间 **Network Namespace** | `CLONE_NEWNET`  |
| Hostname   | UTS命名空间 **UTS Namespace**        | `CLONE_NEWUTS`  |

Let's first add a new mount namespace to `clone` call:

首先, 我们在clone中加入`CLONE_NEWNS`标志位:

```c
// main.c
int clone_flags = CLONE_NEWNS | SIGCHLD;
int pid = clone(child, stack_top, clone_flags, (void *)(argv + 1));
```

由于Linux创建namespaces需要root权限, 接下来运行这个程序我们都需要使用sudo.

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

我们已经设置了新的挂载视图命名空间, 但我们并没有改变任何文件系统内的东西. 让我们使用`chroot`, 将其文件系统挂载点变为我们新建的`./rootfs`文件目录. 我们还需要做的一步是, 使用`chdir`将工作目录改为`/`, 否则我们目前的工作目录在新的文件系统中不会存在.

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

让我们尝试一下重新执行:

```bash
$ sudo ./mini-container /bin/ps aux
Exec failed!
```

切换文件系统后, 我们无法调用`exec`了! 原因是, 目前我们的文件系统根是一个空目录, 并没有我们要执行的`/bin/ps`. 为了让我们的工作简单些, 我们之后会使用`/bin/bash` 和 `/bin/ls` 而不是`/bin/ps`. 既然这样, 我们需要将这些可执行以及其依赖共享库放入新的文件系统根目录中.

```bash
$ mkdir -p rootfs/bin
$ sudo cp /bin/bash /bin/ls rootfs/bin/
```

为了找到所依赖的共享库, 可以使用`ldd`指令, 参数为可执行文件:

```bash
$ ldd rootfs/bin/bash
        linux-vdso.so.1 (0x0000ffff9a665000)
        libtinfo.so.6 => /lib/aarch64-linux-gnu/libtinfo.so.6 (0x0000ffff9a460000)
        libc.so.6 => /lib/aarch64-linux-gnu/libc.so.6 (0x0000ffff9a2b0000)
        /lib/ld-linux-aarch64.so.1 (0x0000ffff9a628000)
```

第一行所展示的`linux-vdso.so.1`是一个虚拟的共享库, 并不再实际的文件系统中存在, 我们只需要处理其他的共享库即可.

值得注意的是, 在不同的Linux发行版和体系结构下, 这些依赖项处于不同位置. 你需要根据你的架构和发行版情况自行拷贝到`rootfs/`目录下的对应位置.

```bash
$ mkdir -p rootfs/bin rootfs/lib rootfs/lib/aarch64-linux-gnu
$ sudo cp /lib/aarch64-linux-gnu/libtinfo.so.6 \
	/lib/aarch64-linux-gnu/libc.so.6 \
	/lib/aarch64-linux-gnu/libselinux.so.1 \
	/lib/aarch64-linux-gnu/libpcre2-8.so.0 \
	rootfs/lib/aarch64-linux-gnu/
$ sudo cp /lib/ld-linux-aarch64.so.1 rootfs/lib/
```

现在, bash和ls可以运行了!

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

以下是文件系统隔离的完整代码:

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

现在我们有了一个隔离的文件系统. 下一章中, 我们会进一步隔离所有的namespaces!
