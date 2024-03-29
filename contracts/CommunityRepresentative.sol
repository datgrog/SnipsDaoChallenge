pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;

import "./Array256Lib.sol";
import "./CommunityLib.sol";

// CommunityCandidate interface / ABI
contract CommunityCandidateInterface {
    function getCandidatesCount() public pure returns(uint) {}
	function getCandidatesIdx() public pure returns(address[]) {}
	function getCandidate(address) public pure returns(CommunityLib.Candidate) {}
}

contract CommunityRepresentative {
    using Array256Lib for uint256[];
    uint256[] voteCountAsId;

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

    function getvoteCountAsId() public view returns(uint256[]) {
        return voteCountAsId;
    }

	function electAllRepresentative() public onlyCommunityElector {        
        CommunityLib.Candidate memory candidateTmp;

        uint candidatesCount = communityCandidate.getCandidatesCount();
		address[] memory candidatesIdx = communityCandidate.getCandidatesIdx();

        if (candidatesCount <= 10) {
            uint currentRepresentativeIdx = 0;
            // each candidatesIdx's value equals to candidateDeleted means that the candidate is not one anymore.
            for(uint i = 0; i < candidatesIdx.length; i++) {
                if (candidatesIdx[i] != candidateDeleted) {
                    candidateTmp = communityCandidate.getCandidate(candidatesIdx[i]);
                    representatives[currentRepresentativeIdx] = candidateTmp.identity;
                    currentRepresentativeIdx++;
                }
            }
        } 
        else {
            CommunityLib.Representative[] memory adapterCandidateVoteCount = new CommunityLib.Representative[](candidatesCount);
            voteCountAsId = new uint256[](candidatesCount);

            for(uint j = 0; j < candidatesIdx.length; j++) {
                if (candidatesIdx[j] != candidateDeleted) {
                    candidateTmp = communityCandidate.getCandidate(candidatesIdx[j]);

                    adapterCandidateVoteCount[j] = CommunityLib.Representative(candidateTmp.identity, candidateTmp.voteCount);
                    voteCountAsId[j] = candidateTmp.voteCount;
                }
            }

            voteCountAsId.heapSort();

            // As the library could not sort a struct array given a specific key as an uint
            // then we had to find the identity given related to a vote which is not consistent.
            uint representativesIdx;
            for(uint voteIdx = voteCountAsId.length - 1; voteIdx >= voteCountAsId.length - 10; voteIdx--) {
                for(uint adapterCandidateVoteCountIdx = 0; adapterCandidateVoteCountIdx < adapterCandidateVoteCount.length; adapterCandidateVoteCountIdx++) {
                    if (voteCountAsId[voteIdx] == adapterCandidateVoteCount[adapterCandidateVoteCountIdx].voteCount && voteCountAsId[voteIdx] != 0) {
                        representativesIdx = voteIdx - voteCountAsId.length + 10;
                        representatives[representativesIdx] = adapterCandidateVoteCount[adapterCandidateVoteCountIdx].identity;
                        delete adapterCandidateVoteCount[adapterCandidateVoteCountIdx].voteCount;
                        break;
                    }
                }
            }
        }
	}
}

// https://ethereum.stackexchange.com/questions/1517/sorting-an-array-of-integer-with-ethereum/20996#20996
// https://stackoverflow.com/questions/33839154/in-ethereum-solidity-what-is-the-purpose-of-the-memory-keyword