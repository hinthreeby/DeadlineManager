/**
 * Bộ điều khiển quản lý các deadline.
 * @module controllers/deadline
 */

const deadlineModel = require('../models/deadline');

/**
 * Lớp xử lý các hoạt động liên quan tới deadline,
 * bao gồm lấy danh sách, tạo mới, xóa và đánh dấu hoàn thành.
 */
class deadline {
	/**
	 * Khởi tạo bộ điều khiển deadline.
	 * @param {BrowserWindow} mainWindow - Cửa sổ chính của ứng dụng.
	 */
	constructor(mainWindow) {
		console.info('[Deadline Controller]: Setting up ...');
		/**
		 * Tham chiếu tới cửa sổ chính của ứng dụng.
		 * @type {BrowserWindow}
		 */
		this.mainWindow = mainWindow;
		console.info('[Deadline Controller]: Finished!');
	}

	/**
	 * Lấy tất cả các deadline từ kho dữ liệu.
	 * @returns {Promise<Array<Object>>} - Mảng các đối tượng deadline.
	 */
	getAll() {
		return deadlineModel.getAll();
	}

	/**
	 * Lưu một deadline mới vào kho dữ liệu.
	 * @param {Object} deadline - Dữ liệu deadline cần lưu.
	 * @returns {Promise<Object>} - Đối tượng deadline đã lưu.
	 */
	saveDeadline(deadline) {
		return deadlineModel.saveDeadline(deadline);
	}

	/**
	 * Xóa deadline theo ID.
	 * @param {string} id - ID của deadline cần xóa.
	 * @returns {Promise<void>} - Kết thúc khi xóa xong.
	 */
	deleteDeadline(id) {
		return deadlineModel.deleteDeadline(id);
	}

	/**
	 * Đánh dấu một deadline là đã hoàn thành theo ID.
	 * @param {string} id - ID của deadline cần đánh dấu hoàn thành.
	 * @returns {Promise<Object>} - Đối tượng deadline đã cập nhật.
	 */
	finishDeadline(id) {
		return deadlineModel.finishDeadline(id);
	}
}

/**
 * Xuất hàm khởi tạo bộ điều khiển deadline.
 * @param {BrowserWindow} mainWindow - Cửa sổ chính của ứng dụng.
 * @returns {deadline} - Thể hiện mới của bộ điều khiển deadline.
 */
module.exports = (mainWindow) => {
	return new deadline(mainWindow);
};
