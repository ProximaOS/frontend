# Use Ubuntu 22.04 as the base image
FROM ubuntu:22.04

# Set environment variables to avoid interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

# Update package lists and install required dependencies
RUN apt-get update && apt-get install -y \
    wlroots \
    wayland-protocols \
    wayland-scanner \
    libwayland-dev \
    libxkbcommon-dev \
    libegl1-mesa-dev \
    libgles2-mesa-dev \
    libgtk-3-dev \
    libxss-dev \
    libnss3-dev \
    libasound2-dev \
    libgconf2-dev \
    libnotify-dev \
    libxtst-dev \
    libudev-dev \
    libpci-dev

RUN mkdir -p /usr/lib/openorchid
COPY ./dist/linux-unpacked/* /usr/lib/openorchid

# Copy files over
COPY ./build/init.sh /init

# Set the display variable for Wayland
ENV WAYLAND_DISPLAY=wayland-0

# Start TinyWL
CMD ["/init"]
