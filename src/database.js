/**
 * Mô-đun quản lý kết nối và khởi tạo cơ sở dữ liệu SQLite.
 * @module utils/database
 */

const sqlite3 = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const registerShutdown = global.utils['shutdown'];

module.exports = {
	/**
	 * Khởi tạo kết nối đến cơ sở dữ liệu SQLite.
	 * - Tạo file database nếu chưa tồn tại.
	 * - Thiết lập bảng Deadline nếu chưa có.
	 * - Đăng ký đóng kết nối khi đóng ứng dụng.
	 * @async
	 * @returns {Promise<sqlite3.Database>} Đối tượng kết nối cơ sở dữ liệu.
	 * @throws {Error} Nếu khởi tạo hoặc kết nối thất bại.
	 */
	init: async () => {
		if (global.db) {
			console.info('[Database]: Found current db Instance');
			return global.db;
		}

		try {
			console.info('[Database]: Connecting to database ...');
			const userDataPath = app.getPath('userData');
			const dbPath = path.join(userDataPath, 'database.db');

			// Tạo file database nếu chưa tồn tại
			if (!fs.existsSync(dbPath)) {
				console.info('[Database]: Generating new database file ...');
				await fs.promises.writeFile(dbPath, '', { encoding: 'utf8' });
			}

			// Mở kết nối SQLite với verbose log
			global.db = new sqlite3(dbPath, { verbose: console.log });

			// Thiết lập bảng Deadline
			global.db
				.prepare(
					`
        CREATE TABLE IF NOT EXISTS Deadline (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          Name TEXT NOT NULL,
          Description TEXT,
          CreatedAt TEXT NOT NULL,
          EditedAt TEXT,
          EndAt TEXT,
          Finished INTEGER DEFAULT 0,
          Priority TEXT DEFAULT 'medium',
          ReminderTime INTEGER DEFAULT 1,
          ReminderUnit TEXT DEFAULT 'days'
        );
      `
				)
				.run();

			console.info('[Database]: Connected.');

			// Đăng ký đóng kết nối khi shutdown
			if (registerShutdown) {
				registerShutdown(() => {
					global.db.close();
					console.info('[Database]: Database closed.');
				});
			}

			return global.db;
		} catch (error) {
			throw error;
		}
	},

	/**
	 * Lấy đối tượng kết nối đang hoạt động.
	 * @returns {sqlite3.Database|undefined} Đối tượng cơ sở dữ liệu nếu đã kết nối, ngược lại undefined.
	 */
	getConnection: () => {
		if (global.db) {
			console.info('[Database]: Found current db Instance');
			return global.db;
		}
	},
};
