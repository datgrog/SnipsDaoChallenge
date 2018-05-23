const helper = require("./Helper.js");

const CommunityCandidate = artifacts.require("CommunityCandidate");
const CommunityElector = artifacts.require("CommunityElector");
const CommunityRepresentative = artifacts.require("CommunityRepresentative");

const CommunityEnum = Object.freeze({
                        "Bitcoin": 0, "Ethereum": 1, 
                        "Filecoin": 2, "Monero": 3, 
                        "Doge": 4, "Cardano": 5, 
                        "NEO": 6, "Dash": 7, 
                        "Zcash": 8, "Decred": 9 
                      });

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

  it("INIT : should register 20 candidates", async function() {
  	let candidatesCount = await communityCandidate.getCandidatesCount.call();

  	assert.equal(
      candidatesCount.valueOf(), 0, 
      "candidatesCount is different than 0"
    );

    await helper.register2CandidateByCommunity(communityCandidate, CommunityEnum, accounts);

	  candidatesCount = await communityCandidate.getCandidatesCount.call();

  	assert.equal(
      candidatesCount.valueOf(), 20, 
      "candidatesCount is different than 20"
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
    const eventLog = firstVoteTx.logs[0];
    const eventName = eventLog.event;
    const eventArgs = eventLog.args;

    assert.equal(
      eventName, "ElectionState", 
      "Event name is not equals to 'ElectionState'"
    );
    assert.isTrue(
      eventArgs.state, 
      "Voting period should be open but is close."
    );

    await helper.electionVoteMockup(communityElector, accounts);
  });

  // TODO automate in contract lifecycle and more complexe voting simulation to be sure
  it("should fire last vote which trigger electAllRepresentative().", async function() {
  	let blockNumber = web3.eth.blockNumber;
    let endVotingBlock = await communityElector.endVotingBlock.call();

  	// makes sure lastVote has not been fire yet
    assert.isBelow(
      blockNumber, endVotingBlock.toNumber(), 
      "blockNumber is not strictly below to endVotingBlock."
    );

    while (blockNumber < endVotingBlock - 1) {
      await helper.mineBlock();
      blockNumber = web3.eth.blockNumber;
    }

    // context where current blockcHeight is endVotingBlock - 1
    // is when electAllRepresentative would be trigger after one last vote
    const lastVoteTx = await communityElector.electorVotes(accounts[6], {from: accounts[0]});
    const eventLog = lastVoteTx.logs[0];
    const eventName = eventLog.event;
    const eventArgs = eventLog.args;

    assert.equal(
      eventName, "ElectionState", 
      "Event name is not equals to 'ElectionState'"
    );
    assert.isFalse(
      eventArgs.state, 
      "Voting period should be close but is open."
    );
  });

  it("should have representative accordingly to previous vote", async function () {
    const communityRepresentatives = await communityRepresentative.getCommunityRepresentative();

    // Print community representatives
    // let representative;
    // let community;
    
    // for (let i = 0; i < 10; i++) {
    // 	representative = await communityCandidate.getCandidate.call(communityRepresentatives[i]);
    // 	community = representative[1];
    // 	console.log("Representative - [Community] " + Object.entries(CommunityEnum)[community][0] 
    // 		+ " [Pseudo] " + web3.toUtf8(representative[0])
    // 		+ " [Identity] " + representative[2].valueOf());
    // }

  	assert.equal(
      communityRepresentatives[0].valueOf(), "0xfc4fa36a7ec9e1455cbc0e3ae5187cbd8ef6b2b1", 
      "Bitcoin representative is not @aantonop"
    );
  	assert.equal(
      communityRepresentatives[1].valueOf(), "0x80a140e86ce98ca848b27cd20ff5c6fbff93ee5f", 
      "Ethereum representative is not @gavofyork"
    );
  	assert.equal(
      communityRepresentatives[2].valueOf(), "0xd8ed8081963166baeb520db299b58272a5572bd0", 
      "Filecoin representative is not @candidate7"
    );
  	assert.equal(
      communityRepresentatives[3].valueOf(), "0x03573b69cc58edd544bab2992c01c281430e500d", 
      "Monero representative is not @janowitz"
    );
  	assert.equal(
      communityRepresentatives[4].valueOf(), "0xb6399bdb2c828420284f296d4e9cc1016ca1b5fa", 
      "Doge representative is not @candidate8"
    );
  	assert.equal(
      communityRepresentatives[5].valueOf(), "0xbcaba8657f375838f89145f589a68be91baffc57", 
      "Cardano representative is not @candidate10"
    );
  	assert.equal(
      communityRepresentatives[6].valueOf(), "0x297b785d6ad25f31a4a3e026364c868d93da26ad", 
      "NEO representative is not @candidate12"
    );
  	assert.equal(
      communityRepresentatives[7].valueOf(), "0x96a8ef108797af3bf7c02eb3cb4bbfeaa4dfe017", 
      "Dash representative is not @candidate14"
    );
  	assert.equal(
      communityRepresentatives[8].valueOf(), "0x92ae17e1824a479c549af8b2ae678d84ab8d45e0", 
      "Zcash representative is not @candidate16"
    );
  	assert.equal(
      communityRepresentatives[9].valueOf(), "0x19185471377a3652c32d480447854c164be388c0", 
      "Decred representative is not @candidate18"
    );
  });

  it("should reset state of the election when the first next allowed vote is fire", async function () {
  	let blockNumber = web3.eth.blockNumber;
    let startVotingBlock = await communityElector.startVotingBlock.call();

    while (blockNumber < startVotingBlock - 1) {
      await helper.mineBlock();
      blockNumber = web3.eth.blockNumber;
    }

    // As a candidate
    let candidateInfo = await communityElector.getCandidate.call(accounts[0]);
  	assert.equal(
      candidateInfo[3].toNumber(), 4, 
      "Candidate should have 4 votes."
    );
    
    // As an elector
    let electorsCommunityVote = await communityElector.getElectorCommunityVote.call(accounts[0]);
    assert.isTrue(
      electorsCommunityVote[0], 
      "electorsCommunityVote[0] is false but should be true here."
    );

    // TRIGGER RESET
    // should fire the first vote of the second voting period which trigger election reset
    const firstVoteTx = await communityElector.electorVotes(accounts[1], {from: accounts[0]});
    const eventLog = firstVoteTx.logs[0];
    const eventName = eventLog.event;
    const eventArgs = eventLog.args;

    assert.equal(
      eventName, "ElectionState", 
      "Event name is not equals to 'ElectionState'"
    );
    assert.isTrue(
      eventArgs.state, 
      "Voting period should be open but is close."
    );
    // END TRIGGER RESET

	  candidateInfo = await communityElector.getCandidate.call(accounts[0]);
  	assert.equal(
      candidateInfo[3].toNumber(), 0,
      "Candidate should have 0 vote."
    );

    electorsCommunityVote = await communityElector.getElectorCommunityVote.call(accounts[0]);
    assert.isFalse(
      electorsCommunityVote[0], 
      "electorsCommunityVote[0] is false but should be true here."
    );
  });

});

// https://ethereum.stackexchange.com/questions/18660/batch-transactions-for-metamask-using-sendasync
// https://ethereum.stackexchange.com/questions/36229/invalid-solidity-type-tuple