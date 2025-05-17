/**
 * Mô-đun hỗ trợ đăng ký xử lý tắt ứng dụng mượt mà (graceful shutdown).
 * @module utils/shutdown
 * @param {Function} callback - Hàm async thực hiện công việc dọn dẹp trước khi thoát.
 */
module.exports = (callback) => {
	/**
	 * Thực thi quy trình tắt ứng dụng khi nhận tín hiệu hệ thống.
	 * @param {string} signal - Tên tín hiệu (ví dụ: 'SIGTERM' hoặc 'SIGINT').
	 */
	const shutdown = async (signal) => {
		console.info(`\nReceived ${signal}, starting graceful shutdown...`);
		try {
			await callback();
			console.info('Cleanup finished. Exiting...');
			process.exit(0);
		} catch (error) {
			console.error('Error during shutdown:', error);
			process.exit(1);
		}
	};

	// Đăng ký bắt các tín hiệu khi người dùng đóng ứng dụng
	process.on('SIGTERM', () => shutdown('SIGTERM'));
	process.on('SIGINT', () => shutdown('SIGINT'));
};
