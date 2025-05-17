/**
 * Mô-đun xử lý giao tiếp IPC giữa renderer và process chính.
 * @module utils/ipcHandler
 */

const { ipcMain } = require('electron/main');

/**
 * Danh sách các lệnh hợp lệ mà IPC có thể xử lý.
 * @type {Object.<string, boolean>}
 */
const validateCommands = {
	getAll: true,
	saveDeadline: true,
	deleteDeadline: true,
	finishDeadline: true,
};

/**
 * Thiết lập handler cho kênh IPC 'main'.
 * Khi nhận được sự kiện 'main', kiểm tra lệnh và chuyển tiếp tới controller tương ứng.
 * @function
 */
module.exports = () => {
	console.info('[IPC Handler]: Setting up ...');

	/**
	 * Xử lý lệnh được gửi từ renderer.
	 * @param {Electron.IpcMainInvokeEvent} event - Sự kiện IPC.
	 * @param {string} command - Tên lệnh cần thực hiện.
	 * @param {...any} args - Các đối số sẽ truyền cho controller.
	 * @returns {Promise<any>} Kết quả trả về từ controller tương ứng.
	 * @throws {Error} Khi nhận lệnh không hợp lệ.
	 */
	ipcMain.handle('main', (event, command, ...args) => {
		console.log('[IPC Handler]: Received command:', command);
		if (command && validateCommands[command] === true) {
			console.info('[IPC Handler]: Valid Command:', command);
			return global.controllers.deadline[command](...args);
		} else {
			console.warn('[IPC Handler]: Invalid Command:', command);
			throw new Error('Invalid command received');
		}
	});
};
