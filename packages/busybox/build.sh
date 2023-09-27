#!/bin/sh

set -e

if [ ! -e ./packages/busybox/src ]; then
  git clone https://github.com/mirror/busybox --depth 1 ./packages/busybox/src
fi

cp ./packages/busybox/.config ./packages/busybox/src/.config
cd ./packages/busybox/src

make $COMPILER_ARGS
make CONFIG_PREFIX="$ROOTFS_DIR" install

cd ../../..
