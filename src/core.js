/**
 * Mô-đun khởi tạo và cấu hình các thành phần cốt lõi của ứng dụng Electron:
 * - Kết nối cơ sở dữ liệu
 * - Thiết lập IPC handler
 * - Tự động nạp các controller và util modules
 * - Đăng ký hành động tắt ứng dụng và hiển thị trang chính
 * @module core
 * @param {Electron.App} app - Đối tượng App của Electron
 * @param {BrowserWindow} mainWindow - Cửa sổ chính của ứng dụng
 * @returns {Promise<void>} Promise hoàn thành khi khởi tạo xong
 */

const fs = require('fs');
const path = require('path');

// Khởi tạo các không gian tên toàn cục
global.controllers = {};
global.utils = {};
global.db = null;

module.exports = async (app, mainWindow) => {
	console.info('[Core]: Trying to connect to the database ...');
	/**
	 * Kết nối đến cơ sở dữ liệu và gán vào global.db
	 * @type {any}
	 */
	global.db = await require('./database').init(app);

	console.info('[Core]: Setting IPC Handler ...');
	require('./ipcHandler')();

	// Tự động nạp controllers
	if (!Object.keys(global.controllers).length) {
		const controllersPath = path.join(__dirname, '/controllers');
		const controllerFiles = await fs.promises.readdir(controllersPath, { withFileTypes: true });

		for (const controllerFile of controllerFiles) {
			if (controllerFile.isFile() && controllerFile.name.endsWith('.js')) {
				console.info(`[Core]: Loading ${controllerFile.name}`);
				const name = controllerFile.name.split('.')[0];
				const controller = require(path.join(controllersPath, controllerFile.name));
				/**
				 * Đăng ký controller toàn cục
				 * @type {any}
				 */
				global.controllers[name] = controller(mainWindow);
			}
		}
	}

	// Tự động nạp utils
	if (!Object.keys(global.utils).length) {
		const utilsPath = path.join(__dirname, '/utils');
		const utilFiles = await fs.promises.readdir(utilsPath, { withFileTypes: true });

		for (const utilFile of utilFiles) {
			if (utilFile.isFile() && utilFile.name.endsWith('.js')) {
				console.info(`[Core]: Loading ${utilFile.name}`);
				const name = utilFile.name.split('.')[0];
				const util = require(path.join(utilsPath, utilFile.name));
				/**
				 * Đăng ký tiện ích toàn cục
				 * @type {Function|Object}
				 */
				global.utils[name] = util;
			}
		}
	}

	// Đăng ký hành động tắt ứng dụng mượt mà
	global.utils['shutdown'](() => {
		db.close();
	});

	// Hiển thị trang chính
	global.controllers['page'].render('home');
};
