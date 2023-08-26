# Storage API Module Documentation

The Storage API module facilitates operations related to reading, writing, managing, and interacting with files within the OrchidOS environment. It offers functions to read file content, write new content, delete files, copy and move files, list directory contents, obtain file statistics, and retrieve MIME types. This documentation provides comprehensive explanations of each module function, its purpose, and how it can be effectively used.

## Table of Contents

1. [Introduction](#introduction)
2. [Dependencies](#dependencies)
3. [Module Functions](#module-functions)
   - [`read`](#read)
   - [`write`](#write)
   - [`delete`](#delete)
   - [`copy`](#copy)
   - [`move`](#move)
   - [`list`](#list)
   - [`getFileStats`](#getfilestats)
   - [`getMime`](#getmime)
5. [Usage Example](#usage-example)

## Introduction

The Storage API module simplifies the interaction with files within the OrchidOS ecosystem. It provides a set of functions to manage file operations, including reading, writing, copying, moving, deleting, listing, obtaining statistics, and retrieving MIME types.

## Dependencies

- `fs`: A Node.js built-in module for file system operations.
- `path`: A Node.js built-in module for working with file paths.
- `mime`: A library for determining MIME types based on file extensions.
- `dotenv`: A library for loading environment variables from a `.env` file.
- `del`: A library for deleting files and directories asynchronously.
- `copy`: A library for copying files and directories asynchronously.
- `mv`: A library for moving files and directories asynchronously.

## Module Functions

### `read`

Reads the content of a file.

```javascript
read(filePath: string, options?: { encoding: string }): Promise<string>
```
- filePath: The path to the file to be read.
- options.encoding: The encoding for reading the file (default: 'utf8').
- Returns: A promise that resolves to the content of the file.

This function reads the content of the specified file and returns a promise that resolves with the file content.

### `write`

Writes content to a file.

```javascript
write(filePath: string, content: string): void
```

- filePath: The path to the file to be written.
- content: The content to be written to the file.

This function writes the provided content to the specified file.

### `delete`

Deletes a file or directory.

```javascript
delete(input: string): void
```

- input: The path to the file or directory to be deleted.

This function asynchronously deletes the specified file or directory.

### `copy`

Copies a file or directory.

```javascript
copy(fromPath: string, toPath: string): void
```

- fromPath: The path of the source file or directory.
- toPath: The path of the destination file or directory.

This function asynchronously copies the content from the source path to the destination path.

### `move`

Moves a file or directory.

```javascript
move(fromPath: string, toPath: string): void
```

- fromPath: The path of the source file or directory.
- toPath: The path of the destination file or directory.

This function asynchronously moves the content from the source path to the destination path.

### `list`

Lists contents of a directory.

```javascript
list(dirPath: string): Promise<string[]>
```
- dirPath: The path of the directory to list.
- Returns: A promise that resolves to an array of file and directory names.

This function asynchronously lists the contents of the specified directory and returns an array of file and directory names.

### `getFileStats`

Obtains statistics about a file.

```javascript
getFileStats(filePath: string): Promise<fs.Stats>
```
- filePath: The path to the file.
- Returns: A promise that resolves to the file statistics object.

This function asynchronously obtains statistics about the specified file and returns a file statistics object.

### `getMime`

Retrieves the MIME type of a file.

```javascript
getMime(filePath: string): Promise<string>
```
- filePath: The path to the file.
- Returns: A promise that resolves to the MIME type of the file.

This function asynchronously retrieves the MIME type of the specified file based on its extension.
Usage Example

## Usage Example

```javascript
async function main() {
  const filePath = 'example.txt';
  const fileContent = await _session.storageManager.read(filePath);
  console.log('File Content:', fileContent);

  const newContent = 'New content to write.';
  _session.storageManager.write('newfile.txt', newContent);
  console.log('New file created with content.');

  _session.storageManager.copy('source.txt', 'destination.txt');
  console.log('File copied.');

  _session.storageManager.move('oldfile.txt', 'new/location/oldfile.txt');
  console.log('File moved.');

  const dirPath = 'directory';
  const directoryContents = await _session.storageManager.list(dirPath);
  console.log('Directory Contents:', directoryContents);

  const stats = await _session.storageManager.getFileStats('file.txt');
  console.log('File Statistics:', stats);

  const mimeType = await _session.storageManager.getMime('image.jpg');
  console.log('MIME Type:', mimeType);
}

main();
```

This usage example demonstrates how to interact with the Storage API module. It showcases reading and writing file content, copying and moving files, listing directory contents, obtaining file statistics, and retrieving MIME types.

Feel free to adapt the provided code to your project's structure and requirements.

This documentation should provide comprehensive insights into the Storage API module's functionalities and how to effectively use its functions to manage files and interact with file system operations within the OrchidOS environment. If you have further questions or need assistance, please feel free to ask.
