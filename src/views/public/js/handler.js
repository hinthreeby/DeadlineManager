(async () => {
	// Đợi cho DOM sẵn sàng trước khi thực hiện bất kỳ thao tác nào
	document.addEventListener('DOMContentLoaded', async () => {
		/*
			window.apis.main(command, ...)
		*/
		let deadlines = (await window.apis.main('getAll')) || [];
		console.log('Loaded deadlines:', deadlines);
		let notificationTimers = [];

		const deadlineForm = document.getElementById('deadline-form');
		const deadlineContainer = document.getElementById('deadline-container');
		const sortBySelect = document.getElementById('sort-by');
		const showCompletedCheckbox = document.getElementById('show-completed');
		const notificationElement = document.getElementById('notification');

		const totalDeadlinesEl = document.getElementById('total-deadlines');
		const completedThisWeekEl = document.getElementById('completed-this-week');
		const onTimePercentageEl = document.getElementById('on-time-percentage');
		const upcomingDeadlinesEl = document.getElementById('upcoming-deadlines');

		function renderDeadlines() {
			console.log('Rendering deadlines:', deadlines);
			let filteredDeadlines = deadlines.filter((deadline) => {
				if (showCompletedCheckbox.checked) {
					return true;
				} else {
					return deadline.Finished === 0;
				}
			});

			const sortBy = sortBySelect.value;
			if (sortBy === 'date') {
				filteredDeadlines.sort((a, b) => {
					const dateA = new Date(a.EndAt);
					const dateB = new Date(b.EndAt);

					const timeA = isNaN(dateA) ? Infinity : dateA.getTime();
					const timeB = isNaN(dateB) ? Infinity : dateB.getTime();

					return timeA - timeB;
				});
			} else if (sortBy === 'priority') {
				const priorityOrder = { high: 0, medium: 1, low: 2 };
				filteredDeadlines.sort((a, b) => priorityOrder[a.Priority] - priorityOrder[b.Priority]);
			} else if (sortBy === 'newest') {
				// Sắp xếp theo thời gian tạo mới nhất trước
				filteredDeadlines.sort((a, b) => {
					const dateA = new Date(a.CreatedAt);
					const dateB = new Date(b.CreatedAt);

					const timeA = isNaN(dateA) ? 0 : dateA.getTime();
					const timeB = isNaN(dateB) ? 0 : dateB.getTime();

					// Sắp xếp giảm dần (mới nhất đầu tiên)
					return timeB - timeA;
				});
			}

			console.log('Filtered and sorted deadlines:', filteredDeadlines);

			if (filteredDeadlines.length === 0) {
				deadlineContainer.innerHTML = `<div class="no-deadlines"><p>Chưa có deadline nào được thêm</p></div>`;
				return;
			}

			deadlineContainer.innerHTML = '';

			filteredDeadlines.forEach((deadline) => {
				const deadlineEl = document.createElement('div');
				deadlineEl.className = `deadline-item ${deadline.Priority}`;

				if (deadline.Finished) {
					deadlineEl.classList.add('completed');
				}

				const dueDate = new Date(deadline.EndAt);
				let formattedDate = 'Không có hạn chót';
				let remainingTime = '';

				if (!isNaN(dueDate)) {
					formattedDate = dueDate.toLocaleDateString('vi-VN', {
						day: '2-digit',
						month: '2-digit',
						year: 'numeric',
						hour: '2-digit',
						minute: '2-digit',
					});
					remainingTime = getRemainingTimeText(dueDate);
				}

				const priorityText = getPriorityText(deadline.Priority);
				const createdDate = new Date(deadline.CreatedAt);
				const formattedCreatedDate = createdDate.toLocaleDateString('vi-VN', {
					day: '2-digit',
					month: '2-digit',
					year: 'numeric',
				});

				deadlineEl.innerHTML = `
					<div class="deadline-info">
						<div class="deadline-title">${deadline.Name}</div>
						<div class="deadline-meta">
							<div>Tạo ngày: ${formattedCreatedDate}</div>
							<div>Hạn chót: ${formattedDate} ${remainingTime ? `(${remainingTime})` : ''}</div>
							<div>Ưu tiên: ${priorityText}</div>
							${deadline.Description ? `<div>Ghi chú: ${deadline.Description}</div>` : ''}
						</div>
					</div>
					<div class="deadline-actions">
						${!deadline.Finished ? `<button class="action-btn complete" data-id="${deadline.ID}">✓</button>` : ''}
						<button class="action-btn delete" data-id="${deadline.ID}">✗</button>
					</div>
				`;

				deadlineContainer.appendChild(deadlineEl);

				const completeBtn = deadlineEl.querySelector('.action-btn.complete');
				const deleteBtn = deadlineEl.querySelector('.action-btn.delete');

				if (completeBtn) {
					completeBtn.addEventListener('click', () => completeDeadline(deadline.ID));
				}
				if (deleteBtn) {
					deleteBtn.addEventListener('click', () => deleteDeadline(deadline.ID));
				}
			});
		}

		async function addNewDeadline(e) {
			e.preventDefault();

			const taskName = document.getElementById('task-name').value;
			const dueDate = document.getElementById('due-date').value;
			const priority = document.getElementById('priority').value;
			const reminderTime = parseInt(document.getElementById('reminder-time').value);
			const reminderUnit = document.getElementById('reminder-unit').value;
			const notes = document.getElementById('notes').value;

			const newDeadline = {
				Name: taskName,
				Description: notes,
				CreatedAt: new Date().toISOString(),
				EditedAt: null,
				EndAt: dueDate,
				Finished: 0,
				Priority: priority,
				ReminderTime: reminderTime,
				ReminderUnit: reminderUnit,
			};

			await window.apis.main('saveDeadline', newDeadline);

			deadlines = (await window.apis.main('getAll')) || [];

			deadlineForm.reset();

			const now = new Date();
			now.setDate(now.getDate() + 1);
			document.getElementById('due-date').value = now.toISOString().slice(0, 16);
			document.getElementById('priority').value = 'medium';
			document.getElementById('reminder-time').value = '1';
			document.getElementById('reminder-unit').value = 'days';

			renderDeadlines();
			updateStats();
			setupNotifications();
			showNotification('Deadline mới đã được thêm!');
		}

		async function completeDeadline(id) {
			const deadline = deadlines.find((d) => d.ID === id);
			if (deadline) {
				deadline.Finished = 1;
				deadline.EditedAt = new Date().toISOString();

				// TODO: Update deadline using window.apis
				// Example: await window.apis.updateDeadline(deadline);
				await window.apis.main('finishDeadline', id);

				renderDeadlines();
				updateStats();
				showNotification('Deadline đã hoàn thành!');
			}
		}

		async function deleteDeadline(id) {
			if (confirm('Bạn có chắc muốn xóa deadline này?')) {
				deadlines = deadlines.filter((d) => d.ID !== id);

				// TODO: Delete deadline using window.apis
				await window.apis.main('deleteDeadline', id);

				renderDeadlines();
				updateStats();
				setupNotifications();
				showNotification('Deadline đã được xóa!');
			}
		}

		function updateStats() {
			totalDeadlinesEl.textContent = deadlines.length;

			const oneWeekAgo = new Date();
			oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

			const completedThisWeek = deadlines.filter((d) => {
				return d.Finished && new Date(d.EditedAt || d.CreatedAt) >= oneWeekAgo;
			}).length;

			completedThisWeekEl.textContent = completedThisWeek;

			const completedDeadlines = deadlines.filter((d) => d.Finished);
			let onTimePercentage = 0;
			if (completedDeadlines.length > 0) {
				const onTimeCount = completedDeadlines.filter((d) => new Date(d.EditedAt || d.CreatedAt) <= new Date(d.EndAt)).length;
				onTimePercentage = Math.round((onTimeCount / completedDeadlines.length) * 100);
			}

			onTimePercentageEl.textContent = onTimePercentage + '%';

			const upcomingDeadlines = deadlines.filter((d) => !d.Finished && new Date(d.EndAt) > new Date()).length;
			upcomingDeadlinesEl.textContent = upcomingDeadlines;
		}

		function setupNotifications() {
			notificationTimers.forEach((timer) => clearTimeout(timer));
			notificationTimers = [];

			const incompleteDeadlines = deadlines.filter((d) => !d.Finished);

			incompleteDeadlines.forEach((deadline) => {
				const dueDate = new Date(deadline.EndAt);
				let reminderTime = deadline.ReminderTime || 1;
				const reminderDate = new Date(dueDate);

				if (deadline.ReminderUnit === 'hours') {
					reminderDate.setHours(reminderDate.getHours() - reminderTime);
				} else if (deadline.ReminderUnit === 'days') {
					reminderDate.setDate(reminderDate.getDate() - reminderTime);
				} else {
					reminderDate.setMinutes(reminderDate.getMinutes() - reminderTime);
				}

				const timeUntilReminder = reminderDate - new Date();

				if (timeUntilReminder > 0) {
					const timer = setTimeout(() => {
						const updatedDeadline = deadlines.find((d) => d.ID === deadline.ID && !d.Finished);
						if (updatedDeadline) {
							const notification = `Nhắc nhở: "${deadline.Name}" sắp hết hạn!`;
							showNotification(notification);
							if (Notification.permission === 'granted') {
								new Notification('Deadline Manager', { body: notification });
							}
						}
					}, timeUntilReminder);
					notificationTimers.push(timer);
				}
			});
		}

		function showNotification(message) {
			notificationElement.textContent = message;
			notificationElement.style.display = 'block';
			setTimeout(() => {
				notificationElement.style.display = 'none';
			}, 5000);
		}

		function getRemainingTimeText(dueDate) {
			const now = new Date();
			const diff = dueDate - now;
			if (diff < 0) return 'Đã quá hạn';
			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			if (days > 0) return `Còn ${days} ngày ${hours} giờ`;
			return `Còn ${hours} giờ`;
		}

		function getPriorityText(priority) {
			const priorityMap = { high: 'Cao', medium: 'Trung bình', low: 'Thấp' };
			return priorityMap[priority] || 'Không xác định';
		}

		function requestNotificationPermission() {
			if (Notification && Notification.permission !== 'granted') {
				Notification.requestPermission();
			}
		}

		deadlineForm.addEventListener('submit', addNewDeadline);
		sortBySelect.addEventListener('change', renderDeadlines);
		showCompletedCheckbox.addEventListener('change', renderDeadlines);

		const dueDateInput = document.getElementById('due-date');
		const now = new Date();
		now.setDate(now.getDate() + 1);
		dueDateInput.value = now.toISOString().slice(0, 16);

		renderDeadlines();
		updateStats();
		setupNotifications();
		requestNotificationPermission();

		console.log('Initialization complete');
	});
})();
