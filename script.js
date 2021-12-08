const { gql, GraphQLClient } = require('graphql-request');
const fs = require('fs');

const endpoint = 'https://graphql.bitquery.io';
const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      'X-API-KEY': 'BQYaiXNbZNNKcbNVWxhKbFNhhVqj9Z5e',
    },
  });

async function main() {
    const data = await graphQLClient.request(query);
    const transfers = data.ethereum.transfers;
    console.log(transfers[0]);
    console.log(transfers[1]);
    console.log(transfers[2]);
    const holders = transfers.map(t => t.receiver.address);
    console.log(holders.length);
    fs.writeFileSync('./holders.json', JSON.stringify(holders, null, 4), 'utf-8');
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
