// This module installs a MessageQueue spy at import time, guarded by __DEV__.
// The spy callback is captured so its formatting logic - the only logic here -
// can be exercised directly.
const mockSpy = jest.fn();

jest.mock(
	'react-native/Libraries/BatchedBridge/MessageQueue',
	() => ({ __esModule: true, default: { spy: (...a: any[]) => mockSpy(...a) } }),
	{ virtual: true },
);

const loadModule = (dev: boolean) => {
	jest.resetModules();
	mockSpy.mockClear();
	(global as any).__DEV__ = dev;
	jest.isolateModules(() => {
		require('../messageQueueSpy');
	});
	return mockSpy.mock.calls[0]?.[0];
};

describe('messageQueueSpy installation', () => {
	afterEach(() => {
		delete (global as any).__DEV__;
	});

	it('installs the spy in development', () => {
		loadModule(true);

		expect(mockSpy).toHaveBeenCalledTimes(1);
		expect(typeof mockSpy.mock.calls[0][0]).toBe('function');
	});

	it('installs nothing in production', () => {
		// The spy stringifies every bridge message. Leaving it enabled in a
		// release build logs on every native call and visibly janks the app.
		loadModule(false);

		expect(mockSpy).not.toHaveBeenCalled();
	});
});

describe('messageQueueSpy callback', () => {
	let callback: (msg: any) => void;
	let logSpy: jest.SpyInstance;

	beforeEach(() => {
		callback = loadModule(true);
		logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		logSpy.mockRestore();
		delete (global as any).__DEV__;
	});

	it('ignores WebSocketModule traffic entirely', () => {
		// The dev-server websocket is constant chatter; without this filter it
		// drowns out every other bridge message and the spy is useless.
		callback({ module: 'WebSocketModule', method: 'send', args: ['x'] });

		expect(logSpy).not.toHaveBeenCalled();
	});

	it('labels a message with a type as JS -> Native', () => {
		callback({ type: 1, module: 'UIManager', method: 'measure', args: [] });

		expect(logSpy.mock.calls[0][0]).toContain('JS -> Native');
	});

	it('labels a message without a type as Native -> JS', () => {
		// Direction is inferred from the truthiness of `msg.type`, so a message
		// with type 0 also reads as Native -> JS. Getting the direction backwards
		// makes the log actively misleading when debugging a bridge stall.
		callback({ module: 'UIManager', method: 'measure', args: [] });

		expect(logSpy.mock.calls[0][0]).toContain('Native -> JS');
	});

	it('joins module and method with a dot', () => {
		callback({ type: 1, module: 'UIManager', method: 'measure', args: [] });

		expect(logSpy.mock.calls[0][0]).toContain('UIManager.measure()');
	});

	it('omits the missing half when only one of module/method is present', () => {
		// The filter(Boolean) before join is what stops "undefined.measure".
		callback({ type: 1, method: 'measure', args: [] });

		expect(logSpy.mock.calls[0][0]).toContain('measure()');
		expect(logSpy.mock.calls[0][0]).not.toContain('undefined');
	});

	it('JSON-encodes each argument and comma-separates them', () => {
		callback({
			type: 1,
			module: 'M',
			method: 'm',
			args: [1, 'two', { three: true }],
		});

		expect(logSpy.mock.calls[0][0]).toContain('1, "two", {"three":true}');
	});

	it('truncates any single argument longer than 1000 characters', () => {
		// A full screen payload can be hundreds of KB. Logging it whole is slow
		// enough to change the timing of what is being debugged.
		callback({ type: 1, module: 'M', method: 'm', args: ['x'.repeat(5000)] });

		const logged = logSpy.mock.calls[0][0];
		const argsPart = logged.slice(logged.indexOf('(') + 1, -1);
		expect(argsPart).toHaveLength(1000);
	});

	it('leaves an argument at the boundary untruncated', () => {
		// The check is `> 1000`, so exactly 1000 characters of JSON passes
		// through whole.
		const value = 'y'.repeat(998); // 998 chars + 2 quotes = 1000 of JSON
		callback({ type: 1, module: 'M', method: 'm', args: [value] });

		const logged = logSpy.mock.calls[0][0];
		expect(logged).toContain(value);
	});

	it('handles a message with no args at all', () => {
		callback({ type: 1, module: 'M', method: 'm' });

		expect(logSpy.mock.calls[0][0]).toContain('M.m()');
	});

	it('logs exactly one line per message', () => {
		callback({ type: 1, module: 'M', method: 'm', args: [] });

		expect(logSpy).toHaveBeenCalledTimes(1);
	});
});
