module.exports = { 
	mineBlock: function () {
  		return new Promise((resolve, reject) => {
				web3.currentProvider.sendAsync({
				jsonrpc: "2.0",
				method: "evm_mine",
				params: []
			}, (err, result) => {
				if(err){ return reject(err) }
				return resolve(result)
			});
		})
	},
	printVotingBlock: async function (web3, communityElector) {
	    const blockNumber = web3.eth.blockNumber;
	    const startVotingBlock = await communityElector.startVotingBlock.call();
	    const endVotingBlock = await communityElector.endVotingBlock.call();

	    console.log("currentBlock : " + blockNumber);
	    console.log("startVotingBlock : " + startVotingBlock.toNumber());
	    console.log("endVotingBlock : " + endVotingBlock.toNumber());
	},
	register2CandidateByCommunity: async function(communityCandidate, CommunityEnum, accounts) {
		await communityCandidate.registerCandidate("@aantonop", CommunityEnum.Bitcoin, {from: accounts[0]});
	  	await communityCandidate.registerCandidate("@jimmysong", CommunityEnum.Bitcoin, {from: accounts[4]});
	  	await communityCandidate.registerCandidate("@VitalikButerin", CommunityEnum.Ethereum, {from: accounts[1]});
	  	await communityCandidate.registerCandidate("@gavofyork", CommunityEnum.Ethereum, {from: accounts[5]});
	  	await communityCandidate.registerCandidate("@protocollabs", CommunityEnum.Filecoin, {from: accounts[2]});
	  	await communityCandidate.registerCandidate("@candidate7", CommunityEnum.Filecoin, {from: accounts[7]});
	  	await communityCandidate.registerCandidate("@janowitz", CommunityEnum.Monero, {from: accounts[6]});
	  	await communityCandidate.registerCandidate("@fluffypony", CommunityEnum.Monero, {from: accounts[3]});

	  	await communityCandidate.registerCandidate("@candidate8", CommunityEnum.Doge, {from: accounts[8]});
	  	await communityCandidate.registerCandidate("@candidate9", CommunityEnum.Doge, {from: accounts[9]});
	  	await communityCandidate.registerCandidate("@candidate10", CommunityEnum.Cardano, {from: accounts[10]});
	  	await communityCandidate.registerCandidate("@candidate11", CommunityEnum.Cardano, {from: accounts[11]});
	  	await communityCandidate.registerCandidate("@candidate12", CommunityEnum.NEO, {from: accounts[12]});
	  	await communityCandidate.registerCandidate("@candidate13", CommunityEnum.NEO, {from: accounts[13]});
	  	await communityCandidate.registerCandidate("@candidate14", CommunityEnum.Dash, {from: accounts[14]});
	  	await communityCandidate.registerCandidate("@candidate15", CommunityEnum.Dash, {from: accounts[15]});
	  	await communityCandidate.registerCandidate("@candidate16", CommunityEnum.Zcash, {from: accounts[16]});
	  	await communityCandidate.registerCandidate("@candidate17", CommunityEnum.Zcash, {from: accounts[17]});
	  	await communityCandidate.registerCandidate("@candidate18", CommunityEnum.Decred, {from: accounts[18]});
	  	await communityCandidate.registerCandidate("@candidate19", CommunityEnum.Decred, {from: accounts[19]});
	},
	electionVoteMockup: async function (communityElector, accounts) {
		// each named candidate votes for themself => 7 votes
	  	await communityElector.electorVotes(accounts[4], {from: accounts[4]});
	  	await communityElector.electorVotes(accounts[1], {from: accounts[1]});
	  	await communityElector.electorVotes(accounts[5], {from: accounts[5]});
	  	await communityElector.electorVotes(accounts[2], {from: accounts[2]});
	  	await communityElector.electorVotes(accounts[7], {from: accounts[7]});
	  	await communityElector.electorVotes(accounts[6], {from: accounts[6]});
	  	await communityElector.electorVotes(accounts[3], {from: accounts[3]});
	  	// one candidate for the remaining communities => 6 votes
	  	
	  	await communityElector.electorVotes(accounts[8], {from: accounts[8]});
	  	await communityElector.electorVotes(accounts[10], {from: accounts[10]});
	  	await communityElector.electorVotes(accounts[12], {from: accounts[12]});
	  	await communityElector.electorVotes(accounts[14], {from: accounts[14]});
	  	await communityElector.electorVotes(accounts[16], {from: accounts[16]});
	  	await communityElector.electorVotes(accounts[18], {from: accounts[18]});

	  	// so at this points the test of the election result 
	  	// would only matter about the first 4 communities

	  	// Bitcoin : 3 votes => andreas, 2 votes jimmy |= 5 votes
		await communityElector.electorVotes(accounts[0], {from: accounts[8]});
		await communityElector.electorVotes(accounts[0], {from: accounts[9]});
		await communityElector.electorVotes(accounts[0], {from: accounts[10]});
		await communityElector.electorVotes(accounts[4], {from: accounts[11]});
		await communityElector.electorVotes(accounts[4], {from: accounts[12]});

		// Ethereum : 4 votes Gavin, 2 Vitalik |= 6 votes
		await communityElector.electorVotes(accounts[5], {from: accounts[8]});
		await communityElector.electorVotes(accounts[5], {from: accounts[9]});
		await communityElector.electorVotes(accounts[5], {from: accounts[10]});
		await communityElector.electorVotes(accounts[5], {from: accounts[11]});
		await communityElector.electorVotes(accounts[1], {from: accounts[12]});
		await communityElector.electorVotes(accounts[1], {from: accounts[13]});

		// Filecoin : 3 votes => candidate7, 2 votes protocollabs |= 5 votes
		await communityElector.electorVotes(accounts[7], {from: accounts[8]});
		await communityElector.electorVotes(accounts[7], {from: accounts[9]});
		await communityElector.electorVotes(accounts[7], {from: accounts[10]});
		await communityElector.electorVotes(accounts[2], {from: accounts[11]});
		await communityElector.electorVotes(accounts[2], {from: accounts[12]});

		// Monero : 3 votes => fluffypony, 2 votes janowitz |= 5 votes
		await communityElector.electorVotes(accounts[3], {from: accounts[8]});
		await communityElector.electorVotes(accounts[3], {from: accounts[9]});
		await communityElector.electorVotes(accounts[3], {from: accounts[10]});
		await communityElector.electorVotes(accounts[6], {from: accounts[11]});
		await communityElector.electorVotes(accounts[6], {from: accounts[12]});

	}
};