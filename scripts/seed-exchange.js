//contracts
const Token = artifacts.require("Token")
const Exchange = artifacts.require("Exchange")

//utils
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'

const ether = (n) => {
    return new web3.utils.BN(
        web3.utils.toWei(n.toString(), 'ether')
    )
}

const tokens = (n) => ether(n)

const wait = (seconds) => {
    const miliseconds = seconds * 1000
    return new Promise(resolve => setTimeout(resolve, miliseconds))
}


module.exports = async function(callback) {

    try {
        //fetch account from the wallet
        const accounts = await web3.eth.getAccounts();

        //fetch deployed token 
        const token = await Token.deployed();
        console.log('Token Fetched ', token.address)

        //fetch deployed exchange 
        const exchange = await Exchange.deployed();
        console.log('Exchange Fetched', exchange.address)

        //Give tokens to account[1]
        const sender = accounts[0];
        const receiver = accounts[1];
        let amount = web3.utils.toWei('10000', 'ether') //10k tokens

        await token.transfer(receiver, amount, { from: sender });
        console.log(`Transferred ${amount} tokens from ${sender} to ${receiver} `);

        //setting user for the exchange
        const user1 = accounts[0];
        const user2 = accounts[1];

        //User Deposit Ether
        amount = 1;
        await exchange.depositEther({ from: user1, value: ether(amount) });
        console.log(`Deposited ${amount} Ether from ${user1}`)

        //User 2 approves the Tokens
        amount = 1000;
        await token.approve(exchange.address, tokens(amount), { from: user2 })
        console.log(`Approves ${amount} tokens from ${user2}`)

        //User 2 Deposit Token
        await exchange.depositToken(token.address, tokens(amount), { from: user2 })
        console.log(`Deposited ${amount} token from ${user1}`)

        ////////////////Cancel Orders/////////////////

        //User 1 makes an order to purchase tokens
        let result;
        let orderId;
        result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, ether(0.1), { from: user1 })
        console.log(`Make order from ${user1}`)

        //User 1 cancells the order
        orderId = result.logs[0].args.id;
        await exchange.cancelOrder(orderId, { from: user1 })
        console.log(`Cancelled order from ${ user1 }`)


        //////////////Fill order/////////////////////

        //User 1 makes an Order
        result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, ether(0.1), { from: user1 })
        console.log(`Make order from ${user1}`)

        //User 2 fills order
        orderId = result.logs[0].args.id
        await exchange.fillOrder(orderId, { from: user2 })
        console.log(`Filled order from ${user1}`)

        //Wait 1 second
        await wait(1)

        //User 1 makes another order
        result = await exchange.makeOrder(token.address, tokens(50), ETHER_ADDRESS, ether(0.01), { from: user1 })
        console.log(`Made order from ${user1}`)

        //User 2 fills the order
        orderId = result.logs[0].args.id
        await exchange.fillOrder(orderId, { from: user2 })
        console.log(`Filled order from ${user1}`)

        await wait(1)

        //User 1 makes a final order
        result = await exchange.makeOrder(token.address, tokens(200), ETHER_ADDRESS, ether(0.15), { from: user1 })
        console.log(`Make order from ${user1}`)

        //User 2 fills order
        orderId = result.logs[0].args.id
        await exchange.fillOrder(orderId, { from: user2 })
        console.log(`Filled order from ${user1}`)

        // wait 1 second
        await wait(1)

        //////////////Open Orders///////////////
        //User 1 makes 10 orders
        for (let i = 0; i <= 10; i++) {
            result = await exchange.makeOrder(token.address, tokens(10 * i), ETHER_ADDRESS, ether(0.01), { from: user1 })
            console.log(`Made order from ${user1}`)
            await wait(1)
        }

        // User 2 makes 10 order
        for (let i = 0; i <= 10; i++) {
            result = await exchange.makeOrder(ETHER_ADDRESS, ether(0.01), token.address, tokens(10 * i), { from: user2 })
            console.log(`Made order from ${user2}`)
            await wait(1)
        }

    } catch (err) {
        console.log(err);
    }
    callback()
}