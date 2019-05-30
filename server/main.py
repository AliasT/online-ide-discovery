import json
import logging
from pyls.python_ls import PythonLanguageServer
from pyls.__main__ import _binary_stdio
from tornado import web, ioloop, websocket

from pyls_jsonrpc import dispatchers, endpoint

log = logging.getLogger(__name__)

class LanguageServerWebSocketHandler(websocket.WebSocketHandler):
    """Setup tornado websocket handler to host language server."""

    def __init__(self, *args, **kwargs):
        stdin, stdout = _binary_stdio()
        # Create an instance of the language server used to dispatch JSON RPC methods
        langserver = PythonLanguageServer(stdin, stdout)

        # Setup an endpoint that dispatches to the ls, and writes server->client messages
        # back to the client websocket
        self.endpoint = endpoint.Endpoint(langserver, lambda msg: self.write_message(json.dumps(msg)))

        # Give the language server a handle to the endpoint so it can send JSON RPC
        # notifications and requests.
        langserver.endpoint = self.endpoint

        super(LanguageServerWebSocketHandler, self).__init__(*args, **kwargs)

    def on_message(self, message):
        """Forward client->server messages to the endpoint."""
        self.endpoint.consume(json.loads(message))

    def check_origin(self, origin):
        return True


if __name__ == "__main__":
    app = web.Application([
        (r"/python", LanguageServerWebSocketHandler),
    ])
    app.listen(3000, address='127.0.0.1')
    ioloop.IOLoop.current().start()
