# App Managment
## navigator.api.appManager

`readAppList()`
Lists installed apps with their manifests based on `webapps.json` entries.
It returns something similar to this with pre-installed apps:
```json
[
  {
    "appId": "app1",
    "installedAt": "(ISO Date)",
    "manifestUrl": "http://app1.localhost:8081/manifest.json"
  },
  ...
]
```
and this with 3rd-party installed apps:
```json
[
  ...
  {
    "appId": "{<UUID>}",
    "installedAt": "(ISO Date)",
    "manifestUrl": "http://{<UUID>}.localhost:8081/manifest.json"
  },
  ...
]
```

`installApp(zipFilePath)`
Installs a app using a zip archive file (zip archive filename dosen't affect function)
Installed apps use a randomized UUID for their ID
It can be used like this:
```js
navigator.api.appManager.installApp('/path/to/custom/app.zip');
```
