pragma solidity ^0.4.23;
import "./CommunityLib.sol";

contract CommunityCandidate {

	address constant candidateDeleted = address(0);
	
	address[] public candidatesIdx;
	mapping (address => CommunityLib.Candidate) public registeredCandidate;

	address public communityElectorAddr;

	modifier onlyOneRegistration {
		require(
			registeredCandidate[msg.sender].identity != msg.sender,
			"Candidate already register."
		);
		_;
	}

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

    /**
    * The logs that will be emitted in every step of the contract's life cycle.
    */
	event CandidateRegistered(address identity);
	event CandidateDeregistered(address identity);

    function setCommunityElectorAddr(address _ce) public onlyIfNotInit() {
    	communityElectorAddr = _ce;
    }

	function registerCandidate(bytes32 pseudo, CommunityLib.CommunityChoices community) public onlyOneRegistration {
		CommunityLib.Candidate memory candidate = CommunityLib.Candidate(pseudo, community, msg.sender, 0);

		/**
		* By using a mapping we ensure candidate could not register for more than one community.
		* We save candidate with a mapping and keep tracks of all entries indexes, 
		* by saving them within an array, allowing the contract to iterates over all candidates. 
		*/
		registeredCandidate[msg.sender] = candidate;
 		candidatesIdx.push(msg.sender);

        emit CandidateRegistered(candidate.identity);
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
    			candidatesIdx[i] = candidateDeleted;
    			break;
    		}
    	}

    	emit CandidateDeregistered(msg.sender);
	}

	function getCandidatesIdx() public view returns(address[]) {
		return candidatesIdx;
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

    function getCandidate(address candidateIdx) public view returns(bytes32, CommunityLib.CommunityChoices, address, uint) {
        return (
        	registeredCandidate[candidateIdx].pseudo, registeredCandidate[candidateIdx].community, 
        	registeredCandidate[candidateIdx].identity, registeredCandidate[candidateIdx].voteCount
        );
    }

    function electorVotes(address candidateIdx) public onlyCommunityElector {
    	registeredCandidate[candidateIdx].voteCount++;
    }

    function cleanCandidatesVoteCount() public onlyCommunityElector {
        address candidateIdx;

        for(uint i = 0; i < candidatesIdx.length; i++) {
            candidateIdx = candidatesIdx[i]; 
            if (candidateIdx != candidateDeleted) {
                delete registeredCandidate[candidateIdx].voteCount;
            }
        }
    }
 }

// https://medium.com/loom-network/ethereum-solidity-memory-vs-storage-how-to-initialize-an-array-inside-a-struct-184baf6aa2eb
// https://ethereum.stackexchange.com/questions/13201/if-everyone-runs-the-same-transaction-why-does-only-the-miner-get-gas?rq=
// https://ethereum.stackexchange.com/questions/31094/loop-optimisation-for-gas-usage
// two modifiers http://solidity.readthedocs.io/en/v0.2.1/common-patterns.html