# SnipsDaoChallenge

Your challenge is to write an ethereum smart contract to elect 10 community “representatives”. <br>
The election must run continuously, enabling a rotation of the 10 representative.

The contract must handle:

- receiving votes
- receiving applications to become a representative
- running the election

## Stack technique

- Ethereum in memory blockchain, Ganache Version 1.1.0 (GUI or CLI)
- Truffle v4.1.8 (core: 4.1.8)
- Solidity v0.4.23 (solc-js)
- Node v9.7.1
- npm v6.0.1

## Design

[![Design](docs/pictures/snips_dao_design.png)](docs/pictures/snips_dao_design.png)
[![Lifecycle](docs/pictures/snips_dao_lifecycle.png)](docs/pictures/snips_dao_lifecycle.png)

## Setup local environment

#### Get and Configure Ganache

Get [ganache](http://truffleframework.com/ganache/) GUI, and launch it.<br>
At the top right of the windows, clics on the "option" wheel.<br>

On the **SERVER** tab, where you should be by default, check that :
- hostname is 127.0.0.1
- port is 7545
- network id is 5777
- both Automine and error are activated

On the **ACCOUNTS & KEYS** tab :
- increase the total accounts to generate to 25
- set the Mnemonic to "onion tape alien arctic brush claim verb panther panic issue domain away".

After these changes, just clic on RESTART button on the top right.

#### Install truffle

```
npm install truffle -g
```

## Tests

:heavy_exclamation_mark: As it takes times to generate *fake* blocks with ganache, in **DEV** we set *dayInBlock* to 40 in both `CommunityElector.sol` and `CommunityElector.js` but should be set to 5760 in **PROD**.

```
truffle test
```

## Playing manually

```
truffle migrate --network development // --reset if needed
truffle console --network development
```

Then check `playground_cmd_truffle_console.js` in `docs` if you want to see cmd line exemples to interact within truffle's console console.