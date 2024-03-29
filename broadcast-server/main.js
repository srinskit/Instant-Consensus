#!/usr/bin/env node
var WebSocketServer = require("websocket").server;
var http = require("http");

var server = http.createServer(function (request, response) {
    console.log((new Date()) + " Received request for " + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function () {
    console.log("Server is listening on port 8080");
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    return true;
}

const nodes = {};
const conns = {};

wsServer.on('request', function (request) {
    if (!originIsAllowed(request.origin)) {
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    var connection = request.accept('echo-protocol', request.origin);
    let path = request.resourceURL.path.split("/");
    let name = path[1], address = path[2];
    nodes[address] = name;
    conns[address] = connection;
    connection.on('message', (message) => {
        if (message.type === 'utf8') {
            let data = JSON.parse(message.utf8Data);
            switch (data.type) {
                case "broadcast":
                    broadcast(data.data);
            }
        }
    });
    connection.on('close', () => {
        delete nodes[address];
        delete conns[address];
        console.info(`Disconnected ${name} - ${address}`);
        console.log("Nodes:", nodes);
        broadcast({ type: "nodes", nodes });
    });

    console.info(`Connected ${name} - ${address}`);
    console.log(nodes);
    broadcast({ type: "nodes", nodes });
});

function broadcast(data) {
    data = JSON.stringify({ type: "broadcast", data });
    for (let address in conns) {
        conns[address].sendUTF(data);
    }
}
setTimeout(function () {
    setInterval(function () {
        broadcast({ type: "transact", });
        setTimeout(function () {
            broadcast({ type: "mine" });
        }, 2500);
    }, 3000);
}, 20000);
