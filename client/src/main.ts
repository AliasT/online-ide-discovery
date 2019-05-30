
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import "@babel/polyfill"

const monaco = require('monaco-editor');
const ReconnectingWebSocket = require('reconnecting-websocket');
const { MonacoLanguageClient, CloseAction, ErrorAction, MonacoServices, createConnection } = require('monaco-languageclient');


const editor = monaco.editor.create(
    document.getElementById('container'), {
    value: 'print(3)',
    language: 'python'
});

(self as any).MonacoEnvironment = {
    getWorkerUrl: function(moduleId, label) {
        return './python.js';
    },
};

// install Monaco language client services
MonacoServices.install(editor);

// create the web socket
const url = "ws://localhost:3000/python"
const webSocket = createWebSocket(url);
// listen when the web socket is opened
listen({
    webSocket,
    onConnection: connection => {
        // create and start the language client
        const languageClient = createLanguageClient(connection);
        const disposable = languageClient.start();
        connection.onClose(() => disposable.dispose());
    }
});

function createLanguageClient(connection: MessageConnection) {
    return new MonacoLanguageClient({
        name: "Sample Language Client",
        clientOptions: {
            // use a language id as a document selector
            documentSelector: ['python'],
            // disable the default error handler
            errorHandler: {
                error: (a) => { console.log(a); return ErrorAction.Continue },
                closed: () => CloseAction.DoNotRestart
            }
        },
        // create a language client connection from the JSON RPC connection on demand
        connectionProvider: {
            get: (errorHandler, closeHandler) => {
                return Promise.resolve(createConnection(connection, errorHandler, closeHandler))
            }
        }
    });
}


function createWebSocket(url: string): WebSocket {
    const socketOptions = {
        maxReconnectionDelay: 10000,
        minReconnectionDelay: 1000,
        reconnectionDelayGrowFactor: 1.3,
        connectionTimeout: 10000,
        maxRetries: Infinity,
        debug: false
    };
    return new ReconnectingWebSocket(url, undefined, socketOptions);
}

