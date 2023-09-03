#!/bin/bash

export OPENORCHID_WEBAPPS=/usr/webapps
export OPENORCHID_WEBAPPS_JSON=/usr/webapps.json
export OPENORCHID_DATA="$HOME/.profile"
export OPENORCHID_ADDONS="$OPENORCHID_DATA/extensions"
export OPENORCHID_STORAGE="$HOME"

export CURSOR_THEME=default

/bin/aplay /etc/boot_sound.ogg
/bin/orchidwayland -c /usr/lib/openorchid/openorchid --platform desktop

exit 0
