const CandidateRegistration = artifacts.require("CandidateRegistration");
const CommunityEnum = Object.freeze({"Bitcoin":0, "Ethereum":1, "Filecoin":2, "Monero":3 });

// Ganache GUI keeps same wallet which is more convenient for testing
// MNEMONIC onion tape alien arctic brush claim verb panther panic issue domain away
// HD PATH m/44'/60'/0'/0/account_index

contract('CandidateRegistration', function(accounts) {

  it("should have an endCandidateRegistrationBlock deadline of one day in block equivalent", async function() {
  	const candidateReg = await CandidateRegistration.deployed();
  	const endCandidateRegistrationBlock = await candidateReg.endCandidateRegistrationBlock.call();

  	// BlockHeight when constructor was initiate was one block before
  	const blockNumber = web3.eth.blockNumber - 1;

  	// it takes 3 blocks to setup test env, as a dayInBlock is 5760 we should find 5760
  	assert.equal(endCandidateRegistrationBlock.valueOf(), blockNumber + 5760, "seems like a day equivalent wasn't found in endCandidateRegistrationBlock");

  });

  it("should have no candidate", async function() {
  	const candidateReg = await CandidateRegistration.deployed();
  	const candidatesCount = await candidateReg.getCandidatesCount.call();

	assert.equal(candidatesCount.valueOf(), 0, "candidatesCount is different than 0");
  });
  
  it("should register a candidate", async function() {
  	const candidateReg = await CandidateRegistration.deployed();
  	
  	const account0 = web3.eth.accounts[0];
  	
  	await candidateReg.registerCandidate("@aantonop", CommunityEnum.Bitcoin, {from: account0});
  	
  	const candidate = {};
  	[candidate.pseudo, candidate.community, candidate.identity] = await candidateReg.getCandidate.call(account0);
  	
  	assert.equal(web3.toUtf8(candidate.pseudo), "@aantonop", "candidate.pseudo is different than '@aantonop'");
  	assert.equal(candidate.community.valueOf(), "0", "candidate.community 0 is different than CommunityEnum.Bitcoin");
  	assert.equal(candidate.identity.valueOf(), "0xfc4fa36a7ec9e1455cbc0e3ae5187cbd8ef6b2b1", "candidate.identity is different than 0xfc4fa36a7ec9e1455cbc0e3ae5187cbd8ef6b2b1");

  });

  it("should have one candidate", async function() {
  	const candidateReg = await CandidateRegistration.deployed();
  	const candidatesCount = await candidateReg.getCandidatesCount.call();

	assert.equal(candidatesCount.valueOf(), 1, "candidatesCount is different than 1");
  });

  it("should check CandidateRegistered event by register another candidate", async function() {
  	const candidateReg = await CandidateRegistration.deployed();
  	
  	const account1 = web3.eth.accounts[1];
  	
  	candidateReg.registerCandidate("@VitalikButerin", CommunityEnum.Ethereum, {from: account1}).then( result => {
  		const eventLog = result.logs[0];
  		const eventName = eventLog.event;
  		const eventArgs = eventLog.args;
  		
  		assert.equal(eventName, "CandidateRegistered", "Event name is not equals to 'CandidateRegistered'");
	  	assert.equal(web3.toUtf8(eventArgs.pseudo), "@VitalikButerin", "candidate.pseudo is different than '@VitalikButerin'");
	  	assert.equal(eventArgs.community.valueOf(), "1", "eventArgs.community 1 is different than CommunityEnum.Ethereum");
	  	assert.equal(eventArgs.identity.valueOf(), "0x1df7e4d6f021cff30b62eff03552fdbddc9fddac", "eventArgs.identity is different than 0x1df7e4d6f021cff30b62eff03552fdbddc9fddac");
  	});	
  });

  it("should have two candidates", async function() {
  	const candidateReg = await CandidateRegistration.deployed();
  	const candidatesCount = await candidateReg.getCandidatesCount.call();

	assert.equal(candidatesCount.valueOf(), 2, "candidatesCount is different than 2");
  });

  it("should deregistered a candidate given the eth account the request came from", async function() {
  	const candidateReg = await CandidateRegistration.deployed();

  	// Sorry Vitalik
  	const candidateToDelIdentity = web3.eth.accounts[1];

  	let candidatesIdx = await candidateReg.getCandidatesIdx();
  	let candidateToDelIdx = -1;

	Object.entries(candidatesIdx).forEach(([key, value]) => {
		if (candidateToDelIdentity === value ) {
			candidateToDelIdx = key;
		}
	});

	if (candidateToDelIdx === -1) { 
		throw new Error("The candidate to delete should be the one inserted prev so we should find his identity within candidatesIdx!") 
	}

  	await candidateReg.deregisterCandidate({from: candidateToDelIdentity});

	candidatesIdx = await candidateReg.getCandidatesIdx();

  	assert.equal(candidatesIdx[candidateToDelIdx].valueOf(), "0x0000000000000000000000000000000000000000", "The is different than 1");

  });

  it("should have one candidate", async function() {
  	const candidateReg = await CandidateRegistration.deployed();
  	const candidatesCount = await candidateReg.getCandidatesCount.call();

	assert.equal(candidatesCount.valueOf(), 1, "candidatesCount is different than 1");
  });

});


// https://medium.com/@kscarbrough1/writing-solidity-unit-tests-for-testing-assert-require-and-revert-conditions-using-truffle-2e182d91a40f
// https://medium.com/coinmonks/testing-solidity-with-truffle-and-async-await-396e81c54f93