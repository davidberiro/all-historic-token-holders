const fs = require('fs');
const snapshot = require('./snapshot.json');

const totalRewardAmount = 25000;

async function main() {
    console.log(`have snapshot of length ${snapshot.length}`);
    const holders = snapshot.filter(account => parseFloat(account.balance) > 0);
    console.log(`filtered out ${snapshot.length - holders.length}`);
    const totalWeight = holders.reduce((p, c) => p + parseFloat(c.balance), 0);
    console.log(`total weight: ${totalWeight}`);
    const snapshotRewards = holders.map(h => {
        const rewardAmount = (parseFloat(h.balance) * totalRewardAmount / totalWeight);
        return {
            address: h.address,
            rewardAmount: String(rewardAmount)
        }
    });

    const totalRewards = snapshotRewards.reduce((p, c) => p + parseFloat(c.rewardAmount), 0);
    console.log(`total rewards recalculated: ${totalRewards}`);

    fs.writeFileSync('./snapshot-rewards.json', JSON.stringify(snapshotRewards, null, 4), 'utf-8');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });


