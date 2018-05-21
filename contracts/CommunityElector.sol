pragma solidity ^0.4.23;
import "./CommunityLib.sol";

// CommunityCandidate interface / ABI
contract CommunityCandidateInterface {
    function electorVotes(address) public {}
	function getCandidate(address) public pure returns(bytes32, CommunityLib.CommunityChoices, address, uint) {}
    function getCandidatesCount() public pure returns(uint) {}
}

// CommunityRepresentative interface / ABI
contract CommunityRepresentativeInterface {
	function electAllRepresentative() public {}
}

contract CommunityElector {
	/**
	* As Eth mainet generate new block each 15 sec in avg, 
	* we defined a day 5760 blocks. 
	* We use 30 in dev env.
	*/
	uint constant dayInBlock = 30;
	// uint constant dayInBlock = 5760;

	CommunityCandidateInterface communityCandidate;
	CommunityRepresentativeInterface communityRepresentative;

	mapping (address => bool[4]) public electorsCommunityVote;

	// Election state
	bool public isElectionOpen;
    uint public startVotingBlock;
    uint public endVotingBlock;

	modifier onlyAfterStartVotingBlock {
		require(
			block.number >= startVotingBlock,
			"Election has not yet beein opened."
		);
		_;
	}

	modifier updateElectionState {
		// The first vote during the voting period update isElectionOpen.
		if (block.number < endVotingBlock && !isElectionOpen) {
			isElectionOpen = true;

			emit ElectionState(true);
		}

		// The last vote during the voting period update isElectionOpen.
		if (block.number >= endVotingBlock && isElectionOpen) {
			startVotingBlock = block.number + (6 * dayInBlock);
			endVotingBlock = startVotingBlock + dayInBlock;

			emit ElectionState(false);
		}
		_;
	}
    
    /**
    * The logs that will be emitted in every step of the contract's life cycle.
    */
	event ElectionState(bool state);

	constructor(address _cc, address _cr) public {
		communityCandidate = CommunityCandidateInterface(_cc);
		communityRepresentative = CommunityRepresentativeInterface(_cr);

		// Initiate election state, first election occures next day.
		isElectionOpen = false;
		startVotingBlock = block.number + dayInBlock;
		endVotingBlock = startVotingBlock + dayInBlock;
	}

	function electorVotes(address candidateIdx) public onlyAfterStartVotingBlock updateElectionState {
		// Fetch community info related to candidateIdx
	 	bytes32 pseudo; 
	 	CommunityLib.CommunityChoices community; 
	 	address identity; 
	 	uint voteCount;

		(pseudo, community, identity, voteCount) = this.getCandidate(candidateIdx);
         
		// Compare it against electorsCommunityVote to see
		// if current elector has already vote for a this specific community.
		require(
			false == electorsCommunityVote[msg.sender][uint(community)],
			"Current elector has already vote for a given community."
		);

		// Update that current msg.sender has voted given a specific community
		// and fire the vote.
		electorsCommunityVote[msg.sender][uint(community)] = true;
		communityCandidate.electorVotes(candidateIdx);

		// if isElectionOpen is false then we could trigger CommunityRepresentative
	}

	function electAllRepresentative() public {
		communityRepresentative.electAllRepresentative();
	}

	function getCandidate(address candidateIdx) public view returns(bytes32, CommunityLib.CommunityChoices, address, uint) {
		return communityCandidate.getCandidate(candidateIdx);
	}

    function getCandidatesCount() public view returns (uint) {
        return communityCandidate.getCandidatesCount();
    }
}

// https://medium.com/@blockchain101/calling-the-function-of-another-contract-in-solidity-f9edfa921f4c
// https://vessenes.com/tx-origin-and-ethereum-oh-my/
// https://stackoverflow.com/questions/46104721/solidity-set-value-to-state-variables-the-value-not-changed
// https://ethereum.stackexchange.com/questions/3609/returning-a-struct-and-reading-via-web3/3614#3614
// https://ethereum.stackexchange.com/questions/1701/what-does-the-keyword-memory-do-exactly
// https://ethereum.stackexchange.com/questions/15166/difference-between-require-and-assert-and-the-difference-between-revert-and-thro