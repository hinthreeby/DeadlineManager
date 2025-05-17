/**
 * Bộ điều khiển hiển thị trang.
 * @module controllers/page
 */

const path = require('path');

/**
 * Lớp xử lý việc tải và hiển thị các view EJS trong cửa sổ chính của ứng dụng.
 */
class page {
	/**
	 * Khởi tạo bộ điều khiển trang.
	 * @param {BrowserWindow} mainWindow - Cửa sổ chính của ứng dụng.
	 */
	constructor(mainWindow) {
		console.info('[Page Controller]: Setting up ...');
		/**
		 * Tham chiếu đến cửa sổ chính của ứng dụng.
		 * @type {BrowserWindow}
		 */
		this.mainWindow = mainWindow;
		console.info('[Page Controller]: Finished!');
	}

	/**
	 * Tải và hiển thị một trang EJS.
	 * @param {string} page - Tên file trang (không bao gồm phần mở rộng) trong thư mục views.
	 */
	render(page) {
		this.mainWindow.loadURL(path.join(__dirname, `../views/${page}.ejs`));
	}
}

/**
 * Hàm tạo và xuất bộ điều khiển trang.
 * @param {BrowserWindow} mainWindow - Cửa sổ chính của ứng dụng.
 * @returns {page} Thể hiện mới của bộ điều khiển trang.
 */
module.exports = (mainWindow) => {
	return new page(mainWindow);
};
