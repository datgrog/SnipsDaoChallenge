const CommunityCandidate = artifacts.require("CommunityCandidate");
const CommunityElector = artifacts.require("CommunityElector");
const CommunityEnum = Object.freeze({"Bitcoin": 0, "Ethereum": 1, "Filecoin": 2, "Monero": 3 });

contract('CommunityElector', function (accounts) {

  let communityCandidate;
  let communityElector;
  
  beforeEach('setup contract for each test', async function () {
    communityCandidate = await CommunityCandidate.deployed();
    communityElector = await CommunityElector.deployed(communityCandidate.address);
  })

  it("shoud read CommunityCandidate contract", async function () {
  	/**
  	* To test contract interactions we should redeploy them,
  	* even if we could find a workaround to access CommunityCandidate previously tested.
  	*/
	const account0 = web3.eth.accounts[0];

	await communityCandidate.registerCandidate("@aantonop", CommunityEnum.Bitcoin, {from: account0});

	const aantonop = await communityElector.getCandidate.call(account0);
	console.log(aantonop);

	const candidatesCount = await communityElector.getCandidatesCount.call();
	console.log(candidatesCount);
  });

  it("OK GROG", async function() {
  	const account1 = web3.eth.accounts[1];

  	await communityCandidate.registerCandidate("@VitalikButerin", CommunityEnum.Ethereum, {from: account1})
	
	const candidatesCount = await communityElector.getCandidatesCount.call();
	console.log(candidatesCount);
  });

});

// https://ethereum.stackexchange.com/questions/24915/testing-contract-interactions-with-truffle