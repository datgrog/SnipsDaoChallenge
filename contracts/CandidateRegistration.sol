pragma solidity ^0.4.23;
import "./Community.sol";

contract CandidateRegistration is Community {
	uint constant candidateDeleted = 999999999;
	uint constant dayInBlock = 5;
	uint constant weekInBlock = 7 * 5760;

	uint public endCandidateRegistrationBlock;
	uint public endVotingBlock;

	uint[] public candidatesIdx;
	mapping (uint => Candidate) public registeredCandidate;

	modifier onlyDuringRegistrationPeriod {
		require(
			block.number <= endCandidateRegistrationBlock,
			"Registration Period has expired."
		);
		_;
	}

    /**
    * The logs that will be emitted in every step of the contract's life cycle.
    */
	event CandidateRegistrationStart(uint endCandidateRegistrationBlock);
	event CandidateRegistrationSuccess(bytes32 pseudo, CommunityChoices community, address identity);

	constructor() public {
		/**
		* As Eth mainet generate new block each 15 sec in avg, 
		* we defined a day 5760 blocks. 
		*/
		endCandidateRegistrationBlock = block.number + dayInBlock;
		endVotingBlock = block.number + (2 * dayInBlock);

		emit CandidateRegistrationStart(endCandidateRegistrationBlock);
	}

	function registerCandidate(bytes32 pseudo, CommunityChoices community) public onlyDuringRegistrationPeriod {
		// require(candidate == address(0));
		Candidate memory candidate = Candidate(pseudo, community, msg.sender);

		/**
		* We save candidate with a mapping and keep tracks of all entries indexes, 
		* by saving them within an array, allowing the contract to iterates over all candidates. 
		*/
		registeredCandidate[candidatesIdx.length] = candidate;
 		candidatesIdx.push(candidatesIdx.length);

        // emit CandidateRegistrationSuccess(candidate.pseudo, candidate.community, candidate.identity);
	}

	function deregisterCandidate() public {
		// TODO modifier to ensure the candidate is not the current representative of any communities!
	    for(uint i = 0; i<candidatesIdx.length; i++){
        	if (candidatesIdx[i] != candidateDeleted) {
        		if (registeredCandidate[candidatesIdx[i]].identity == msg.sender) {
        			// we find the index related to the sender's candidate who want to deregister,
        			// we do so by assigning this constant value
        			candidatesIdx[i] = candidateDeleted;
        			break;
        		}
        	}
    	}
	}

    function getCandidatesCount() public view returns(uint) {
	    uint candidatesCount = 0;
	    
	    // each candidatesIdx's value equals to candidateDeleted means that the candidate is not one anymore.
	    for(uint i = 0; i<candidatesIdx.length; i++){
        	if (candidatesIdx[i] != candidateDeleted) {
        		candidatesCount++;
        	}
    	}
        
        return candidatesCount;
    }

    function getCandidate(uint index) public view returns(bytes32, CommunityChoices, address) {
        return (registeredCandidate[index].pseudo, registeredCandidate[index].community, registeredCandidate[index].identity);
    }
}

// https://medium.com/loom-network/ethereum-solidity-memory-vs-storage-how-to-initialize-an-array-inside-a-struct-184baf6aa2eb
// https://ethereum.stackexchange.com/questions/13201/if-everyone-runs-the-same-transaction-why-does-only-the-miner-get-gas?rq=
// https://ethereum.stackexchange.com/questions/31094/loop-optimisation-for-gas-usage