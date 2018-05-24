const helper = require("./Helper.js");

const CommunityCandidate = artifacts.require("CommunityCandidate");
const CommunityElector = artifacts.require("CommunityElector");

const dayInBlock = 40;

const CommunityRepresentative = artifacts.require("CommunityRepresentative");

contract('CommunityElector', function (accounts) {

  const account0 = accounts[0];
  const account1 = accounts[1];
  const account2 = accounts[2];
  const account3 = accounts[3];

  let communityCandidate;
  let communityElector;
  
  // seems like already setup by migrations script
  // as tests passes without "normal" initialization
  beforeEach("setup contract for each test", async function () {
    communityCandidate = await CommunityCandidate.deployed();
    communityElector = await CommunityElector.deployed();
    communityRepresentative = await CommunityRepresentative.deployed();
  });

  it("should have isElectionOpen false at the beggining", async function() {
    const isElectionOpen = await communityElector.isElectionOpen.call();

    assert.isFalse(
      isElectionOpen,
      "seems isElectionOpen is true but should be false."
    );
  });

  it("should have startVotingBlock set to a day after CommunityElector has been mined.", async function () {
    const startVotingBlock = await communityElector.startVotingBlock.call();

  	/**
  	* blockHeight when CommunityElector constructor was called.
  	* As Transactions happen before test execution, we need to sub it from the current blockHeight. 
  	* Ganache default behaviour mines a block for each transaction to confirm them directly 
  	*/
  		
  	const BlocksOrTxsBeforeTestExecution = 3;
  	const blockNumber = web3.eth.blockNumber - BlocksOrTxsBeforeTestExecution;
  		
  	// it takes 3 blocks to setup test env, as a dayInBlock is 5760 in prod but 40 in test, we should find 33
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

	  await communityCandidate.registerCandidate("@aantonop", {from: account0});
  	
    const candidate = {};
    [candidate.pseudo, candidate.identity, candidate.voteCount] = await communityCandidate.getCandidate.call(account0);
    
    assert.equal(
      web3.toUtf8(candidate.pseudo), "@aantonop", 
      "candidate.pseudo is different than '@aantonop'"
    );
    assert.equal(
      candidate.identity.valueOf(), "0xfc4fa36a7ec9e1455cbc0e3ae5187cbd8ef6b2b1", 
      "candidate.identity is different than 0xfc4fa36a7ec9e1455cbc0e3ae5187cbd8ef6b2b1"
    );
    assert.equal(
      candidate.voteCount.toNumber(), 0, 
      "candidate voteCount should be 0."
    );
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
		  await communityElector.electorVote(account0, {from: account1});
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
    let candidate0VoteCount = candidate0Info[2].toNumber();    
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

    // The account0 votes and it's the first one so we catch the event
    const voteTx = await communityElector.electorVote(account0, {from: account0});
    const eventLog = voteTx.logs[0];
    const eventName = eventLog.event;
    const eventArgs = eventLog.args;

    assert.equal(
      eventName, "ElectionState", 
      "Event name is not equals to 'ElectionState'"
    );
    assert.isTrue(
      eventArgs.state, 
      "In the context where Voting period open the state says closed."
    );

    // after the first vote the the state should be true aka open
    isElectionOpen = await communityElector.isElectionOpen.call();
    assert.isTrue(
      isElectionOpen, 
      "seems isElectionOpen is true but should be false as voting hasn't yet started."
    );

    // as we vote once the candidate should only have one vote
    candidate0Info = await communityElector.getCandidate.call(account0);
    candidate0VoteCount = candidate0Info[2].toNumber();
    assert.equal(
      candidate0VoteCount, 1, 
      "candidate0 should have only one vote "
    );
 });

  it("should write CommunityCandidate contract by voting", async function() {
    await communityElector.electorVote(account0, {from: account1});

    const candidate = {};
    [candidate.pseudo, candidate.identity, candidate.voteCount] = await communityElector.getCandidate.call(account0);

    assert.equal(
      web3.toUtf8(candidate.pseudo), "@aantonop", 
      "candidate.pseudo is different than '@aantonop'"
    );
    assert.equal(
      candidate.identity.valueOf(), "0xfc4fa36a7ec9e1455cbc0e3ae5187cbd8ef6b2b1", 
      "candidate.identity is different than 0xfc4fa36a7ec9e1455cbc0e3ae5187cbd8ef6b2b1"
    );
    assert.equal(
      candidate.voteCount.toNumber(), 2, 
      "candidate voteCount should be 2."
    );
  });

  it("should not allow an user to vote multiple times.", async function() {

  	try {
      // beware one could vote for an eth address that does not refers to a registered candidate, on purpose.
  		await communityElector.electorVote(account1, {from: account1});
  	} catch (e) {
  		return true;
  	}
  	throw new Error("I should never see this!");
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

    // The account2 votes and it's the last one so we catch the event
    const voteTx = await communityElector.electorVote(account2, {from: account2});
    const eventLog = voteTx.logs[0];
    const eventName = eventLog.event;
    const eventArgs = eventLog.args;

    assert.equal(
      eventName, "ElectionState", 
      "Event name is not equals to 'ElectionState'"
    );
    assert.isFalse(
      eventArgs.state, 
      "In the context where Voting period open the state says closed."
    );

    const candidate2Info = await communityElector.getCandidate.call(account2);
    const candidate2VoteCount = candidate2Info[2].toNumber();

    assert.equal(
      candidate2VoteCount, 1, 
      "candidate2 should have 1 vote."
    );
  });

  it("should fail to vote as the startVotingBlock has been updated previously", async function() {
    const blockNumber = web3.eth.blockNumber;
    const startVotingBlock = await communityElector.startVotingBlock.call();

    assert.isBelow(
      blockNumber, startVotingBlock, 
      "blockNumber should not be equal or above startVotingBlock"
    );
    
    try {
      await communityElector.electorVote(account0, {from: account0});  
    } catch (e) {
      return true;
    }
    
    throw new Error("I should never see this!");
  });

});

// https://ethereum.stackexchange.com/questions/24915/testing-contract-interactions-with-truffle
// https://ethereum.stackexchange.com/questions/29597/how-to-convert-bignumber-to-number-in-truffle-framework
// https://ethereum.stackexchange.com/questions/36639/truffle-cmd-bignumber-to-number-hex-to-string