import MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue';

// Please only do this in a __DEV__ environment
// console.log is slow
if (__DEV__) {
	MessageQueue.spy((msg: any) => {
		if (msg.module === 'WebSocketModule') {
			return;
		}

		const direction = msg.type
			? '🤖 JS -> Native'
			: '👨 Native -> JS';
		const functionName = [msg.module, msg.method]
			.filter((x) => x)
			.join('.');
		const args = (msg.args || [])
			.map((arg: any) => {
				const result = JSON.stringify(arg);

				// Optional: replace all JSON that's longer than 1000 chars
				// Usually that's quite helpful to increase readability
				if (result.length > 1000) {
					return result.substr(0, 1000);
				}

				return result;
			})
			.join(', ');

		console.log(
			`${direction}: ${functionName}(${args})`,
		);
	});
}
