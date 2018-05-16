pragma solidity ^0.4.23;

contract Community {
	enum CommunityChoices { Bitcoin, Ethereum, Filecoin, Monero }

    struct Candidate {
        bytes32 pseudo;
        CommunityChoices community;
        address identity;
    }
}

// http://solidity.readthedocs.io/en/v0.4.23/types.html?highlight=view#enums