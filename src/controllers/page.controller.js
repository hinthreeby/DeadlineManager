const path = require('path');
class page {
	constructor(mainWindow) {
		console.info('[Page Controller]: Setting up ...');
		this.mainWindow = mainWindow;
		console.info('[Page Controller]: Finished!');
	}

	render(page) {
		this.mainWindow.loadURL(path.join(__dirname, `../views/${page}.ejs`));
	}
}

module.exports = (mainWindow) => {
	return new page(mainWindow);
};
