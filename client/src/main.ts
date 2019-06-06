
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import "@babel/polyfill"

import * as monaco from 'monaco-editor'
import { MonacoLanguageClient, CloseAction, ErrorAction, MonacoServices, createConnection }  from 'monaco-languageclient'

const ReconnectingWebSocket = require('reconnecting-websocket');

// 如果要实现多文件的defition跳转，文件必须真实存在，包括已经安装的module都支持
const model1 = monaco.editor.createModel("from b import c", "python", monaco.Uri.parse("./server/a.py"))
const model2 = monaco.editor.createModel("c = 3", "python", monaco.Uri.parse("./server/b.py"))

;(self as any).MonacoEnvironment = {
    getWorkerUrl: function(moduleId, label) {
        return './editor.worker.js';
    },
};

const editor = monaco.editor.create(
    document.getElementById('container'), {
        model: model1,
    }
);

editor.onDidChangeModel(e => {
    console.log(e)
})


// install Monaco language client services
MonacoServices.install(editor);

// create the web socket
const url = "ws://localhost:4000/python"
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

