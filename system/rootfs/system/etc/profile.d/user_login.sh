#!/system/bin/sh

# Create a secure directory if device is secured
if [ "$(getprop ro.secure 1)" = "1" ]; then
  mkdir -p "$HOME/.secure"

  # Set ownership and permissions for secure directory
  chown -R "$USER:$USER" "$HOME/.secure"
  chmod 700 "$HOME/.secure"
fi

# Execute user shell configurations
exec $COMMAND_PREFIX /system/bin/sh "$HOME/.envrc"
exec $COMMAND_PREFIX /system/bin/sh "$HOME/.bbshrc"
exec $COMMAND_PREFIX /system/bin/sh "$HOME/.bbsh_aliases"

# Mount as a fuse emulated folder
mkdir -p /mnt/sdcard
if mount | grep -q '/mnt/sdcard'; then
  sudo umount /mnt/sdcard
fi
fuse-overlayfs \
  -o lowerdir="$HOME",upperdir=/mnt/sdcard,redirect_dir=true \
  /mnt/sdcard
