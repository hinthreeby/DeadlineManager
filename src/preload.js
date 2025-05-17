const { contextBridge, ipcRenderer } = require('electron');

// https://www.electronjs.org/docs/latest/tutorial/tutorial-preload#what-is-a-preload-script
contextBridge.exposeInMainWorld('apis', {
	render: () => global.controllers.page.render,
	main: (command, ...args) => ipcRenderer.invoke('main', command, ...args),
});
