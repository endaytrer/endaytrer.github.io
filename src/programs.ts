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
    mov a, .str
    mov b, [.strlen_null]

    dec b
loop:
    mov x, [a]
    inc a
    scall SYSCALL_PUT_CHAR
    
    dec b
    bnz loop, b
    mov x, 69
    scall SYSCALL_EXIT
`
    },
    {
        name: "recursion.S",
        program: String.raw`// macro definitions
SYSCALL_EXIT = 1
SYSCALL_PUT_CHAR = 3

.section .text
__start:
    nop
    mov sp, 1023
    mov x, 3
    call print_int


    mov x, 0
    call exit
    

exit:
    scall SYSCALL_EXIT

print_int:
    push lr
    push x
    push y

    bn print_int_endl, x // go to end if x < 0
    mov y, 'A'
    push x
    add x, x, y
    scall SYSCALL_PUT_CHAR
    pop x
    dec x
    call print_int

    j epologue

print_int_endl:

    mov x, '\n'
    scall SYSCALL_PUT_CHAR

epologue:
    pop y
    pop x
    pop lr
    ret

`
    }
]