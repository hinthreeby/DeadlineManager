module.exports = (app, createWindow) => {
	return new Promise((resolve, reject) => {
		// Handle creating/removing shortcuts on Windows when installing/uninstalling.
		if (require('electron-squirrel-startup')) {
			app.quit();
		}

		console.info('[App]: Adding whenReady signal ...');
		app.whenReady()
			.then(() => {
				createWindow(app);
				app.on('activate', () => {
					if (BrowserWindow.getAllWindows().length === 0) {
						createWindow(app);
					}
				});
			})
			.catch((error) => reject(error));

		console.info('[App]: Adding window-all-closed signal ...');
		app.on('window-all-closed', () => {
			if (process.platform !== 'darwin') {
				app.quit();
			}
		});

		resolve(app);
	});
};
