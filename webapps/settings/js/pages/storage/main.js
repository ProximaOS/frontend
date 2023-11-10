!(function (exports) {
  'use strict';

  const Storage = {
    usedSpaceProgress: document.getElementById('storage-used-space-progress'),

    init: async function () {
      const sizes = await this.calculateSizes('/');
      Object.entries(sizes).forEach((category, index) => {
        const fill = document.createElement('div');
        fill.classList.add('fill');
        fill.style.setProperty('--hue', (index / (sizes.length - 1)) * 360);
        fill.style.setProperty('--progress', (category.sizePercentage / 100) | 0);
        this.usedSpaceProgress.appendChild(fill);
      });
    },

    calculateSizes: async function (directoryPath) {
      const fileTypes = {
        pictures: ['jpg', 'jpeg', 'png', 'gif'],
        videos: ['mp4', 'avi', 'mkv'],
        audio: ['mp3', 'wav', 'ogg']
      };

      const files = await SDCardManager.list(directoryPath);
      const fileStats = files.map((file) => {
        const filePath = directoryPath + '/' + file;
        const stat = SDCardManager.getFileStats(filePath);
        return { name: file, size: stat.size };
      });

      const categorizedFiles = {
        pictures: [],
        videos: [],
        audio: [],
        other: []
      };

      let totalSize = 0;

      fileStats.forEach((fileStat) => {
        totalSize += fileStat.size;

        const regex = /\.([^.]+)$/;
        const match = fileStat.name.toLowerCase().match(regex);
        const extension = match ? match[1] : null;
        let categorized = false;

        for (const fileType in fileTypes) {
          if (fileTypes[fileType].includes(extension)) {
            categorizedFiles[fileType].push(fileStat);
            categorized = true;
            break;
          }
        }

        if (!categorized) {
          categorizedFiles.other.push(fileStat);
        }
      });

      const categorizedSizes = [];
      for (const fileType in categorizedFiles) {
        const categorySize = categorizedFiles[fileType].reduce(
          (acc, fileStat) => acc + fileStat.size,
          0
        );
        const percentage = (categorySize / totalSize) * 100;
        categorizedSizes.push({
          type: fileType,
          sizeBytes: categorySize,
          sizePercentage: percentage
        });
      }

      return categorizedSizes;
    }
  };

  Storage.init();
})(window);
