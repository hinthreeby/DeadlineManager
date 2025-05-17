/**
 * Entry point của ứng dụng Electron.
 * Thiết lập và khởi chạy vòng đời của ứng dụng.
 * @module main
 */

const { app, BrowserWindow } = require('electron');
const appSetup = require('./app');
const path = require('node:path');
const core = require('./core');
require('ejs-electron'); // Cung cấp khả năng render file EJS

/**
 * Thể hiện cửa sổ chính của ứng dụng.
 * @type {BrowserWindow}
 */
let mainWindow;

/**
 * Tạo và cấu hình cửa sổ chính của ứng dụng.
 * @async
 * @param {Electron.App} app - Đối tượng ứng dụng Electron.
 */
const createWindow = async (app) => {
	// Tham khảo: https://www.electronjs.org/docs/latest/api/structures/base-window-options
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		autoHideMenuBar: true,
		icon: path.join(__dirname, './views/public/imgs/icon.jpg'),
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
		},
	});

	// Khởi tạo các thành phần cốt lõi và hiển thị trang đầu
	await core(app, mainWindow);
	// mainWindow.webContents.openDevTools(); // Mở DevTools nếu cần gỡ lỗi
};

// Thiết lập ứng dụng và bắt lỗi nếu có
appSetup(app, createWindow).catch((error) => {
	throw error;
});
