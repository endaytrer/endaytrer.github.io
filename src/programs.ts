export interface Program {
    name: string,
    program: string,
}
export const defaultPrograms: Program[] = [
    {
      name: "hello_world.S",
      program: String.raw`SYSCALL_EXIT = 0x1
SYSCALL_PANIC = SYSCALL_EXIT + 1
SYSCALL_PUT_CHAR = SYSCALL_PANIC + 1

.section .data
.str: .string "Hello world!\n"
    .string "Welcome to here.\n"
STRLEN = . - .str
    .store 0
.strlen_null:
    .store STRLEN + 1
.section .text
.global _start
_start:
    ldi r3, .str
    ld r4, [.strlen_null]

    dec r4
loop:
    ld r1, [r3]
    inc r3
    scall SYSCALL_PUT_CHAR
    
    dec r4
    bnz r4, loop
    mov r1, zero
    scall SYSCALL_EXIT
`
    },
    {
        name: "recursion.S",
        program: String.raw`// macro definitions
SYSCALL_EXIT = 1
SYSCALL_PUT_CHAR = 3

.section .text
.global _start
_start:
    nop
    ldi sp, 1023
    ldi r1, 'Z' - 'A'
    call print_int


    ldi r1, 0
    call exit
    

exit:
    scall SYSCALL_EXIT

print_int:
    push lr

    bn r1, print_int_endl // go to end if r1 < 0
    ldi r2, 'Z'
    push r1
    sub r1, r2, r1
    scall SYSCALL_PUT_CHAR
    pop r1
    dec r1
    call print_int

    j epologue

print_int_endl:

    ldi r1, '\n'
    scall SYSCALL_PUT_CHAR

epologue:
    pop lr
    ret

`
    }
]