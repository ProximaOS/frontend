#!/bin/bash
as -o bootloader.o bootloader.asm
as -o bootloader_b.o bootloader_b.asm
ld -o bootloader bootloader.o
ld -o bootloader_b bootloader_b.o
gcc -o bootloader bootloader.asm
gcc -o bootloader_b bootloader_b.asm
