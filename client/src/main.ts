
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import {StandaloneCodeEditorServiceImpl}  from 'monaco-editor/esm/vs/editor/standalone/browser/standaloneCodeServiceImpl';
import "@babel/polyfill"
import * as monaco from 'monaco-editor'
import { MonacoLanguageClient, CloseAction, ErrorAction, MonacoServices, createConnection }  from 'monaco-languageclient'

const ReconnectingWebSocket = require('reconnecting-websocket');

const openCodeEditor = StandaloneCodeEditorServiceImpl.prototype.openCodeEditor

StandaloneCodeEditorServiceImpl.prototype.findModel = function (editor, resource) {
    var model = null;
    if(resource !== null)
        model = monaco.editor.getModel(resource);
    if(model == null) {
        model = editor.getModel()
    }
    return model;
};

StandaloneCodeEditorServiceImpl.prototype.doOpenEditor = function (editor, input) {
    var model = this.findModel(editor, input.resource);
    if (!model) { return null; }
    editor.setModel(model)
    var selection = (input.options ? input.options.selection : null);
    if (selection) {
        if (typeof selection.endLineNumber === 'number' && typeof selection.endColumn === 'number') {
            editor.setSelection(selection);
            editor.revealRangeInCenter(selection, 1 /* Immediate */);
        }
        else {
            var pos = {
                lineNumber: selection.startLineNumber,
                column: selection.startColumn
            };
            editor.setPosition(pos);
            editor.revealPositionInCenter(pos, 1 /* Immediate */);
        }
    }
    return editor;
};




// 如果要实现多文件的defition跳转，文件必须真实存在，包括已经安装的module都支持
const model1 = monaco.editor.createModel("from b import c", "python", monaco.Uri.parse("file:///Users/chai/Documents/online-ide-discovery/server/a.py"))
const model2 = monaco.editor.createModel("c = 3", "python", monaco.Uri.parse("file:///Users/chai/Documents/online-ide-discovery/server/b.py"))

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
