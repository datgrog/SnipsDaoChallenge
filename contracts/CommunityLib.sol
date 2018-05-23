pragma solidity ^0.4.23;

library CommunityLib {
    enum CommunityChoices { Bitcoin, Ethereum, Filecoin, Monero, Doge, Cardano, NEO, Dash, Zcash, Decred }

    struct Candidate {
        bytes32 pseudo;
        CommunityChoices community;
        address identity;
        uint voteCount;
    }

    struct Representative {
        address identity;
        uint voteCount;
    }
}

// http://solidity.readthedocs.io/en/v0.4.23/types.html?highlight=view#enums
// https://ethereum.stackexchange.com/questions/11556/use-string-type-or-bytes32
// https://ethereum.stackexchange.com/questions/31667/how-to-test-a-contract-that-uses-a-library-in-truffle

// we cant move constant to a lib
// https://www.reddit.com/r/ethdev/comments/72nos0/accessing_a_library_constant_from_a_contract/??????