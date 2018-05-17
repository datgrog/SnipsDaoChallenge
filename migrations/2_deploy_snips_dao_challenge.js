// const SnipsDaoChallenge = artifacts.require("./SnipsDaoChallenge.sol")

// module.exports = function(deployer) {
// 	deployer.deploy(SnipsDaoChallenge);
// };
const CommunityCandidate = artifacts.require("./CommunityCandidate.sol");
const CommunityElector = artifacts.require("./CommunityElector.sol");

module.exports = function(deployer) {
	// deployer.deploy(CommunityCandidate);

	// Deploy A, then deploy B, passing in A's newly deployed address
	deployer.deploy(CommunityCandidate).then(function() {
	  return deployer.deploy(CommunityElector, CommunityCandidate.address);
	});
};