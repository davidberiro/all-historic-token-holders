const { gql, GraphQLClient } = require('graphql-request');
const ethers = require('ethers');
const fs = require('fs');

const bep20Abi = require('./IBEP20.json');
const tokenAddress = '0x774D9103dc027b707812aCF0e0B40A34DcAeF658';
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

    const tokenContract = new ethers.Contract(tokenAddress, bep20Abi, provider);
    let balances = [];
    for (let i = 0; i < holders.length; i++) {
        console.log(i);
        const holder = holders[i];
        const balance = await tokenContract.balanceOf(holder, { blockTag: blockNumber });
        balances.push({
            address: holder,
            balance: ethers.utils.formatEther(balance)
        });
    }

    fs.writeFileSync('./holders.json', JSON.stringify(holders, null, 4), 'utf-8');
    fs.writeFileSync('./balances.json', JSON.stringify(balances, null, 4), 'utf-8');
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
