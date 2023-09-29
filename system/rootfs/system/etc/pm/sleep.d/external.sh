#!/system/bin/sh

# Find and execute all files in /system_*/etc/pm/sleep.d/*
for script_file in /system_*/etc/pm/sleep.d/*; do
  if [ -f "$script_file" ] && [ -x "$script_file" ]; then
    exec $COMMAND_PREFIX "$script_file"
  elif [ -f "$script_file" ] && [ ! -x "$script_file" ]; then
    chmod 755 "$script_file"
    exec $COMMAND_PREFIX "$script_file"
  fi
done

# Find and execute all files in /vendor/etc/pm/sleep.d/*
for script_file in /vendor/etc/pm/sleep.d/*; do
  if [ -f "$script_file" ] && [ -x "$script_file" ]; then
    exec $COMMAND_PREFIX "$script_file"
  elif [ -f "$script_file" ] && [ ! -x "$script_file" ]; then
    chmod 755 "$script_file"
    exec $COMMAND_PREFIX "$script_file"
  fi
done

# Find and execute all files in /product/etc/pm/sleep.d/*
for script_file in /product/etc/pm/sleep.d/*; do
  if [ -f "$script_file" ] && [ -x "$script_file" ]; then
    exec $COMMAND_PREFIX "$script_file"
  elif [ -f "$script_file" ] && [ ! -x "$script_file" ]; then
    chmod 755 "$script_file"
    exec $COMMAND_PREFIX "$script_file"
  fi
done

# Find and execute all files in /odm/etc/pm/sleep.d/*
for script_file in /odm/etc/pm/sleep.d/*; do
  if [ -f "$script_file" ] && [ -x "$script_file" ]; then
    exec $COMMAND_PREFIX "$script_file"
  elif [ -f "$script_file" ] && [ ! -x "$script_file" ]; then
    chmod 755 "$script_file"
    exec $COMMAND_PREFIX "$script_file"
  fi
done

# Find and execute all files in /oem/etc/pm/sleep.d/*
for script_file in /oem/etc/pm/sleep.d/*; do
  if [ -f "$script_file" ] && [ -x "$script_file" ]; then
    exec $COMMAND_PREFIX "$script_file"
  elif [ -f "$script_file" ] && [ ! -x "$script_file" ]; then
    chmod 755 "$script_file"
    exec $COMMAND_PREFIX "$script_file"
  fi
done

# Find and execute all files in /apex/*/etc/pm/sleep.d/*
for script_file in /apex/*/etc/pm/sleep.d/*; do
  if [ -f "$script_file" ] && [ -x "$script_file" ]; then
    exec $COMMAND_PREFIX "$script_file"
  elif [ -f "$script_file" ] && [ ! -x "$script_file" ]; then
    chmod 755 "$script_file"
    exec $COMMAND_PREFIX "$script_file"
  fi
done

# Find and execute all files in /system/apex/*/etc/pm/sleep.d/*
for script_file in /system/apex/*/etc/pm/sleep.d/*; do
  if [ -f "$script_file" ] && [ -x "$script_file" ]; then
    exec $COMMAND_PREFIX "$script_file"
  elif [ -f "$script_file" ] && [ ! -x "$script_file" ]; then
    chmod 755 "$script_file"
    exec $COMMAND_PREFIX "$script_file"
  fi
done
