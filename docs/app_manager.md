# Web Apps Module Documentation

The Web Apps module is an integral part of the OrchidOS operating system. This module provides functionality for managing web applications, including retrieving information about installed apps, installing new apps, uninstalling apps, and calculating the sizes of app folders. This documentation provides an overview of each module function, its purpose, and its usage.

## Table of Contents

1. [Introduction](#introduction)
2. [Dependencies](#dependencies)
3. [Module Functions](#module-functions)
   - [`getAll`](#getall)
   - [`writeAppList`](#writeapplist)
   - [`installPackage`](#installpackage)
   - [`uninstall`](#uninstall)
   - [`getFolderSize`](#getfoldersize)
4. [App Object Structure](#app-object-structure)
5. [Usage Example](#usage-example)

## Introduction

The Web Apps module simplifies the management of web applications within the OrchidOS environment. It enables developers to interact with installed web apps, handle their installation and removal, and obtain information about their configurations.

## Dependencies

- `adm-zip`: A library for working with ZIP archives.
- `fs`: A Node.js built-in module for file system operations.
- `path`: A Node.js built-in module for working with file paths.
- `uuid`: A library for generating UUIDs (Universally Unique Identifiers).
- `dotenv`: A library for loading environment variables from a `.env` file.

## Module Functions

### `getAll`

Retrieves information about all installed web applications.

```javascript
getAll(): Promise<App[]>
```
This function returns a promise that resolves to an array of app objects. Each app object contains details such as the app's ID, installation timestamp, and manifest URL. If an error occurs during the retrieval of app information, the promise will be rejected.

### `writeAppList`

Writes the list of installed web applications to a configuration file.

```javascript
writeAppList(appList: App[]): void
```
- appList: An array of app objects to be written to the configuration file.

This function accepts an array of app objects and writes them to a configuration file. It is used to update the list of installed apps after new installations or uninstalls.

### `installPackage`

Installs a new web application from a ZIP archive.

```javascript
installPackage(zipFilePath: string): Promise<string>
```

- zipFilePath: The path to the ZIP archive containing the app files.
- Returns: A promise that resolves to the app ID of the newly installed app.

This function installs a new web application by extracting the contents of a ZIP archive to a designated directory. It generates a new app ID and creates a manifest URL for the installed app. The app's information is then added to the list of installed apps using the writeAppList function.

### `uninstall`

Uninstalls a web application.

```javascript
uninstall(appId: string): void
```

- appId: The ID of the app to be uninstalled.

This function removes a web application by deleting its directory and updating the list of installed apps. It identifies the app to uninstall based on the provided app ID.

### `getFolderSize`

Calculates the size of a folder.

```javascript
getFolderSize(folderPath: string): string
```

- folderPath: The path to the folder whose size needs to be calculated.
- Returns: A human-readable string representing the size of the folder.

This function calculates the total size of a folder by recursively traversing its contents. It converts the size from bytes to a more human-readable format, such as KB, MB, or GB.

## App Object Structure

Each app object includes the following properties:

- appId: The unique identifier of the app.
- installedAt: The timestamp of when the app was installed.
- manifestUrl: The URL to the app's manifest file.
- Additional properties may be added by the module functions.

## Usage Example

```javascript
async function main() {
  const appList = await _session.appsManager.getAll();
  console.log('Installed Apps:', appList);

  const zipFilePath = '/path/to/app.zip';
  const newAppId = await _session.appsManager.installPackage(zipFilePath);
  console.log('New App Installed. App ID:', newAppId);

  const appIdToDelete = 'abc123';
  _session.appsManager.uninstall(appIdToDelete);
  console.log(`App with ID '${appIdToDelete}' uninstalled.`);
}

main();
```

This usage example illustrates how to interact with the OrchidOS Web Apps module. It demonstrates retrieving app information, installing a new app, and uninstalling an existing app.

Feel free to adapt the provided code to your project's structure and requirements.
