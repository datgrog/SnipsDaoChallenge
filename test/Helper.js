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
	register9Candidates: async function(communityCandidate, accounts) {
		await communityCandidate.registerCandidate("@candidate0", {from: accounts[0]});
	  	await communityCandidate.registerCandidate("@candidate1", {from: accounts[1]});
	  	await communityCandidate.registerCandidate("@candidate2", {from: accounts[2]});
	  	await communityCandidate.registerCandidate("@candidate3", {from: accounts[3]});
	  	await communityCandidate.registerCandidate("@candidate4", {from: accounts[4]});
	  	await communityCandidate.registerCandidate("@candidate5", {from: accounts[5]});
	  	await communityCandidate.registerCandidate("@candidate6", {from: accounts[6]});
	  	await communityCandidate.registerCandidate("@candidate7", {from: accounts[7]});
	  	await communityCandidate.registerCandidate("@candidate8", {from: accounts[8]});

	  	// await communityCandidate.registerCandidate("@candidate9", {from: accounts[9]});
	  	// await communityCandidate.registerCandidate("@candidate10", {from: accounts[10]});
	  	// await communityCandidate.registerCandidate("@candidate11", {from: accounts[11]});
	  	// await communityCandidate.registerCandidate("@candidate12", {from: accounts[12]});
	  	// await communityCandidate.registerCandidate("@candidate13", {from: accounts[13]});
	  	// await communityCandidate.registerCandidate("@candidate14", {from: accounts[14]});
	  	// await communityCandidate.registerCandidate("@candidate15", {from: accounts[15]});
	  	// await communityCandidate.registerCandidate("@candidate16", {from: accounts[16]});
	  	// await communityCandidate.registerCandidate("@candidate17", {from: accounts[17]});
	  	// await communityCandidate.registerCandidate("@candidate18", {from: accounts[18]});
	  	// await communityCandidate.registerCandidate("@candidate19", {from: accounts[19]});
	},
	electionVoteMockup: async function (communityElector, accounts) {
		// each candidate vote for themself => 9 votes
	  	await communityElector.electorVote(accounts[0], {from: accounts[0]});
	  	await communityElector.electorVote(accounts[1], {from: accounts[1]});
	  	await communityElector.electorVote(accounts[2], {from: accounts[2]});
	  	await communityElector.electorVote(accounts[3], {from: accounts[3]});
	  	await communityElector.electorVote(accounts[4], {from: accounts[4]});
	  	await communityElector.electorVote(accounts[5], {from: accounts[5]});
	  	await communityElector.electorVote(accounts[6], {from: accounts[6]});
	  	await communityElector.electorVote(accounts[7], {from: accounts[7]});
	  	await communityElector.electorVote(accounts[8], {from: accounts[8]});
	  	
	  	// elector votes => 11 votes
	  	await communityElector.electorVote(accounts[0], {from: accounts[9]});
	  	await communityElector.electorVote(accounts[0], {from: accounts[10]});
	  	await communityElector.electorVote(accounts[0], {from: accounts[11]});
	  	await communityElector.electorVote(accounts[1], {from: accounts[12]});
	  	await communityElector.electorVote(accounts[1], {from: accounts[13]});
	  	await communityElector.electorVote(accounts[1], {from: accounts[14]});
	  	await communityElector.electorVote(accounts[1], {from: accounts[15]});
	  	await communityElector.electorVote(accounts[4], {from: accounts[16]});
	  	await communityElector.electorVote(accounts[5], {from: accounts[17]});
	  	await communityElector.electorVote(accounts[6], {from: accounts[18]});
	  	await communityElector.electorVote(accounts[8], {from: accounts[19]});

	}
};