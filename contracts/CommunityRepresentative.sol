pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;

import "./CommunityLib.sol";

// CommunityCandidate interface / ABI
contract CommunityCandidateInterface {
	function getCandidatesIdx() public pure returns(address[]) {}
	function getCandidate(address) public pure returns(CommunityLib.Candidate) {}
}

contract CommunityRepresentative {

    struct Representative {
        address identity;
        uint voteCount;
    }

	address constant candidateDeleted = address(0);
	
	CommunityCandidateInterface public communityCandidate;
	address public communityElectorAddr;

	address[4] public communityRepresentatives;

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
    
    function getCommunityRepresentative() public view returns(address[4]) {
        return communityRepresentatives;
    }

	function electAllRepresentative() public onlyCommunityElector {
        Representative[4] memory communityRepresentativesTmp;
        
        CommunityLib.Candidate memory communityRepresentativeTmp;
        uint communityTmp;

		address[] memory candidatesIdx = communityCandidate.getCandidatesIdx();

	    // each candidatesIdx's value equals to candidateDeleted means that the candidate is not one anymore.
	    for(uint i = 0; i < candidatesIdx.length; i++) {
        	if (candidatesIdx[i] != candidateDeleted) {
                communityRepresentativeTmp = communityCandidate.getCandidate(candidatesIdx[i]);
                communityTmp = uint(communityRepresentativeTmp.community);

                if (communityRepresentativeTmp.voteCount > communityRepresentativesTmp[communityTmp].voteCount) {
                    communityRepresentativesTmp[communityTmp].identity = communityRepresentativeTmp.identity;
                    communityRepresentativesTmp[communityTmp].voteCount = communityRepresentativeTmp.voteCount;
                }
        	}
    	}

        // 4 enum length
        for (uint j = 0; j < 4; j++) {
            communityRepresentatives[j] = communityRepresentativesTmp[j].identity;
        }
	}
}

// https://stackoverflow.com/questions/33839154/in-ethereum-solidity-what-is-the-purpose-of-the-memory-keyword