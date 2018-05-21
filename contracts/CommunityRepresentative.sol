pragma solidity ^0.4.23;
import "./CommunityLib.sol";

// CommunityCandidate interface / ABI
contract CommunityCandidateInterface {
	function getCandidatesIdx() public pure returns(address[]) {}
	function getCandidate(address) public pure returns(bytes32, CommunityLib.CommunityChoices, address, uint) {}
}

contract CommunityRepresentative {
	address constant candidateDeleted = address(0);
	
	CommunityCandidateInterface public communityCandidate;
	address public communityElectorAddr;

	CommunityLib.Candidate[4] communityRepresentative;

	uint public test;

    modifier onlyIfNotInit {
        require(
            communityElectorAddr == address(0),
            "communityElectorAddr has already been initiate."
        );
        _;
    }

    modifier onlyCommunityElector {
        require(
            communityElectorAddr == msg.sender,
            "msg.sender is not communityElectorAddr."
        );
        _;
    }

	constructor(address _cc) public {
		communityCandidate = CommunityCandidateInterface(_cc);
	}

    function setCommunityElectorAddr(address _ce) public onlyIfNotInit() {
    	communityElectorAddr = _ce;
    }

	function electAllRepresentative() public onlyCommunityElector {
		address[] memory candidatesIdx = communityCandidate.getCandidatesIdx();
	    uint candidatesCount = 0;
	    
	    // each candidatesIdx's value equals to candidateDeleted means that the candidate is not one anymore.
	    for(uint i = 0; i<candidatesIdx.length; i++) {
        	if (candidatesIdx[i] != candidateDeleted) {
        		candidatesCount++;
        	}
    	}
    	test = candidatesCount;
	}
}

// https://stackoverflow.com/questions/33839154/in-ethereum-solidity-what-is-the-purpose-of-the-memory-keyword