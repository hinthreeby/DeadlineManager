module.exports = (callback) => {
	const shutdown = async () => {
		console.info(`\nReceived ${signal}, starting graceful shutdown...`);
		try {
			await callback();
			console.info('Cleanup finished. Exiting ...');
			process.exit(0);
		} catch (error) {
			console.error('Error during shutdown:', err);
			process.exit(1);
		}
	};

	// Add events that will fire when user closes application
	process.on('SIGTERM', () => {
		shutdown('SIGTERM');
		process.kill(process.pid, 'SIGTERM');
	});
	process.on('SIGINT', () => {
		shutdown('SIGINT');
		process.kill(process.pid, 'SIGINT');
	});
};
