pragma solidity ^0.4.23;
import "./CommunityLib.sol";

contract CommunityRepresentative {
	//function electorVotes(address candidateIdx) public returns(bool) {}
	function getCandidate(address) public pure returns(bytes32, CommunityLib.CommunityChoices, address, uint) {}
    function getCandidatesCount() public pure returns(uint) { }
}

contract CommunityElector {
	
	CommunityRepresentative cr;

	constructor(address _cr) public {
		cr = CommunityRepresentative(_cr);
	}

	// function electorVotes(address candidateIdx) public {
	// 	cr.electorVotes(candidateIdx);
	// }

	function getCandidate(address candidateIdx) public view returns(bytes32, CommunityLib.CommunityChoices, address, uint) {
		return cr.getCandidate(candidateIdx);
	}

    function getCandidatesCount() public view returns (uint) {
        return cr.getCandidatesCount();
    }
}

// https://medium.com/@blockchain101/calling-the-function-of-another-contract-in-solidity-f9edfa921f4c
// https://vessenes.com/tx-origin-and-ethereum-oh-my/
// https://stackoverflow.com/questions/46104721/solidity-set-value-to-state-variables-the-value-not-changed
// https://ethereum.stackexchange.com/questions/3609/returning-a-struct-and-reading-via-web3/3614#3614