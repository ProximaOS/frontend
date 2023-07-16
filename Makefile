#!/bin/make
OPENORCHID_SRC_DIR := $(shell pwd)

.PHONY: all build install clean

all: | build

build:
  npm run build

install:
  $(shell ./scripts/install /mnt)

uninstall:
  $(shell ./scripts/uninstall /mnt)

clean:
	rm -rf $(OPENORCHID_SRC_DIR)/dist $(OPENORCHID_SRC_DIR)/profile
