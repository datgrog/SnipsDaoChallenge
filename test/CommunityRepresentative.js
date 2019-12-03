const helper = require("./Helper.js");
const utf8ToHex = web3.utils.utf8ToHex;
const hexToUtf8 = web3.utils.hexToUtf8;

const CommunityCandidate = artifacts.require("CommunityCandidate");
const CommunityElector = artifacts.require("CommunityElector");
const CommunityRepresentative = artifacts.require("CommunityRepresentative");

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

  it("INIT : should register 9 candidates", async function() {
  	let candidatesCount = await communityCandidate.getCandidatesCount.call();

  	assert.equal(
      candidatesCount.valueOf(), 0, 
      "candidatesCount is different than 0"
    );

    await helper.register9Candidates(communityCandidate, accounts);

	  candidatesCount = await communityCandidate.getCandidatesCount.call();

  	assert.equal(
      candidatesCount.valueOf(), 9, 
      "candidatesCount is different than 9"
    );

  });

  it("INIT : should votes, until before last vote.", async function() {
  	let blockNumber = await web3.eth.getBlockNumber();
    let startVotingBlock = await communityElector.startVotingBlock.call();
    let endVotingBlock = await communityElector.endVotingBlock.call();

    // - 1 because the voting tx will when mined be it will match exactly endVotingBlock value
    // and the (block.number >= endVotingBlock && isElectionOpen) condition
    while (blockNumber < startVotingBlock - 1) {
      await helper.mineBlock();
      blockNumber = await web3.eth.getBlockNumber();
    }
    
    // People register as candidate of course 
    // vote for themself as they are allowed to do so.
    const firstVoteTx = await communityElector.electorVote(accounts[0], {from: accounts[0]});
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

    await helper.electionVoteMockup1(communityElector, accounts);
  });

  it("should fire last vote which trigger electAllRepresentative().", async function() {
  	let blockNumber = await web3.eth.getBlockNumber();
    let endVotingBlock = await communityElector.endVotingBlock.call();

  	// makes sure lastVote has not been fire yet
    assert.isBelow(
      blockNumber, endVotingBlock.toNumber(), 
      "blockNumber is not strictly below to endVotingBlock."
    );

    while (blockNumber < endVotingBlock - 1) {
      await helper.mineBlock();
      blockNumber = await web3.eth.getBlockNumber();
    }

    // Context where current blockcHeight is endVotingBlock - 1
    // is when electAllRepresentative would be trigger after one last vote
    const lastVoteTx = await communityElector.electorVote(accounts[6], {from: accounts[20]});
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

  it("should have representatives accordingly to previous vote where there is 10 candidates max", async function () {
    const communityRepresentatives = await communityRepresentative.getCommunityRepresentative();
    const undefinedIdentity = "0x0000000000000000000000000000000000000000";

    // Print community representatives
    let representative;
    let representativeCount = 0;
    
    for (let i = 0; i < 10; i++) {
    	representative = await communityCandidate.getCandidate.call(communityRepresentatives[i]);

      if (representative[1].valueOf() != undefinedIdentity) {
        representativeCount++;
      }

    // 	console.log("Representative - [Pseudo] " + web3.toUtf8(representative[0]) 
    // 		+ " [Identity] " + representative[1].valueOf()
    // 		+ " [VoteCount] " + representative[2].toNumber());
    // }
    }

    // as there is only 9 candidates then we should have 9 representatives and one undefined
    assert.equal(
      representativeCount, 9, 
      "representativeCount should be equals to the number of registred candidate as they are < 10"
    );
    const lastRepresentative = await communityCandidate.getCandidate.call(communityRepresentatives[9])
    assert.equal(
      lastRepresentative[1].valueOf(), undefinedIdentity, 
      "The last representative identity should be undefined with default address(0)"
    );
  });

  it("should register other 11 candidates before blockcHeight equals startVotingBlock", async function () {
    await helper.register11Candidates(communityCandidate, accounts);
    const candidatesCount = await communityCandidate.getCandidatesCount.call();

    assert.equal(
      candidatesCount.valueOf(), 20, 
      "candidatesCount is different than 20"
    );
  })

  it("should reset state of the election when the first next allowed vote is fire", async function () {
  	let blockNumber = await web3.eth.getBlockNumber();
    let startVotingBlock = await communityElector.startVotingBlock.call();

    while (blockNumber < startVotingBlock - 1) {
      await helper.mineBlock();
      blockNumber = await web3.eth.getBlockNumber();
    }

    // As a candidate
    let candidateInfo = await communityElector.getCandidate.call(accounts[0]);
  	assert.equal(
      candidateInfo[2].toNumber(), 4, 
      "Candidate should have 4 votes."
    );
    
    // As an elector
    let electorsCommunityVote = await communityElector.getElectorFirewallVote.call(accounts[0]);
    assert.isTrue(
      electorsCommunityVote, 
      "electorsCommunityVote is false but should be true here."
    );

    // TRIGGER RESET
    // should fire the first vote of the second voting period which trigger election reset
    const firstVoteTx = await communityElector.electorVote(accounts[5], {from: accounts[0]});
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

	  candidateInfo = await communityElector.getCandidate.call(accounts[5]);
  	assert.equal(
      candidateInfo[2].toNumber(), 1,
      "Candidate should have 1 vote."
    );

    electorsCommunityVote = await communityElector.getElectorFirewallVote.call(accounts[0]);
    assert.isTrue(
      electorsCommunityVote, 
      "electorsCommunityVote accounts[1] is true but should be false as he didnt vote yet."
    );

    electorsCommunityVote = await communityElector.getElectorFirewallVote.call(accounts[1]);
    assert.isFalse(
      electorsCommunityVote,
      "electorsCommunityVote accounts[0] is false but should be true here as he has already voted."
    );
  });

  // SECOND ELECTION WITH MORE THAN > 10 candidates
  it("should vote amongst the 20 candidates and fire last vote which trigger electAllRepresentative().", async function() {
    await helper.electionVoteMockup2(communityElector, accounts);

    let blockNumber = await web3.eth.getBlockNumber();
    let endVotingBlock = await communityElector.endVotingBlock.call();

    // makes sure lastVote has not been fire yet
    assert.isBelow(
      blockNumber, endVotingBlock.toNumber(), 
      "blockNumber is not strictly below to endVotingBlock."
    );

    while (blockNumber < endVotingBlock - 1) {
      await helper.mineBlock();
      blockNumber = await web3.eth.getBlockNumber();
    }

    // Context where current blockcHeight is endVotingBlock - 1
    // is when electAllRepresentative would be trigger after one last vote
    const lastVoteTx = await communityElector.electorVote(accounts[6], {from: accounts[38]});
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
  it("should have representatives accordingly to previous vote where there is more than 10 candidates", async function () {
    const communityRepresentatives = await communityRepresentative.getCommunityRepresentative();

    assert.equal(
      communityRepresentatives[0].valueOf(), "0x440348997Da5130d491864c23DE26639706d488f",
      "Decred representative is not @candidate9"
    );
    assert.equal(
      communityRepresentatives[1].valueOf(), "0x502C07E176820A19c5AAa57e4a0DbDDFA1182791",
      "Decred representative is not @candidate4"
    );
    assert.equal(
      communityRepresentatives[2].valueOf(), "0xB66761118C38062efce94ed524a41Ce61E8D9e36",
      "Decred representative is not @candidate2"
    );
    assert.equal(
      communityRepresentatives[3].valueOf(), "0x92AE17e1824a479C549AF8B2ae678d84aB8D45E0",
      "Decred representative is not @candidate16"
    );
    assert.equal(
      communityRepresentatives[4].valueOf(), "0x5f6f21faa62889F0D5BEA2f20dd63cC759c0d4A7",
      "Decred representative is not @candidate15"
    );
    assert.equal(
      communityRepresentatives[5].valueOf(), "0xB6399Bdb2C828420284F296d4E9cc1016ca1B5Fa",
      "Decred representative is not @candidate8"
    );
    assert.equal(
      communityRepresentatives[6].valueOf(), "0xfc4FA36a7Ec9e1455cbc0E3ae5187Cbd8Ef6B2B1",
      "Decred representative is not @candidate0"
    );
    assert.equal(
      communityRepresentatives[7].valueOf(), "0xFf52Bf651264C32fB8491e6d9fbdCbe22A2F98e6",
      "Decred representative is not @candidate11"
    );
    assert.equal(
      communityRepresentatives[8].valueOf(), "0x03573B69cC58Edd544baB2992c01c281430e500D",
      "Decred representative is not @candidate6"
    );
    assert.equal(
      communityRepresentatives[9].valueOf(), "0x80A140E86cE98CA848b27Cd20FF5C6FbfF93EE5F",
      "Decred representative is not @candidate5"
    );
  })
});

// https://ethereum.stackexchange.com/questions/18660/batch-transactions-for-metamask-using-sendasync
// https://ethereum.stackexchange.com/questions/36229/invalid-solidity-type-tuple