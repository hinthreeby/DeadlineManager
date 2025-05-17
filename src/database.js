const sqlite3 = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const registerShutdown = global.utils['shutdown'];

module.exports = {
	init: async () => {
		if (global.db) {
			console.info('[Database]: Found current db Instance');
			return global.db;
		}

		try {
			console.info('[Database]: Connecting to database ...');
			const userDataPath = app.getPath('userData');
			const dbPath = path.join(userDataPath, 'database.db');

			if (!fs.existsSync(dbPath)) {
				console.info('[Database]: Generating new database file ...');
				await fs.promises.writeFile(dbPath, '', { encoding: 'utf8' });
			}

			global.db = new sqlite3(dbPath, { verbose: console.log });

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

	getConnection: () => {
		if (global.db) {
			console.info('[Database]: Found current db Instance');
			return global.db;
		}
	},
};
