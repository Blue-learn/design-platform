const { exec } = require('child_process'); // native in nodeJs
const chokidar = require('chokidar');

chokidar
	.watch('.', {
		ignored: [
			'**/node_modules/**/*',
			'**/src/**/*',
			'**/scripts/**/*',
			'**/.git/**/*',
		],
		ignoreInitial: true,
		persistent: true,
	})
	.on('all', async (event, path) => {
		console.log('event ->', event, ' ', 'path', path);
		if (event === 'change') {
			exec(`sh scripts/copy-watcher.sh ${path}`, (error, stdout, stderr) => {
				if (error) {
					console.log(`error: ${error.message}`);
					return;
				}
				if (stderr) {
					console.log(`stderr: ${stderr}`);
					return;
				}
				console.log(`stdout: ${stdout}`);
			});
			console.log(
				'..............................................',
			);
		}
	});
