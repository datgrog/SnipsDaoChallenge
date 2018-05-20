const CommunityCandidate = artifacts.require("./CommunityCandidate.sol");
const CommunityElector = artifacts.require("./CommunityElector.sol");
const owner = web3.eth.accounts[0];

module.exports = function(deployer) {
	/**
	* Deploy CommunityCandidate, then deploy CommunityElector,
	* passing in CommunityCandidate's newly deployed address 
	*/
	deployer.then(async function() {
		const CommunityCandidateInstance = await deployer.deploy(CommunityCandidate);
		const CommunityElectorInstance = await deployer.deploy(CommunityElector, CommunityCandidate.address);

		await CommunityCandidateInstance.setCommunityElectorAddr(CommunityElector.address, {from: owner});
	});
};

// await async migrations file
// https://github.com/trufflesuite/truffle/issues/501