(function(win, doc){
	
	var ws, url, queue = [],
		client = document.getElementById("jsconsole"),
		host = win.location.hostname,
		_console = win.console,
		console = {
			log: function(msg) {
				if(ws.readyState === 1) { // OPEN
					ws.send("console.log was executed on "+host+"::"+msg);
					_console.log(msg);
				} else {
					methodQueue("log",msg);
				}
			},
			info: function(msg) {
				if(ws.readyState === 1) { // OPEN
					ws.send("console.info was executed on "+host+"::"+msg);
					_console.info(msg);
				} else {
					methodQueue("info",msg);
				}
			}
		},
		libraries = {
			jquery: 'http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js',
			prototype: 'http://ajax.googleapis.com/ajax/libs/prototype/1/prototype.js',
			dojo: 'http://ajax.googleapis.com/ajax/libs/dojo/1/dojo/dojo.xd.js',
			mootools: 'http://ajax.googleapis.com/ajax/libs/mootools/1/mootools-yui-compressed.js',
			underscore: 'http://documentcloud.github.com/underscore/underscore-min.js',
			rightjs: 'http://rightjs.org/hotlink/right.js',
			coffeescript: 'http://jashkenas.github.com/coffee-script/extras/coffee-script.js',
			yui: 'http://yui.yahooapis.com/3.2.0/build/yui/yui-min.js'
		};
	
	if (("WebSocket" in win) === false) {
		alert('Your browser does not seem to support websockets this is required.');
		return;
	}
	
	url = (client) ? client.getAttribute("data-socketaddress") : win.prompt("Enter socket url to connect to","");
	ws = new WebSocket(url);
	
	ws.onopen = function() {
		var call, data;
		
		console.info("connected to " + host);
		
		if(queue.length >= 1) {
			for(var i = 0, len = queue.length; i<len; i++) {
				data = queue[i].split("::");
				call = data[0];
				console[call](data[1]);
			}
		}
	};
	ws.onclose = function() {
		console.info("connection to "+ host +" closed");
	};
	ws.onmessage = function(msg) {
		// Eval all code that's passed through, maybe a smarter/safer option could be explored
		win["eval"](msg.data);
	};
	ws.onerror = function() {
		console.log("error");
	};
	
	function loadScript() {
		for (var i = 0; i < arguments.length; i++) {
			(function (url) {
				var script = document.createElement('script');
				script.src = url;
				script.onload = function () {
					console.info('Loaded ' + url, 'http://' + host);
				};
				script.onerror = function () {
					console.info('Failed to load ' + url, 'error');
				};
				doc.body.appendChild(script);
			})(libraries[arguments[i]] || arguments[i]);
		}
		return "Loading script...";
	}
	
	function methodQueue(method,data) {
		// Socket is yet to be connected, queue method calls
		queue.push(method+"::"+data);
	}
	
	// Expose loadScript and console methods globally
	win.loadScript = loadScript;
	win._console = _console;
	win.console = console;

})(this, this.document);