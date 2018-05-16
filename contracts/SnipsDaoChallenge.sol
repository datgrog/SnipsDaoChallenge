pragma solidity ^0.4.23;

contract SnipsDaoChallenge {
	uint constant dayInBlock = 5;
	uint constant weekInBlock = 7 * 5760;

	uint public endCandidateRegistrationBlock;
	uint public endVotingBlock;
  	
	address public candidate;

  	address public owner;
  	uint public last_completed_migration;

	// modifier onlyOwner {
	// 	require(
	// 		msg.sender == owner,
	// 		"Only owner can call this function."
	// 	);
	// 	_;
	// }

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
	event CandidateRegistrationStartSuccess(address candidate);

	constructor() public {
		/**
		* As Eth mainet generate new block each 15 sec in avg, 
		* we defined a day 5760 blocks. 
		*/
		endCandidateRegistrationBlock = block.number + dayInBlock;
		endVotingBlock = block.number + (2 * dayInBlock);

		emit CandidateRegistrationStart(endCandidateRegistrationBlock);
		
		owner = msg.sender;
	}

	function candidateRegistration() public onlyDuringRegistrationPeriod {
		// require(candidate == address(0));

        candidate = msg.sender;

        emit CandidateRegistrationStartSuccess(candidate);
	}

}

// https://ethereum.stackexchange.com/questions/2943/how-to-create-an-iterable-key-value-structure-in-solidity
// https://ethereum.stackexchange.com/questions/27259/how-can-you-share-a-struct-definition-between-contracts-in-separate-files
// http://solidity.readthedocs.io/en/latest/contracts.html#constant-state-variables
// http://solidity.readthedocs.io/en/latest/contracts.html#function-modifiers
// revert msg not showing in truffle yet https://medium.com/@blooomberglaw/you-probably-have-to-wrap-your-truffle-web3-js-bf1ffeb27ff3
// https://gist.github.com/fabdarice/a4a581df4098323e1e3b286141d78034