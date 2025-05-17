/**
 * Mô-đun truy cập cơ sở dữ liệu cho bảng Deadline.
 * @module models/deadline
 */

const db = require('../database').getConnection();

/**
 * Lấy tất cả các bản ghi deadline.
 * @returns {Array<Object>} Mảng các đối tượng deadline từ cơ sở dữ liệu.
 */
const getAll = () => {
	// Sử dụng prepared statement không có tham số
	return db.prepare('SELECT * FROM Deadline').all();
};

/**
 * Lấy một deadline theo ID.
 * @param {number} id - ID của deadline cần lấy.
 * @returns {Object|undefined} Đối tượng deadline hoặc undefined nếu không tìm thấy.
 */
const getById = (id) => {
	// Kiểm tra tham số đầu vào
	if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
		throw new Error('ID phải là một số nguyên dương');
	}

	// Sử dụng prepared statement với tham số được ràng buộc
	return db.prepare('SELECT * FROM Deadline WHERE ID = ?').get(id);
};

/**
 * Lưu một deadline mới vào cơ sở dữ liệu.
 * @param {Object} deadline - Đối tượng chứa dữ liệu deadline cần lưu.
 * @param {string} deadline.Name - Tên deadline.
 * @param {string} deadline.Description - Mô tả chi tiết.
 * @param {string} deadline.CreatedAt - Thời điểm tạo (định dạng ISO).
 * @param {string} deadline.EndAt - Thời điểm kết thúc (định dạng ISO).
 * @param {number} deadline.Finished - Trạng thái hoàn thành (0 hoặc 1).
 * @param {number} deadline.Priority - Mức độ ưu tiên (số nguyên).
 * @param {number} deadline.ReminderTime - Thời gian nhắc (số nguyên).
 * @param {string} deadline.ReminderUnit - Đơn vị nhắc (ví dụ: 'minutes', 'hours').
 * @returns {number} ID của bản ghi vừa được chèn.
 * @throws {Error} Nếu dữ liệu không hợp lệ.
 */
const saveDeadline = (deadline) => {
	// Xác thực dữ liệu đầu vào
	validateDeadlineData(deadline);

	// Chuẩn bị dữ liệu sạch để chèn vào cơ sở dữ liệu
	const sanitizedDeadline = {
		Name: String(deadline.Name).trim(),
		Description: String(deadline.Description || '').trim(),
		CreatedAt: String(deadline.CreatedAt),
		EndAt: String(deadline.EndAt),
		Finished: Number(deadline.Finished) === 1 ? 1 : 0,
		Priority: Number(deadline.Priority),
		ReminderTime: Number(deadline.ReminderTime),
		ReminderUnit: String(deadline.ReminderUnit).trim(),
	};

	// Sử dụng prepared statement với các tham số được đặt tên
	const statement = db.prepare(`
    INSERT INTO Deadline
    (Name, Description, CreatedAt, EditedAt, EndAt, Finished, Priority, ReminderTime, ReminderUnit)
    VALUES (
      @Name, @Description, @CreatedAt, NULL, @EndAt, @Finished, @Priority, @ReminderTime, @ReminderUnit
    );
  `);

	const result = statement.run(sanitizedDeadline);
	return result.lastInsertRowid;
};

/**
 * Cập nhật một deadline.
 * @param {number} id - ID của deadline cần cập nhật.
 * @param {Object} deadline - Đối tượng chứa dữ liệu cập nhật.
 * @returns {Object} Kết quả thực thi câu lệnh cập nhật.
 * @throws {Error} Nếu dữ liệu không hợp lệ.
 */
