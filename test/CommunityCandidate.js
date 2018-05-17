const CommunityCandidate = artifacts.require("CommunityCandidate");
const CommunityEnum = Object.freeze({"Bitcoin":0, "Ethereum":1, "Filecoin":2, "Monero":3 });

// Ganache GUI keeps same wallet which is more convenient for testing
// MNEMONIC onion tape alien arctic brush claim verb panther panic issue domain away
// HD PATH m/44'/60'/0'/0/account_index

// helper 
const mineBlock = function () {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "evm_mine",
      params: []
  }, (err, result) => {
      if(err){ return reject(err) }
      return resolve(result)
    });
  })
}

contract('CommunityCandidate', function(accounts) {

  it("should have an endCommunityCandidateBlock deadline of one day in block equivalent", async function() {
  	const candidateReg = await CommunityCandidate.deployed();
  	const endCommunityCandidateBlock = await candidateReg.endCommunityCandidateBlock.call();

  	// BlockHeight when constructor was initiate was one block before
  	const blockNumber = web3.eth.blockNumber - 1;

  	// it takes 3 blocks to setup test env, as a dayInBlock is 5760 in prod but 10 in test, we should find 13
  	assert.equal(endCommunityCandidateBlock.valueOf(), blockNumber + 10, "seems like a day equivalent wasn't found in endCommunityCandidateBlock");

  });

  it("should have no candidate", async function() {
  	const candidateReg = await CommunityCandidate.deployed();
  	const candidatesCount = await candidateReg.getCandidatesCount.call();

	assert.equal(candidatesCount.valueOf(), 0, "candidatesCount is different than 0");
  });
  
  it("should register a candidate", async function() {
  	const candidateReg = await CommunityCandidate.deployed();
  	
  	const account0 = web3.eth.accounts[0];
  	
  	await candidateReg.registerCandidate("@aantonop", CommunityEnum.Bitcoin, {from: account0});
  	
  	const candidate = {};
  	[candidate.pseudo, candidate.community, candidate.identity] = await candidateReg.getCandidate.call(account0);
  	
  	assert.equal(web3.toUtf8(candidate.pseudo), "@aantonop", "candidate.pseudo is different than '@aantonop'");
  	assert.equal(candidate.community.valueOf(), "0", "candidate.community 0 is different than CommunityEnum.Bitcoin");
  	assert.equal(candidate.identity.valueOf(), "0xfc4fa36a7ec9e1455cbc0e3ae5187cbd8ef6b2b1", "candidate.identity is different than 0xfc4fa36a7ec9e1455cbc0e3ae5187cbd8ef6b2b1");

  });

  it("should have one candidate", async function() {
  	const candidateReg = await CommunityCandidate.deployed();
  	const candidatesCount = await candidateReg.getCandidatesCount.call();

	assert.equal(candidatesCount.valueOf(), 1, "candidatesCount is different than 1");
  });

  it("should check CandidateRegistered event by register another candidate", async function() {
  	const candidateReg = await CommunityCandidate.deployed();
  	
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
  	const candidateReg = await CommunityCandidate.deployed();
  	const candidatesCount = await candidateReg.getCandidatesCount.call();

	assert.equal(candidatesCount.valueOf(), 2, "candidatesCount is different than 2");
  });

  it("should deregistered a candidate given the eth account the request came from", async function() {
  	const candidateReg = await CommunityCandidate.deployed();

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
  	const candidateReg = await CommunityCandidate.deployed();
  	const candidatesCount = await candidateReg.getCandidatesCount.call();

	assert.equal(candidatesCount.valueOf(), 1, "candidatesCount is different than 1");
  });


  it("should not register candidate as the candidate registration period expired", async function() {
  	const candidateReg = await CommunityCandidate.deployed();
  	const account3 = web3.eth.accounts[3];
  	let blockNumber = web3.eth.blockNumber;

  	/**
    * As it takes a while to go mine a test block,
    * we modify the constant dayInBlock within the contract CommunityCandidate.sol DIRECTLY 
    * we do not rely on smartcontract endCommunityCandidateBlock which is approx 5760 blocks
    */
  	const endCommunityCandidateBlock = await candidateReg.endCommunityCandidateBlock.call();

  	while(blockNumber <= endCommunityCandidateBlock) {
  		await mineBlock();
  		blockNumber = web3.eth.blockNumber;
  	}

	assert.isAbove(blockNumber, endCommunityCandidateBlock , "Current blockHeight is not strictly above endCommunityCandidateBlock which is mandatory to trigger revert()");
  	
  	// catch the revert() exeception and return true as the test succeed
  	try {
  		await candidateReg.registerCandidate("@protocollabs", CommunityEnum.Filecoin, {from: account3});	
  	} catch (e) {
      return true;
    }
    
    throw new Error("I should never see this!")
  });

});


// https://medium.com/@kscarbrough1/writing-solidity-unit-tests-for-testing-assert-require-and-revert-conditions-using-truffle-2e182d91a40f
// https://medium.com/coinmonks/testing-solidity-with-truffle-and-async-await-396e81c54f93