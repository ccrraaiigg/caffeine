var WebSocket = require("./ws/websocket");

class SafeWebSocketClient extends WebSocket {
	constructor(url, protocols) {
		super(url, protocols, { perMessageDeflate: false });
	}
}

module.exports = SafeWebSocketClient;
