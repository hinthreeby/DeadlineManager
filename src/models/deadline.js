const db = require('../database').getConnection();

const getAll = () => {
	return db.prepare('SELECT * FROM Deadline').all();
};

const saveDeadline = (deadline) => {
	return db
		.prepare(
			`
		INSERT INTO Deadline
		(Name, Description, CreatedAt, EditedAt, EndAt, Finished, Priority, ReminderTime, ReminderUnit)
		VALUES (
			@Name, @Description, @CreatedAt, NULL, @EndAt, @Finished, @Priority, @ReminderTime, @ReminderUnit
		);
	`
		)
		.run(deadline).lastInsertRowid;
};

const deleteDeadline = (id) => {
	return db
		.prepare(
			`
		DELETE FROM Deadline
		WHERE ID=?;	
	`
		)
		.run(id);
};

const finishDeadline = (id) => {
	return db
		.prepare(
			`
		UPDATE Deadline
		SET Finished=1
		WHERE ID=?;	
	`
		)
		.run(id);
};

module.exports = {
	getAll,
	saveDeadline,
	deleteDeadline,
	finishDeadline,
};
