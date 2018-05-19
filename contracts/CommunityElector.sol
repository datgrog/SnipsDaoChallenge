pragma solidity ^0.4.23;
import "./CommunityLib.sol";

contract CommunityRepresentative {
    function electorVotes(address) public { }
	function getCandidate(address) public pure returns(bytes32, CommunityLib.CommunityChoices, address, uint) {}
    function getCandidatesCount() public pure returns(uint) { }
}

contract CommunityElector {
	/**
	* As Eth mainet generate new block each 15 sec in avg, 
	* we defined a day 5760 blocks. 
	* We use 10 in dev env
	*/
	uint constant dayInBlock = 10;
	// uint constant dayInBlock = 5760;

	CommunityRepresentative cr;

	mapping (address => bool[4]) public electorsCommunityVote;

	// Election state
	CommunityLib.Election public electionState;

	modifier onlyAfterStartVotingBlock {
		require(
			block.number >= electionState.startVotingBlock,
			"Voting is still ongoing or already close."
		);
		_;
	}

	constructor(address _cr) public {
		cr = CommunityRepresentative(_cr);

		// Initiate election state, first election occures next day.
		uint startVotingBlock = block.number + dayInBlock;
		uint endVotingBlock = startVotingBlock + dayInBlock;
		electionState = CommunityLib.Election(0, false, startVotingBlock, endVotingBlock);
	}

	function electorVotes(address candidateIdx) public onlyAfterStartVotingBlock {
		// the first vote during the voting period update electionState
		if ((block.number <= electionState.endVotingBlock) && (!electionState.isOpen)) {
			electionState.isOpen = true;
			electionState.id++;
			// emit event VotingPeriod id, true
		}

		// Fetch community related to candidateIdx
	 	bytes32 pseudo; 
	 	CommunityLib.CommunityChoices community; 
	 	address identity; 
	 	uint voteCount;

		(pseudo, community, identity, voteCount) = this.getCandidate(candidateIdx);
         
		// Compare it against electorsCommunityVote to see
		// if current elector has already vote for a this specific community
		require(
			false == electorsCommunityVote[msg.sender][uint(community)],
			"Current elector has already vote for a given community."
		);
		electorsCommunityVote[msg.sender][uint(community)] = true;
		cr.electorVotes(candidateIdx);

		// the last vote during the voting period update electionState
		if ((block.number >= electionState.endVotingBlock) && (electionState.isOpen)) {
			// emit event VotingPeriod id, false
			electionState.isOpen = false;
			electionState.id++;
			electionState.startVotingBlock = block.number + (6 * dayInBlock);
			electionState.endVotingBlock = electionState.startVotingBlock + dayInBlock;
		}
	}

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
// https://ethereum.stackexchange.com/questions/1701/what-does-the-keyword-memory-do-exactly
// https://ethereum.stackexchange.com/questions/15166/difference-between-require-and-assert-and-the-difference-between-revert-and-thro