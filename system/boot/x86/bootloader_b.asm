; bootloader_b.asm

section .text
    global _start

_start:
    ; Set up segments
    xor ax, ax         ; Clear ax register
    mov ds, ax         ; Set data segment to 0x0000
    mov ss, ax         ; Set stack segment to 0x0000
    mov sp, 0x7C00     ; Set stack pointer to 0x7C00 (end of bootloader)

    ; Load kernel to memory
    mov bx, 0x0200     ; Destination address where kernel will be loaded
    mov ah, 0x02       ; BIOS function for reading disk sectors
    mov al, 0x01       ; Number of sectors to read
    mov ch, 0x00       ; Cylinder number
    mov cl, 0x02       ; Sector number (start at 2)
    mov dh, 0x00       ; Head number
    int 0x13           ; Call BIOS interrupt for disk I/O

    ; Jump to kernel
    mov si, kernel_args ; Load address of kernel arguments
    mov di, 0x8000      ; Load address where arguments will be stored in memory
    mov cx, 32          ; Maximum number of arguments characters (adjust as needed)
    rep movsb           ; Copy arguments to memory

    jmp 0x0000:0x0200   ; Jump to kernel code

    ; Custom kernel arguments
kernel_args:
    db "root=/dev/sda8 init=/init quiet splash", 0

section .signature
    db 'Orchid Bootloader', 0

    times 510-($-$$) db 0   ; Fill the rest of the boot sector with zeros
    dw 0xAA55               ; Magic number indicating valid boot sector
