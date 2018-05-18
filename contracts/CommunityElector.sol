pragma solidity ^0.4.23;
// import "./CommunityRepresentative.sol";

contract CommunityRepresentative {
	//function quickVote(address candidateIdx) public returns(bool) {}
    function getCandidatesCount() public pure returns(uint) { }
}

contract CommunityElector {
	
	CommunityRepresentative cr;

	constructor(address _cr) public {
		cr = CommunityRepresentative(_cr);
	}

	// function quickVote(address candidateIdx) public {
	// 	cr.quickVote(candidateIdx);
	// }

    function getCandidatesCount() public view returns (uint) {
        return cr.getCandidatesCount();
    }
}

// https://medium.com/@blockchain101/calling-the-function-of-another-contract-in-solidity-f9edfa921f4c
// https://vessenes.com/tx-origin-and-ethereum-oh-my/