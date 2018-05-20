const helper = require("./Helper.js");

const CommunityCandidate = artifacts.require("CommunityCandidate");
const CommunityElector = artifacts.require("CommunityElector");
const CommunityEnum = Object.freeze({"Bitcoin": 0, "Ethereum": 1, "Filecoin": 2, "Monero": 3 });

const dayInBlock = 10;

contract('CommunityElector', function (accounts) {

  const account0 = accounts[0];
  const account1 = accounts[1];

  let communityCandidate;
  let communityElector;
  
  beforeEach('setup contract for each test', async function () {
    communityCandidate = await CommunityCandidate.deployed();
    communityElector = await CommunityElector.deployed(communityCandidate.address);
  })

  it("should have isElectionOpen false at the beggining", async function() {
    const isElectionOpen = await communityElector.isElectionOpen.call();

    assert.isFalse(
      isElectionOpen,
      "seems isElectionOpen is true but should be false."
    );
  })

  it("should have startVotingBlock set to a day after CommunityElector has been mined.", async function () {
    const startVotingBlock = await communityElector.startVotingBlock.call();

  	/**
  	* blockHeight when CommunityElector constructor was called.
  	* As Transactions happen before test execution, we need to sub it from the current blockHeight. 
  	* Ganache default behaviour mines a block for each transaction to confirm them directly 
  	*/
  		
  	const BlocksOrTxsBeforeTestExecution = 2;
  	const blockNumber = web3.eth.blockNumber - BlocksOrTxsBeforeTestExecution;
  		
  	// it takes 3 blocks to setup test env, as a dayInBlock is 5760 in prod but 10 in test, we should find 13
  	assert.equal(
      startVotingBlock.toNumber(), blockNumber + dayInBlock, 
      "seems like a day equivalent wasn't found in startVotingBlock"
    );
  });

  it("should have endVotingBlock equals to a day after startVotingBlock.", async function () {
    const startVotingBlock = await communityElector.startVotingBlock.call();
    const endVotingBlock = await communityElector.endVotingBlock.call();
	  
	  assert.equal(
      endVotingBlock.toNumber(), startVotingBlock.toNumber() + dayInBlock, 
      "endVotingBlock not equal to a day after startVotingBlock"
    );
  });

  it("shoud read CommunityCandidate contract", async function () {
  	/**
  	* To test contract interactions we should redeploy them,
  	* even if we could find a workaround to access CommunityCandidate previously tested.
  	*/

	  await communityCandidate.registerCandidate("@aantonop", CommunityEnum.Bitcoin, {from: account0});
  	
  	const candidate = {};
  	[candidate.pseudo, candidate.community, candidate.identity] = await communityCandidate.getCandidate.call(account0);
  	
  	assert.equal(web3.toUtf8(candidate.pseudo), "@aantonop", "candidate.pseudo is different than '@aantonop'");
  	assert.equal(candidate.community.valueOf(), "0", "candidate.community 0 is different than CommunityEnum.Bitcoin");
  	assert.equal(candidate.identity.valueOf(), "0xfc4fa36a7ec9e1455cbc0e3ae5187cbd8ef6b2b1", "candidate.identity is different than 0xfc4fa36a7ec9e1455cbc0e3ae5187cbd8ef6b2b1");
  });

  it("should write CommunityCandidate contract by adding one candidate", async function() {

  	await communityCandidate.registerCandidate("@VitalikButerin", CommunityEnum.Ethereum, {from: account1})
	  const candidatesCount = await communityElector.getCandidatesCount.call();

	  assert.equal(candidatesCount.valueOf(), 2, "candidatesCount is different than 2");
  });

  it("should reject vote while startVotingBlock has not been reached", async function() {
    const startVotingBlock = await communityElector.startVotingBlock.call();
    const blockNumber = web3.eth.blockNumber;

    assert.isBelow(
      blockNumber, startVotingBlock, 
      "Current blockHeight is not strictly below startVotingBlock which is mandatory to trigger revert()"
    );
	  
    // catch the revert() exeception and return true as the test succeed
	  try {
		  await communityElector.electorVotes(account0, {from: account1});
	  } catch (e) {
      return true;
	  }
    
    throw new Error("I should never see this!");
  });

 it("should check ElectionState event TRUE by having the FIRST vote after startVotingBlock has been reach", async function() {
    const startVotingBlock = await communityElector.startVotingBlock.call();
    let blockNumber = web3.eth.blockNumber;
    
    /**
      * As it takes a while to go mine a test block,
      * we modify the constant dayInBlock within the contract CommunityElector.sol DIRECTLY 
      * we do not rely on smartcontract endCommunityCandidateBlock which is approx 5760 blocks
      */
    while (blockNumber < startVotingBlock) {
      await helper.mineBlock();
      blockNumber = web3.eth.blockNumber;
    }

    let candidate0Info = await communityElector.getCandidate.call(account0);
    let candidate0VoteCount = candidate0Info[3].toNumber();    
    assert.equal(
      candidate0VoteCount, 0, 
      "candidate0 should not have any vote yet"
    );

    // before the first vote the the state should be false aka close
    let isElectionOpen = await communityElector.isElectionOpen.call();
    assert.isFalse(
      isElectionOpen, 
      "seems isElectionOpen is true but should be false as voting hasn't yet started."
    );

    // The account1 votes and it's the first one so we catch the event
    const voteTx = await communityElector.electorVotes(account0, {from: account1});
    const eventLog = voteTx.logs[0];
    const eventName = eventLog.event;
    const eventArgs = eventLog.args;

    assert.equal(eventName, "ElectionState", "Event name is not equals to 'ElectionState'");
    assert.isTrue(eventArgs.state, "In the context where Voting period open the state says closed.");

    // after the first vote the the state should be true aka open
    isElectionOpen = await communityElector.isElectionOpen.call();
    assert.isTrue(
      isElectionOpen, true, 
      "seems isElectionOpen is true but should be false as voting hasn't yet started."
    );

    // as we vote once the candidate should only have one vote
    candidate0Info = await communityElector.getCandidate.call(account0);
    candidate0VoteCount = candidate0Info[3].toNumber();
    assert.equal(candidate0VoteCount, 1, "candidate0 should have only one vote ");

 });

  it("should not allow an user to vote multiple times a specific community candidate.", async function() {

  	try {
  		await communityElector.electorVotes(account0, {from: account1});
  	} catch (e) {
  		return true;
  	}
  	throw new Error("I should never see this!");
  });

  it("should allow an user to vote to different community candidate.", async function() {
  	const vitalik = web3.eth.accounts[1];

  	// In this case vitalik vote for himself after voting for aantonop
 	  await communityElector.electorVotes(vitalik, {from: vitalik});

 	  const vitalikInfo = await communityElector.getCandidate.call(vitalik);
 	  vitalikVoteCount = vitalikInfo[3].toNumber();
 	  
    assert.equal(vitalikVoteCount, 1, "vitalik should have only his own vote.");
  });

  it("should check ElectionState event FALSE by having the LAST vote after or equals endVotingBlock has been reach", async function() {
    const endVotingBlock = await communityElector.endVotingBlock.call();
    let blockNumber = web3.eth.blockNumber;

    // - 1 because the voting tx will when mined be it will match exactly endVotingBlock value
    // and the (block.number >= endVotingBlock && isElectionOpen) condition
    while (blockNumber < endVotingBlock - 1) {
      await helper.mineBlock();
      blockNumber = web3.eth.blockNumber;
    }

    // The account0 votes and it's the first one so we catch the event
    const voteTx = await communityElector.electorVotes(account1, {from: account0});
    const eventLog = voteTx.logs[0];
    const eventName = eventLog.event;
    const eventArgs = eventLog.args;

    assert.equal(eventName, "ElectionState", "Event name is not equals to 'ElectionState'");
    assert.isFalse(eventArgs.state, "In the context where Voting period open the state says closed.");

    const vitalikInfo = await communityElector.getCandidate.call(account1);
    const vitalikVoteCount = vitalikInfo[3].toNumber();

    assert.equal(vitalikVoteCount, 2, "vitalik should have 2 vote.");
  });

  it("should fail to vote as the startVotingBlock has been updated previously", async function() {
    const blockNumber = web3.eth.blockNumber;
    const startVotingBlock = await communityElector.startVotingBlock.call();


    assert.isBelow(blockNumber, startVotingBlock, "blockNumber should not be equal or above startVotingBlock");
    
    try {
      await communityElector.electorVotes(account1, {from: account0});  
    } catch (e) {
      return true;
    }
    
    throw new Error("I should never see this!");
  });

});

// https://ethereum.stackexchange.com/questions/24915/testing-contract-interactions-with-truffle
// https://ethereum.stackexchange.com/questions/29597/how-to-convert-bignumber-to-number-in-truffle-framework
// https://ethereum.stackexchange.com/questions/36639/truffle-cmd-bignumber-to-number-hex-to-string