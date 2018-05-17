# Playground truffle console

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

CandidateRegistrationInstance.deregisterCandidate({from: account0});

// CandidateRegistrationInstance.registerCandidate("grog", 1, {from: account0}).then( res => { console.log(res.logs) });
// CandidateRegistrationInstance.registerCandidate("groguette", 2, {from: account1}).then( res => { console.log(res.logs) });
// CandidateRegistrationInstance.registerCandidate("grogzator", 0, {from: account1}).then( res => { console.log(res.logs) });
// CandidateRegistrationInstance.registerCandidate("grogbitch", 3, {from: account0}).then( res => { console.log(res.logs) });

CandidateRegistrationInstance.registerCandidate("grogonche", 0, {from: account0}).then( res => { console.log(res.logs) });

CandidateRegistrationInstance.candidatesIdx.call(0);
CandidateRegistrationInstance.endCandidateRegistrationBlock.call();