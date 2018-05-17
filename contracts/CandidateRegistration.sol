pragma solidity ^0.4.23;
import "./Community.sol";

contract CandidateRegistration is Community {
	address constant candidateDeleted = address(0);
	uint constant dayInBlock = 5;
	uint constant weekInBlock = 7 * 5760;

	uint public endCandidateRegistrationBlock;
	uint public endVotingBlock;

	address[] public candidatesIdx;
	mapping (address => Candidate) public registeredCandidate;

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
		* By using a mapping we ensure candidate could not register for more than one community.
		* We save candidate with a mapping and keep tracks of all entries indexes, 
		* by saving them within an array, allowing the contract to iterates over all candidates. 
		*/
		registeredCandidate[msg.sender] = candidate;
 		candidatesIdx.push(msg.sender);

        // emit CandidateRegistrationSuccess(candidate.pseudo, candidate.community, candidate.identity);
	}

	function deregisterCandidate() public {
		// TODO modifier to ensure the candidate is not the current representative of any communities!
	    for(uint i = 0; i<candidatesIdx.length; i++) {
    		if (candidatesIdx[i] == msg.sender) {
    			/**
    			* Find the index related to the sender who want to deregister.
    			* If the sender is a candidate it would deregister if not it would do nothing but paying gas.
    			* Deregister means we reset candidatesIdx[x] by candidateDeleted constant value.
    			* The mapping's value related to the eth@ is not cleared as it does not affect app behavior.
    			*/
    			// BUG ? It also reset the related value within the mapping, which in fact is proper.
    			// => probably pointer behaviour
    			candidatesIdx[i] = candidateDeleted;
    			break;
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
    	address candidateIdx = candidatesIdx[index];
        return (registeredCandidate[candidateIdx].pseudo, registeredCandidate[candidateIdx].community, registeredCandidate[candidateIdx].identity);
    }
}

// https://medium.com/loom-network/ethereum-solidity-memory-vs-storage-how-to-initialize-an-array-inside-a-struct-184baf6aa2eb
// https://ethereum.stackexchange.com/questions/13201/if-everyone-runs-the-same-transaction-why-does-only-the-miner-get-gas?rq=
// https://ethereum.stackexchange.com/questions/31094/loop-optimisation-for-gas-usage