const ethers = require('ethers');

const snapshotRewards = require("./snapshot-rewards.json");
const multisendAbi = require("./MultiSend.json");
const fs = require('fs');

const rpcEndpoint = 'https://speedy-nodes-nyc.moralis.io/0a0c712dcc0b75a2d155d4cf/bsc/mainnet/archive';
const provider = new ethers.providers.StaticJsonRpcProvider(rpcEndpoint);

const multisendAddress = "0x7bcC6eEE4e6a68f4342C7D64b9aFb8e8e0dC5A6d";
const tokenAddress = "0x4FdD92Bd67Acf0676bfc45ab7168b3996F7B4A3B";
const rewardsBatchSize = 350;

async function main() {
    //const totalAmount = tokenRecipients.amounts.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
    //console.log(`generating tx to send ${totalAmount} token ${tokenRecipients.tokenAddress}`);
    const multisendContract = new ethers.Contract(multisendAddress, multisendAbi, provider);

    const rewardBatches = (splitRewards(snapshotRewards, rewardsBatchSize)).reverse();

    let payloads = [];
    for (let i = 0; i < rewardBatches.length; i++) {
        const batch = rewardBatches[i];
        const addresses = batch.map(user => user.address);
        const amounts = batch.map(user => ethers.utils.parseEther(user.rewardAmount));
        const tx = await multisendContract.populateTransaction.multisendToken(
            tokenAddress,
            addresses,
            amounts
        );
        const gas = await multisendContract.estimateGas.multisendToken(
            tokenAddress,
            addresses,
            amounts,
            { from: "0x636bf0Bd0986a1C96998f26F34b9076e113d9d48" }
        );
        console.log(gas.toString());
        //payloads.push({ batch, data: tx.data });
        payloads.push({ batchNum: i, data: tx.data });
    }

    fs.writeFileSync('./payloads.json', JSON.stringify(payloads, null, 4), 'utf-8');
}

function splitRewards(rewardsArray, size) {
    const res = [];
    for (let i = 0; i < rewardsArray.length; i += size) {
        res.push(rewardsArray.slice(i, i + size));
    }
    return res;
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
