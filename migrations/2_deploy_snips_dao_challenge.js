// const SnipsDaoChallenge = artifacts.require("./SnipsDaoChallenge.sol")

// module.exports = function(deployer) {
// 	deployer.deploy(SnipsDaoChallenge);
// };
const CommunityCandidate = artifacts.require("./CommunityCandidate.sol")

module.exports = function(deployer) {
	deployer.deploy(CommunityCandidate);
};