#!/bin/sh

set -e

if [ ! -e ./system/kernel/src ]; then
  wget -O ./linux-5.15.119.tar.xz https://cdn.kernel.org/pub/linux/kernel/v5.x/linux-5.15.119.tar.xz
  mkdir -p ./system/kernel/src
  tar -xf ./linux-5.15.119.tar.xz -C ./system/kernel/src
fi

cp -f ./system/kernel/.config ./system/kernel/src/.config
cd ./system/kernel/src

make $COMPILER_ARGS
cp ./system/kernel/src/arch/x86/boot/bzImage "$ROOTFS_DIR/vmlinuz"

cd ../../..
