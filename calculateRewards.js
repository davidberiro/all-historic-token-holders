const ethers = require('ethers');
const fs = require('fs');
const snapshot = require('./snapshot.json');
let shareholders = require('./shareholders.json');
shareholders = shareholders.map(a => a.toLowerCase());
const parseEther = ethers.utils.parseEther;
const formatEther = ethers.utils.formatEther;

const totalRewardAmount = '25000';

async function main() {
    console.log(`have snapshot of length ${snapshot.length}`);
    let holders = snapshot.filter(account => parseFloat(account.balance) > 0);
    console.log(`filtered out ${snapshot.length - holders.length}`);
    const prevLength = holders.length;
    holders = holders.filter(account => !shareholders.includes(account.address.toLowerCase()));
    console.log(`filtered out ${prevLength - holders.length}`);
    const totalWeight = holders.reduce((p, c) => p + parseFloat(c.balance), 0);
    console.log(`total weight: ${totalWeight}`);
    const snapshotRewards = holders.map(h => {
        const rewardAmount = parseEther(h.balance).mul(totalRewardAmount).div(String(parseInt(totalWeight)));
        return {
            address: h.address,
            rewardAmount: formatEther(rewardAmount)
        }
    });

    const totalRewards = snapshotRewards.reduce((p, c) => p + parseFloat(c.rewardAmount), 0);
    console.log(`total rewards recalculated: ${totalRewards}`);
    const orderedRewards = snapshotRewards.sort((a, b) => parseFloat(b.rewardAmount) - parseFloat(a.rewardAmount));

    fs.writeFileSync('./snapshot-rewards.json', JSON.stringify(orderedRewards, null, 4), 'utf-8');
}

async function create() {
    const csv = fs.readFileSync('./shareholders.csv', 'utf8');

    console.log(`\nloading shareholders from CSV file...`);
    const shareholders = [];
    for (let line of csv.split('\n')) {
      const [name, mainAddress, emergencyAddress, shares] = line.split(",");
      if (!name || name == "") {
        console.log(`WARNING: skipping empty line: (name='${name}')`);
        continue;
      }
      shareholders.push(mainAddress);
      shareholders.push(emergencyAddress);
    }
    fs.writeFileSync('./shareholders.json', JSON.stringify(shareholders, null, 4), 'utf-8');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });


