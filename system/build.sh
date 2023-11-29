#!/bin/bash

set -e

ARCH=x86_64
KERNEL_ARCH=x86

BOOT_BZIMAGE=$(pwd)/output/boot/bzImage
BOOT_INITRAMFS=$(pwd)/output/boot/initrd.gz
INITRAMFS_SKEL=$(pwd)/system/skeleton
INITRAMFS_OUTPUT=$(pwd)/output/initramfs
CACHE_DIR=$(pwd)/.cache
PROJECT_DIR=$(pwd)

mkdir -p $CACHE_DIR output output/boot output/initramfs

# Function to check if a file exists
file_exists() {
  if [ -f "$1" ]; then
    return 0
  else
    return 1
  fi
}

# Check and download the files if they do not exist
if ! file_exists "$CACHE_DIR/kernel.tar.gz"; then
  wget https://cdn.kernel.org/pub/linux/kernel/v5.x/linux-5.15.139.tar.xz -O "$CACHE_DIR/kernel.tar.gz"
fi
if ! file_exists "$CACHE_DIR/busybox"; then
  git clone https://github.com/mirror/busybox "$CACHE_DIR/busybox" --depth 1
fi
if ! file_exists "$CACHE_DIR/libX11"; then
  git clone https://github.com/mirror/libX11 "$CACHE_DIR/libX11" --depth 1
fi
if ! file_exists "$CACHE_DIR/fontconfig"; then
  git clone https://github.com/behdad/fontconfig "$CACHE_DIR/fontconfig" --depth 1
fi
if ! file_exists "$CACHE_DIR/weston"; then
  git clone https://gitlab.freedesktop.org/wayland/weston.git "$CACHE_DIR/weston" --depth 1
fi
if ! file_exists "$CACHE_DIR/libxkbfile"; then
  git clone https://gitlab.freedesktop.org/xorg/lib/libxkbfile.git "$CACHE_DIR/libxkbfile" --depth 1
fi
if ! file_exists "$CACHE_DIR/libxss"; then
  git clone https://salsa.debian.org/xorg-team/lib/libxss.git "$CACHE_DIR/libxss" --depth 1
fi
if ! file_exists "$CACHE_DIR/mesa"; then
  git clone https://github.com/Mesa3D/mesa "$CACHE_DIR/mesa" --depth 1
fi
if ! file_exists "$CACHE_DIR/alsa-lib"; then
  git clone https://github.com/alsa-project/alsa-lib "$CACHE_DIR/alsa-lib" --depth 1
fi
if ! file_exists "$CACHE_DIR/alsa-utils"; then
  git clone https://github.com/alsa-project/alsa-utils "$CACHE_DIR/alsa-utils" --depth 1
fi
if ! file_exists "$CACHE_DIR/glibc"; then
  git clone https://sourceware.org/git/glibc.git "$CACHE_DIR/glibc" --depth 1
fi
if ! file_exists "$CACHE_DIR/gcc"; then
  git clone https://github.com/gcc-mirror/gcc "$CACHE_DIR/gcc" --depth 1
fi
if ! file_exists "$CACHE_DIR/wpasupplicant.tar.gz"; then
  wget https://w1.fi/releases/wpa_supplicant-2.10.tar.gz -O "$CACHE_DIR/wpasupplicant.tar.gz"
fi

tar -xf "$CACHE_DIR/kernel.tar.xz" -C "$CACHE_DIR/"
KERNEL_DIR=$(find "$CACHE_DIR/" -type d -name "linux-*")

# Build and install the kernel
cd "$KERNEL_DIR"
make defconfig
make -j$(nproc)
cd "$PROJECT_DIR"

# Build busybox
cd "$CACHE_DIR/busybox"
make defconfig
make install CONFIG_PREFIX="$INITRAMFS_OUTPUT"
cd "$PROJECT_DIR"

# Build libX11
cd "$CACHE_DIR/libX11"
./configure
make install DESTDIR="$INITRAMFS_OUTPUT"
cd "$PROJECT_DIR"

# Build fontconfig
cd "$CACHE_DIR/fontconfig"
./configure
make install DESTDIR="$INITRAMFS_OUTPUT"
cd "$PROJECT_DIR"

# Build weston
cd "$CACHE_DIR/weston"
mkdir build && cd build
meson ..
ninja install -C .
cd "$PROJECT_DIR"

# Build libxkbfile
cd "$CACHE_DIR/libxkbfile"
./autogen.sh
make install DESTDIR="$INITRAMFS_OUTPUT"
cd "$PROJECT_DIR"

# Build libxss
cd "$CACHE_DIR/libxss"
./autogen.sh
make install DESTDIR="$INITRAMFS_OUTPUT"
cd "$PROJECT_DIR"

# Build Mesa
cd "$CACHE_DIR/mesa"
mkdir build && cd build
meson ..
ninja install -C .
cd "$PROJECT_DIR"

# Build alsa-lib
cd "$CACHE_DIR/alsa-lib"
./configure
make install DESTDIR="$INITRAMFS_OUTPUT"
cd "$PROJECT_DIR"

# Build alsa-utils
cd "$CACHE_DIR/alsa-utils"
./configure
make install DESTDIR="$INITRAMFS_OUTPUT"
cd "$PROJECT_DIR"

# Build and install glibc
cd "$CACHE_DIR/glibc"
mkdir build && cd build
./configure --prefix="$INITRAMFS_OUTPUT/system" --disable-werror --enable-kernel=3.2 --enable-stack-protector=strong
make install_root="$INITRAMFS_OUTPUT" install
cd "$PROJECT_DIR"

# Build and install gcc
cd "$CACHE_DIR/gcc"
./configure --disable-multilib
make install DESTDIR="$INITRAMFS_OUTPUT"
cd "$PROJECT_DIR"

# Extract and install wpa_supplicant
cd "$CACHE_DIR"
tar -xzvf wpasupplicant.tar.gz -C $CACHE_DIR
cd "$CACHE_DIR/wpa_supplicant-2.10"
make BINDIR="$INITRAMFS_OUTPUT/sbin" install
cd "$PROJECT_DIR"

# Copy over bzImage
cp "$KERNEL_DIR/arch/$KERNEL_ARCH/boot/bzImage" "$BOOT_BZIMAGE"

# Create initramfs
(cd "$INITRAMFS_OUTPUT" && find . | cpio -H newc -o) | gzip -9 > "$BOOT_INITRAMFS"
