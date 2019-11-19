#!/usr/bin/env node
const crypto = require("crypto");
const WebSocketClient = require('websocket').client;

var nodes = {};
var gensisBlock = require("./genesis");
var blockchain = [
    { hash: hashObj(gensisBlock), block: gensisBlock },
]
var transactionPool = [];
var winnerAddress;
var count = {};

function on_broadcast(data) {
    switch (data.type) {
        case "nodes":
            nodes = data.nodes;
            break;
        case "transact":
            makeDummyTransaction();
            break;
        case "mine":
            mine();
            break;
        case "block":
            handleBlock(data.block);
            break;
        case "transaction":
            handleTransaction(data.transaction);
    }
}

function handleTransaction(transaction) {
    transactionPool.push(transaction);
}

function mine() {
    console.log("\n\n======\nMining\n======");
    console.log("My distance:", hashDistance(myAddress(), lastBlock().hash));
    let minDistance = -1;
    for (let address in nodes) {
        let dist = hashDistance(address, lastBlock().hash);
        if (minDistance === -1 || minDistance > dist) {
            minDistance = dist;
            winnerAddress = address;
        }
    }
    console.log(`Winner: ${nodes[winnerAddress]} - ${winnerAddress}`);
    count[winnerAddress] = count[winnerAddress] ? count[winnerAddress] + 1 : 1;
    console.log(count);
    if (winnerAddress === myAddress()) {
        broadcast(makeBlock());
    }
}

function makeBlock() {
    let transactions = [];
    transactionPool.sort((t1, t2) => calcReward(t1) - calcReward(t2));
    let k = 3, reward = 0;
    for (let i = 0; transactionPool.length && i < k; ++i) {
        let t = transactionPool[transactionPool.length - i - 1];
        reward += calcReward(t);
        transactions.push(t);
    }
    let block = {
        type: "block",
        block: {
            owner: myAddress(),
            transactions,
            reward,
            prev: lastBlock().hash,
        },
    };
    return block;
}

function handleBlock(block) {
    if (verifyBlock(block)) {
        blockchain.push({
            block,
            hash: hashObj(block)
        });
        for (let i = 0; i < block.transactions.length; ++i)
            remove(transactionPool, block.transactions[i]);
        printBlock(block);
        winnerAddress = null;
        console.log("Pool size:", transactionPool.length);
    }
    else {
        console.warn(`Received unauthorized block by ${block.owner}`);
    }
}

function verifyBlock(block) {
    if (block.owner === winnerAddress) {
        winnerAddress = null;
        return true;
    }
}

function makeDummyTransaction() {
    let to = myAddress();
    while (to === myAddress()) {
        let addresses = Object.keys(nodes);
        to = addresses[Math.floor(Math.random() * addresses.length)];
    }

    let transaction = {
        from: myAddress(),
        to,
        amt: Math.floor(Math.random() * 1000),
        fee: Math.floor(Math.random() * 50),
        time: (+ new Date() - 10 + Math.floor(Math.random() * 11)),
    }

    if (Math.random() > 0.75)
        broadcast({ type: "transaction", transaction });
}

function calcReward(transaction) {
    if (transaction)
        return transaction.fee;
    else
        return 0;
}

function lastBlock() {
    return blockchain[blockchain.length - 1];
}

var conn;
const client = new WebSocketClient();

client.on('connectFailed', function (error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function (connection) {
    conn = connection;
    connection.on('error', function (error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function () {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            let data = JSON.parse(message.utf8Data);
            switch (data.type) {
                case "broadcast":
                    on_broadcast(data.data);
                    break;
            }
        }
    });
});

function printBlock(b) {
    console.log("\n=====\nBLOCK\n=====");
    console.log(b);
    console.log();
}

function hash(msg) {
    return crypto.createHash('sha256').update(msg).digest('hex');
}

function hashObj(msg) {
    return crypto.createHash('sha256').update(JSON.stringify(msg)).digest('hex');
}

function hashDistance(h1, h2) {
    return Math.abs(parseInt(h1, 16) - parseInt(h2, 16));
}

function generateAddress(name) {
    return hash(name + Math.random());
}

function broadcast(data) {
    conn.sendUTF(JSON.stringify({ type: "broadcast", data }));
}

function myAddress() {
    return process.argv[4];
}

function myName() {
    return process.argv[3];
}

function remove(array, element) {
    var index = array.indexOf(element);
    if (index > -1) {
        array.splice(index, 1);
    }
}

switch (process.argv[2]) {
    case "create": {
        console.log("Your address is:", generateAddress(myName()));
    }
        break;
    case "run": {
        client.connect(`ws://localhost:8080/${myName()}/${myAddress()}`, 'echo-protocol');
    }
        break;
}

