const CandidateRegistration = artifacts.require("CandidateRegistration");

const CommunityEnum = Object.freeze({"Bitcoin":0, "Ethereum":1, "Filecoin":2, "Monero":3 });

contract('CandidateRegistration', function(accounts) {

  it("should have an endCandidateRegistrationBlock deadline of one day in block equivalent", async function() {
  	const candidateReg = await CandidateRegistration.deployed();
  	const endCandidateRegistrationBlock = await candidateReg.endCandidateRegistrationBlock.call();

  	// BlockHeight when constructor was initiate was one block before
  	const blockNumber = web3.eth.blockNumber - 1;

  	// it takes 3 blocks to setup test env, as a dayInBlock is 5760 we should find 5760
  	assert.equal(endCandidateRegistrationBlock.valueOf(), blockNumber + 5760, "seems like a day equivalent wasn't found in endCandidateRegistrationBlock");

  });

  it("should add have no candidate ", async function() {
  	const candidateReg = await CandidateRegistration.deployed();
  	const candidatesCount = await candidateReg.getCandidatesCount.call();

	assert.equal(candidatesCount.valueOf(), 0, "candidatesCount is different than 0");
  });
  
  it("should register a candidate", async function() {
  	// console.log("enum : " + CommunityEnum.Bitcoin);
  	const candidateReg = await CandidateRegistration.deployed();
  	
  	const account0 = web3.eth.accounts[0];
  	
  	await candidateReg.registerCandidate("@aantonop", CommunityEnum.Bitcoin, {from: account0});
  	
  	const candidate = {};
  	[candidate.pseudo, candidate.community, candidate.identity] = await candidateReg.getCandidate.call(account0);
  	
  	assert.equal(web3.toUtf8(candidate.pseudo), "@aantonop", "candidate.pseudo is different than '@aantonop'");
  	assert.equal(candidate.community.valueOf(), "0", "candidate.community 0 is different than CommunityEnum.Bitcoin");
  	assert.equal(candidate.identity.valueOf(), "0xfc4fa36a7ec9e1455cbc0e3ae5187cbd8ef6b2b1", "candidate.identity is different than 0xfc4fa36a7ec9e1455cbc0e3ae5187cbd8ef6b2b1");

  });

  it("should add have one candidate ", async function() {
  	const candidateReg = await CandidateRegistration.deployed();
  	const candidatesCount = await candidateReg.getCandidatesCount.call();

	assert.equal(candidatesCount.valueOf(), 1, "candidatesCount is different than 1");
  });

});


// https://medium.com/@kscarbrough1/writing-solidity-unit-tests-for-testing-assert-require-and-revert-conditions-using-truffle-2e182d91a40f
// https://medium.com/coinmonks/testing-solidity-with-truffle-and-async-await-396e81c54f93