const CommunityCandidate = artifacts.require("CommunityCandidate");
const utf8ToHex = web3.utils.utf8ToHex;
const hexToUtf8 = web3.utils.hexToUtf8;


// Ganache GUI keeps same wallet which is more convenient for testing
// MNEMONIC onion tape alien arctic brush claim verb panther panic issue domain away
// HD PATH m/44'/60'/0'/0/account_index

contract('CommunityCandidate', function (accounts) {
  const account0 = accounts[0];
  const account1 = accounts[1];

  let communityCandidate;
  
  // Contract instance looks like already setup by migrations script
  // as tests passes without "normal" initialization / constructor params
  beforeEach("setup contract for each test", async function () {
    communityCandidate = await CommunityCandidate.deployed();
  });

  it("shoud have a reference to CommunityElector's contract", async function () {
    const communityElectorAddr = await communityCandidate.communityElectorAddr.call();

    assert.notEqual(
      communityElectorAddr.valueOf(), "0x0000000000000000000000000000000000000000", 
      "communityElectorAddr should not have default address(0)"
    );
  });

  it("should not assign CommunityElector's contract reference if already initiate", async function () {
    const communityElectorAddr = await communityCandidate.communityElectorAddr.call();
    const randomContractAdrr = "0xa5b9d60f32436310afebcfda832817a68921beaf";

    // Tx could be fire from anyone but without ABI neither contract Addr,
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
    await communityCandidate.registerCandidate(utf8ToHex("@aantonop"), {from: account0});

    // ({0: candidate.pseudo, 1: candidate.identity, 2: candidate.voteCount} = await communityCandidate.getCandidate.call(account0));
    const candidate_res = await communityCandidate.getCandidate.call(account0);
    const candidate = { 'pseudo': candidate_res['0'], 'identity': candidate_res['1'], 'voteCount': candidate_res['2']};

    assert.equal(
      hexToUtf8(candidate.pseudo), "@aantonop",
      "candidate.pseudo is different than '@aantonop'"
    );
    assert.equal(
      candidate.identity.valueOf(), "0xfc4FA36a7Ec9e1455cbc0E3ae5187Cbd8Ef6B2B1",
      "candidate.identity is different than 0xfc4FA36a7Ec9e1455cbc0E3ae5187Cbd8Ef6B2B1"
    );
    assert.equal(
      candidate.voteCount.toNumber(), 0, 
      "candidate voteCount should be 0."
    );
  });

  it("should have one candidate", async function () {
    const candidatesCount = await communityCandidate.getCandidatesCount.call();

    assert.equal(candidatesCount.valueOf(), 1, "candidatesCount is different than 1");
  });

  it("should check CandidateRegistered event by register another candidate", async function () {
    const registerCandidateTx = await communityCandidate.registerCandidate(utf8ToHex("@VitalikButerin"), {from: account1});
    const eventLog = registerCandidateTx.logs[0];
    const eventName = eventLog.event;
    const eventArgs = eventLog.args;
      
    assert.equal(
      eventName, "CandidateRegistered", 
      "Event name is not equals to 'CandidateRegistered'"
    );
    assert.equal(
      eventArgs.identity.valueOf(), "0x1df7E4d6F021CFF30B62EfF03552fdbDdc9FddAc", 
      "eventArgs.identity is different than 0x1df7E4d6F021CFF30B62EfF03552fdbDdc9FddAc"
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
    const candidateToDelIdentity = account1;

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