#!/system/bin/sh

# Find and execute all files in /system_*/etc/profile.d/*
for script_file in /system_*/etc/profile.d/*; do
  if [ -f "$script_file" ] && [ -x "$script_file" ]; then
    exec $COMMAND_PREFIX "$script_file"
  elif [ -f "$script_file" ] && [ ! -x "$script_file" ]; then
    chmod 755 "$script_file"
    exec $COMMAND_PREFIX "$script_file"
  fi
done

# Find and execute all files in /vendor/etc/profile.d/*
for script_file in /vendor/etc/profile.d/*; do
  if [ -f "$script_file" ] && [ -x "$script_file" ]; then
    exec $COMMAND_PREFIX "$script_file"
  elif [ -f "$script_file" ] && [ ! -x "$script_file" ]; then
    chmod 755 "$script_file"
    exec $COMMAND_PREFIX "$script_file"
  fi
done

# Find and execute all files in /product/etc/profile.d/*
for script_file in /product/etc/profile.d/*; do
  if [ -f "$script_file" ] && [ -x "$script_file" ]; then
    exec $COMMAND_PREFIX "$script_file"
  elif [ -f "$script_file" ] && [ ! -x "$script_file" ]; then
    chmod 755 "$script_file"
    exec $COMMAND_PREFIX "$script_file"
  fi
done

# Find and execute all files in /odm/etc/profile.d/*
for script_file in /odm/etc/profile.d/*; do
  if [ -f "$script_file" ] && [ -x "$script_file" ]; then
    exec $COMMAND_PREFIX "$script_file"
  elif [ -f "$script_file" ] && [ ! -x "$script_file" ]; then
    chmod 755 "$script_file"
    exec $COMMAND_PREFIX "$script_file"
  fi
done

# Find and execute all files in /oem/etc/profile.d/*
for script_file in /oem/etc/profile.d/*; do
  if [ -f "$script_file" ] && [ -x "$script_file" ]; then
    exec $COMMAND_PREFIX "$script_file"
  elif [ -f "$script_file" ] && [ ! -x "$script_file" ]; then
    chmod 755 "$script_file"
    exec $COMMAND_PREFIX "$script_file"
  fi
done
