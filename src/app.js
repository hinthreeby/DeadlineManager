/**
 * Mô-đun khởi tạo và quản lý vòng đời ứng dụng Electron.
 * @module utils/appLifecycle
 * @param {Electron.App} app - Đối tượng App của Electron.
 * @param {Function} createWindow - Hàm tạo cửa sổ chính của ứng dụng.
 * @returns {Promise<Electron.App>} - Promise trả về đối tượng App sau khi cấu hình xong.
 */
module.exports = (app, createWindow) => {
	return new Promise((resolve, reject) => {
		// Xử lý tạo/xóa shortcut trên Windows khi cài đặt/gỡ bỏ
		if (require('electron-squirrel-startup')) {
			app.quit();
		}

		console.info('[App]: Adding whenReady signal ...');
		app.whenReady()
			.then(() => {
				// Gọi hàm tạo cửa sổ chính
				createWindow(app);

				// Trên macOS, khi kích hoạt lại ứng dụng mà không còn cửa sổ nào, tạo mới
				app.on('activate', () => {
					const { BrowserWindow } = require('electron');
					if (BrowserWindow.getAllWindows().length === 0) {
						createWindow(app);
					}
				});
			})
			.catch((error) => reject(error));

		console.info('[App]: Adding window-all-closed signal ...');
		app.on('window-all-closed', () => {
			// Trên Windows và Linux, thoát ứng dụng khi tất cả cửa sổ bị đóng
			if (process.platform !== 'darwin') {
				app.quit();
			}
		});

		resolve(app);
	});
};
