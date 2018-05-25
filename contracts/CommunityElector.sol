pragma solidity ^0.4.23;
import "./CommunityLib.sol";

// CommunityCandidate interface / ABI
contract CommunityCandidateInterface {
    function electorVote(address) public pure {}
    function cleanCandidatesVoteCount() public pure {}
	function getCandidate(address) public pure returns(bytes32, address, uint) {}
}

// CommunityRepresentative interface / ABI
contract CommunityRepresentativeInterface {
	function electAllRepresentative() pure public {}
}

contract CommunityElector {
	/**
	* As Eth mainet generate new block each 15 sec in avg, 
	* we defined a day 5760 blocks. 
	* We use 40 in dev env.
	*/
	// DEV
	uint constant dayInBlock = 40;
	// PROD
	// uint constant dayInBlock = 5760;

	CommunityCandidateInterface communityCandidate;
	CommunityRepresentativeInterface communityRepresentative;

	address[] public electorsIdx;
	mapping (address => bool) electorsFirewallVote;

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

	modifier openElectionState {
		// The first vote during the voting period update isElectionOpen.
		if (block.number < endVotingBlock && !isElectionOpen) {
			isElectionOpen = true;

			emit ElectionState(true);
			cleanElectionState();
		}
		_;
	}

	modifier closeElectionState {
		_;
		// The last vote during the voting period update isElectionOpen.
		if (block.number >= endVotingBlock && isElectionOpen) {
			// DEV
			startVotingBlock = block.number + dayInBlock;
			// PROD
			// startVotingBlock = block.number + (6 * dayInBlock);
			endVotingBlock = startVotingBlock + dayInBlock;
			isElectionOpen = false;

			emit ElectionState(false);
			electAllRepresentative();
		}
	}
    
	event ElectionState(bool state);

	constructor(address _cc, address _cr) public {
		communityCandidate = CommunityCandidateInterface(_cc);
		communityRepresentative = CommunityRepresentativeInterface(_cr);

		// Initiate election state, first election occures next day.
		isElectionOpen = false;
		startVotingBlock = block.number + dayInBlock;
		endVotingBlock = startVotingBlock + dayInBlock;
	}

	function electorVote(address candidateIdx) public onlyAfterStartVotingBlock openElectionState closeElectionState {
		// Fetch community info related to candidateIdx
	 	bytes32 pseudo; 
	 	address identity; 
	 	uint voteCount;

		(pseudo, identity, voteCount) = this.getCandidate(candidateIdx);
         
		// Compare it against electorsFirewallVote to see
		// if current elector has already vote for a this specific community.
		require(
			false == electorsFirewallVote[msg.sender],
			"Current elector has already vote for a given community."
		);

		// Update that current msg.sender has voted given a specific community
		// and fire the vote.
		electorsFirewallVote[msg.sender] = true;
		electorsIdx.push(msg.sender);

		communityCandidate.electorVote(candidateIdx);
	}

	// Why view works ?
	function electAllRepresentative() view private {
		communityRepresentative.electAllRepresentative();
	}

	function cleanElectionState() private {
		// Clean each candidate voteCount.
		communityCandidate.cleanCandidatesVoteCount();

		// Clean each electorsFirewallVote.
		address electorIdx;

	    for(uint i = 0; i < electorsIdx.length; i++) {
	    	electorIdx = electorsIdx[i]; 
        	delete electorsFirewallVote[electorIdx];	
    	}
	}

	function getCandidate(address candidateIdx) public view returns(bytes32, address, uint) {
		return communityCandidate.getCandidate(candidateIdx);
	}

    function getElectorFirewallVote(address electorIdx) public view returns(bool) {
    	return electorsFirewallVote[electorIdx];
    }
}

// https://medium.com/@blockchain101/calling-the-function-of-another-contract-in-solidity-f9edfa921f4c
// https://vessenes.com/tx-origin-and-ethereum-oh-my/
// https://stackoverflow.com/questions/46104721/solidity-set-value-to-state-variables-the-value-not-changed
// https://ethereum.stackexchange.com/questions/3609/returning-a-struct-and-reading-via-web3/3614#3614
// https://ethereum.stackexchange.com/questions/1701/what-does-the-keyword-memory-do-exactly
// https://ethereum.stackexchange.com/questions/15166/difference-between-require-and-assert-and-the-difference-between-revert-and-thro
// https://ethereum.stackexchange.com/questions/32353/what-is-the-difference-between-an-internal-external-and-public-private-function?rq=1