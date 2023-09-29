#!/bin/sh

set -e

if [ ! -e ./kernel/src ]; then
  wget -O ./linux-5.15.119.tar.xz https://cdn.kernel.org/pub/linux/kernel/v5.x/linux-5.15.119.tar.xz
  mkdir -p ./kernel/src
  tar -xf ./linux-5.15.119.tar.xz -C ./kernel/src
fi

cp -f ./kernel/.config ./kernel/src/.config
cd ./kernel/src

make $COMPILER_ARGS
cp ./kernel/src/arch/x86/boot/bzImage "$ROOTFS_DIR/vmlinuz"

cd ../../..
