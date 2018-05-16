// const SnipsDaoChallenge = artifacts.require("./SnipsDaoChallenge.sol")

// module.exports = function(deployer) {
// 	deployer.deploy(SnipsDaoChallenge);
// };
const CandidateRegistration = artifacts.require("./CandidateRegistration.sol")

module.exports = function(deployer) {
	deployer.deploy(CandidateRegistration);
};