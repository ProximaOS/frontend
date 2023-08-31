!(function (exports) {
  'use strict';

  function FileIndexer (directory, mimeType) {
    return new Promise((resolve, reject) => {
      const matchingFiles = [];

      async function findMatchingFiles (currentDir) {
        const files = await window.StorageManager.list(currentDir);
        for (const file of files) {
          const filePath = `${currentDir}/${file}`;

          const stats = await window.StorageManager.getFileStats(filePath);
          if (stats.isDirectory()) {
            await findMatchingFiles(filePath);
          } else {
            const fileMimeType = window.StorageManager.getMime(filePath);
            if (fileMimeType && fileMimeType.startsWith(mimeType)) {
              matchingFiles.push(filePath);
            }
          }
        }
      }

      try {
        findMatchingFiles(directory).then(() => {
          resolve(matchingFiles);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  exports.FileIndexer = FileIndexer;
})(window);
