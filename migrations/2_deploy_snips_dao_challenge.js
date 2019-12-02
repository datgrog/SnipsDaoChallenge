const Array256Lib = artifacts.require("./Array256Lib.sol");
const CommunityCandidate = artifacts.require("./CommunityCandidate.sol");
const CommunityElector = artifacts.require("./CommunityElector.sol");
const CommunityRepresentative = artifacts.require("./CommunityRepresentative.sol");

module.exports = function(deployer) {
	/**
	* Deploy CommunityCandidate, then deploy CommunityElector,
	* passing in CommunityCandidate's newly deployed address 
	*/

	deployer.then(async function() {
		const accounts = await web3.eth.getAccounts();
		const owner = accounts[0];

		await deployer.deploy(Array256Lib);
		await deployer.link(Array256Lib, CommunityRepresentative);


		const CommunityCandidateInstance = await deployer.deploy(CommunityCandidate);
		
		const CommunityRepresentativeInstance = await deployer.deploy(
													CommunityRepresentative, 
													CommunityCandidate.address
												);

		const CommunityElectorInstance = await deployer.deploy(
											CommunityElector, 
											CommunityCandidate.address,
											CommunityRepresentative.address
										 );

		await CommunityCandidateInstance.setCommunityElectorAddr(CommunityElector.address, {from: owner});
		await CommunityRepresentativeInstance.setCommunityElectorAddr(CommunityElector.address, {from: owner});
	});
};

// await async migrations file
// https://github.com/trufflesuite/truffle/issues/501