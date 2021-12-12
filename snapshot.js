const { gql, GraphQLClient } = require('graphql-request');
const ethers = require('ethers');
const fs = require('fs');

const revaStakingPoolAbi = require('./RevaStakingPool.json');
const revaStakingPoolAddress = '0x8B7b2a115201ACd7F95d874D6A9432FcEB9C466A';
const blockNumber = 12948624;

const rpcEndpoint = 'https://speedy-nodes-nyc.moralis.io/0a0c712dcc0b75a2d155d4cf/bsc/mainnet/archive';
const endpoint = 'https://graphql.bitquery.io';

const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
        'X-API-KEY': 'BQYaiXNbZNNKcbNVWxhKbFNhhVqj9Z5e',
    },
});
const provider = new ethers.providers.StaticJsonRpcProvider(rpcEndpoint);

async function main() {
    const data = await graphQLClient.request(query);
    const transfers = data.ethereum.transfers;
    console.log(transfers[0]);
    console.log(transfers[1]);
    console.log(transfers[2]);
    const holders = transfers.map(t => t.receiver.address);
    console.log(holders.length);

    const revaStakingPoolContract = new ethers.Contract(revaStakingPoolAddress, revaStakingPoolAbi, provider);
    let snapshot = [];
    for (let i = 0; i < holders.length; i++) {
        console.log(i);
        const holder = holders[i];
        try {
            const balance1 = (await revaStakingPoolContract.userPoolInfo(1, holder, { blockTag: blockNumber }))[0];
            const balance2 = (await revaStakingPoolContract.userPoolInfo(2, holder, { blockTag: blockNumber }))[0];
            const balance3 = (await revaStakingPoolContract.userPoolInfo(3, holder, { blockTag: blockNumber }))[0];
            const balance = balance1.add(balance2.mul(2)).add(balance3.mul(3));
            snapshot.push({
                address: holder,
                balance: ethers.utils.formatEther(balance)
            });
        } catch(e) {
            fs.writeFileSync('./snapshot.json', JSON.stringify(snapshot, null, 4), 'utf-8');
            throw e;
        }
    }

    fs.writeFileSync('./snapshot.json', JSON.stringify(snapshot, null, 4), 'utf-8');
}

const query = gql`
  {
    ethereum(network: bsc) {
        transfers(
          currency: {is: "0x774D9103dc027b707812aCF0e0B40A34DcAeF658"}
          options: {}
        ) {
          receiver {
            address
          }
        }
      }
  }
`

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

