# Playground truffle console

curl localhost:7545 -X POST --data '{"jsonrpc":"2.0","method":"evm_mine","params":[]}'

curl localhost:7545 -X POST --data '{"jsonrpc":"2.0","method":"miner_start","params":[]}'
curl localhost:7545 -X POST --data '{"jsonrpc":"2.0","method":"miner_stop","params":[]}'



// Playing with CommunityCandidate contract
account0 = web3.eth.accounts[0];
account1 = web3.eth.accounts[1];
account2 = web3.eth.accounts[2];
account3 = web3.eth.accounts[3];

CommunityCandidate.deployed().then(inst => { CommunityCandidateInstance = inst });

CommunityCandidateInstance.registerCandidate("grog", 0, {from: account0});
CommunityCandidateInstance.registerCandidate("groguette", 1, {from: account1});
CommunityCandidateInstance.registerCandidate("grogzator", 2, {from: account2});
CommunityCandidateInstance.registerCandidate("grogzy", 3, {from: account3});

CommunityCandidateInstance.deregisterCandidate({from: account1});

// CommunityCandidateInstance.registerCandidate("grog", 1, {from: account0}).then( res => { console.log(res.logs) });
// CommunityCandidateInstance.registerCandidate("groguette", 2, {from: account1}).then( res => { console.log(res.logs) });
// CommunityCandidateInstance.registerCandidate("grogzator", 0, {from: account1}).then( res => { console.log(res.logs) });
// CommunityCandidateInstance.registerCandidate("grogzy", 3, {from: account0}).then( res => { console.log(res.logs) });

CommunityCandidateInstance.registerCandidate("grogonche", 0, {from: account0}).then( res => { console.log(res.logs) });

CommunityCandidateInstance.candidatesIdx.call(0);
CommunityCandidateInstance.endCandidateRegistrationBlock.call();
CommunityCandidateInstance.getCandidatesCount.call()

CommunityCandidateInstance.deregisterCandidate({from: account1});
CommunityCandidateInstance.getCandidate.call(account1);

// Playing with CommunityElector contract
account0 = web3.eth.accounts[0];
account1 = web3.eth.accounts[1];

CommunityCandidate.deployed().then(inst => { CommunityCandidateInstance = inst });
CommunityCandidateInstance.registerCandidate("grog", 0, {from: account0});
CommunityCandidateInstance.registerCandidate("groguette", 1, {from: account1});
CommunityElector.deployed().then(inst => { CommunityElectorInstance = inst });
CommunityElectorInstance.getCandidatesCount.call();

CommunityCandidateInstance.getCandidate.call(account1);

// BOTH SEND TX AND MODIFY STATE
CommunityCandidateInstance.quickVote(account1)
// CommunityCandidateInstance.quickVote.sendTransaction(account1);