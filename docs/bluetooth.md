# Bluetooth API Module Documentation

The Bluetooth API module facilitates interaction with Bluetooth devices and provides functions to scan, connect, disconnect, and manage Bluetooth peripherals. This documentation offers an in-depth explanation of each module function, its purpose, and how it can be used effectively.

## Table of Contents

1. [Introduction](#introduction)
2. [Dependencies](#dependencies)
2. [Module Functions](#module-functions)
   - [`scan`](#scan)
   - [`connect`](#connect)
   - [`disconnect`](#disconnect)
   - [`enableBluetooth`](#enablebluetooth)
   - [`disableBluetooth`](#disablebluetooth)
5. [Usage Example](#usage-example)

## Introduction

The Bluetooth API module is a crucial component of the OrchidOS ecosystem, enabling seamless interaction with Bluetooth devices. It simplifies tasks such as scanning for nearby devices, establishing connections, managing connections, and enabling/disabling Bluetooth functionality.

## Module Functions

### `scan`

Scans for nearby Bluetooth devices for a specified duration.

```javascript
scan(duration: number): Promise<Device[]>
```
- duration: The duration of the scan in seconds.
- Returns: A promise that resolves to an array of device objects.

This function initiates a scan for Bluetooth devices and returns a promise that resolves with an array of nearby device objects. Each device object contains details such as the device's ID, name, received signal strength indicator (RSSI), and advertisement data.

### `connect`

Connects to a Bluetooth device.

```javascript
connect(deviceId: string): Promise<Device>
```

- deviceId: The ID of the device to connect to.
- Returns: A promise that resolves to the connected device object.

This function establishes a connection with the specified Bluetooth device using its device ID. It returns a promise that resolves to the connected device object.

### `disconnect`

Disconnects from a connected Bluetooth device.

```javascript
disconnect(deviceId: string): Promise<Device>
```

- deviceId: The ID of the device to disconnect from.
- Returns: A promise that resolves to the disconnected device object.

This function terminates the connection with the specified Bluetooth device using its device ID. It returns a promise that resolves to the disconnected device object.

### `enableBluetooth`

Enables Bluetooth functionality.

```javascript
enableBluetooth(): Promise<void>
```

This function turns on Bluetooth functionality and returns a promise that resolves when Bluetooth is successfully enabled.

### `disableBluetooth`

Disables Bluetooth functionality.

```javascript
disableBluetooth(): Promise<void>
```

This function turns off Bluetooth functionality and returns a promise that resolves when Bluetooth is successfully disabled.
Device Object Structure

Each device object includes the following properties:

- id: The unique identifier of the device.
- name: The name of the device (if available).
- rssi: The received signal strength indicator of the device.
- address: The Bluetooth address of the device.
- advertisement: The advertisement data received from the device.

## Usage Example

```javascript
async function main() {
  try {
    await _session.bluetooth.enableBluetooth();
    console.log('Bluetooth enabled.');

    const scanDuration = 10; // seconds
    const devices = await _session.bluetooth.scan(scanDuration);
    console.log('Discovered Devices:', devices);

    const deviceId = 'abcdef123456'; // Replace with a valid device ID
    const connectedDevice = await _session.bluetooth.connect(deviceId);
    console.log('Connected to:', connectedDevice);

    await _session.bluetooth.disconnect(deviceId);
    console.log('Disconnected from:', connectedDevice);

    await _session.bluetooth.disableBluetooth();
    console.log('Bluetooth disabled.');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

This usage example demonstrates how to interact with the Bluetooth API module. It showcases enabling/disabling Bluetooth, scanning for devices, connecting to a device, and disconnecting from a device.

Feel free to adapt the provided code to your project's structure and requirements.

This documentation should provide a clear understanding of the Bluetooth API module's functionality and how to effectively utilize its functions to manage Bluetooth devices within the OrchidOS ecosystem. If you have further questions or need assistance, please feel free to ask.
