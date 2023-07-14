const Grid = {
  gridColumns: 4,
  gridRows: 5,
  HIDDEN_ROLES: ["homescreen", "system", "theme"],

  gridElement: document.getElementById("grid"),
  dockElement: document.getElementById("dock"),
  dropIndicatorElement: document.getElementById("drop-indicator"),
  apps: [],
  positions: {},
  dockIcons: [],

  isHolding: false,
  isDragging: false,
  draggedIcon: null,
  startX: 0,
  startY: 0,
  startTranslateX: 0,
  startTranslateY: 0,
  currentPageIndex: 0,

  chunkArray: function (array, chunkSize) {
    const chunkedArray = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunkedArray.push(array.slice(i, i + chunkSize));
    }
    return chunkedArray;
  },

  savePositions: function () {
    var icons = document.getElementsByClassName("icon");
    for (var i = 0; i < icons.length; i++) {
      var icon = icons[i];
      this.positions[icon.id] = {
        transform: icon.style.transform,
      };
    }
    localStorage.setItem("positions", JSON.stringify(this.positions));
  },

  restorePositions: function () {
    var savedPositions = JSON.parse(localStorage.getItem("positions"));
    if (savedPositions) {
      for (var id in savedPositions) {
        if (savedPositions.hasOwnProperty(id)) {
          var icon = document.getElementById(id);
          if (icon) {
            icon.style.transform = savedPositions[id].transform;
          }
        }
      }
    }
  },

  init: function () {
    this.gridElement.style.setProperty("--grid-columns", this.gridColumns);
    this.gridElement.style.setProperty("--grid-rows", this.gridRows);
    this.dockElement.style.setProperty("--grid-columns", this.gridColumns);

    fs.readdir(path.join('webapps'), (error, files) => {
      if (error) {
        throw error;
      }

      files.forEach(file => {
        const appManifestPath = path.join('webapps', file, 'manifest.json');
        if (!fs.existsSync(appManifestPath)) {
          return;
        }
        const appManifest = JSON.parse(fs.readFileSync(appManifestPath, { encoding: 'utf-8' }));
        console.log(appManifest);

        appManifest.manifestUrl = `http://${file}.localhost:${location.port}/manifest.json`;
        if (appManifest.icons) {
          Object.entries(appManifest.icons).forEach((icon) => {
            appManifest.icons[icon[0]] = `http://${file}.localhost:${location.port}${icon[1]}`;
          });
        }

        this.apps.push(appManifest);
      });

      this.createIcons();
    });

    document.addEventListener("mousemove", this.dragMove);
    document.addEventListener("touchmove", this.dragMove);
    document.addEventListener("mouseup", this.dragEnd);
    document.addEventListener("touchend", this.dragEnd);

    // Restore positions
    this.restorePositions();
  },

  createIcons: function () {
    var index = 0;
    var pages = this.chunkArray(this.apps, (this.gridColumns * this.gridRows) + 1);
    pages.forEach((page, pageIndex) => {
      index = 0;

      var element = document.createElement("div");
      element.classList.add("page");
      element.style.transform = `translateX(${window.innerWidth * pageIndex}px)`;
      this.gridElement.appendChild(element);

      page.forEach(app => {
        if (this.HIDDEN_ROLES.indexOf(app.role) !== -1) {
          return;
        }

        var icon = document.createElement("div");
        icon.id = `appicon${pageIndex + index}`;
        icon.classList.add("icon");
        var x = ((window.innerWidth - 20) / this.gridColumns) * (index % this.gridColumns);
        var y = ((window.innerHeight - 130) / this.gridRows) * (parseInt(index / this.gridColumns) % this.gridRows);
        icon.style.transform = `translate(${x}px, ${y}px)`;
        if (app.type == 'widget') {
          icon.classList.add(`widget-${app.size[0]}x${app.size[1]}`);
        }
        element.appendChild(icon);

        var iconHolder = document.createElement("div");
        iconHolder.classList.add("icon-holder");
        icon.appendChild(iconHolder);

        var iconContainer = document.createElement("img");
        iconContainer.crossOrigin = 'anonymous';
        iconContainer.src = app.icons[45];
        iconHolder.appendChild(iconContainer);

        var name = document.createElement("div");
        name.classList.add("name");
        name.textContent = app.name;
        icon.appendChild(name);

        // Add event listeners for long press and drag
        icon.addEventListener("mousedown", this.longPressStart);
        icon.addEventListener("mouseup", () => this.longPressEnd(app));
        icon.addEventListener("touchstart", this.longPressStart);
        icon.addEventListener("touchend", () => this.longPressEnd(app));

        index++;
      });
    });
  },

  longPressStart: function (event) {
    event.preventDefault();
    Grid.draggedIcon = this;
    Grid.isDragging = false;
    Grid.isHolding = true;
    Grid.startX = event.clientX || event.touches[0].clientX;
    Grid.startY = event.clientY || event.touches[0].clientY;

    // Get the existing translate values of the icon
    Grid.startTranslateX = Grid.draggedIcon.getBoundingClientRect().left - 10;
    Grid.startTranslateY = Grid.draggedIcon.getBoundingClientRect().top;

    setTimeout(function () {
      if (!Grid.isDragging && Grid.isHolding) {
        Grid.dragStart();
      }
    }, 500);
  },

  longPressEnd: function (app) {
    Grid.isHolding = false;

    var x = Grid.draggedIcon.getBoundingClientRect().left + (Grid.draggedIcon.offsetWidth / 2);
    var y = Grid.draggedIcon.getBoundingClientRect().top + (Grid.draggedIcon.offsetHeight / 3);

    if (!Grid.isDragging) {
      // Dispatch the custom event with the manifest URL
      ipcRenderer.sendToHost('open-app', {
        data: {
          manifestUrl: app.manifestUrl,
          xOrigin: x,
          yOrigin: y
        }
      });
    }
  },

  dragStart: function () {
    Grid.isDragging = true;
    Grid.draggedIcon.classList.add("dragging");
    Grid.draggedIcon.style.zIndex = "9999";

    Grid.dropIndicatorElement.classList.add("visible");
    Grid.dockElement.classList.add("dragging-dock");

    var currentPage = Grid.draggedIcon.closest(".page");
    Grid.currentPageIndex = Array.from(Grid.gridElement.children).indexOf(currentPage);

    // Store the icons in the dock for reference
    Grid.dockIcons = Array.from(Grid.dockElement.getElementsByClassName("icon"));
  },

  dragMove: function (event) {
    if (Grid.isDragging) {
      event.preventDefault();
      var clientX = event.clientX || event.touches[0].clientX;
      var clientY = event.clientY || event.touches[0].clientY;
      var deltaX = clientX - Grid.startX;
      var deltaY = clientY - Grid.startY;

      // Calculate the new position based on initial position and delta values
      var newPositionX = Grid.startTranslateX + deltaX;
      var newPositionY = Grid.startTranslateY + deltaY;

      // Calculate the closest grid position
      var gridX = Math.round(newPositionX / ((window.innerWidth - 20) / Grid.gridColumns));
      var gridY = Math.round((newPositionY - 40) / ((window.innerHeight - 130) / Grid.gridRows));

      // Snap the icon to the grid position
      var snappedX = gridX * ((window.innerWidth - 20) / Grid.gridColumns);
      var snappedY = gridY * ((window.innerHeight - 130) / Grid.gridRows);

      // Update the transform with the new position
      Grid.draggedIcon.style.transform = `translate(${newPositionX}px, ${newPositionY}px)`;

      // Update the drop indicator position
      Grid.dropIndicatorElement.style.transform = `translate(${10 + snappedX}px, ${40 + snappedY}px)`;
      Grid.dropIndicatorElement.style.width = `${Grid.draggedIcon.offsetWidth}px`;
      Grid.dropIndicatorElement.style.height = `${Grid.draggedIcon.offsetHeight}px`;

      // Move icons within the grid
      Grid.moveIconsOutOfTheWay(gridX, gridY, Grid.draggedIcon);

      // Move icons within the dock
      Grid.moveIconsOutOfTheWay(0, gridY, null, Grid.dockIcons);
    }
  },

  dragEnd: function (event) {
    if (Grid.isDragging) {
      Grid.isDragging = false;
      Grid.draggedIcon.classList.remove("dragging");
      Grid.dropIndicatorElement.classList.remove("visible");
      Grid.draggedIcon.style.zIndex = "";
      var clientX = event.clientX || event.touches[0].clientX;
      var clientY = event.clientY || event.touches[0].clientY;
      var deltaX = clientX - Grid.startX;
      var deltaY = clientY - Grid.startY;

      // Calculate the new position based on initial position and delta values
      var newPositionX = Grid.startTranslateX + deltaX;
      var newPositionY = Grid.startTranslateY + deltaY;

      // Calculate the closest grid position
      var gridX = Math.round(newPositionX / ((window.innerWidth - 20) / Grid.gridColumns));
      var gridY = Math.round((newPositionY - 40) / ((window.innerHeight - 130) / Grid.gridRows));

      // Snap the icon to the grid position
      var snappedX = gridX * ((window.innerWidth - 20) / Grid.gridColumns);
      var snappedY = gridY * ((window.innerHeight - 130) / Grid.gridRows);

      Grid.draggedIcon.style.transform = `translate(${10 + snappedX}px, ${snappedY}px)`;
      Grid.savePositions();

      // Check if dropped on the dock
      var dockRect = Grid.dockElement.getBoundingClientRect();
      if (clientX >= dockRect.left &&
          clientX <= dockRect.right &&
          clientY >= dockRect.top &&
          clientY <= dockRect.bottom) {
        var dockIcon = document.createElement("div");
        dockIcon.classList.add("icon", "dock-icon");
        dockIcon.appendChild(Grid.draggedIcon);
        Grid.dockElement.appendChild(dockIcon);
        Grid.draggedIcon.style.transform = "";
        Grid.dropIndicatorElement.classList.remove("visible");
        Grid.savePositions();
      } else {
        // Check if dropped on a different page
        var currentPage = Grid.draggedIcon.closest(".page");
        var currentPageIndex = Array.from(Grid.gridElement.children).indexOf(currentPage);
        if (currentPageIndex !== gridX) {
          var newPage = Grid.gridElement.children[gridX];
          newPage.appendChild(Grid.draggedIcon);
          Grid.savePositions();
        }
      }
    }
  },

  moveIconsOutOfTheWay: function (gridX, gridY, draggedIcon, icons) {
    icons = icons || Array.from(document.getElementsByClassName("icon"));
    icons.forEach((icon) => {
      if (icon !== draggedIcon) {
        var iconRect = icon.getBoundingClientRect();
        var iconGridX = Math.round(iconRect.left / (window.innerWidth / Grid.gridColumns));
        var iconGridY = Math.round((iconRect.top - 40) / ((window.innerHeight - 130) / Grid.gridRows));

        if (iconGridX === gridX && iconGridY === gridY) {
          // Move the icon out of the way
          var newGridX = iconGridX;
          var newGridY = iconGridY;

          if (gridX < Grid.gridColumns - 1) {
            newGridX++;
          } else {
            newGridX--;
          }

          // Calculate the new position
          var newPositionX = newGridX * ((window.innerWidth - 20) / Grid.gridColumns);
          var newPositionY = newGridY * ((window.innerHeight - 130) / Grid.gridRows) + 40;
          icon.style.transform = `translate(${10 + newPositionX}px, ${newPositionY}px)`;
        }
      }
    });
  },
};

Grid.init();
