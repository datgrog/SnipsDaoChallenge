# SnipsDaoChallenge

Your challenge is to write an ethereum smart contract to elect 10 community “representatives”. <br>
The election must run continuously, enabling a rotation of the 10 representative.

The contract must handle:

- receiving votes
- receiving applications to become a representative
- running the election

**Summary**

* [Technology Stack](#technology-stack)
* [Design](#design)
* [How this election system can be cheated](#how-this-election-system-can-be-cheated)
* [Installation](#installation)
* [Tests](#tests)
* [Playing](#playing)

## Technology Stack

- Ethereum in memory blockchain, Ganache Version 1.1.0 (GUI or CLI)
- Truffle v4.1.8 (core: 4.1.8)
- Solidity v0.4.23 (solc-js)
- Node v9.7.1
- npm v6.0.1

## Design

[![Design](docs/pictures/snips_dao_design.png)](docs/pictures/snips_dao_design.png)

<br>

| Contract                | Responsability                 |
|-------------------------|--------------------------------|
| CommunityRepresentative | Reference to query current representative's identity from any community that the DAO support. |
| CommunityCandidate | Manage candidate registration or deregistration and keep their vote up to date. This contract guarantees that any vote came from CommunityElector's contract. |
| CommunityElector | Core of the DAO as it's main responsability is to manage the state of the continuous rotating election. It also handle electors and verify that they do not vote more than once for each community. |

<br>

[![Lifecycle](docs/pictures/snips_dao_lifecycle.png)](docs/pictures/snips_dao_lifecycle.png)

On-chain election: <br>
- We save all candidate index within the array, then to achieve the top 10 candidates we had to use a sorting algorithm.
Instead of using quickSort, here we choose heapSort, as it's used in small embedded systems (EVM could be considered as one).
Also, using a circular or a simple linked list to keep track of all candidate index would be interesting. 
For each vote, we could move an "index candidate node" if it's neighbour's candidate node as less vote, to always keep an ordered list. A similar logic could have been implemented with the array but would be more expensive compare to a list.

Off-chain election: <br>
- Costly operations is not design to be run within a smartcontract aka thousand of nodes. Here we could consider delegate this task to an oracle as anyone could check afterward if it has been done properly (for free). In our case what matter the most is in fact that the contract code / integrity when deployed could be check by anyone. As all vote are public and pseudonimous here, any elector knows it's not a human that count and attributes a vote to a candidate but the whole network as a guarantee (it's super effective..!).

## How this election system can be cheated

In this design, we choose to not rely on any oracles, which means that, if the contracts run as expected, lifecycle of this DAO is as autonomous as it could be in this decentralized computer. However, it's important to mention that there is downsides. The main one on this specific Dapp in about the cost in gas regarding both first and last vote given an election. Because each triggers function that takes care of the correct election state, it means the electors (or a tiny subset) takes care of the cost of the application to themself.

Election could easily be cheated as there is nothing preventing an user to hide behind multiple ethereum accounts to vote multiple times, which is known as the [Sybil attacks](https://en.wikipedia.org/wiki/Sybil_attack). It's well known in peer-to-peer network topology and there is no built-in solution. 
One "workaround" possible would be to implement a safeguard or more specifically an oracle which would have the responsability to guarantee each elector's ethereum identity based on "IRL proof". As we currently vote by showing an national card, there is an "official public organisation" which creates/controls/manage them. Such organisation could deploy a smartcontract with public functions allowing anyone to use it as an API to guarantee that each vote is related to one unique person. The bad thing here is that this oracle would become our DAO SPOF but as we already rely on this security IRL then, why not... 

## Installation

#### Get and Configure Ganache

Get [ganache](http://truffleframework.com/ganache/) GUI, and launch it.<br>
At the top right of the windows, clics on the "option" wheel.<br>

On the **SERVER** tab, where you should be by default, check that :
- hostname is 127.0.0.1
- port is 7545
- network id is 5777
- both Automine and error are activated

On the **ACCOUNTS & KEYS** tab :
- increase the total accounts to generate to 40
- set the Mnemonic to "onion tape alien arctic brush claim verb panther panic issue domain away".

After these changes, just clic on RESTART button on the top right.

#### Install truffle

```
npm install truffle -g
```

## Tests

:heavy_exclamation_mark: As it takes times to generate *fake* blocks with ganache, in **DEV** we set *dayInBlock* to 40 in both `CommunityElector.sol` and `CommunityElector.js` but should be set to 5760 in **PROD**.<br>
In the same logic, we also modify `startVotingBlock` in the `modifier closeElectionState` within CommunityElector contract.

```
truffle test
```

## Playing

```
truffle migrate --network development // --reset if needed
truffle console --network development
```

Then check `playground_cmd_truffle_console.js` in `docs` if you want to see cmd line exemples to interact within truffle's console console.

// https://ethereum.stackexchange.com/questions/1517/sorting-an-array-of-integer-with-ethereum
// https://github.com/Modular-Network/ethereum-libraries/tree/master/ArrayUtilsLib#basic-usage
// https://medium.com/modular-network/circular-linked-list-in-solidity-41ee6d1d0056
// https://soliditycookbook.com/arrays/
// https://medium.com/coinmonks/linked-lists-in-solidity-cfd967af389b
