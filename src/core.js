const fs = require('fs');
const path = require('path');

global.controllers = {};
global.utils = {};
global.db = null;

module.exports = async (app, mainWindow) => {
	console.info('[Core]: Trying to connect to the database ...');
	global.db = await require('./database').init(app);

	console.info('[Core]: Setting IPC Handler ...');
	require('./ipcHandler')();

	if (!Object.keys(global.controllers).length) {
		const controllersPath = path.join(__dirname, '/controllers');
		const controllerFiles = await fs.promises.readdir(controllersPath, {
			withFileTypes: true,
		});

		for (const controllerFile of controllerFiles) {
			if (controllerFile.isFile() && controllerFile.name.endsWith('.js')) {
				console.info(`[Core]: Loading ${controllerFile.name}`);
				const name = controllerFile.name.split('.')[0];
				const controller = require(path.join(controllersPath, controllerFile.name));
				global.controllers[name] = controller(mainWindow);
			}
		}
	}

	if (!Object.keys(global.utils).length) {
		const utilsPath = path.join(__dirname, '/utils');
		const utilFiles = await fs.promises.readdir(utilsPath, {
			withFileTypes: true,
		});

		for (const utilFile of utilFiles) {
			if (utilFile.isFile() && utilFile.name.endsWith('.js')) {
				console.info(`[Core]: Loading ${utilFile.name}`);
				const name = utilFile.name.split('.')[0];
				const util = require(path.join(utilsPath, utilFile.name));
				global.utils[name] = util;
			}
		}
	}

	// Register shutdown action
	global.utils['shutdown'](() => {
		db.close();
	});
	global.controllers['page'].render('home');
};
