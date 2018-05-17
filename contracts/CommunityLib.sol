pragma solidity ^0.4.23;

library CommunityLib {
	enum CommunityChoices { Bitcoin, Ethereum, Filecoin, Monero }

    struct Candidate {
        bytes32 pseudo;
        CommunityChoices community;
        address identity;
        uint voteCount;
    }
}

// http://solidity.readthedocs.io/en/v0.4.23/types.html?highlight=view#enums
// https://ethereum.stackexchange.com/questions/11556/use-string-type-or-bytes32
// https://ethereum.stackexchange.com/questions/31667/how-to-test-a-contract-that-uses-a-library-in-truffle