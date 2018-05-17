# Playground truffle console

curl localhost:7545 -X POST --data '{"jsonrpc":"2.0","method":"evm_mine","params":[]}'
truffle migrate --network development --reset
truffle console --network development

account0 = web3.eth.accounts[0]

SnipsDaoChallenge.deployed().then(inst => { SnipsDaoChallengeInstance = inst })

SnipsDaoChallengeInstance.endCandidateRegistrationBlock.call()
SnipsDaoChallengeInstance.endVotingBlock.call()
SnipsDaoChallengeInstance.weekInBlock.call()

SnipsDaoChallengeInstance.registerCandidate({from: account0}).then( res => { console.log(res.logs) })

curl localhost:7545 -X POST --data '{"jsonrpc":"2.0","method":"evm_mine","params":[]}'

///
account0 = web3.eth.accounts[0];
account1 = web3.eth.accounts[1];
account2 = web3.eth.accounts[2];
account3 = web3.eth.accounts[3];

CandidateRegistration.deployed().then(inst => { CandidateRegistrationInstance = inst });

CandidateRegistrationInstance.registerCandidate("grog", 0, {from: account0});
CandidateRegistrationInstance.registerCandidate("groguette", 1, {from: account1});
CandidateRegistrationInstance.registerCandidate("grogzator", 2, {from: account2});
CandidateRegistrationInstance.registerCandidate("grogbitch", 3, {from: account3});
// CandidateRegistrationInstance.registerCandidate("grogbitch", 3, {from: account3}).then(res => { onchoir = res} );

CandidateRegistrationInstance.deregisterCandidate({from: account1});

// CandidateRegistrationInstance.registerCandidate("grog", 1, {from: account0}).then( res => { console.log(res.logs) });
// CandidateRegistrationInstance.registerCandidate("groguette", 2, {from: account1}).then( res => { console.log(res.logs) });
// CandidateRegistrationInstance.registerCandidate("grogzator", 0, {from: account1}).then( res => { console.log(res.logs) });
// CandidateRegistrationInstance.registerCandidate("grogbitch", 3, {from: account0}).then( res => { console.log(res.logs) });

CandidateRegistrationInstance.registerCandidate("grogonche", 0, {from: account0}).then( res => { console.log(res.logs) });

CandidateRegistrationInstance.candidatesIdx.call(0);
CandidateRegistrationInstance.endCandidateRegistrationBlock.call();
CandidateRegistrationInstance.getCandidatesCount.call()

CandidateRegistrationInstance.deregisterCandidate({from: account1});
CandidateRegistrationInstance.getCandidate.call(account1);

//
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


