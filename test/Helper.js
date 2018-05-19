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
	} 
};