# Instant Consensus
# Leader selection
1.  The winner is selected based on the minimum distance between the user’s address and the previous block hash in the blockchain.
2.  Since everyone has the address of all nodes, the winner can be found out by everyone, and hence there is no need for broadcasting to come to a consensus on the winner.

## Broadcast Server
A simple relay server to relay messages in the P2P network

```
# Install deps
cd broadcast-server
npm install

# Run
./main.js
```
## Miner Node
```
# Install deps
cd node
npm install
```

#### Create
```
./node/main.js create [name]
```
#### Start
```
./node/main.js run [name] [address]
```
#### Automate
Starts 8 nodes for testing
```
./node/auto.sh
```