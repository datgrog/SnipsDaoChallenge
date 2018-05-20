const CommunityCandidate = artifacts.require("CommunityCandidate");
const CommunityEnum = Object.freeze({"Bitcoin": 0, "Ethereum": 1, "Filecoin": 2, "Monero": 3 });

// Ganache GUI keeps same wallet which is more convenient for testing
// MNEMONIC onion tape alien arctic brush claim verb panther panic issue domain away
// HD PATH m/44'/60'/0'/0/account_index

contract('CommunityCandidate', function (accounts) {

  const account0 = accounts[0];
  const account1 = accounts[1];

  let communityCandidate;
  
  beforeEach('setup contract for each test', async function () {
    communityCandidate = await CommunityCandidate.deployed();
  })

  it("shoud have a reference to CommunityElector contract with communityElectorAddr", async function () {
    const communityElectorAddr = await communityCandidate.communityElectorAddr.call();

    assert.notEqual(
      communityElectorAddr.valueOf(), "0x0000000000000000000000000000000000000000", 
      "communityElectorAddr should not have default address(0)"
    );
  });

  it("should not assign communityElectorAddr if already initiate", async function () {
    const communityElectorAddr = await communityCandidate.communityElectorAddr.call();
    const randomContractAdrr = "0xa5b9d60f32436310afebcfda832817a68921beaf";

    // tx could be fire from anyone but without ABI neither contract Addr,
    // it's safe to say we got time to be the first to init this var.
    try {
      await communityCandidate.setCommunityElectorAddr(randomContractAdrr);  
    } catch (e) {
      return true;
    }
    
    throw new Error("I should never see this!")
  });

  it("should have no candidate", async function () {
  	const candidatesCount = await communityCandidate.getCandidatesCount.call();

	  assert.equal(
      candidatesCount.valueOf(), 0, 
      "candidatesCount is different than 0"
    );
  });
  
  it("should register a candidate", async function () {
  	await communityCandidate.registerCandidate("@aantonop", CommunityEnum.Bitcoin, {from: account0});
  	
  	const candidate = {};
  	[candidate.pseudo, candidate.community, candidate.identity] = await communityCandidate.getCandidate.call(account0);
  	
  	assert.equal(
      web3.toUtf8(candidate.pseudo), "@aantonop", 
      "candidate.pseudo is different than '@aantonop'"
    );
  	assert.equal(
      candidate.community.valueOf(), "0", 
      "candidate.community 0 is different than CommunityEnum.Bitcoin"
    );
  	assert.equal(
      candidate.identity.valueOf(), "0xfc4fa36a7ec9e1455cbc0e3ae5187cbd8ef6b2b1", 
      "candidate.identity is different than 0xfc4fa36a7ec9e1455cbc0e3ae5187cbd8ef6b2b1"
    );
  });

  it("should have one candidate", async function () {
  	const candidatesCount = await communityCandidate.getCandidatesCount.call();

	  assert.equal(candidatesCount.valueOf(), 1, "candidatesCount is different than 1");
  });

  it("should check CandidateRegistered event by register another candidate", async function () {
  	const registerCandidateTx = await communityCandidate.registerCandidate("@VitalikButerin", CommunityEnum.Ethereum, {from: account1});
    const eventLog = registerCandidateTx.logs[0];
    const eventName = eventLog.event;
    const eventArgs = eventLog.args;
      
    assert.equal(
      eventName, "CandidateRegistered", 
      "Event name is not equals to 'CandidateRegistered'"
    );
    assert.equal(
      eventArgs.identity.valueOf(), "0x1df7e4d6f021cff30b62eff03552fdbddc9fddac", 
      "eventArgs.identity is different than 0x1df7e4d6f021cff30b62eff03552fdbddc9fddac"
    );
  });

  it("should have two candidates", async function () {
  	const candidatesCount = await communityCandidate.getCandidatesCount.call();

	  assert.equal(
      candidatesCount.valueOf(), 2, 
      "candidatesCount is different than 2"
    );
  });

  it("should deregistered a candidate given the eth account the request came from", async function () {
  	const candidateToDelIdentity = web3.eth.accounts[1];

  	let candidatesIdx = await communityCandidate.getCandidatesIdx();
  	let candidateToDelIdx = -1;

  	Object.entries(candidatesIdx).forEach(([key, value]) => {
  		if (candidateToDelIdentity === value ) {
  			candidateToDelIdx = key;
  		}
  	});

  	if (candidateToDelIdx === -1) { 
  		throw new Error("The candidate to delete should be the one inserted prev so we should find his identity within candidatesIdx!") 
  	}

  	await communityCandidate.deregisterCandidate({from: candidateToDelIdentity});

	  candidatesIdx = await communityCandidate.getCandidatesIdx();

  	assert.equal(
      candidatesIdx[candidateToDelIdx].valueOf(), "0x0000000000000000000000000000000000000000", 
      "Deregister candidateIdx should have default address(0)"
    );
  });

  it("should have one candidate", async function () {
  	const candidatesCount = await communityCandidate.getCandidatesCount.call();

	  assert.equal(
      candidatesCount.valueOf(), 1, 
      "candidatesCount is different than 1"
    );
  });

});

// https://medium.com/@kscarbrough1/writing-solidity-unit-tests-for-testing-assert-require-and-revert-conditions-using-truffle-2e182d91a40f
// https://medium.com/coinmonks/testing-solidity-with-truffle-and-async-await-396e81c54f93
// https://web3js.readthedocs.io/en/1.0/web3-utils.html
// https://ethereum.stackexchange.com/questions/15567/truffle-smart-contract-testing-does-not-reset-state/15574#15574
// https://medium.com/@gus_tavo_guim/testing-your-smart-contracts-with-javascript-40d4edc2abed