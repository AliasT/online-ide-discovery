# online-ide-discovery


- [x] python language sever : auto complete, go to definition, all references (static analyzie)
- [x] [json rpc](https://zh.wikipedia.org/wiki/JSON-RPC)


- [ ] [skulpt](http://www.skulpt.org/) python语法树转换js，支持turtle编程

- [ ] [python sandbox](http://doc.pypy.org/en/latest/sandbox.html) python标准库

- [ ] [xterm](https://github.com/xtermjs/xterm.js/)

### 案例
- [theia](https://github.com/theia-ide/theia)
- [repl.it](https://repl.it)
- [kada](https://kada.163.com)
- [coding](https://coding.net)

### issues

1. [skuplt python 3 support](https://github.com/skulpt/skulpt/issues/777)



### kada.163.com: python

1. skulpt
2. [ace editor](https://github.com/ajaxorg/ace) + [ace/lib/snippets](https://github.com/ajaxorg/ace/blob/master/lib/ace/snippets/python.snippets)


### repl.it: python
1. [monaco editor](https://microsoft.github.io/monaco-editor/)
2. [自定义 python language server](https://repl.it/site/blog/intel)
3. [https://github.com/microsoft/monaco-editor/blob/master/docs/integrate-esm.md](https://github.com/microsoft/monaco-editor/blob/master/docs/integrate-esm.md)
4. [https://github.com/palantir/python-jsonrpc-server](https://github.com/palantir/python-jsonrpc-server)
5. [https://github.com/palantir/python-language-server](https://github.com/palantir/python-language-server)
6. [https://github.com/TypeFox/monaco-languageclient](https://github.com/TypeFox/monaco-languageclient)


### 难点
1. 怎么处理多个 python package 的文件夹层次 ？
2. 采用什么样的 python language server ？
3. 后端服务器用什么语言开发最快，最容易集成 ？
4. monaco editor 怎么实现多文件的 lsp 交互 ？



### Demo 运行

client
```sh
cd client
yarn start
```
server
```sh
cd server
python3 main.py
```

open [localhost:9000](http://localhost:9000)
