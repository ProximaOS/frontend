!(function (exports) {
  'use strict';

  function FileIndexer (directory, mimeType) {
    return new Promise((resolve, reject) => {
      const matchingFiles = [];

      async function findMatchingFiles (currentDir) {
        const files = await SDCardManager.list(currentDir);
        for (const file of files) {
          const filePath = `${currentDir}/${file}`;

          const stats = SDCardManager.getFileStats(filePath);
          if (stats.is_directory) {
            await findMatchingFiles(filePath);
          } else {
            const fileMimeType = SDCardManager.getMime(filePath);
            if (fileMimeType && fileMimeType.startsWith(mimeType)) {
              matchingFiles.push(filePath);
            }
          }
        }
      }

      try {
        findMatchingFiles(directory).then(() => {
          setTimeout(() => {
            resolve(matchingFiles);
          }, 500);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  exports.FileIndexer = FileIndexer;
})(window);
