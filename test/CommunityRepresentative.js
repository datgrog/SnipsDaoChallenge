const helper = require("./Helper.js");

const CommunityCandidate = artifacts.require("CommunityCandidate");
const CommunityElector = artifacts.require("CommunityElector");
const CommunityRepresentative = artifacts.require("CommunityRepresentative");

const CommunityEnum = Object.freeze({"Bitcoin": 0, "Ethereum": 1, "Filecoin": 2, "Monero": 3 });

contract('CommunityRepresentative', function (accounts) {
  let communityCandidate;
  let communityElector;
  let communityRepresentative;

  // seems like already setup by migrations script
  // as tests passes without "normal" initialization
  beforeEach("setup contract for each test", async function () {
	communityCandidate = await CommunityCandidate.deployed();
	communityElector = await CommunityElector.deployed();
	communityRepresentative = await CommunityRepresentative.deployed();
  });

  // Does it make sense to set communityCandidateAddr, communityElector 
  // public to test that they are properly set ?

  it("shoud have a reference to CommunityCandidate contract", async function () {
    const communityCandidateAddr = await communityRepresentative.communityCandidate.call();

    assert.notEqual(
      communityCandidateAddr.valueOf(), "0x0000000000000000000000000000000000000000", 
      "communityCandidateAddr should not have default address(0)"
    );
  });

  it("shoud have a reference to CommunityElector contract", async function () {
    const communityElectorAddr = await communityRepresentative.communityElectorAddr.call();

    assert.notEqual(
      communityElectorAddr.valueOf(), "0x0000000000000000000000000000000000000000", 
      "communityElectorAddr should not have default address(0)"
    );
  });

  it("INIT : should register 12 candidates", async function() {
  	let candidatesCount = await communityCandidate.getCandidatesCount.call();

  	assert.equal(
      candidatesCount.valueOf(), 0, 
      "candidatesCount is different than 0"
    );

    /**
    *	Candidates
    *	CommunityEnum.Bitcoin 3
    *	CommunityEnum.Ethereum 3
    *	CommunityEnum.Filecoin 3
    * 	CommunityEnum.Monero 3
    */
	await communityCandidate.registerCandidate("@aantonop", CommunityEnum.Bitcoin, {from: accounts[0]});
  	await communityCandidate.registerCandidate("@VitalikButerin", CommunityEnum.Ethereum, {from: accounts[1]});
  	await communityCandidate.registerCandidate("@protocollabs", CommunityEnum.Filecoin, {from: accounts[2]});
  	await communityCandidate.registerCandidate("@fluffypony", CommunityEnum.Monero, {from: accounts[3]});
  	await communityCandidate.registerCandidate("@jimmysong", CommunityEnum.Bitcoin, {from: accounts[4]});
  	await communityCandidate.registerCandidate("@gavofyork", CommunityEnum.Ethereum, {from: accounts[5]});
  	await communityCandidate.registerCandidate("@janowitz", CommunityEnum.Monero, {from: accounts[6]});

  	await communityCandidate.registerCandidate("@candidate0", CommunityEnum.Bitcoin, {from: accounts[7]});
  	await communityCandidate.registerCandidate("@candidate1", CommunityEnum.Filecoin, {from: accounts[8]});
  	await communityCandidate.registerCandidate("@candidate2", CommunityEnum.Filecoin, {from: accounts[9]});
  	await communityCandidate.registerCandidate("@candidate3", CommunityEnum.Monero, {from: accounts[10]});
  	await communityCandidate.registerCandidate("@candidate4", CommunityEnum.Ethereum, {from: accounts[11]});

	candidatesCount = await communityCandidate.getCandidatesCount.call();

  	assert.equal(
      candidatesCount.valueOf(), 12, 
      "candidatesCount is different than 12"
    );

  });

  it("INIT : should votes, until before last vote.", async function() {
  	let blockNumber = web3.eth.blockNumber;
    let startVotingBlock = await communityElector.startVotingBlock.call();
    let endVotingBlock = await communityElector.endVotingBlock.call();

    // - 1 because the voting tx will when mined be it will match exactly endVotingBlock value
    // and the (block.number >= endVotingBlock && isElectionOpen) condition
    while (blockNumber < startVotingBlock - 1) {
      await helper.mineBlock();
      blockNumber = web3.eth.blockNumber;
    }
    
    // People register as candidate of course 
    // vote for themself as they are allowed to do so.
    const firstVoteTx = await communityElector.electorVotes(accounts[0], {from: accounts[0]});
    let eventLog = firstVoteTx.logs[0];
    let eventName = eventLog.event;
    let eventArgs = eventLog.args;

    assert.equal(eventName, "ElectionState", "Event name is not equals to 'ElectionState'");
    assert.isTrue(eventArgs.state, "Voting period should be open but is close.");

    await communityElector.electorVotes(accounts[1], {from: accounts[1]});
    await communityElector.electorVotes(accounts[2], {from: accounts[2]});
    await communityElector.electorVotes(accounts[3], {from: accounts[3]});
    await communityElector.electorVotes(accounts[4], {from: accounts[4]});
    await communityElector.electorVotes(accounts[5], {from: accounts[5]});
    await communityElector.electorVotes(accounts[6], {from: accounts[6]});

    await communityElector.electorVotes(accounts[0], {from: accounts[1]});
    await communityElector.electorVotes(accounts[0], {from: accounts[2]});
    await communityElector.electorVotes(accounts[0], {from: accounts[3]});

    await communityElector.electorVotes(accounts[1], {from: accounts[4]});
    await communityElector.electorVotes(accounts[1], {from: accounts[3]});

  	blockNumber = web3.eth.blockNumber;

    while (blockNumber < endVotingBlock - 1) {
      await helper.mineBlock();
      blockNumber = web3.eth.blockNumber;
    }

    const lastVoteTx = await communityElector.electorVotes(accounts[3], {from: accounts[10]});
    eventLog = lastVoteTx.logs[0];
    eventName = eventLog.event;
    eventArgs = eventLog.args;

    assert.equal(eventName, "ElectionState", "Event name is not equals to 'ElectionState'");
    assert.isFalse(eventArgs.state, "Voting period should be close but is open.");

  	// aantonop = await communityCandidate.getCandidate.call(accounts[0]);
  	// console.log("pseudo " + aantonop[0] + " voteCount " + aantonop[3]);

  });

  // it("INIT : should fire last vote which trigger electAllRepresentative().", async function() {
  // 	const blockNumber = web3.eth.blockNumber;
  //   const startVotingBlock = await communityElector.startVotingBlock.call();
  //   const endVotingBlock = await communityElector.endVotingBlock.call();

  //   console.log("currentBlock : " + blockNumber);
  //   console.log("startVotingBlock : " + startVotingBlock.toNumber());
  //   console.log("endVotingBlock : " + endVotingBlock.toNumber());
  // });

});

// https://ethereum.stackexchange.com/questions/18660/batch-transactions-for-metamask-using-sendasync