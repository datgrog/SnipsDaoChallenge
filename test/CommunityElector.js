const helper = require("./Helper.js");

const CommunityCandidate = artifacts.require("CommunityCandidate");
const CommunityElector = artifacts.require("CommunityElector");
const CommunityEnum = Object.freeze({"Bitcoin": 0, "Ethereum": 1, "Filecoin": 2, "Monero": 3 });

const dayInBlock = 10;

contract('CommunityElector', function (accounts) {

  let communityCandidate;
  let communityElector;
  
  beforeEach('setup contract for each test', async function () {
    communityCandidate = await CommunityCandidate.deployed();
    communityElector = await CommunityElector.deployed(communityCandidate.address);
  })

  it("should have startVotingBlock set to a day after CommunityElector has been mined.", async function () {
	const electionState = {};
	[electionState.id, electionState.isOpen, electionState.startVotingBlock, electionState.endVotingBlock] = await communityElector.electionState.call();

	/**
	* blockHeight when CommunityElector constructor was called.
	* As Transactions happen before test execution, we need to sub it from the current blockHeight. 
	* Ganache default behaviour mines a block for each transaction to confirm them directly 
	*/
		
	const BlocksOrTxsBeforeTestExecution = 2;
	const blockNumber = web3.eth.blockNumber - BlocksOrTxsBeforeTestExecution;
		
	// it takes 3 blocks to setup test env, as a dayInBlock is 5760 in prod but 10 in test, we should find 13
	assert.equal(electionState.startVotingBlock.toNumber(), blockNumber + dayInBlock, "seems like a day equivalent wasn't found in startVotingBlock");
  });

  it("should have endVotingBlock equals to a day after startVotingBlock.", async function () {
	const electionState = {};
	[electionState.id, electionState.isOpen, electionState.startVotingBlock, electionState.endVotingBlock] = await communityElector.electionState.call();

	assert.equal(electionState.endVotingBlock.toNumber(), electionState.startVotingBlock.toNumber() + dayInBlock, "endVotingBlock not equal to a day after startVotingBlock");
  });

  it("shoud read CommunityCandidate contract", async function () {
  	/**
  	* To test contract interactions we should redeploy them,
  	* even if we could find a workaround to access CommunityCandidate previously tested.
  	*/
	const account0 = web3.eth.accounts[0];

	await communityCandidate.registerCandidate("@aantonop", CommunityEnum.Bitcoin, {from: account0});
  	
  	const candidate = {};
  	[candidate.pseudo, candidate.community, candidate.identity] = await communityCandidate.getCandidate.call(account0);
  	
  	assert.equal(web3.toUtf8(candidate.pseudo), "@aantonop", "candidate.pseudo is different than '@aantonop'");
  	assert.equal(candidate.community.valueOf(), "0", "candidate.community 0 is different than CommunityEnum.Bitcoin");
  	assert.equal(candidate.identity.valueOf(), "0xfc4fa36a7ec9e1455cbc0e3ae5187cbd8ef6b2b1", "candidate.identity is different than 0xfc4fa36a7ec9e1455cbc0e3ae5187cbd8ef6b2b1");
  });

  it("should write CommunityCandidate contract by adding one candidate", async function() {
  	const account1 = web3.eth.accounts[1];

  	await communityCandidate.registerCandidate("@VitalikButerin", CommunityEnum.Ethereum, {from: account1})
	const candidatesCount = await communityElector.getCandidatesCount.call();

	assert.equal(candidatesCount.valueOf(), 2, "candidatesCount is different than 2");
  });

  it("should reject vote while startVotingBlock has not been reached", async function() {
  	const blockNumber = web3.eth.blockNumber;
  	const account0 = web3.eth.accounts[0];
	const account1 = web3.eth.accounts[1];

	const electionState = {};
	[electionState.id, electionState.isOpen, electionState.startVotingBlock, electionState.endVotingBlock] = await communityElector.electionState.call();

	assert.isBelow(blockNumber, electionState.startVotingBlock , "Current blockHeight is not strictly below startVotingBlock which is mandatory to trigger revert()");
	// catch the revert() exeception and return true as the test succeed
	try {
		await communityElector.electorVotes(account0, {from: account1});
	} catch (e) {
		return true;
	}
	throw new Error("I should never see this!")
  });

 it("should vote by calling electorVotes within CommunityCandidate contract", async function () {
 	let blockNumber = web3.eth.blockNumber;
  	const account0 = web3.eth.accounts[0];
	const account1 = web3.eth.accounts[1];

	const electionState = {};
	[electionState.id, electionState.isOpen, electionState.startVotingBlock, electionState.endVotingBlock] = await communityElector.electionState.call();

 	/**
    * As it takes a while to go mine a test block,
    * we modify the constant dayInBlock within the contract CommunityElector.sol DIRECTLY 
    * we do not rely on smartcontract endCommunityCandidateBlock which is approx 5760 blocks
    */
 	while (blockNumber < electionState.startVotingBlock) {
 		await helper.mineBlock();
 		blockNumber = web3.eth.blockNumber;
 	}

 	let candidate0Info = await communityElector.getCandidate.call(account0);
 	let candidate0VoteCount = candidate0Info[3].toNumber();
 	
 	assert.equal(candidate0VoteCount, 0, "candidate0 should not have any vote yet");

	// account1HasVoted
 	await communityElector.electorVotes(account0, {from: account1});

 	candidate0Info = await communityElector.getCandidate.call(account0);
 	candidate0VoteCount = candidate0Info[3].toNumber();
 	assert.equal(candidate0VoteCount, 1, "candidate0 should have only one vote ");
 });

  it("should not allow an user to vote multiple times a specific community candidate.", async function() {
  	const account0 = web3.eth.accounts[0];
  	const account1 = web3.eth.accounts[1];

  	try {
  		await communityElector.electorVotes(account0, {from: account1});
  	} catch (e) {
  		return true;
  	}
  	throw new Error("I should never see this!")
  });

  it("should allow an user to vote to different community candidate.", async function() {
  	const vitalik = web3.eth.accounts[1];

  	// In this case vitalik vote for himself after voting for aantonop
 	await communityElector.electorVotes(vitalik, {from: vitalik});

 	vitalikInfo = await communityElector.getCandidate.call(vitalik);
 	vitalikVoteCount = vitalikInfo[3].toNumber();
 	assert.equal(vitalikVoteCount, 1, "vitalik should have only his own vote.");
  });

});

// https://ethereum.stackexchange.com/questions/24915/testing-contract-interactions-with-truffle
// https://ethereum.stackexchange.com/questions/29597/how-to-convert-bignumber-to-number-in-truffle-framework
// https://ethereum.stackexchange.com/questions/36639/truffle-cmd-bignumber-to-number-hex-to-string