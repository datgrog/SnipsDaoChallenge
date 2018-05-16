# Playground truffle console

account0 = web3.eth.accounts[0]

SnipsDaoChallenge.deployed().then(inst => { SnipsDaoChallengeInstance = inst })

SnipsDaoChallengeInstance.endCandidateRegistrationBlock.call()
SnipsDaoChallengeInstance.endVotingBlock.call()
SnipsDaoChallengeInstance.weekInBlock.call()

SnipsDaoChallengeInstance.candidateRegistration({from: account0}).then( res => { console.log(res.logs) })

curl localhost:7545 -X POST --data '{"jsonrpc":"2.0","method":"evm_mine","params":[]}'

///

CandidateRegistration.deployed().then(inst => { CandidateRegistrationInstance = inst })
CandidateRegistrationInstance.endCandidateRegistrationBlock.call();
CandidateRegistrationInstance.candidate.call();
CandidateRegistrationInstance.candidateRegistration("grog", 1, {from: account0});