pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;

import "./CommunityLib.sol";

// CommunityCandidate interface / ABI
contract CommunityCandidateInterface {
	function getCandidatesIdx() public pure returns(address[]) {}
	function getCandidate(address) public pure returns(CommunityLib.Candidate) {}
}

contract CommunityRepresentative {
	address constant candidateDeleted = address(0);
	
	CommunityCandidateInterface public communityCandidate;
	address public communityElectorAddr;

	address[10] public representatives;

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
    
    function getCommunityRepresentative() public view returns(address[10]) {
        return representatives;
    }

	function electAllRepresentative() public onlyCommunityElector {
        CommunityLib.Representative[10] memory representativesTmp;
        
        CommunityLib.Candidate memory communityRepresentativeTmp;
        uint communityTmp;

		address[] memory candidatesIdx = communityCandidate.getCandidatesIdx();

	    // each candidatesIdx's value equals to candidateDeleted means that the candidate is not one anymore.
	    for(uint i = 0; i < candidatesIdx.length; i++) {
        	if (candidatesIdx[i] != candidateDeleted) {
                communityRepresentativeTmp = communityCandidate.getCandidate(candidatesIdx[i]);
                communityTmp = uint(communityRepresentativeTmp.community);

                if (communityRepresentativeTmp.voteCount > representativesTmp[communityTmp].voteCount) {
                    representativesTmp[communityTmp].identity = communityRepresentativeTmp.identity;
                    representativesTmp[communityTmp].voteCount = communityRepresentativeTmp.voteCount;
                }
        	}
    	}

        // 4 enum length
        for (uint j = 0; j < 10; j++) {
            representatives[j] = representativesTmp[j].identity;
        }
	}
}

// https://stackoverflow.com/questions/33839154/in-ethereum-solidity-what-is-the-purpose-of-the-memory-keyword