OPENORCHID_SRC_DIR := $(shell pwd)
BUILD_STAGE_DIR := $(OPENORCHID_SRC_DIR)/build_stage
ROOTFS_DIR := $(BUILD_STAGE_DIR)/rootfs
SKELETON_PATH := $(OPENORCHID_SRC_DIR)/system/skeleton

.PHONY: all clean

all: | prepare_rootfs build

prepare_rootfs:
	mkdir -p $(BUILD_STAGE_DIR) $(BUILD_STAGE_DIR)/boot $(ROOTFS_DIR) $(OPENORCHID_SRC_DIR)/logs
	rm -rf $(ROOTFS_DIR)
	mkdir -p $(ROOTFS_DIR)
	cp -rf $(SKELETON_PATH)/* $(ROOTFS_DIR)

build: $(patsubst $(OPENORCHID_SRC_DIR)/build.%.sh,%,$(wildcard $(OPENORCHID_SRC_DIR)/build.*.sh))
  npm run build

$(patsubst $(OPENORCHID_SRC_DIR)/build.%.sh,%,$(wildcard $(OPENORCHID_SRC_DIR)/build.*.sh)):
	@echo "Executing build script $@"
	$(OPENORCHID_SRC_DIR)/$@.sh > $(OPENORCHID_SRC_DIR)/logs/$@.txt

clean:
	rm -rf $(BUILD_STAGE_DIR) $(OPENORCHID_SRC_DIR)/logs
