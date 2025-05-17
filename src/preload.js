/**
 * Preload script for Electron renderer processes.
 * Thiết lập cầu nối bảo mật giữa context chính và renderer thông qua contextBridge.
 * @module preload
 */

const { contextBridge, ipcRenderer } = require('electron');

/**
 * Đăng ký các API được phép truy cập từ renderer process.
 */
contextBridge.exposeInMainWorld('apis', {
	/**
	 * Gọi hàm render của controller page để tải view.
	 * @function
	 * @returns {Function} Hàm render nhận tên trang và thực thi tải URL.
	 */
	render: () => global.controllers.page.render,

	/**
	 * Gửi lệnh tới main process và nhận kết quả.
	 * @function
	 * @param {string} command - Tên lệnh (ví dụ: 'getAll', 'saveDeadline').
	 * @param {...any} args - Các đối số truyền kèm lệnh.
	 * @returns {Promise<any>} Kết quả trả về từ main process thông qua ipcRenderer.invoke.
	 */
	main: (command, ...args) => ipcRenderer.invoke('main', command, ...args),
});
