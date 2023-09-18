#!/bin/bash

set -e

mount -t devtmpfs dev /dev
mount -t proc proc /proc
mount -t sysfs sys /sys

export OPENORCHID_WEBAPPS=/data/local/webapps
export OPENORCHID_WEBAPPS_JSON=/data/local/webapps.json
export OPENORCHID_DATA="$HOME/.profile"
export OPENORCHID_ADDONS="$OPENORCHID_DATA/extensions"
export OPENORCHID_STORAGE="$HOME"

export CURSOR_THEME=default

/sbin/wpa_supplicant -B -i wlan0 -c /system/etc/wpa_supplicant/wpa_supplicant.conf
/sbin/alsactl restore
/sbin/bluetoothd --daemon
/sbin/dhcpcd

/system/bin/aplay /system/etc/boot_sound.ogg
/system/bin/weston
  --idle-time=0 --shell=/system/bin/weston-desktop-shell
  --backend=wayland-backend.so --width=1920 --height=1080 --fullscreen
  /system/openorchid/openorchid -- --type desktop

exit 0
