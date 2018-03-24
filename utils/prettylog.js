const clc = require('cli-color');
const now = require('./utilities').now;

let mapping = {
  log: clc.white,
	info: clc.blue,
	warn: clc.yellow,
  error: clc.red
};

// Define some cool properties to get more information when a console method is triggered
Object.defineProperty(global, '__stack', {
	get: function() {
		let orig = Error.prepareStackTrace;
		Error.prepareStackTrace = function(_, stack) {
			return stack;
		};

		let err = new Error();
		Error.captureStackTrace(err, arguments.callee);

		let stack = err.stack;
		Error.prepareStackTrace = orig;

		return stack;
	}
});

Object.defineProperty(global, '__file', {
	get: function() {
		return __stack[2].getFileName();
  }
});
Object.defineProperty(global, '__line', {
	get: function() {
		return __stack[2].getLineNumber();
  }
});
Object.defineProperty(global, '__column', {
	get: function() {
		return __stack[2].getColumnNumber();
  }
});
Object.defineProperty(global, '__function', {
	get: function() {
  	return __stack[2].getFunctionName() || 'anonymous';
  }
});
Object.defineProperty(global, '__method', {
	get: function() {
  	return __stack[2].getMethodName() || 'anonymous';
  }
});

// Override the console printing methods
['log', 'info', 'warn', 'error'].forEach(function(method) {
  let oldMethod = console[method].bind(console);
  console[method] = function() {

    if (method === 'log') {
      return oldMethod.apply(console, arguments);
    }

		let time = now();

		let letter;
		switch (method) {
			case 'info':
				letter = 'I';
				break;
			case 'warn':
				letter = 'W';
				break;
			case 'error':
				letter = 'E';
				break;
		}

		let result = [mapping[method](letter+'  '+time)];

		if (method == 'warn' || method == 'error') {
			result.push(mapping[method](__file+':'+__line));
		}

		for (let i in arguments) {
			result.push(arguments[i]);
		}

    return oldMethod.apply(console, result);
  };
});
