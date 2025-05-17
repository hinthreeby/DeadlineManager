const deadlineModel = require('../models/deadline');
class deadline {
	constructor(mainWindow) {
		console.info('[Deadline Controller]: Setting up ...');
		this.mainWindow = mainWindow;
		console.info('[Deadline Controller]: Finished!');
	}

	getAll() {
		return deadlineModel.getAll();
	}

	saveDeadline(deadline) {
		return deadlineModel.saveDeadline(deadline);
	}

	deleteDeadline(id) {
		return deadlineModel.deleteDeadline(id);
	}

	finishDeadline(id) {
		return deadlineModel.finishDeadline(id);
	}
}

module.exports = (mainWindow) => {
	return new deadline(mainWindow);
};
