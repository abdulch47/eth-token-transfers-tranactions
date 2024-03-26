const { Web3 } = require('web3'); // Import Web3 as a default import
const { abi } = require('./abi2.json');
const { ethers } = require('ethers');

const tokenaddress = "0x776820f1a6adbED4B790EA58a01Af2d5F7E02967";
// SEPOLIA-USDT 0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0
// ETH-USDC: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
// ARB-USDT TOKEN : 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9
// ETH USDT : 0xdAC17F958D2ee523a2206206994597C13D831ec7

const RPC = ""; //enter your websocket url
const web3 = new Web3(RPC);
const contractInstance = new web3.eth.Contract(abi, tokenaddress);
const addresses = ['0x9fc1aA5157Ee24801a6e27A09784170eB12C502d'];
let addedHashes = [];

async function getTransactionsByAddress(address) {
    let endBlockNumber = await web3.eth.getBlockNumber();
    let startBlockNumber = Number(endBlockNumber) - 10000;
    console.log("Starting event subscription...");
    console.log("Event filter:", { from: address });
    const eventFilter = {
        filter: { to: address },
        fromBlock: startBlockNumber
    };

    const event = contractInstance.events.Transfer(eventFilter);
        event.on('data', async function (tx) {
            console.log("hash",tx)

            if (addedHashes.includes(tx.transactionHash)) {
                console.log("Transaction Already Added");
            } else {
                addedHashes.push(tx.transactionHash);
                const receipts = await web3.eth.getTransaction(tx.transactionHash);
                const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);
                const block = await web3.eth.getBlock(tx.blockNumber);
                const transactions = {
                    blockNumber: tx.blockNumber,
                    hash: tx.transactionHash,
                    from_address: tx.returnValues.from,
                    contractAddress: tx.address,
                    to_address: tx.returnValues.to,
                    value: ethers.utils.formatUnits(tx.returnValues.value, 6),
                    tokenName: 'Tether USD',
                    tokenSymbol: 'USDT',
                    tokenDecimal: '6',
                    transactionIndex: tx.transactionIndex,
                    gas: receipts.gas,
                    gasPrice: receipts.gasPrice,
                    gasUsed: receipt.gasUsed,
                    cumulativeGasUsed: receipt.cumulativeGasUsed,
                    input: receipts.input,
                    confirmations: Number(tx.blockNumber) + 24,
                    nonce: receipts.nonce,
                    timestamp: block.timestamp
                };
                console.log('Transaction:', transactions);
            }

        });
        event.on('error',  function (error) {
            console.error('Error in event listener:', error);
        });
}



for (let i = 0; i < addresses.length; i++) {
    getTransactionsByAddress(addresses[i]);
}
