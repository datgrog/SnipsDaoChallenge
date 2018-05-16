pragma solidity ^0.4.23;
import "./Community.sol";

contract CandidateRegistration is Community {
	uint constant dayInBlock = 5;
	uint constant weekInBlock = 7 * 5760;

	uint public endCandidateRegistrationBlock;
	uint public endVotingBlock;

	Candidate public candidate;

	modifier onlyDuringRegistrationPeriod {
		require(
			block.number <= endCandidateRegistrationBlock,
			"Registration Period has expired."
		);
		_;
	}

    /**
    * The logs that will be emitted in every step of the contract's life cycle
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

	function candidateRegistration(bytes32 pseudo, CommunityChoices community) public onlyDuringRegistrationPeriod {
		// require(candidate == address(0));
		candidate = Candidate(pseudo, community, msg.sender);

        emit CandidateRegistrationSuccess(candidate.pseudo, candidate.community, candidate.identity);
	}
}