const CommunityCandidate = artifacts.require("./CommunityCandidate.sol");
const CommunityElector = artifacts.require("./CommunityElector.sol");
const owner = web3.eth.accounts[0];

module.exports = function(deployer) {
	/**
	* Deploy CommunityCandidate, then deploy CommunityElector,
	* passing in CommunityCandidate's newly deployed address 
	*/
	let CommunityCandidateInstance;
	let CommunityElectorInstance;

	deployer.deploy(CommunityCandidate).then(function(instance) {
		CommunityCandidateInstance = instance;
	  	
	  	return deployer.deploy(CommunityElector, CommunityCandidate.address);
	}).then(function(instance) {
		CommunityElectorInstance = instance;

		// owner logic might not be necessary though
		return CommunityCandidateInstance.setCommunityElectorAddr(CommunityElector.address, {from: owner});
	});
};