const { app, BrowserWindow } = require('electron');
const appSetup = require('./app');
const path = require('node:path');
const core = require('./core');
require('ejs-electron'); // require this for rendering ejs file :D

let mainWindow;

const createWindow = async (app) => {
	// https://www.electronjs.org/docs/latest/api/structures/base-window-options
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		autoHideMenuBar: true,
		icon: path.join(__dirname, './views/public/imgs/icon.jpg'),
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
		},
	});

	await core(app, mainWindow);
	// mainWindow.webContents.openDevTools();
};

appSetup(app, createWindow).catch((error) => {
	throw error;
});
