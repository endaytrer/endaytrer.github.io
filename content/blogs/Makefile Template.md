---
title = "Makefile Templates"
created = 2023-09-21
license = "CC0 1.0"
tags = ["programming"]
---

C / Assembly project

```Makefile
C_SRCS := $(wildcard *.c)
C_HDRS := $(wildcard *.h)
ASM_SRCS := $(wildcard *.S)

C_OBJS := $(patsubst %.c, %.o, $(C_SRCS))
ASM_OBJS := $(patsubst %.c, %.o, $(ASM_SRCS))

OBJS := $(C_OBJS)
OBJS += $(ASM_OBJS)

EXE := main

.PHONY: all clean

all: $(EXE)

$(EXE): $(OBJS)
	$(LD) $(LDFLAGS) -o $@ $(OBJS)
	
%.o: %.c
	$(CC) $(CFLAGS) -c -o $@ $^
	
%.o: %.S
	$(AS) $(ASFLAGS) -c -o $@ $^
	
clean:
	rm -f $(EXE) $(OBJS)
```

