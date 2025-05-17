const { ipcMain } = require('electron/main');

const validateCommands = {
	getAll: true,
	saveDeadline: true,
	deleteDeadline: true,
	finishDeadline: true,
};

module.exports = () => {
	console.info('[IPC Handler]: Setting up ...');
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
