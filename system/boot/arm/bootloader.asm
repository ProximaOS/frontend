.section .text
.global _start

_start:
    /* Set up segments */
    mov r0, #0          /* Clear r0 register */
    mov r1, r0          /* Set data segment to 0x0000 */
    mov r2, r0          /* Set stack segment to 0x0000 */
    mov sp, #0x7C00     /* Set stack pointer to 0x7C00 (end of bootloader) */

    /* Load kernel to memory */
    mov r3, #0x0200     /* Destination address where kernel will be loaded */
    mov r4, #0x01       /* Number of sectors to read */
    mov r5, #0x00       /* Cylinder number */
    mov r6, #0x02       /* Sector number (start at 2) */
    mov r7, #0x00       /* Head number */
    bl load_kernel      /* Call load_kernel subroutine */

    /* Jump to kernel */
    ldr r3, =kernel_args /* Load address of kernel arguments */
    ldr r4, =0x8000      /* Load address where arguments will be stored in memory */
    mov r5, #32          /* Maximum number of arguments characters (adjust as needed) */
    bl copy_args         /* Call copy_args subroutine */

    ldr r0, =0x0000      /* Load high word of destination address */
    ldr r1, =0x0200      /* Load low word of destination address */
    bx  r0               /* Jump to kernel code */

load_kernel:
    /* Implementation of loading kernel goes here */
    /* This is platform-specific and will depend on how the ARM system handles disk I/O */

copy_args:
    /* Implementation of copying arguments goes here */
    /* Use r3 as source address, r4 as destination address, and r5 as count */
    mov r2, #0          /* Initialize counter */
copy_loop:
    ldrb r6, [r3], #1   /* Load a byte from source and increment source pointer */
    strb r6, [r4], #1   /* Store byte in destination and increment destination pointer */
    subs r5, r5, #1     /* Decrement counter */
    bne copy_loop       /* Repeat loop if counter is not zero */
    bx  lr              /* Return from subroutine */

kernel_args:
    .ascii "root=/dev/sda7 init=/init quiet splash\0"

section .signature
    db 'Orchid Bootloader', 0

    .space 510-($-$$)   /* Fill the rest of the boot sector with zeros */
    .short 0xAA55       /* Magic number indicating valid boot sector */