const updateDeadline = (id, deadline) => {
	// Kiểm tra ID
	if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
		throw new Error('ID phải là một số nguyên dương');
	}

	// Xác thực dữ liệu đầu vào
	validateDeadlineData(deadline);

	// Chuẩn bị dữ liệu sạch
	const sanitizedData = {
		id: Number(id),
		Name: String(deadline.Name).trim(),
		Description: String(deadline.Description || '').trim(),
		EditedAt: new Date().toISOString(),
		EndAt: String(deadline.EndAt),
		Finished: Number(deadline.Finished) === 1 ? 1 : 0,
		Priority: Number(deadline.Priority),
		ReminderTime: Number(deadline.ReminderTime),
		ReminderUnit: String(deadline.ReminderUnit).trim(),
	};

	// Sử dụng prepared statement với các tham số được đặt tên
	const statement = db.prepare(`
    UPDATE Deadline
    SET Name = @Name,
        Description = @Description,
        EditedAt = @EditedAt,
        EndAt = @EndAt,
        Finished = @Finished,
        Priority = @Priority,
        ReminderTime = @ReminderTime,
        ReminderUnit = @ReminderUnit
    WHERE ID = @id;
  `);

	return statement.run(sanitizedData);
};

/**
 * Xóa một deadline theo ID.
 * @param {number} id - ID của deadline cần xóa.
 * @returns {Object} Kết quả thực thi câu lệnh xóa.
 * @throws {Error} Nếu ID không hợp lệ.
 */
const deleteDeadline = (id) => {
	// Kiểm tra ID
	if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
		throw new Error('ID phải là một số nguyên dương');
	}

	// Sử dụng prepared statement với tham số được ràng buộc
	return db.prepare('DELETE FROM Deadline WHERE ID = ?').run(id);
};

/**
 * Đánh dấu một deadline là đã hoàn thành.
 * @param {number} id - ID của deadline cần cập nhật.
 * @returns {Object} Kết quả thực thi câu lệnh cập nhật.
 * @throws {Error} Nếu ID không hợp lệ.
 */
const finishDeadline = (id) => {
	// Kiểm tra ID
	if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
		throw new Error('ID phải là một số nguyên dương');
	}

	// Sử dụng prepared statement với tham số được ràng buộc
	return db.prepare('UPDATE Deadline SET Finished = 1 WHERE ID = ?').run(id);
};

/**
 * Xác thực dữ liệu deadline.
 * @param {Object} deadline - Đối tượng chứa dữ liệu deadline cần xác thực.
 * @throws {Error} Nếu dữ liệu không hợp lệ.
 * @private
 */
const validateDeadlineData = (deadline) => {
	if (!deadline) {
		throw new Error('Dữ liệu deadline không được để trống');
	}

	// Kiểm tra các trường bắt buộc
	if (!deadline.Name || typeof deadline.Name !== 'string' || deadline.Name.trim() === '') {
		throw new Error('Tên deadline không được để trống');
	}

	// Kiểm tra định dạng ngày tháng
	try {
		if (deadline.CreatedAt) {
			new Date(deadline.CreatedAt).toISOString();
		}
		if (deadline.EndAt) {
			new Date(deadline.EndAt).toISOString();
		}
	} catch (err) {
		throw new Error('Định dạng ngày tháng không hợp lệ');
	}

	// Kiểm tra các trường số
	if (deadline.Priority !== undefined && !Number.isInteger(Number(deadline.Priority))) {
		throw new Error('Mức độ ưu tiên phải là số nguyên');
	}

	if (deadline.ReminderTime !== undefined && (!Number.isInteger(Number(deadline.ReminderTime)) || Number(deadline.ReminderTime) < 0)) {
		throw new Error('Thời gian nhắc phải là số nguyên không âm');
	}

	// Kiểm tra trường ReminderUnit
	const validUnits = ['minutes', 'hours', 'days', 'weeks'];
	if (deadline.ReminderUnit && !validUnits.includes(String(deadline.ReminderUnit).toLowerCase())) {
		throw new Error('Đơn vị nhắc không hợp lệ');
	}

	// Kiểm tra trường Finished
	if (deadline.Finished !== undefined && ![0, 1].includes(Number(deadline.Finished))) {
		throw new Error('Trạng thái hoàn thành phải là 0 hoặc 1');
	}
};

module.exports = {
	getAll,
	getById,
	saveDeadline,
	updateDeadline,
	deleteDeadline,
	finishDeadline,
};
