const dotenv = require("dotenv");
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const BNBContractABI = require("./contactsABI/BNBabi.json");
const XGXContractABI = require("./contactsABI/HuxhTokenABI.json");
const Fortmatic = require("fortmatic");
const { getBalance } = require("./myLib/cryptoBalance");
const bitcore = require("bitcore-lib");
const conn = require("./config/db_conn");
const litecore = require("litecore-lib");
const Web3 = require("web3");
const ganache = require("ganache-cli");
const e = require("express");


const app = express();
app.use(bodyParser.json());
var multer = require("multer");
var upload = multer();
// for parsing multipart/form-data
app.use(upload.array());
app.use(express.static("public"));

app.use(bodyParser.json({})); //this line is required to tell your app to parse the body as json
app.use(bodyParser.urlencoded({ extended: false }));
// init env file
dotenv.config();

//btc transfer function
const transferBTC = require("./myLib/transbtc");
const transferLTC = require("./myLib/transltc");

//Storing Some Token Value
let btcEQXGX;
let bnbEQXGX;
let btcEQltc;
let ltcEQbtc;
let ltcEQXGX;
let btcPrice;
let bnbPrice;
let ltcPrice;
let ethPrice;
let btcEQbnb;
let bnbEQbtc;
let xgxEQBNB;
async function tokenPrice() {
    await axios
        .get(`https://betconix.com/api/v2/tickers`)
        .then((result) => {
            // console.log("result===",result.)
            result.data.map((eleme) => {
                if (eleme.ticker_id == "BTC_USD") {
                    btcPrice = eleme.last_price;
                } else if (eleme.ticker_id == "LTC_USD") {
                    ltcPrice = eleme.last_price;
                } else if (eleme.ticker_id == "ETH_USD") {
                    ethPrice = eleme.last_price;
                } else if (eleme.ticker_id == "BNB_USD") {
                    bnbPrice = eleme.last_price;
                    console.log(bnbPrice);
                }
            });
        })
        .catch((er) => {});
}
tokenPrice();

async function getXGXBalance(walletAddress) {

    var web3 = new Web3(
        new Web3.providers.HttpProvider(
            "https://data-seed-prebsc-1-s1.binance.org:8545"
        )
    );
    let XGXcontractAddress = "0x5ff35d14fdd7743fbcd358f41c9abd1751e32846"
    const contract = new web3.eth.Contract(XGXContractABI, XGXcontractAddress);

    const result = await contract.methods.balanceOf(walletAddress).call(); // 29803630997051883414242659
    console.log("result", result)
    const format = web3.utils.fromWei(result); // 29803630.997051883414242659
    console.log("formate", format);
    return format;

}



async function XGXEQUEVALENTBNB(amount) {
    let xgxToUSD = ParseFloat(amount / 100).toPrecision(6);
    xgxEQBNB = (xgxToUSD / bnbPrice).toFixed(2)
    return xgxEQBNB;
}

async function BNBEQUEVALENTBTC(amount) {
    let btcBnb = ParseFloat(amount * bnbPrice).toPrecision(6);
    bnbEQbtc = (btcBnb / btcPrice).toFixed(2)
    return bnbEQbtc;
}

async function BTCEQUEVALENTBNB(amount) {
    let btcBnb = ParseFloat(amount * btcPrice).toPrecision(6);
    btcEQbnb = (btcBnb / bnbPrice).toFixed(2)
    return btcEQbnb;
}

async function BTCEQUEVALENTXGX(amount) {
    let btcUSD = ParseFloat(amount * btcPrice).toFixed(2)
    btcEQXGX = btcUSD * 100
    return btcEQltc;
}

async function BNBEQUEVALENTXGX(amount) {
    let bnb = ParseFloat(amount * bnbPrice).toPrecision(6);
    bnbEQXGX = (bnb * 100).toFixed(2)
    return btcEQltc;
}


async function BTCEQUEVALENTLTC(amount) {
    let ltc = ParseFloat(ltcPrice / btcPrice).toPrecision(6);
    btcEQltc = parseFloat((ltc * amount).toPrecision(6));
    return btcEQltc;
}

async function LTCEQUEVALENTXGX(amount) {
    let ltcUSD = ParseFloat(amount * ltcPrice).toFixed(2)
    ltcEQXGX = ltcUSD * 100
    return ltcEQXGX;
}

async function LTCEQUEVALENTBTC(amount) {
    let btc = ParseFloat(btcPrice / ltcPrice).toPrecision(6);
    btcEQltc = parseFloat((btc * amount).toPrecision(6));
    return btcEQltc;
}

//Discod Managment =================

const msg = require("./private-message");
const walletBalance = require("./myLib/checkWalletBalance");
const cbMsg = require("./discordButton");

const discord = require("discord.js");
const { Client, WebhookClient } = require("discord.js");
const privateMessage = require("./private-message");
const client = new Client({
    partials: ["MESSAGE", "REACTION"],
});

// const webhookClient = new WebhookClient(
//   process.env.WEBHOOK_ID,
//   process.env.WEBHOOK_TOKEN,
// );
require("discord-buttons")(client);
client.on("ready", () => {
    console.log(`${client.user.username} has logged in.`);
});

const DSPREFIX = "/";
const firstGroupName = "AGM-Gift";
const DSGroupLink = "https://discord.gg/MXeNCtwaDv";
client.on("message", async(message) => {
    if (message.author.bot) return;
    let reqGroupName = message.guild.name;

    const CMD_NAME = message.content.substring(DSPREFIX.length);

    // console.log("req",message)
    console.log("req", message.guild.name);

    message.channel.reply('node response');

    if (message.content.startsWith(DSPREFIX)) {
        console.log("COMMADN_ANME", CMD_NAME);
        if (CMD_NAME == "all" && reqGroupName == "AGM") {
            await cbMsg
                .buttonMsg(message)
                .then((res) => {
                    // console.log("res", res)
                })
                .catch((er) => {
                    console.log("ERROR", er);
                });
        } else if (CMD_NAME == "all" && reqGroupName == "AGM-Gift") {
            console.log("HERE========");
            await cbMsg
                .buttonGift(message)
                .then((res) => {
                    console.log("res", res);
                })
                .catch((er) => {
                    console.log("ERROR", er);
                });
        }
    } else {}
});

client.on("clickButton", async(button) => {
    // console.log("button.usser.id", button.guild)
    let channelId = button.message.author.id;
    let botId = button.message.author.id;
    let user_id = button.clicker.id;
    let serverError = "Server is busy try again...";

    // let userData = await client.users.fetch(button.channel.id)
    // let channelData = await client.channels.get(button.channel.id)

    if (button.id === "processToPayment") {
        let otp = Math.floor(1000 + Math.random() * 9000);
        let user_wallet_id;
        //Generate eth address with private key
        let account = await web3.eth.accounts.create();

        //Generate lit coin address with private key
        let privateKeyLTC = new litecore.PrivateKey("testnet");
        // let privateKeyLTC = new litecore.PrivateKey();
        let addressLTC = privateKeyLTC.toAddress();
        //Generate Bit coin address with private key
        let privateKeyWIF = bitcore.PrivateKey("testnet").toWIF();
        // let privateKeyWIF = bitcore.PrivateKey().toWIF();
        let privateKeyBTC = bitcore.PrivateKey.fromWIF(privateKeyWIF);
        let addressBTC = privateKeyBTC.toAddress();

        let userPrivateWallet =
            "INSERT INTO user_private_wallet (id, user_wallet_id, privateKey, walletAddress, walletType) VALUES (?);";

        let updateQuery = `UPDATE register_user SET token ="${0}" WHERE user_id = '${user_id}'`;
        // let values = [req.body.message.from.id];
        const userWalletExist = `SELECT * FROM register_user WHERE user_id LIKE '${user_id}';`;
        //create user wallet
        let personalWalletQuery =
            "INSERT INTO user_wallet (id, walletAddress, privateKey, amount, otp) VALUES (?);";
        let personalWalletData = [
            null,
            account.address,
            account.privateKey,
            0,
            otp,
        ];

        //register user query
        let registereDuserQuery =
            "INSERT INTO register_user (id, user_wallet_id,user_id,token,nft,watch,miningPc,swapToken) VALUES (?);";
        conn.query(userWalletExist, async(err, result) => {
            console.log("error", err);
            if (err) {
                console.log("error", err);
                await msg
                    .channelMessage(message, serverError)
                    .then((res) => {
                        console.log("res error");
                    })
                    .catch((er) => {
                        console.log("catch erro");
                    });
            }
            //user found
            else if (result.length > 0) {
                cbMsg
                    .buttonMsg(button.message)
                    .then((res) => {
                        // console.log("res", res)
                    })
                    .catch((er) => {
                        console.log("ERROR", er);
                    });
                button.channel.send(
                    `Your are already registered.\nPlease make the payment and Click on CONFIRM PAYMENT`
                );
                // msg(`Your are already registered.\nPlease make the payment and Click on CONFIRM PAYMENT`)
                // client.on('messageCreate', message => {
                //     client.channels.cache.get('channelId').send(`Your are already registered.\nPlease make the payment and Click on CONFIRM PAYMENT`);
                // })
                // channelData.send(`Your are already registered.\nPlease make the payment and Click on CONFIRM PAYMENT`)
            }
            //did not found user then create userWallet
            else {
                conn.query(
                    personalWalletQuery, [personalWalletData],
                    async(err, result, fields) => {
                        if (err) {
                            console.log("error", err);
                            msg
                                .channelMessage(message, serverError)
                                .then((res) => {
                                    console.log("res error");
                                })
                                .catch((er) => {
                                    console.log("catch erro");
                                });
                        }
                        //create register user details
                        else {
                            user_wallet_id = result.insertId;
                            let registeredUserData = [
                                null,
                                user_wallet_id,
                                user_id,
                                1,
                                1,
                                1,
                                1,
                                1,
                            ];
                            conn.query(
                                registereDuserQuery, [registeredUserData],
                                async(err, result, fields) => {
                                    if (err) {
                                        msg
                                            .channelMessage(message, serverError)
                                            .then((res) => {
                                                console.log("res error");
                                            })
                                            .catch((er) => {
                                                console.log("catch erro");
                                            });
                                    } else {
                                        let bitcoinWalletData = [
                                            null,
                                            user_wallet_id,
                                            privateKeyBTC,
                                            addressBTC,
                                            "BTC",
                                        ];
                                        let litecoinWalletData = [
                                            null,
                                            user_wallet_id,
                                            privateKeyLTC,
                                            addressLTC,
                                            "LTC",
                                        ];
                                        let ethWalletData = [
                                            null,
                                            user_wallet_id,
                                            account.privateKey,
                                            account.address,
                                            "ETH",
                                        ];

                                        conn.query(
                                            userPrivateWallet, [bitcoinWalletData],
                                            async(err, result, fields) => {
                                                if (err) {
                                                    console.log("BTC Wallet ERROR", err);
                                                } else {
                                                    console.log("BTC Wallet CREATE");
                                                }
                                            }
                                        );
                                        conn.query(
                                            userPrivateWallet, [litecoinWalletData],
                                            async(err, result, fields) => {
                                                if (err) {
                                                    console.log("LTC Wallet ERROR", err);
                                                } else {
                                                    console.log("LTC Wallet CREATE");
                                                }
                                            }
                                        );
                                        conn.query(
                                            userPrivateWallet, [ethWalletData],
                                            async(err, result, fields) => {
                                                if (err) {
                                                    console.log("ETH Wallet ERROR", err);
                                                } else {
                                                    console.log("ETH Wallet CREATE");
                                                }
                                            }
                                        );

                                        cbMsg
                                            .buttonMsg(button.message)
                                            .then((res) => {
                                                // console.log("res", res)
                                            })
                                            .catch((er) => {
                                                console.log("ERROR", er);
                                            });

                                        await client.users
                                            .fetch(user_id)
                                            .then((user) => {
                                                user.send(`Your Verification code is ${otp}\nDon't share it with anyone.\n
                                    Bitcoin wallet address - ${addressBTC}\n
                                    Ethereum wallet address - ${account.address}\n
                                    Litecoin wallet address - ${addressLTC}\n
                                    Binance Coin wallet address - ${account.address}\n`);
                                            })
                                            .catch(async(er) => {
                                                console.log("HERE===============", er);
                                                await msg
                                                    .channelMessage(button.message, serverError)
                                                    .then((res) => {
                                                        // console.log("res error")
                                                    })
                                                    .catch((er) => {
                                                        // console.log("catch erro")
                                                    });
                                            });
                                        // await msg.privateMessage(button.message, `Your Verification code is ${otp}\nDon't share it with anyone.\n
                                        // Bitcoin wallet address - ${addressBTC}\n
                                        // Ethereum wallet address - ${account.address}\n
                                        // Litecoin wallet address - ${addressLTC}\n
                                        // Binance Coin wallet address - ${account.address}\n`)

                                        // await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                        //     chat_id: user_id,
                                        // text: `Your Verification code is ${otp}\nDon't share it with anyone.\n
                                        //             Bitcoin wallet address - ${addressBTC}\n
                                        //             Ethereum wallet address - ${account.address}\n
                                        //             Litecoin wallet address - ${addressLTC}\n
                                        //             Binance Coin wallet address - ${account.address}\n`
                                        // }).catch(async (err) => {
                                        //     console.log("error", err)
                                        //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                        //         chat_id: chatId,
                                        //         text: "Server is busy try again..."
                                        //     })
                                        // })
                                    }
                                }
                            );
                        }
                    }
                );
            }
        });
    } else if (button.id === "paymentComplete") {
        const userWalletExist = `SELECT register_user.*,user_wallet.*
                    FROM register_user
                    JOIN user_wallet
                    ON register_user.user_wallet_id=user_wallet.id
                    WHERE register_user.user_id = '${user_id}' AND user_wallet.success = ${0};`;

        conn.query(userWalletExist, async(err, result) => {
            // console.log("result======", result.token)
            // console.log("result++++++", result[0].token)
            if (err) {
                console.log("ERROR==============asdasdasdasdas", err);
                return null;
            } else if (result.length > 0) {
                // console.log("HERE======CONFRIM PAYMENT", result)
                user_wallet_id = result[0].user_wallet_id;
                register_user_id = result[0].id;
                await walletBalance
                    .checkWalletBalance(result[0].user_wallet_id, 1)
                    .then(async(res) => {
                        if (
                            res[0] ||
                            res[0].balance ||
                            res[1] ||
                            res[1].balance ||
                            res[2] ||
                            res[2].balance ||
                            res[3] ||
                            res[3].balance
                        ) {
                            let total = 0;
                            //ltc , bsc, btc , eth
                            if (res[0] && (res[0].balance && Number(res[0].balance)) > 0) {
                                total += Number(res[0].balance) * ltcPrice;

                                console.log("=======", res[0].balance * ltcPrice);
                                // if ((Number(res[0].balance * ltcPrice)) > 200) {
                                //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                //         chat_id: chatId,
                                //         text: `Your transaction is successful`
                                //     })
                                // } else {
                                //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                //         chat_id: chatId,
                                //         text: `Your transaction is less than required\nPlease check the amount you have sended`
                                //     })
                                // }
                            } else if (
                                res[1] &&
                                res[1].balance &&
                                Number(res[1].balance) > 0
                            ) {
                                total += Number(res[1].balance) * bnbPrice;
                                console.log("@@@@@@@@", res[1].balance * bnbPrice);
                                // if ((Number(res[1] * bnbPrice)) > 200) {
                                //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                //         chat_id: chatId,
                                //         text: `Your transaction is successful`
                                //     })
                                // } else {
                                //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                //         chat_id: chatId,
                                //         text: `Your transaction is less than required\nPlease check the amount you have sended`
                                //     })
                                // }
                            } else if (
                                res[2] &&
                                (res[2].balance && Number(res[2].balance)) > 0
                            ) {
                                total += Number(res[2].balance) * btcPrice;
                                console.log("ZZZZZZ", res[2].balance * btcPrice);
                                // if ((Number(res[2] * btcPrice)) > 200) {
                                //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                //         chat_id: chatId,
                                //         text: `Your transaction is successful`
                                //     })
                                // } else {
                                //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                //         chat_id: chatId,
                                //         text: `Your transaction is less than required\nPlease check the amount you have sended`
                                //     })
                                // }
                            } else if (
                                res[3] &&
                                res[3].balance &&
                                Number(res[3].balance) > 0
                            ) {
                                total += Number(res[3].balance) * ethPrice;
                                console.log("SSSSSS", Number(res[3].balance * ethPrice) > 200);

                                // if ((Number(res[3].balance * ethPrice)) > 200) {
                                //     createUserWallet(wallet_id, res[3].balance * ethPrice, walletAddress, req.body.message.from.id)
                                //         .then(res => {
                                //             console.log("resasdasd", res)
                                //         }).catch(err => {
                                //             console.log("errror", err)
                                //         })

                                //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                //         chat_id: chatId,
                                //         text: `Your transaction is successful`
                                //     })
                            }
                            if (total > 200) {
                                console.log("TOTAL", total);
                                // let userAccountAddress
                                // createUserWallet(wallet_id, res[3].balance * ethPrice, walletAddress, req.body.message.from.id)
                                //     .then(async (res) => {
                                //         console.log("resasdasd", res)
                                //         userAccountAddress = res.accountPublicAddress
                                //         register_user_id = res.register_user_id
                                //     }).catch(async (err) => {
                                //         console.log("errror", err)
                                //         await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                //             chat_id: chatId,
                                //             text: `Server busy try again later...`
                                //         })
                                //     })
                                button.channel.send(
                                    `Your transaction is successfull\nCheck your inbox.`
                                );
                                // await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                //     chat_id: chatId,
                                //     text: `Your transaction is successfull\nCheck your inbox.`
                                // })
                                //update the sucess with corresponding otp
                                let updateWalletInfo = `UPDATE user_wallet SET success ="${1}" WHERE id = ${user_wallet_id}`;
                                conn.query(updateWalletInfo, async(err, result, fields) => {
                                    if (err) {
                                        console.log("ERROADasdasd==========");
                                    } else {
                                        console.log("UPDATE CONFIRM");
                                    }
                                });
                                //create group_info with registered_user_id
                                let groupInfoQuery =
                                    "INSERT INTO group_info (id, groupName,groupId,register_user_id) VALUES (?);";
                                let groupInfoData = [
                                    null,
                                    firstGroupName,
                                    firstGroupId,
                                    register_user_id,
                                ];
                                conn.query(
                                    groupInfoQuery, [groupInfoData],
                                    async(err, result, fields) => {
                                        if (err) {
                                            console.log("err 2", err);
                                            button.channel.send(serverError);
                                            // await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            //     chat_id: chatId,
                                            //     text: `Server busy try again later...`
                                            // })
                                        } else {
                                            await getUserWalletDetails(user_wallet_id).then(
                                                async(res) => {
                                                    await client.users
                                                        .fetch(user_id)
                                                        .then((user) => {
                                                            user.send(
                                                                `Transaction was successfull\nYour wallet address is ${res[0].walletAddress}\nDon't share it with anyone.\nJoin here ${DSGroupLink} and claim your token and see gift-box status`
                                                            );
                                                        })
                                                        .catch(async(er) => {
                                                            button.channel.send(serverError);
                                                        });

                                                    cbMsg
                                                        .buttonMsg(button.message)
                                                        .then((res) => {
                                                            // console.log("res", res)
                                                        })
                                                        .catch((er) => {
                                                            console.log("ERROR", er);
                                                        });
                                                }
                                            );
                                        }
                                    }
                                );
                            } else {
                                cbMsg
                                    .buttonMsg(button.message)
                                    .then((res) => {
                                        // console.log("res", res)
                                    })
                                    .catch((er) => {
                                        console.log("ERROR", er);
                                    });
                                button.channel.send(
                                    `Your transaction is less than required\nPlease check the amount you have sended`
                                );
                            }
                        } else {
                            button.channel.send(serverError);
                        }
                    })
                    .catch(async(err) => {
                        button.channel.send(serverError);
                    });
            } else {
                let reCheckSuccessQuery = `SELECT register_user.*,user_wallet.*
                            FROM register_user
                            JOIN user_wallet
                            ON register_user.user_wallet_id=user_wallet.id
                            WHERE register_user.user_id = '${user_id}' AND user_wallet.success = ${1};`;

                await new Promise((resolve, reject) => {
                    conn.query(reCheckSuccessQuery, async(err, result) => {
                        console.log("PAYMENT CONFRIM RECHECK", result);
                        if (err) {
                            button.channel.send(serverError);
                        } else if (result.length > 0) {
                            button.channel.send(
                                "Your payment is done\nCheck we have inboxed you all details"
                            );
                            resolve();
                        } else {
                            button.channel.send(
                                "You are not registered\nPlease follow the process"
                            );
                        }
                    });
                });
            }
        });
    } else if (button.id === "token") {
        await walletBalance
            .checkGroupAccess(user_id)
            .then(async(res) => {
                if (res.length > 0) {
                    let updateQuery = `UPDATE register_user SET token ="${0}" WHERE user_id = '${user_id}'`;
                    // let values = [req.body.message.from.id];
                    const tokenClaimDetails = `SELECT * FROM register_user WHERE user_id LIKE '${user_id}' AND token = '${1}' ;`;
                    //check token claimed or not
                    conn.query(tokenClaimDetails, async(err, result) => {
                        if (err) {
                            // return res.status(501).json({
                            //     msg: "Number checking error",
                            //     error: err.message
                            // })
                            console.log("erro", err);
                            button.channel.send(`This wallet has already claimed it's token`);
                        } else if (result.length > 0) {
                            //update table walletKey status
                            conn.query(updateQuery, async(err, result) => {
                                if (err) {
                                    // return res.status(501).json({
                                    //     msg: "Number checking error",
                                    //     error: err.message
                                    // })
                                    console.log("erro", err);
                                    button.channel.send(serverError);
                                } else {
                                    conn.query(updateQuery, async(err, result) => {
                                        if (err) {
                                            console.log("err-r", err);
                                            button.channel.send(serverError);
                                        }
                                    });
                                    //call token send function
                                    // sendTestBnb(walletAddress)

                                    await button.channel
                                        .send(`Token has been sended into your wallet`)
                                        .then(async(res) => {
                                            await cbMsg
                                                .buttonGift(button.message)
                                                .then((res) => {
                                                    // console.log("res", res)
                                                })
                                                .catch((er) => {
                                                    console.log("ERROR", er);
                                                });
                                        });
                                }
                            });
                        } else {
                            button.channel.send(`This wallet has already claimed it's token`);
                        }
                    });
                } else {
                    //kick user
                    await client.users
                        .fetch(user_id)
                        .then((user) => {
                            user.send(`You have been kicked.Please Contact with XGX Admin`);
                        })
                        .then((res) => {
                            setTimeout(() => {
                                member = button.channel.guild.members.cache.get(user_id);
                                console.log("CHECKINg===");
                                member.kick();
                            }, 3000);
                        })
                        .catch((er) => {
                            console.log("KICK ERRO", er);
                        });
                }
            })
            .catch((er) => {
                console.log("ERROR", er);
                button.channel.send(serverError);
            });
    } else if (button.id == "nft") {
        button.channel.send(`Wait for next round`);
        cbMsg
            .buttonGift(button.message)
            .then((res) => {
                // console.log("res", res)
            })
            .catch((er) => {
                console.log("ERROR", er);
            });
    } else if (button.id == "watch") {
        button.channel.send(`Wait for next round`);
        cbMsg
            .buttonGift(button.message)
            .then((res) => {
                // console.log("res", res)
            })
            .catch((er) => {
                console.log("ERROR", er);
            });
    } else if (button.id == "pc") {
        button.channel.send(`Wait for next round`);
        cbMsg
            .buttonGift(button.message)
            .then((res) => {
                // console.log("res", res)
            })
            .catch((er) => {
                console.log("ERROR", er);
            });
    } else if (button.id == "swapToken") {
        button.channel.send(`Wait for next round`);
        cbMsg
            .buttonGift(button.message)
            .then((res) => {
                // console.log("res", res)
            })
            .catch((er) => {
                console.log("ERROR", er);
            });
    }
    button.reply.defer();
});

client.login(process.env.DISCORDJS_TOKEN);

// const userRoute = require('./routes/auth/UserAuthRoute')

// const userRoute = require('./routes/auth/UserAuthRoute')

// console.log("BNBContractABI",BNBContractABI)

const jsonAbi = BNBContractABI; // JSON ABI of the token contract
const contractAddress = "0xB8c77482e45F1F44dE1745F52C74426C631bDD52"; // address of the token contract
const tokenAddress = "0xB8c77482e45F1F44dE1745F52C74426C631bDD52"; // address of which you want to get the token balance
// var web3 = new Web3(Web3.givenProvider || 'ws://some.local-or-remote.node:8546');
const provierUrl = process.env.PROVIER_URL || "http://127.0.0.1:3000";

// const BSCOptions = {
//     /* Smart Chain - Testnet RPC URL */
//       rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
//       chainId: 97 // Smart Chain - Testnet chain id
//     }
// let web3 = new Web3(provierUrl);
// let web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/9e81cde3134f40019b152fafe6d2f265"));
// let web3 = new Web3(new Web3.providers.HttpProvider("https://data-seed-prebsc-1-s1.binance.org:8545"));
// let web3 = new Web3(
//     new Web3.providers.HttpProvider(
//         "https://rinkeby.infura.io/v3/9e81cde3134f40019b152fafe6d2f265"
//     )
// );
// let web3 = new Web3(new Web3.providers.HttpProvider(BSCOptions));
// const web3 = new Fortmatic('YOUR_TEST_API_KEY', BSCOptions);

// const provider = ganache.provider();
// const web3 = new Web3(provider);

// console.log(web3)
let accountBalance;
let error = null;
const checkBalance = async(walletKey, type) => {
    if (type == 1) {
        web3.eth.getTransaction(
            "0x9fc76417374aa880d4449a1f7f31ec597f00b1f6f3dd2d66f4c9c6c445836d8b§234"
        );
        then((res) => {
            console.log("asdasd", res);
        });
        web3.eth
            .getBalance("0xB8c77482e45F1F44dE1745F52C74426C631bDD52")
            .then((res) => {
                var balance = web3.utils.fromWei(res, "ether");
                accountBalance = balance;
                return balance;
            })
            .catch((err) => {
                error = err;
                console.log("type1 error", err);
            });
    } else if (type == 2) {
        const contract = new web3.eth.Contract(jsonAbi, contractAddress);

        //get account balance in eth

        // web3.eth.getBalance("0xB8c77482e45F1F44dE1745F52C74426C631bDD52").then(res=>{
        //     console.log("ooo",res);
        //     var balance = web3.utils.fromWei(res, 'ether')
        //     console.log("bala",balance)
        // }).catch(err=>{
        //     console.log("err",err)
        // })

        // console.log('token',token)
        // await web3.eth.getBalance("0xB8c77482e45F1F44dE1745F52C74426C631bDD52").then(res=>{
        //     console.log("balance",res)
        // }).catch(err=>{
        //     console.log("err",err)
        // })

        // const balance = await token.methods.balanceOf(tokenAddress).call();
        // const balance = await token.balanceOf.call(tokenAddress)
        const result = await contract.methods.balanceOf(walletKey).call(); // 29803630997051883414242659

        console.log("result", result);

        const format = web3.utils.fromWei(result); // 29803630.997051883414242659

        console.log("format", format);
        return format;
        // const balance = web3.utils.fromWei(token, 'bnb')
        // balance = web3.utils.toDecimal(balance);
        // console.log("token", balance)
        // console.log("balance", balance)
    } else if (type == 3) {
        let mainWallet = "0xB8c77482e45F1F44dE1745F52C74426C631bDD52";

        const contract = new web3.eth.Contract(jsonAbi, contractAddress);

        const result = await contract.methods.balanceOf(mainWallet).call(); // 29803630997051883414242659

        const format = web3.utils.fromWei(result); // 29803630.997051883414242659
        console.log("formate", format);
        return format;
    }
};
// console.log("token",token)
// console.log("balance",balance)

const { TOKEN, SERVER_URL } = process.env;
console.log("TOKEN", TOKEN);
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URL = SERVER_URL + URI;

// getBalance("LTC","LcFFkbRUrr8j7TMi8oXUnfR4GPsgcXDepo")
// .then(res=>{
//     console.log("res",res);
// }).catch(err=>{
//     console.log("err",err)
// })

async function getTokenBalance(trxHash, chatId) {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: "We are verifying your transaction details...\nplease wait",
    });
    let TransDetails;
    let TokenPrice;
    const promise1 = await axios
        .get(`https://api.blockcypher.com/v1/ltc/main/txs/${trxHash}?limit=1`)
        .then(async(res) => {
            // await axios.get(`https://api.coingecko.com/api/v3/coins/litecoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
            //     .then(result => {
            //         TokenPrice = result.data.market_data.current_price.usd
            //     }).catch(er=>{
            //         console.log("MAIN ERROR====111")
            //     })
            console.log("hhhhhhhhhhhhhhhhhhhh");
            let balance = {
                balance: res.data["inputs"][0]["output_value"] * 0.00000001,
                walletAddress: res.data["inputs"][0]["addresses"][0],
                tokenPrice: ltcPrice,
            };
            return balance;
        })
        .catch((er) => {
            console.log("ER1");
            return null;
        });

    const promise2 = await axios
        .get(
            `https://api-testnet.bscscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash=${trxHash}&apikey=XZY87BD71ZVJH47SS8348X3CJK3IXBWV9C`
        )
        .then(async(res) => {
            // await axios.get(`https://betconix.com/api/v2/tickers`)
            //     .then(result => {
            //         console.log("result",result.data)
            //         TokenPrice = result.data.market_data.current_price.usd
            //     }).catch(er=>{
            //         console.log("MAIN ERROR====")
            //     })
            console.log("ttttttt");
            if (res.data.result.value) {
                const format = web3.utils.fromWei(res.data.result.value.toString()); // 29803630.997051883414242659
                let balance = {
                    balance: format,
                    total: format,
                    walletAddress: res.data.result.from,
                    tokenPrice: bnbPrice,
                };
                return balance;
            }
        })
        .catch((er) => {
            console.log("ER2");
            return null;
        });

    const promise3 = await axios
        .get(`https://api.blockcypher.com/v1/btc/main/txs/${trxHash}?limit=1`)
        .then(async(res) => {
            // await axios.get(`https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
            //     .then(result => {
            //         TokenPrice = result.data.market_data.current_price.usd
            //     })
            console.log("sssssssss");
            let balance = {
                balance: res.data["inputs"][0]["output_value"] * 0.00000001,
                walletAddress: res.data["inputs"][0]["addresses"][0],
                tokenPrice: btcPrice,
            };
            return balance;
        })
        .catch((er) => {
            console.log("ER3");
            return null;
        });

    const promise4 = await axios
        .get(`https://api.blockcypher.com/v1/eth/main/txs/${trxHash}?limit=1`)
        .then(async(res) => {
            // await axios.get(`https://api.coingecko.com/api/v3/coins/ethereum?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
            //     .then(result => {
            //         TokenPrice = result.data.market_data.current_price.usd
            //     })
            console.log("yyyyyyyyyy");
            let balance = {
                // balance: (res.data.total) * 0.00000001,
                // total: res.data.total * 0.00000001,
                // walletAddress: res.data["inputs"][0]["addresses"][0]
                balance: res.data["inputs"][0]["output_value"] * 0.00000001,
                walletAddress: res.data["inputs"][0]["addresses"][0],
                tokenPrice: ethPrice,
            };
            return balance;
        })
        .catch((er) => {
            console.log("ER4");
            // console.log("ER", er)
            return null;
        });

    await Promise.all([promise1, promise2, promise3, promise4])
        .then((values) => {
            TransDetails = values;
            console.log("values", values);
            return values;
        })
        .catch((er) => {
            TransDetails = er;
            return er;
        });
    return TransDetails;
}

async function liquidityPoolUserDetails(userId) {
    console.log(" I AM HERE");
    let output = { key: null, data: null };

    //wallet details BTC
    // let privateKeyWIF = bitcore.PrivateKey("testnet").toWIF();
    let privateKeyWIF = await bitcore.PrivateKey().toWIF();
    let privateKeyBTC = await bitcore.PrivateKey.fromWIF(privateKeyWIF);
    let addressBTC = privateKeyBTC.toAddress();

    //wallet details LTC
    // let privateKeyWIF = bitcore.PrivateKey("testnet").toWIF();
    let privateKeyLTC = new litecore.PrivateKey("testnet");
    // let privateKeyLTC = new litecore.PrivateKey();
    let addressLTC = privateKeyLTC.toAddress();

    //wallet details eth
    let accountETH = await web3.eth.accounts.create();
    let AccountETH = accountETH.address;
    let PrivateKeyETH = accountETH.privateKey;

    // //wallet details bnb
    // let accountBNB = await web3.eth.accounts.create();
    // let BNBAccount = accountBNB.address;
    // let BNBPrivateKey = accountBNB.privateKey;

    //user wallet
    let accountUser = await web3.eth.accounts.create();
    let ETHAccount = accountUser.address;
    let ETHPrivateKey = accountUser.privateKey;
    //id, userId, userWalletAddr, userWalletKey, btcWalletAddr, btcWalletKey,
    //ltcWalletAddr, ltcWalletKey, ethWalletAddr, ethWalletKey, bnbWalletAddr,
    //bnbWalletKey, btcAmountReceived, ltcAmountReceived,
    //ethAmountReceived, bnbAmountReceived, xgxAmount

    console.log("BTC", addressBTC.toString());
    console.log("LTC", addressLTC.toString());
    console.log("ETH", ETHAccount);
    console.log("BNB", AccountETH);

    const checkPending = `SELECT liquidity_pool_user.*, liquidity_pool_history.*
  FROM liquidity_pool_user 
  JOIN liquidity_pool_history
  ON liquidity_pool_user.id = liquidity_pool_history.lqpoolId
  WHERE liquidity_pool_user.userId = '${userId}';`;
    let query =
        "INSERT INTO liquidity_pool_user (id, userId, userWalletAddr,userWalletKey, btcWalletAddr,btcWalletKey, ltcWalletAddr, ltcWalletKey, ethWalletAddr, ethWalletKey, bnbWalletAddr, bnbWalletKey) VALUES (?);";
    let data = [
        null,
        userId,
        ETHAccount,
        ETHPrivateKey,
        addressBTC.toString(),
        privateKeyBTC,
        addressLTC.toString(),
        privateKeyLTC,
        AccountETH,
        PrivateKeyETH,
        AccountETH,
        PrivateKeyETH,
    ];

    await new Promise((resolve, reject) => {
        conn.query(checkPending, async(err, result) => {
            if (err) {
                console.log("ERROR+++++", err, result);
                return output;
            } else if (result.length == 0) {
                console.log("MY RESULT ==,", result);
                resolve(
                    await new Promise((resolve, reject) => {
                        conn.query(query, [data], (err, result) => {
                            console.log("RESULT====", result);
                            output["key"] = result.insertId;
                            output["data"] = {
                                userETHAddress: ETHAccount,
                                userETHKey: ETHPrivateKey,
                                privateBTCAddress: addressBTC,
                                privateBTCKey: privateKeyBTC,
                                privateLTCAddress: addressLTC,
                                privateLTCKey: privateKeyLTC,
                                privateETHAddress: AccountETH,
                                privateETHKey: PrivateKeyETH,
                                privateBNBAddress: AccountETH,
                                privateBNBKey: PrivateKeyETH,
                            };

                            if (err) {
                                axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: `Server busy try again later...`,
                                });
                                console.log("ERROR=================", err);
                                return output;
                            } else {
                                return resolve(output);
                            }
                        });
                    })
                );
            } else {
                console.log(" I AM SUPPOSE TO HERE ", result);
                output["key"] = null;
                output["data"] = result;
                resolve(output);
            }
        });
    });

    return output;
}

//check user is registered from public group for liquidity pool
async function liquidityPoolConfirm(userId, testNet = true) {
    console.log("HERE============", userId)
    if (testNet == true) {
        let output = { data: null, balance: null };
        console.log("HERE============")
        const checkPending = `SELECT liquidity_pool_user.* , liquidity_pool_history.id as liquidityPoolId ,liquidity_pool_history.fromCurrency,liquidity_pool_history.toCurrency,liquidity_pool_history.status
    FROM liquidity_pool_user
    JOIN liquidity_pool_history
    ON liquidity_pool_user.id = liquidity_pool_history.lqpoolId
    WHERE liquidity_pool_user.userId = '${userId}' AND liquidity_pool_history.status = '${1}';`;

        await new Promise((resolve, reject) => {
            conn.query(checkPending, (err, result) => {
                // console.log("checkBTCBalance", result);

                if (err) {
                    console.log("eerr", err);
                    return output
                } else {
                    console.log("ddata", result)
                    output["data"] = result;
                    resolve(output);
                }
            });
        });
        // console.log("OUTPUT====", output);
        // if (output.data[0].fromCurrency == "BTC") {
        //   await axios
        //     .get(
        //       `https://api.blockcypher.com/v1/btc/main/addrs/${output.data[0].walletAddress}/balance`
        //     )
        //     .then(async (res) => {
        //       // await axios.get(`https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
        //       //     .then(result => {
        //       //         TokenPrice = result.data.market_data.current_price.usd
        //       //     })
        //       output.balance = res.data.final_balance * 0.00000001;
        //     })
        //     .catch((er) => {
        //       console.log("ER3", er);
        //       output.balance = 0;
        //     });
        // } else if (output.data[0].fromCurrency == "LTC") {
        //   await axios
        //     .get(
        //       `https://chain.so/api/v2/get_address_balance/LTC/${output.data[0].walletAddress}`
        //     )
        //     .then(async (res) => {
        //       console.log("res.data.confirmed_balance", res.data.confirmed_balance);
        //       output.balance = res.data.confirmed_balance;
        //     })
        //     .catch((er) => {
        //       console.log("ER1");
        //       output.balance = 0;
        //     });
        // } else {
        //   console.log("ERROR WALLET FROM");
        //   output.balance = 0;
        // }
        return output;
    } else {}
}

//check user is registered from public group for liquidity pool
async function publicGroupUserLiquidityPool(userId) {
    let output = null;

    const checkPending = `SELECT public_group_user.* , currency_convert_request.walletAddress , currency_convert_request.toWalletAddress,currency_convert_request.fromCurrency,currency_convert_request.toCurrency
   FROM public_group_user
   JOIN currency_convert_request
   ON public_group_user.id = currency_convert_request.publicUserId
   WHERE public_group_user.userId = '${userId}' AND public_group_user.status = '${2}';`;

    await new Promise((resolve, reject) => {
        conn.query(checkPending, (err, result) => {
            console.log("publicGroupUserDetails", result);

            if (err) {
                console.log("eerr", err);
            } else {
                output = result;
                return resolve(result);
            }
        });
    });

    return output;
}

//check user is registered from public group for token convert
async function publicGroupUserDetails(userId) {
    let output = null;

    const checkPending = `SELECT public_group_user.* , currency_convert_request.walletAddress , currency_convert_request.toWalletAddress,currency_convert_request.fromCurrency,currency_convert_request.toCurrency
   FROM public_group_user
   JOIN currency_convert_request
   ON public_group_user.id = currency_convert_request.publicUserId
   WHERE public_group_user.userId = '${userId}' AND public_group_user.status IS NULL;`;

    await new Promise((resolve, reject) => {
        conn.query(checkPending, (err, result) => {
            console.log("publicGroupUserDetails", result);

            if (err) {
                console.log("eerr", err);
            } else {
                output = result;
                return resolve(result);
            }
        });
    });

    return output;
}

async function checkBTCBalance(testNet, userId) {
    if (testNet == true) {
        let output = { data: null, balance: null };

        const checkPending = `SELECT public_group_user.* , currency_convert_request.walletAddress,currency_convert_request.walletPrivateKey,currency_convert_request.toWalletAddress,currency_convert_request.fromCurrency,currency_convert_request.toCurrency
   FROM public_group_user
   JOIN currency_convert_request
   ON public_group_user.id = currency_convert_request.publicUserId
   WHERE public_group_user.userId = '${userId}' AND public_group_user.status IS NULL;`;

        await new Promise((resolve, reject) => {
            conn.query(checkPending, (err, result) => {
                // console.log("checkBTCBalance", result);

                if (err) {
                    console.log("eerr", err);
                } else {
                    output.data = result;
                    resolve(result);
                }
            });
        });
        console.log("OUTPUT====", output);
        if (output.data.length > 0) {
            if (output.data[0].fromCurrency == "BTC") {
                await axios
                    .get(
                        `https://api.blockcypher.com/v1/btc/main/addrs/${output.data[0].walletAddress}/balance`
                    )
                    .then(async(res) => {
                        // await axios.get(`https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
                        //     .then(result => {
                        //         TokenPrice = result.data.market_data.current_price.usd
                        //     })
                        output.balance = res.data.final_balance * 0.00000001;
                    })
                    .catch((er) => {
                        console.log("ER3", er);
                        output.balance = 0;
                    });
            } else if (output.data[0].fromCurrency == "LTC") {
                await axios
                    .get(
                        `https://chain.so/api/v2/get_address_balance/LTC/${output.data[0].walletAddress}`
                    )
                    .then(async(res) => {
                        console.log("res.data.confirmed_balance", res.data.confirmed_balance);
                        output.balance = res.data.confirmed_balance;
                    })
                    .catch((er) => {
                        console.log("ER1");
                        output.balance = 0;
                    });
            } else if (output.data[0].fromCurrency == "BNB") {
                await axios
                    .get(
                        `https://api-testnet.bscscan.com/api?module=account&action=balance&address=${output.data[0].walletAddress}&tag=latest&apikey=XZY87BD71ZVJH47SS8348X3CJK3IXBWV9C`
                    )
                    .then(async(res) => {
                        // await axios.get(`https://betconix.com/api/v2/tickers`)
                        //     .then(result => {
                        //         console.log("result",result.data)
                        //         TokenPrice = result.data.market_data.current_price.usd
                        //     }).catch(er=>{
                        //         console.log("MAIN ERROR====")
                        //     })

                        if (res.data.result) {
                            const format = web3.utils.fromWei(res.data.result.toString()); // 29803630.997051883414242659
                            output.balance = format

                        } else {
                            console.log("COULD NOT TRACT BNB PRICE")
                            output.balance = 0
                        }

                    })
                    .catch((er) => {
                        console.log("ER2", er);
                        output.balance = 0;
                    });
            } else if (output.data[0].fromCurrency == "ETH") {

                await axios
                    .get(
                        `https://api-rinkeby.etherscan.io/api?module=account&action=balance&address=${output.data[0].walletAddress}&tag=latest&apikey=CDWRF4K5C8NC3YZK7K69MZDSRVXHTFE4WB`
                    )
                    .then(async(res) => {
                        // await axios.get(`https://api.coingecko.com/api/v3/coins/ethereum?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
                        //     .then(result => {
                        //         TokenPrice = result.data.market_data.current_price.usd
                        //     })

                        // let balance = {
                        //   // balance: (res.data.total) * 0.00000001,
                        //   // total: res.data.total * 0.00000001,
                        //   // walletAddress: res.data["inputs"][0]["addresses"][0]
                        //   // balance: 0.5,
                        // };

                        output.balance = web3.utils.fromWei(res.data.result.toString())
                    })
                    .catch((er) => {
                        console.log("ER4");
                        // console.log("ER", er)
                        output.balance = 0
                    })
            } else {
                console.log("ERROR WALLET FROM");
                output.balance = 0;
            }
        }

        return output;
    } else {}
}

async function checkWalletBalance(user_wallet_id, chatId, testnet) {
    const userPrivateWallet = `SELECT * FROM user_private_wallet WHERE user_wallet_id LIKE '${user_wallet_id}';`;
    const walletAddress = await new Promise((resolve, reject) => {
        conn.query(userPrivateWallet, (err, result) => {
            if (err) {
                console.log("eerr", err);
            } else {
                return resolve(result);
            }
        });
    });
    console.log("walletAddress=================", walletAddress);
    let TransDetails;
    let TokenPrice;
    if (testnet == 1) {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: "We are verifying your transaction details...\nplease wait",
        });

        const promise1 = await axios
            .get(
                `https://chain.so/api/v2/get_address_balance/LTCTEST/${walletAddress[1].walletAddress}`
            )
            .then(async(res) => {
                // await axios.get(`https://api.coingecko.com/api/v3/coins/litecoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
                //     .then(result => {
                //         TokenPrice = result.data.market_data.current_price.usd
                //     }).catch(er=>{
                //         console.log("MAIN ERROR====111")
                //     })
                console.log("res.data.confirmed_balance", res.data.data.confirmed_balance);
                let balance = {
                    // balance: (res.data.final_balance) * 0.00000001,
                    balance: res.data.data.confirmed_balance,
                };
                console.log(
                    "hhhhhhhhhhhhhhhhhhhh",
                    res.data,
                    walletAddress[1],
                    balance
                );
                return balance;
            })
            .catch((er) => {
                console.log("ER1");
                return null;
            });

        const promise2 = await axios
            .get(
                `https://api-testnet.bscscan.com/api?module=account&action=balance&address=${walletAddress[2].walletAddress}&tag=latest&apikey=XZY87BD71ZVJH47SS8348X3CJK3IXBWV9C`
            )
            .then(async(res) => {
                // await axios.get(`https://betconix.com/api/v2/tickers`)
                //     .then(result => {
                //         console.log("result",result.data)
                //         TokenPrice = result.data.market_data.current_price.usd
                //     }).catch(er=>{
                //         console.log("MAIN ERROR====")
                //     })

                if (res.data.result) {
                    const format = web3.utils.fromWei(res.data.result.toString()); // 29803630.997051883414242659
                    let balance = {
                        balance: format,
                    };

                    return balance;
                }
                console.log("jjjjjjjjjjjjjjjjj", res.data, walletAddress[2], balance);
            })
            .catch((er) => {
                console.log("ER2");
                return null;
            });

        const promise3 = await axios
            .get(
                `https://api.blockcypher.com/v1/btc/test3/addrs/${walletAddress[0].walletAddress}/balance`
            )
            .then(async(res) => {
                // await axios.get(`https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
                //     .then(result => {
                //         TokenPrice = result.data.market_data.current_price.usd
                //     })
                let balance = {
                    balance: res.data.final_balance * 0.00000001,
                };
                console.log("aaaaaaaaaaaaaaa", res.data, walletAddress[0], balance);
                return balance;
            })
            .catch((er) => {
                console.log("ER3");
                return null;
            })

        const promise4 = await axios
            .get(
                `https://api-rinkeby.etherscan.io/api?module=account&action=balance&address=${walletAddress[2].walletAddress}&tag=latest&apikey=CDWRF4K5C8NC3YZK7K69MZDSRVXHTFE4WB`
            )
            .then(async(res) => {
                // await axios.get(`https://api.coingecko.com/api/v3/coins/ethereum?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
                //     .then(result => {
                //         TokenPrice = result.data.market_data.current_price.usd
                //     })

                let balance = {
                    // balance: (res.data.total) * 0.00000001,
                    // total: res.data.total * 0.00000001,
                    // walletAddress: res.data["inputs"][0]["addresses"][0]
                    // balance: web3.utils.fromWei(res.data.result.toString()),
                    balance: 0.53,
                };
                console.log("pppppppppppp", res.data, walletAddress[2], balance);
                return balance;
            })
            .catch((er) => {
                console.log("ER4");
                // console.log("ER", er)
                return null;
            })
        await Promise.all([promise1, promise2, promise3, promise4])
            .then((values) => {
                TransDetails = values;
                console.log("values", values);
                return values;
            })
            .catch((er) => {
                TransDetails = er;
                return er;
            });
    } else {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: "We are verifying your transaction details...\nplease wait",
        });
        let TransDetails;
        let TokenPrice;
        const promise1 = await axios
            .get(
                `https://api.blockcypher.com/v1/ltc/main/addrs/${walletAddress}/balance`
            )
            .then(async(res) => {
                // await axios.get(`https://api.coingecko.com/api/v3/coins/litecoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
                //     .then(result => {
                //         TokenPrice = result.data.market_data.current_price.usd
                //     }).catch(er=>{
                //         console.log("MAIN ERROR====111")
                //     })
                console.log("hhhhhhhhhhhhhhhhhhhh");
                let balance = {
                    balance: res.data.final_balance * 0.00000001,
                };
                return balance;
            })
            .catch((er) => {
                console.log("ER1");
                return null;
            });
        const promise2 = await axios
            .get(
                `https://api.bscscan.com/api?module=account&action=balance&address=${walletAddress}&apikey=XZY87BD71ZVJH47SS8348X3CJK3IXBWV9C`
            )
            .then(async(res) => {
                // await axios.get(`https://betconix.com/api/v2/tickers`)
                //     .then(result => {
                //         console.log("result",result.data)
                //         TokenPrice = result.data.market_data.current_price.usd
                //     }).catch(er=>{
                //         console.log("MAIN ERROR====")
                //     })
                console.log("ttttttt");
                if (res.data.result.value) {
                    const format = web3.utils.fromWei(res.data.result.toString()); // 29803630.997051883414242659
                    let balance = {
                        balance: format,
                    };
                    return balance;
                }
            })
            .catch((er) => {
                console.log("ER2");
                return null;
            });

        const promise3 = await axios
            .get(
                `https://api.blockcypher.com/v1/btc/main/addrs/${walletAddress}/balance`
            )
            .then(async(res) => {
                // await axios.get(`https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
                //     .then(result => {
                //         TokenPrice = result.data.market_data.current_price.usd
                //     })
                console.log("sssssssss");
                let balance = {
                    balance: res.data.final_balance * 0.00000001,
                };
                return balance;
            })
            .catch((er) => {
                console.log("ER3");
                return null;
            });

        const promise4 = await axios
            .get(
                `https://api.blockcypher.com/v1/eth/main/addrs/${walletAddress}/balance`
            )
            .then(async(res) => {
                // await axios.get(`https://api.coingecko.com/api/v3/coins/ethereum?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
                //     .then(result => {
                //         TokenPrice = result.data.market_data.current_price.usd
                //     })
                console.log("yyyyyyyyyy");
                let balance = {
                    // balance: (res.data.total) * 0.00000001,
                    // total: res.data.total * 0.00000001,
                    // walletAddress: res.data["inputs"][0]["addresses"][0]
                    // balance: web3.utils.fromWei(res.data.final_balance.toString()),
                    balance: 0.350,
                };
                return balance;
            })
            .catch((er) => {
                console.log("ER4");
                // console.log("ER", er)
                return null;
            });
        await Promise.all([promise1, promise2, promise3, promise4])
            .then((values) => {
                TransDetails = values;
                console.log("values", values);
                return values;
            })
            .catch((er) => {
                TransDetails = er;
                return er;
            });
    }

    return TransDetails;
}

async function sendOnlyone() {
    let toAddress = "0x964A6E4cBbbC5341d19F408ED90CD3fa35E1602D";
    let fromAddress = "0xAa4C101a8b42268d1F5117709b052C3bD273337d";
    const BNBContabiArrayractABI = require("./contactsABI/HuxhTokenABI.json");
    const abiArray = BNBContabiArrayractABI;
    const contractAddress = "0xbae7588c722d279b93355dce53a4e88a08c2c381";
    var Tx = require("ethereumjs-tx").Transaction;
    var Web3 = require("web3");
    // var web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed.binance.org/'));
    var web3 = new Web3(
        new Web3.providers.HttpProvider(
            "https://data-seed-prebsc-1-s1.binance.org:8545"
        )
    );

    var amount = web3.utils.toHex(1);
    // var privateKey = Buffer.from("61b99f388f3b36384bc6a4727bcef1937d07de3817a392dea93cff0de27f50c9", 'hex');
    // // var contractAddress = '0xb899db682e6d6164d885ff67c1e676141deaaa40'; // ONLYONE address
    // var contract = new web3.eth.Contract(abiArray, contractAddress, {from: fromAddress});
    // let contractName = await contract.methods.name().call()
    // console.log("contractName",contractName)
    // // var transfer = contract.methods.transfer(toAddress, amount);
    // // console.log("ytas",transfer)
    // // var encodedABI = transfer.encodeABI();
    // var Common = require('ethereumjs-common').default;
    // var BSC_FORK = Common.forCustomChain(
    //     'mainnet',
    //     {
    //     name: 'Smart Chain - Testnet',
    //     networkId: 97,
    //     chainId: 97,
    //     url: 'https://data-seed-prebsc-1-s1.binance.org:8545/'
    //     },
    //     'istanbul',
    // );
    let values = await web3.eth.accounts.wallet.add({
        privateKey: "61b99f388f3b36384bc6a4727bcef1937d07de3817a392dea93cff0de27f50c9",
        address: "0xAa4C101a8b42268d1F5117709b052C3bD273337d",
    });
    // console.log("values==========",values)
    let account = await web3.eth.accounts.wallet;
    // console.log("account",account)
    let myCount = account["0"];
    // const accounts = await web3.eth.getAccounts();
    console.log("account", myCount);
    // console.log("accounts",accounts)
    var count = await web3.eth.getTransactionCount(fromAddress);
    // count += 1
    console.log("count", count);
    const gasLimit = 24000;
    let biteCode = await web3.eth.getCode(contractAddress);
    // console.log("biteCode",biteCode)
    let gasPrice = await web3.eth.getGasPrice();
    console.log("gasPrice", gasPrice);
    // var accounts = await web3.eth.accounts;
    // console.log("account",accounts[0])
    // let personal = await web3.eth.personal.unlockAccount(fromAddress, "61b99f388f3b36384bc6a4727bcef1937d07de3817a392dea93cff0de27f50c9", 600)
    // console.log("personal",personal)
    // .then(res=>{
    //     console.log("unclockAccont",res)
    // }).catch(err=>{
    //     console.log("Eerrr",err)
    // })

    var rawTransaction = {
        from: fromAddress,
        gasPrice: web3.utils.toHex(gasPrice),
        gas: web3.utils.toHex(gasLimit),
        // "value":web3.utils.toHex(amount),
        // 'value': 0x0,
        // "data":contract.methods.transfer(toAddress, amount).encodeABI(),
        // "data":contract.methods.myMethod(biteCode).encodeABI(),
        // "data":encodedABI,
        nonce: web3.utils.toHex(count),
    };

    const contract = new web3.eth.Contract(abiArray, contractAddress, {
        from: myCount.address,
        gas: 24000,
    });

    await contract.methods
        .balanceOf(fromAddress)
        .call({})
        .then((res) => {
            const format = web3.utils.fromWei(res); // 29803630.997051883414242659

            console.log("format", format);
        })
        .catch(console.error);

    // await contract.methods.transfer(toAddress, amount).send()
    // .on('transactionHash', function(hash){
    //     console.log("hash",hash)
    // })
    // .on('confirmation', function(confirmationNumber, receipt){
    // })
    // .on('receipt', function(receipt){
    //     console.log("receipt",receipt)
    // }).
    // on('error', function(error, receipt) {
    //     console.log("errorreceipt",receipt) // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
    //     console.log("receipt",error) // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
    // })
    await contract.methods
        .transfer(toAddress, amount)
        .send({
            from: fromAddress,
            value: amount * 1000000000000000000,
        })
        .on("transactionHash", function(hash) {
            console.log("hash", hash);
        })
        .on("confirmation", function(confirmationNumber, receipt) {})
        .on("receipt", function(receipt) {
            console.log("receipt", receipt);
        })
        .on("error", function(error, receipt) {
            console.log("errorreceipt", receipt); // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
            console.log("receipt", error); // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        });
    // .then(res=>{
    //     console.log("res",res)
    // }).catch(console.error);

    // var rawTransaction = {
    //     "from":fromAddress,
    //     "gasPrice":web3.utils.toHex(gasPrice),
    //     "gasLimit":web3.utils.toHex(gasLimit),
    //     "to":toAddress,
    //     // "value":web3.utils.toHex(amount),
    //     'value': 0x0,
    //     // "data":contract.methods.transfer(toAddress, amount).encodeABI(),
    //     // "data":contract.methods.myMethod(biteCode).encodeABI(),
    //     "data":encodedABI,
    //     "nonce":web3.utils.toHex(count)
    // };

    // var transaction = new Tx(rawTransaction, {'common':BSC_FORK});
    // transaction.sign(privateKey)

    // var result = await web3.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'));
    // console.log('result',result)
}

async function sendTestBnb(receiver) {
    let toAddress = receiver;
    let fromAddress = "0xAa4C101a8b42268d1F5117709b052C3bD273337d";
    const BNBContabiArrayractABI = require("./contactsABI/HuxhTokenABI.json");
    const abiArray = BNBContabiArrayractABI;
    const contractAddress = "0xbae7588c722d279b93355dce53a4e88a08c2c381";
    var Tx = require("ethereumjs-tx").Transaction;
    var Web3 = require("web3");
    // var web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed.binance.org/'));
    var web3 = new Web3(
        new Web3.providers.HttpProvider(
            "https://data-seed-prebsc-1-s1.binance.org:8545"
        )
    );

    var amount = 0.0001;
    amount = parseInt(web3.utils.toWei(`${amount}`));
    console.log("asdasdasd", amount);
    var privateKey = Buffer.from(
        "61b99f388f3b36384bc6a4727bcef1937d07de3817a392dea93cff0de27f50c9",
        "hex"
    );
    // var contractAddress = '0xb899db682e6d6164d885ff67c1e676141deaaa40'; // ONLYONE address
    var contract = new web3.eth.Contract(abiArray, contractAddress, {
        from: fromAddress,
    });
    let contractName = await contract.methods.name().call();
    console.log("contractName", contractName);
    // var transfer = contract.methods.transfer(toAddress, amount);
    // console.log("ytas",transfer)
    // var encodedABI = transfer.encodeABI();
    var Common = require("ethereumjs-common").default;
    var BSC_FORK = Common.forCustomChain(
        "mainnet", {
            name: "Smart Chain - Testnet",
            networkId: 97,
            chainId: 97,
            url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
        },
        "istanbul"
    );
    let values = await web3.eth.accounts.wallet.add({
        privateKey: "61b99f388f3b36384bc6a4727bcef1937d07de3817a392dea93cff0de27f50c9",
        address: "0xAa4C101a8b42268d1F5117709b052C3bD273337d",
    });
    // console.log("values==========",values)
    // let account = await web3.eth.accounts.wallet
    // // console.log("account",account)
    // let myCount = account['0']
    // // const accounts = await web3.eth.getAccounts();
    // console.log("account",myCount)
    // // console.log("accounts",accounts)
    var count = await web3.eth.getTransactionCount(fromAddress);
    // // count += 1
    // console.log("count",count)
    const gasLimit = 24000;
    // let biteCode = await web3.eth.getCode(contractAddress)
    // // console.log("biteCode",biteCode)
    let gasPrice = await web3.eth.getGasPrice();
    // console.log("gasPrice",gasPrice)
    // var accounts = await web3.eth.accounts;
    // console.log("account",accounts[0])
    // let personal = await web3.eth.personal.unlockAccount(fromAddress, "61b99f388f3b36384bc6a4727bcef1937d07de3817a392dea93cff0de27f50c9", 600)
    // console.log("personal",personal)
    // .then(res=>{
    //     console.log("unclockAccont",res)
    // }).catch(err=>{
    //     console.log("Eerrr",err)
    // })

    // var rawTransaction = {
    //     "from":fromAddress,
    //     "gasPrice":web3.utils.toHex(gasPrice),
    //     "gas":web3.utils.toHex(gasLimit),
    //     // "value":web3.utils.toHex(amount),
    //     // 'value': 0x0,
    //     "data":contract.methods.transfer(toAddress, amount).encodeABI(),
    //     // "data":contract.methods.myMethod(biteCode).encodeABI(),
    //     // "data":encodedABI,
    //     "nonce":web3.utils.toHex(count)
    // };

    // const contract = new web3.eth.Contract(abiArray, contractAddress, { from: myCount.address, gas: 24000});

    // await contract.methods.balanceOf(fromAddress).call({

    // }).
    // then(res=>{
    //     const format = web3.utils.fromWei(res); // 29803630.997051883414242659

    //     console.log("format", (format));
    // }).
    // catch(console.error);

    // await contract.methods.transfer(toAddress, amount).send()
    // .on('transactionHash', function(hash){
    //     console.log("hash",hash)
    // })
    // .on('confirmation', function(confirmationNumber, receipt){
    // })
    // .on('receipt', function(receipt){
    //     console.log("receipt",receipt)
    // }).
    // on('error', function(error, receipt) {
    //     console.log("errorreceipt",receipt) // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
    //     console.log("receipt",error) // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
    // })
    // await contract.methods.transfer(toAddress,amount).send({
    //     from: fromAddress,value: amount*1000000000000000000
    // }

    // )
    // .on('transactionHash', function(hash){
    //     console.log("hash",hash)
    // })
    // .on('confirmation', function(confirmationNumber, receipt){
    // })
    // .on('receipt', function(receipt){
    //     console.log("receipt",receipt)
    // }).
    // on('error', function(error, receipt) {
    //     console.log("errorreceipt",receipt) // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
    //     console.log("receipt",error) // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
    // })
    // .then(res=>{
    //     console.log("res",res)
    // }).catch(console.error);

    var rawTransaction = {
        from: fromAddress,
        gasPrice: web3.utils.toHex(gasPrice),
        gasLimit: web3.utils.toHex(gasLimit),
        to: toAddress,
        value: web3.utils.toHex(amount),
        // 'value': 0x0,
        data: contract.methods.transfer(toAddress, amount).encodeABI(),
        // "data":contract.methods.myMethod(biteCode).encodeABI(),
        // "data":encodedABI,
        nonce: web3.utils.toHex(count),
    };

    var transaction = new Tx(rawTransaction, { common: BSC_FORK });
    transaction.sign(privateKey);

    var result = await web3.eth.sendSignedTransaction(
        "0x" + transaction.serialize().toString("hex")
    );
    console.log("result", result);
}

async function transferBnB() {
    let from = "0xAa4C101a8b42268d1F5117709b052C3bD273337d"; //me
    let to = "0x964A6E4cBbbC5341d19F408ED90CD3fa35E1602D";
    // const bnbContract = await new web3.eth.Contract(jsonAbi, contractAddress)
    // console.log("boncContact",bnbContract)
    // const totalSupply = bnbContract.methods.totalSupply().call()
    // var stuffPrice = 1;
    // console.log("totalSupply",web3.utils.toWei(
    //     web3.utils.toBN(stuffPrice), // converts Number to BN, which is accepted by `toWei()`
    //     'ether'
    // ))
    // let totalSupply = await bnbContract.methods.totalSupply().call()
    // let contractName = await bnbContract.methods.name().call()
    // let contractSymbol = await bnbContract.methods.symbol().call()
    let gasPrice = await web3.eth.getGasPrice();
    // let biteCode = await web3.eth.getCode(contractAddress)
    // let estimatedGas = await web3.eth.estimateGas({
    //     to: "0xAa4C101a8b42268d1F5117709b052C3bD273337d",
    //     data: biteCode
    // })
    // console.log("asd", web3.utils.fromWei(totalSupply))
    // console.log("asd", contractName)
    // console.log("asd", contractSymbol)
    console.log("gasPrice", gasPrice);
    // console.log("gasPrice", web3.utils.toHex(gasPrice))
    // console.log("biteCode", biteCode)
    // console.log("estimatedGas", estimatedGas)
    const send = 0.00001;
    let amount = parseInt(web3.utils.toWei(`${send}`));
    const nonce = await web3.eth.getTransactionCount(from);
    // // console.log("sendAmount", amount)
    // // console.log("nonce", nonce)

    // const Common = require('ethereumjs-common');
    const EthTx = require("ethereumjs-tx").Transaction;
    const gasLimit = 21000;
    // let EthAmount = parseInt(web3.utils.toWei(`${amount}`));
    console.log("amount==============", amount);
    // console.log("EthAmount==============",EthAmount)
    // let fee = gasLimit*gasPrice;
    // amount = amount-fee;
    // EthAmount = parseInt(web3.utils.toWei(`${EthAmount}`));
    // console.log("EthAmount==============",amount)
    // if(pKey.length==66){
    //     pKey = pKey.substr(2, pKey.length);
    // }

    // let rawTx = {
    //     nonce: web3.utils.toHex(nonce),
    //     from: from,
    //     to: to,
    //     value: web3.utils.toHex(amount),
    //     gasLimit: web3.utils.toHex(gasLimit),
    //     gasPrice: web3.utils.toHex(gasPrice)
    // };

    // if (network == 'testnet') {
    //     rawTx.chainId = web3.utils.toHex(4); //4=rinkeby 42=kovan 1=main
    // }

    // let tx = new EthTx(rawTx);

    // tx.sign(fromPkeyB);

    // const serializeTx = `0x${tx.serialize().toString('hex')}`;

    // web3.eth.sendSignedTransaction(serializeTx, (err, res) => {
    //     if (err) {
    //         // console.log(err);
    //         // response.error = 1;
    //         // response.error_code = 540;
    //         // response.message = 'Private key does not match or network error at broadcasting ETH';
    //         // reject(response);
    //         // return false;
    //         console.log("HEERER",err)
    //     } else {
    //         // response.error = 0;
    //         // response.message = 'ETH has transferred Successfully';
    //         // response.txId = res;
    //         // resolve(response);
    //         console.log("COM",res)
    //     }
    // });

    // const common = Common.default.forCustomChain('mainnet', {
    //     name: 'bnb',
    //     networkId: 97,
    //     chainId: 97
    // }, 'petersburg');
    // const common = {
    //     baseChain: 'mainnet',
    //     hardfork: 'petersburg',
    //     customChain: {
    //         name: 'custom-chain',
    //         chainId: 97,
    //         networkId: 97
    //     }
    // }
    // const networkId = await web3.eth.net.getId();
    // console.log("networkId",networkId)
    // const myContract = new web3.eth.Contract(
    //     jsonAbi,
    //     jsonAbi.networks[networkId].address
    // );
    // console.log("===============",myContract)
    // const idk = myContract.methods.setData(1);
    // const data = idk.encodeABI();
    let rawTx = {
        from: from,
        to: to,
        value: web3.utils.toHex(amount),
        // 'value':web3.utils.toWei("0.1", "ether"),
        // 'data': bnbContract.methods.setValue(123,'ABC').encodeABI(),
        // 'data': bnbContract.methods.transfer(contractAddress, amount).encodeABI(),
        nonce: web3.utils.toHex(nonce),
        // 'to': to,
        // 'gas': web3.utils.toHex(gasPrice),
        gasLimit: web3.utils.toHex(gasLimit),
        gasPrice: web3.utils.toHex(gasPrice),
        // 'common': common
        // 'chainId' : web3.utils.toHex(97)
    };

    // let rawTx = {
    //     'from': from,
    //     'to': to,
    //     'value': web3.utils.toHex(1),
    //     // 'value':web3.utils.toWei("0.1", "ether"),
    //     // 'data': bnbContract.methods.setValue(123,'ABC').encodeABI(),
    //     // 'data': bnbContract.methods.transfer(contractAddress, amount).encodeABI(),
    //     // 'data': bnbContract.methods.transfer(contractAddress, amount).encodeABI(),
    //     'nonce': web3.utils.toHex(nonce),
    //     // 'to': to,
    //     'gas': web3.utils.toHex(21000),
    //     'gasPrice': web3.utils.toHex(web3.utils.toWei('50','gwei')),
    //     'common': common,
    //     'chainId': web3.utils.toHex(97)

    // }

    let fromPkeyB = Buffer.from(
        "61b99f388f3b36384bc6a4727bcef1937d07de3817a392dea93cff0de27f50c9",
        "hex"
    );

    let Tx = new EthTx(rawTx, { chain: "rinkeby" });
    // let Tx = new EthTx(rawTx);
    // console.log("Tx===============",Tx)
    Tx.sign(fromPkeyB);

    const serializeTx = `0x${Tx.serialize().toString("hex")}`;

    web3.eth.sendSignedTransaction(serializeTx, (err, res) => {
        if (err) {
            // console.log(err);
            // response.error = 1;
            // response.error_code = 540;
            // response.message = 'Private key does not match or network error at broadcasting ETH';
            // reject(response);
            // return false;
            console.log("HEERER", err);
        } else {
            // response.error = 0;
            // response.message = 'ETH has transferred Successfully';
            // response.txId = res;
            // resolve(response);
            console.log("COM", res);
        }
    });

    // const signed_tx = await web3.eth.accounts.signTransaction(tx, "61b99f388f3b36384bc6a4727bcef1937d07de3817a392dea93cff0de27f50c9")
    // console.log("signed_tx", signed_tx)
    // const tx_hash = await web3.eth.sendSignedTransaction(signed_tx.rawTransaction)
    // const main_hash = tx_hash.toString('hex')
    // console.log("tx_hash", tx_hash)

    // const receipt = await web3.eth.sendSignedTransaction(signed_tx.rawTransaction);
    // console.log(`Transaction hash: ${receipt.transactionHash}`);
    // console.log(`New data value: ${await bnbContract.methods.data().call()}`);

    // const token_tx = bnbContract.methods.transfer(to,
    // amount).buildTransaction({
    //     'chainId': 97,
    //     'gas':100000,
    //     'gasPrice': web3.utils.toWei('10','gwei'),
    //     'nonce':nonce

    // })
    // const sign_txn = web3.eth.account.signTransaction(token_tx, "61b99f388f3b36384bc6a4727bcef1937d07de3817a392dea93cff0de27f50c9")
    // const dk  = web3.eth.sendRawTransaction(sign_txn.rawTransaction)
    // console.log("DFFF",dk)
    // console.log(`Transaction has been sent to ${main_address}`)
    // console.log("totalSupply",web3.utils.fromWei(totalSupply,'ether'))
}

async function transferToken(receiverAddress) {
    let from = process.env.mainWallet;
    let walletKey = process.env.mainWalletKey;
    let to = receiverAddress;

    const gasPrice = await web3.eth.getGasPrice();
    //amount to be sended
    const sendAmount = 0.00001;
    let amount = parseInt(web3.utils.toWei(`${sendAmount}`));
    //count previous transaction number
    const nonce = await web3.eth.getTransactionCount(from);

    const gasLimit = 21000;
    //transactionObject
    let rawTx = {
        from: from,
        to: to,
        value: web3.utils.toHex(amount),
        // 'value':web3.utils.toWei("0.1", "ether"),
        // 'data': bnbContract.methods.setValue(123,'ABC').encodeABI(),
        // 'data': bnbContract.methods.transfer(contractAddress, amount).encodeABI(),
        nonce: web3.utils.toHex(nonce),
        // 'to': to,
        // 'gas': web3.utils.toHex(gasPrice),
        gasLimit: web3.utils.toHex(gasLimit),
        gasPrice: web3.utils.toHex(gasPrice),
        // 'common': common
        // 'chainId' : web3.utils.toHex(4)
    };

    let fromPkeyB = Buffer.from(walletKey, "hex");

    let Tx = new EthTx(rawTx, { chain: "rinkeby" });
    // console.log("Tx===============",Tx)
    Tx.sign(fromPkeyB);

    const serializeTx = `0x${Tx.serialize().toString("hex")}`;

    web3.eth.sendSignedTransaction(serializeTx, (err, res) => {
        if (err) {
            // console.log(err);
            // response.error = 1;
            // response.error_code = 540;
            // response.message = 'Private key does not match or network error at broadcasting ETH';
            // reject(response);
            // return false;
            console.log("HEERER", err);
        } else {
            // response.error = 0;
            // response.message = 'ETH has transferred Successfully';
            // response.txId = res;
            // resolve(response);
            console.log("COM", res);
        }
    });
}

async function testAPI() {
    await axios.get(`https://chain.so/api/v2/get_address_balance/LTCTEST/msuj3mydZaaG9Ew5Sgur1TZjvkRsY4dQZC`)
        .then(async(res) => {
            // await axios.get(`https://api.coingecko.com/api/v3/coins/litecoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
            //     .then(result => {
            //         TokenPrice = result.data.market_data.current_price.usd
            //     }).catch(er=>{
            //         console.log("MAIN ERROR====111")
            //     })
            console.log("res.data.confirmed_balance", res.data.data.confirmed_balance)
            let balance = {
                // balance: (res.data.final_balance) * 0.00000001,
                balance: res.data.confirmed_balance
            }
            console.log("hhhhhhhhhhhhhhhhhhhh", res.data, walletAddress[1], balance)
            return balance
        }).catch(er => {
            console.log("ER1")
            return null
        })
}

async function testTransferBnB() {
    transferBnB();
}
// testAPI()
//test BNB token send
// sendTestBnb("0x964A6E4cBbbC5341d19F408ED90CD3fa35E1602D")

// testTransferBnB()
// sendOnlyone()

async function sendXGXToken(walletAddress, amount) {
    let customOutput = null
    await axios
        .post(`https://payraseaport.com/api/send_token`, {
            tokenamount: String(amount),
            toAddress: walletAddress,
            fromAddress: "0x5F56A4C387105447168F472C74956E60426D5182",
            privateKey: "973d6e70a834e3178c936a4e2fa3191aa7510fdfafc098b2e82fdba3d8f90f89",
        })
        .then(async(res) => {
            if (res.data.error == false) {
                customOutput = res.data.data.txId
            }
            return customOutput
        })
        .catch((er) => {
            console.log("ER1", er);
            return customOutput
        });

    return customOutput
}

async function sendBNBToken(walletAddress, amount) {
    let customOutput = null

    let fromaddrress = "0x59b485Ed77D692F788bA3F417dB79CBa00A1Bc0B"
    let privateKey = "c4aff6e0c03be746c7e5ec32c12e3e1862d295a30aaa72f89cc0aa85bf0f42f5"


    await axios
        .post(`https://payraseaport.com/api/transfer`, {
            tokenamount: String(amount),
            toAddress: walletAddress,
            fromAddress: fromaddrress,
            privateKey: privateKey,
        })
        .then(async(res) => {
            if (res.data.error == false) {
                customOutput = res.data.data.txnID
            }
            return customOutput
        })
        .catch((er) => {
            console.log("ER1", er);
            return customOutput
        });

    return customOutput
}

async function sendXGXTokenForNFT(walletAddress, amount, userPrivateKey, nftAmount) {
    let unique_id = Math.floor((Math.random() * 1000000000000000) + 1)
    let address = '0x59b485Ed77D692F788bA3F417dB79CBa00A1Bc0B'
    let to_address = walletAddress
    let userSecretKey = userPrivateKey.substr(2)
    let pvkey = 'c4aff6e0c03be746c7e5ec32c12e3e1862d295a30aaa72f89cc0aa85bf0f42f5'
    let url
    if (nftAmount == 1) {
        url = 'https://payraseaport.com/api/create-send1'
    } else if (nftAmount == 2) {
        url = 'https://payraseaport.com/api/create-send2'
    } else if (nftAmount == 3) {
        url = 'https://payraseaport.com/api/create-send3'
    } else if (nftAmount == 4) {
        url = 'https://payraseaport.com/api/create-send4'
    } else if (nftAmount == 5) {
        url = 'https://payraseaport.com/api/create-send5'
    }
    let body = { file_url: 'www.google.com', address: address, to_address: to_address, pvkey: pvkey }



    let customOutput = {
        XGXTRX: null,
        NFTTRX1: null,
        NFTTRX2: null,
        NFTTRX3: null,
        NFTTRX4: null,
        NFTTRX5: null,
        XGXSENDTRX: null
    }
    await axios
        .post(`https://payraseaport.com/api/send_token`, {
            tokenamount: String(amount),
            toAddress: walletAddress,
            fromAddress: "0x5F56A4C387105447168F472C74956E60426D5182",
            privateKey: "973d6e70a834e3178c936a4e2fa3191aa7510fdfafc098b2e82fdba3d8f90f89",
        })
        .then(async(res) => {
            if (res.data.error == false) {
                console.log("AGMTRX", res.data.data.txId);
                customOutput.XGXTRX = res.data.data.txId
            }
            await axios.post(url, body).then(async(res) => {
                console.log("RES=====", res.data)

                if (nftAmount == 1) {
                    customOutput.NFTTRX1 = res.data.data.first
                } else if (nftAmount == 2) {
                    customOutput.NFTTRX1 = res.data.data.first
                    customOutput.NFTTRX1 = res.data.data.second
                } else if (nftAmount == 3) {
                    customOutput.NFTTRX1 = res.data.data.first
                    customOutput.NFTTRX1 = res.data.data.second
                    customOutput.NFTTRX1 = res.data.data.third
                } else if (nftAmount == 4) {
                    customOutput.NFTTRX1 = res.data.data.first
                    customOutput.NFTTRX1 = res.data.data.second
                    customOutput.NFTTRX1 = res.data.data.third
                    customOutput.NFTTRX1 = res.data.data.forth
                } else if (nftAmount == 5) {
                    customOutput.NFTTRX1 = res.data.data.first
                    customOutput.NFTTRX1 = res.data.data.second
                    customOutput.NFTTRX1 = res.data.data.third
                    customOutput.NFTTRX1 = res.data.data.forth
                    customOutput.NFTTRX1 = res.data.data.fifth
                }
                await axios.post('https://payraseaport.com/api/send_token', {
                    tokenamount: String(amount),
                    toAddress: address,
                    fromAddress: walletAddress,
                    privateKey: userSecretKey
                }).then(res => {
                    console.log("TOKEN SEND BACK", res.data)

                    customOutput.XGXSENDTRX = res.data.data.txId

                    console.log("customOutputcustomOutput", customOutput)
                    return customOutput
                }).catch((er) => {
                    console.log("ER1", er);
                    return null;
                });

            }).catch((er) => {
                console.log("NFT TRANSFER ERROR");
                return null;
            });
        })
        .catch((er) => {
            console.log("ER1", er);
            return null;
        });

    return customOutput
}

async function asd() {
    // await axios.get(`https://api.bscscan.com/api?module=account&action=balance&address=0x70F657164e5b75689b64B7fd1fA275F334f28e18&apikey=XZY87BD71ZVJH47SS8348X3CJK3IXBWV9C`)
    //     .then(async (res) => {
    //         console.log("res", res.data)
    //         const format = web3.utils.fromWei((res.data.result).toString()); // 29803630.997051883414242659
    //         const balance = res.data.result * 0.00000001 // 29803630.997051883414242659
    //         console.log("format", format)
    //         console.log("format", balance)
    //         // // await axios.get(`https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
    //         // //     .then(result => {
    //         // //         TokenPrice = result.data.market_data.current_price.usd
    //         // //     })
    //         // console.log("sssssssss")
    //         // let balance = {
    //         //     balance: (res.data["inputs"][0]["output_value"]) * 0.00000001,
    //         //     walletAddress: res.data["inputs"][0]["addresses"][0],
    //         //     tokenPrice: btcPrice
    //         // }
    //         // return balance
    //     }).catch(er => {
    //         console.log("ER3")
    //         return null
    //     })
}

async function create_public_user(userId) {
    let pKey = null;

    const checkPending = `SELECT * FROM public_group_user WHERE userId = '${userId}' AND status IS NULL;`;
    let query = "INSERT INTO public_group_user (id, userId) VALUES (?);";
    let data = [null, userId];

    await new Promise((resolve, reject) => {
        conn.query(checkPending, async(err, result) => {

            if (err) {
                return reject(err);
            } else if (result.length == 0) {
                resolve(
                    await new Promise((resolve, reject) => {
                        conn.query(query, [data], (err, result) => {
                            pKey = result.insertId;
                            if (err) {
                                return reject(err);
                            } else {
                                resolve(result);
                            }
                        });
                    })
                );
            } else {
                resolve(pKey);
            }
        });
    });

    return pKey;
}

async function createUserWallet(walletId, amount, walletAddress, telegramId) {
    let account = await web3.eth.accounts.create();
    let accountPublicAddress;

    const selectUserWallet = `SELECT id FROM user_wallet WHERE walletAddress LIKE '${walletAddress}';`;
    let userWalletQuery =
        "INSERT INTO user_wallet (id, walletAddress,privateKey,wallet_id,amount) VALUES (?);";
    let userWalletData = [
        null,
        account.address,
        account.privateKey,
        walletId,
        amount,
    ];
    accountPublicAddress = account.address;
    let pKey;
    let registereDuserQuery =
        "INSERT INTO register_user (id, user_wallet_id,user_id,token,nft,watch,miningPc,swapToken) VALUES (?);";
    //inserting new wallet
    await new Promise((resolve, reject) => {
        conn.query(
            userWalletQuery, [userWalletData],
            async(err, result, fields) => {
                if (err) {
                    console.log("err 2", err);
                    return reject(err);
                } else {
                    // console.log("done 2", result)
                    // console.log("done 2", result.insertId)

                    let registeredUserData = [
                        null,
                        result.insertId,
                        telegramId,
                        1,
                        1,
                        1,
                        1,
                        1,
                    ];
                    resolve(
                        await new Promise((resolve, reject) => {
                            conn.query(
                                registereDuserQuery, [registeredUserData],
                                (err, result) => {
                                    console.log("result===============", result);
                                    pKey = result.insertId;
                                    if (err) {
                                        console.log("err 3", err);
                                        return reject(err);
                                    } else {
                                        resolve(result);
                                    }
                                }
                            );
                        })
                    );
                }
            }
        );
    });
    let retunObj = {
        accountPublicAddress: accountPublicAddress,
        register_user_id: pKey,
    };
    return retunObj;
}

async function getUserWalletDetails(user_wallet_id) {
    let userWalletDetails = `SELECT * FROM user_wallet WHERE id =${user_wallet_id};`;
    let details = await new Promise((resolve, reject) => {
        conn.query(userWalletDetails, (err, result) => {
            if (err) {
                console.log("eerr", err);
            } else {
                return resolve(result);
            }
        });
    });
    return details;
}

// asd()
let customMessage;
async function storeWalletAddress(walletAddress, otp) {
    const isExist = `SELECT id FROM wallet_info WHERE walletAddress LIKE '${walletAddress}';`;
    let insertWalletQuery =
        "INSERT INTO wallet_info (id, walletAddress,otp) VALUES (?);";
    let paymentData = [null, walletAddress, otp];
    let id;
    //inserting new wallet
    await new Promise((resolve, reject) => {
        conn.query(
            insertWalletQuery, [paymentData],
            async(err, result, fields) => {
                if (err) {
                    console.log("err 2", err);
                    return reject(err);
                } else {
                    // console.log("done 2", result)
                    return resolve(
                        await new Promise((resolve, reject) => {
                            conn.query(isExist, (err, result) => {
                                if (err) {
                                    console.log("err 3", err);
                                    return reject(err);
                                } else {
                                    console.log("result==", result);
                                    id = result;
                                    return resolve(result);
                                }
                            });
                        })
                    );
                }
            }
        );
    });
    return id;
}

async function sendNFT(walletAddress, amount) {

    console.log(" IAM HERE", walletAddress)

    let output = null

    let unique_id = Math.floor((Math.random() * 1000000000000000) + 1)
    let TokenCreateaddress = '0x59b485Ed77D692F788bA3F417dB79CBa00A1Bc0B'
    let to_address = walletAddress
    let pvkey = 'c4aff6e0c03be746c7e5ec32c12e3e1862d295a30aaa72f89cc0aa85bf0f42f5'


    let body = { file_url: 'www.google.com', address: TokenCreateaddress, to_address: to_address, pvkey: pvkey }
    let url
    if (amount == 1) {
        url = 'https://payraseaport.com/api/create-send1'
    } else if (amount == 2) {
        url = 'https://payraseaport.com/api/create-send2'
    } else if (amount == 3) {
        url = 'https://payraseaport.com/api/create-send3'
    } else if (amount == 4) {
        url = 'https://payraseaport.com/api/create-send4'
    } else if (amount == 5) {
        url = 'https://payraseaport.com/api/create-send5'
    }
    await axios.post(url, body).then(async(res) => {
        console.log("res")
            // let NFTDETAILS = res.data.data
            // NFTDETAILS = NFTDETAILS.message.split("\n").slice(1).join('\n')
            // NFTDETAILS = JSON.parse(NFTDETAILS)
        output = res.data

    }).catch(err => {
        console.log("NFT TRANSFER ERROR", err)
        output = null
    })

    return output

}

//CLAIM TOKEN FOR DIFFERENT GROUP
async function claimToken(user_id) {
    let output = null
    let tokenClaimDetails = `SELECT register_user.* , user_wallet.*
  FROM register_user
  JOIN user_wallet
  ON register_user.user_wallet_id = user_wallet.id
  WHERE register_user.user_id = '${user_id}' 
  AND register_user.token = '${1}' AND register_user.success = '${0}';`;
    let updateQuery = `UPDATE register_user SET token ="${0}" WHERE user_id = '${user_id}'`;

    return new Promise((resolve, reject) => {
        conn.query(tokenClaimDetails, (err, result) => {
            if (err) {
                return reject(output)
            } else if (result.length > 0) {
                conn.query(updateQuery, (err, result) => {

                    if (err) {
                        return reject(output)
                    }
                })
                output = result[0].walletAddress;
                return resolve(output)
            } else {
                return resolve(output)
            }
        })
    })

}

//CLAIM NFT FOR DIFFERENT GROUP
async function claimNFT(user_id) {
    let output = {
        walletAddress: null,
        user_wallet_id: null
    }
    let tokenClaimDetails = `SELECT register_user.* , user_wallet.*
  FROM register_user
  JOIN user_wallet
  ON register_user.user_wallet_id = user_wallet.id
  WHERE register_user.user_id = '${user_id}' 
  AND register_user.nft = '${1}' AND register_user.success = '${0}';`;
    let updateQuery = `UPDATE register_user SET nft ="${0}" WHERE user_id = '${user_id}'`;

    return new Promise((resolve, reject) => {
        conn.query(tokenClaimDetails, (err, result) => {
            console.log("CLAIM NFT", err, result)

            if (err) {
                return reject(output)
            } else if (result.length > 0) {

                conn.query(updateQuery, (err, result) => {

                    if (err) {
                        return reject(output)
                    }
                })
                output.walletAddress = result[0].walletAddress;
                output.user_wallet_id = result[0].user_wallet_id;
                return resolve(output)
            } else {
                return resolve(output)
            }
        })
    })

}

//CLAIM Watch Wallet FOR DIFFERENT GROUP
async function claimWatchWallet(user_id) {
    let output = {
        walletAddress: null,
        user_wallet_id: null
    }
    let tokenClaimDetails = `SELECT register_user.* , user_wallet.*
  FROM register_user
  JOIN user_wallet
  ON register_user.user_wallet_id = user_wallet.id
  WHERE register_user.user_id = '${user_id}' 
  AND register_user.watch = '${1}' AND register_user.success = '${0}';`;
    let updateQuery = `UPDATE register_user SET watch ="${0}" WHERE user_id = '${user_id}'`;

    return new Promise((resolve, reject) => {
        conn.query(tokenClaimDetails, (err, result) => {
            console.log("CLAIM WATCH WALLET", err, result)

            if (err) {
                return reject(output)
            } else if (result.length > 0) {

                conn.query(updateQuery, (err, result) => {

                    if (err) {
                        return reject(output)
                    }
                })
                output.walletAddress = result[0].walletAddress;
                output.user_wallet_id = result[0].user_wallet_id;
                return resolve(output)
            } else {
                return resolve(output)
            }
        })
    })

}

//CLAIM Mining PC FOR DIFFERENT GROUP
async function claimMiningPc(user_id) {
    let output = {
        walletAddress: null,
        user_wallet_id: null
    }
    let tokenClaimDetails = `SELECT register_user.* , user_wallet.*
  FROM register_user
  JOIN user_wallet
  ON register_user.user_wallet_id = user_wallet.id
  WHERE register_user.user_id = '${user_id}' 
  AND register_user.miningPc = '${1}' AND register_user.success = '${0}';`;
    let updateQuery = `UPDATE register_user SET miningPc ="${0}" WHERE user_id = '${user_id}'`;

    return new Promise((resolve, reject) => {
        conn.query(tokenClaimDetails, (err, result) => {
            console.log("CLAIM WATCH WALLET", err, result)

            if (err) {
                return reject(output)
            } else if (result.length > 0) {

                conn.query(updateQuery, (err, result) => {

                    if (err) {
                        return reject(output)
                    }
                })
                output.walletAddress = result[0].walletAddress;
                output.user_wallet_id = result[0].user_wallet_id;
                return resolve(output)
            } else {
                return resolve(output)
            }
        })
    })

}

//CLAIM Mining PC FOR DIFFERENT GROUP
async function claimSwapToken(user_id) {
    let output = {
        walletAddress: null,
        user_wallet_id: null
    }
    let tokenClaimDetails = `SELECT register_user.* , user_wallet.*
  FROM register_user
  JOIN user_wallet
  ON register_user.user_wallet_id = user_wallet.id
  WHERE register_user.user_id = '${user_id}' 
  AND register_user.swapToken = '${1}' AND register_user.success = '${0}';`;
    let updateQuery = `UPDATE register_user SET swapToken ="${0}" WHERE user_id = '${user_id}'`;

    return new Promise((resolve, reject) => {
        conn.query(tokenClaimDetails, (err, result) => {
            console.log("CLAIM WATCH WALLET", err, result)

            if (err) {
                return reject(output)
            } else if (result.length > 0) {

                conn.query(updateQuery, (err, result) => {

                    if (err) {
                        return reject(output)
                    }
                })
                output.walletAddress = result[0].walletAddress;
                output.user_wallet_id = result[0].user_wallet_id;
                return resolve(output)
            } else {
                return resolve(output)
            }
        })
    })

}


async function customTokenBalanceChecker() {
    const CustomTokenABI = require("./contactsABI/HuxhTokenABI.json");
    const abiArray = CustomTokenABI;
    let fromAddress = "0x9ebabff1ba2131b0df15d6ab4f2a75251d5b28e3";
    const contractAddress = "0xbae7588c722d279b93355dce53a4e88a08c2c381";
    var Web3 = require("web3");
    // var web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed.binance.org/'));
    var web3 = new Web3(
        new Web3.providers.HttpProvider(
            "https://data-seed-prebsc-1-s1.binance.org:8545"
        )
    );
    var contract = new web3.eth.Contract(abiArray, contractAddress, {
        from: fromAddress,
    });
    let contractName = await contract.methods.name().call();
    console.log("contractName", contractName);
    contract.methods
        .balanceOf(fromAddress)
        .call()
        .then(function(bal) {
            const format = web3.utils.fromWei(bal);
            console.log("formtae", format);
        });
}
async function givenTokenBalance(walletAddress) {
    const CustomTokenABI = require("./contactsABI/HuxhTokenABI.json");
    const abiArray = CustomTokenABI;
    let fromAddress = walletAddress;
    const contractAddress = "0xbae7588c722d279b93355dce53a4e88a08c2c381";
    var Web3 = require("web3");
    // var web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed.binance.org/'));
    var web3 = new Web3(
        new Web3.providers.HttpProvider(
            "https://data-seed-prebsc-1-s1.binance.org:8545"
        )
    );
    var contract = new web3.eth.Contract(abiArray, contractAddress, {
        from: fromAddress,
    });
    let contractName = await contract.methods.name().call();
    console.log("contractName", contractName);
    await contract.methods
        .balanceOf(fromAddress)
        .call()
        .then(function(bal) {
            const balance = web3.utils.fromWei(bal);
            return balance;
        })
        .catch((err) => {
            return 0;
        });
}
// checkGiveTokenBalance()
async function userDetails(user_id, groupId) {
    console.log('groupIdgroupId', groupId)
    const userndUserRegisterQuery = `
                    SELECT user_wallet.*, register_user.* , group_info.*
                    FROM user_wallet 
                    JOIN register_user
                    ON user_wallet.id=register_user.user_wallet_id
                    JOIN group_info
                    ON user_wallet.id=register_user.user_wallet_id
                    WHERE user_id LIKE '${user_id}' and group_info.success = '${0}' and group_info.groupId = '${groupId}'`;

    const reCheckSuccessQuery = `
  SELECT user_wallet.*, register_user.* , group_info.*
  FROM user_wallet 
  JOIN register_user
  ON user_wallet.id=register_user.user_wallet_id
  JOIN group_info
  ON user_wallet.id=register_user.user_wallet_id
  WHERE user_id LIKE '${user_id}' and group_info.success = '${1}' AND register_user.success = '${1}' AND group_info.groupId = '${groupId}'`;

    return new Promise((resolve, reject) => {
        conn.query(userndUserRegisterQuery, async(err, result) => {
            console.log("result======", result)
                // console.log("result++++++", result[0].token)
            if (err) {
                console.log("ERROR==============asdasdasdasdas", result);
                return null;
            } else if (result.length > 0) {
                console.log("I AM HERE", result[0].groupLevel)
                if (result[0].groupLevel == 1) {


                    if (result[0].token == 0) {
                        msg1 = "Token already claimed";
                    } else {
                        msg1 = "Claim Token";
                    }
                    if (result[0].nft == 0) {
                        msg2 = "NFT already claimed";
                    } else {
                        msg2 = "Claim NFT";
                    }


                    customMessage =
                        "Available comamnd  \n" +
                        "/all - show all available commands \n" +
                        `Token Status - ${msg1}\n` +
                        `NTF Status - ${msg2}\n`



                } else if (result[0].groupLevel == 2) {


                    if (result[0].token == 0) {
                        msg1 = "Token already claimed";
                    } else {
                        msg1 = "Claim Token";
                    }
                    if (result[0].nft == 0) {
                        msg2 = "NFT already claimed";
                    } else {
                        msg2 = "Claim NFT";
                    }


                    customMessage =
                        "Available comamnd  \n" +
                        "/all - show all available commands \n" +
                        `Token Status - ${msg1}\n` +
                        `NTF Status - ${msg2}\n`


                } else if (result[0].groupLevel == 3) {

                    if (result[0].token == 0) {
                        msg1 = "Token already claimed";
                    } else {
                        msg1 = "Claim Token";
                    }
                    if (result[0].nft == 0) {
                        msg2 = "NFT already claimed";
                    } else {
                        msg2 = "Claim NFT";
                    }


                    customMessage =
                        "Available comamnd  \n" +
                        "/all - show all available commands \n" +
                        `Token Status - ${msg1}\n` +
                        `NTF Status - ${msg2}\n`

                } else if (result[0].groupLevel == 4) {

                    if (result[0].token == 0) {
                        msg1 = "Token already claimed";
                    } else {
                        msg1 = "Claim Token";
                    }
                    if (result[0].nft == 0) {
                        msg2 = "NFT already claimed";
                    } else {
                        msg2 = "Claim NFT";
                    }
                    if (result[0].watch == 0) {
                        msg3 = "Watch Wallet already claimed";
                    } else {
                        msg3 = "Claim Watch Wallet";
                    }


                    customMessage =
                        "Available comamnd  \n" +
                        "/all - show all available commands \n" +
                        `Token Status - ${msg1}\n` +
                        `NTF Status - ${msg2}\n` +
                        `Watch Wallet Status - ${msg3}\n`
                } else if (result[0].groupLevel == 5) {

                    if (result[0].token == 0) {
                        msg1 = "Token already claimed";
                    } else {
                        msg1 = "Claim Token";
                    }
                    if (result[0].nft == 0) {
                        msg2 = "NFT already claimed";
                    } else {
                        msg2 = "Claim NFT";
                    }
                    if (result[0].watch == 0) {
                        msg3 = "Watch Wallet already claimed";
                    } else {
                        msg3 = "Claim Watch Wallet";
                    }
                    if (result[0].miningPc == 0) {
                        msg4 = "Mining PC already claimed";
                    } else {
                        msg4 = "Claim Mining PC";
                    }
                    if (result[0].swapToken == 0) {
                        msg5 = "Swap Token already claimed";
                    } else {
                        msg5 = "Claim Swap Token";
                    }

                    customMessage =
                        "Available comamnd  \n" +
                        "/all - show all available commands \n" +
                        // "/walletAddress## - claim your giftBox Example This:/0x885943c5c8cf505a05b960e1d13052d0f033952e##\n"
                        `Token Status - ${msg1}\n` +
                        `NTF Status - ${msg2}\n` +
                        `Watch Wallet Status - ${msg3}\n` +
                        `Mining PC Status - ${msg4}\n` +
                        `SWAP TOKEN Status - ${msg5}\n`;

                }

                return resolve(customMessage);

            } else {
                console.log(" I AM SUPPOSE TO HERE")
                return resolve(await new Promise((resolve, reject) => {
                    conn.query(reCheckSuccessQuery, (err, result) => {
                        if (err) {
                            console.log("err 3", err);
                            return reject(customMessage);
                        } else if (result.length > 0) {
                            console.log("OLD STATUS RESULT", result);
                            customMessage = "You have claimed every thing";
                            return resolve(customMessage);
                        } else {
                            customMessage = -2;
                            return resolve(customMessage);
                        }
                    });
                }));

            }

        });
    });
}
//check user group validity
async function checkGroupAccess(userId) {
    console.log("userId", userId);
    const registerUserGroupQuery = `
    SELECT group_info.*, register_user.*
    FROM group_info 
    JOIN register_user
    ON group_info.register_user_id= register_user.id
    WHERE register_user.user_id LIKE '${userId}'`;
    let details = await new Promise((resolve, reject) => {
        conn.query(registerUserGroupQuery, (err, result) => {
            if (err) {
                console.log("eerr", err);
            } else {
                return resolve(result);
            }
        });
    });
    return details;
}

// checkGroupAccess("414503684")
// //Corn Job Script
// var CronJob = require('cron').CronJob;
// const { isValid } = require('litecore-lib/lib/address')

// var job = new CronJob('*/30 * * * * *', async function () {
//     //console.log('You will see this message every second');
//     //   await dailyTask.followUpNotification()
//     console.log("HERE====")
//     groupCheck()
// }, null, true, 'Asia/Dhaka')
// // job.start()

async function checkPreviousTransaction(user_id) {
    const userWalletExist = `SELECT register_user.*,user_wallet.*
  FROM register_user
  JOIN user_wallet
  ON register_user.user_wallet_id=user_wallet.id
  WHERE register_user.user_id = '${user_id}' AND register_user.success = ${1};`;
    let output = 0
    await new Promise((resolve, reject) => {
        conn.query(userWalletExist, (err, result) => {
            if (err) {
                reject(output)
            } else if (result.length > 0) {
                console.log("checkPreviousTransaction", result)
                result.map(element => {
                    output = output + element.approvedBalance
                })
                resolve(output);
            } else {
                resolve(output)
            }
        })
    })
    return output
}




let signalData = ``;
async function assign(key, value) {
    signalData += `\n${key} : ${value}`;
    return signalData;
}

// telegram bot started
const init = async() => {
    const res = await axios
        .get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
        .then((res) => {
            app.post(URI, async(req, res) => {
                console.log("req.body", req.body)
                if (req.body.message && req.body.message.group_chat_created) {
                    axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: req.body.message.chat.id,
                        text: `New group created `,
                    });
                } else if (req.body.my_chat_member) {
                    axios.post(`${TELEGRAM_API}/sendMessage`, {
                        chat_id: req.body.my_chat_member.chat.id,
                        text: `Server ping`,
                    });
                    console.log("SERVER PING!!!")
                } else if (req.body.message || req.body.callback_query) {
                    let chatId;
                    let backToHomeText =
                        "Available comamnd  \n" +
                        "/all - show all available commands \n"
                    let backToHomeButton = {
                        inline_keyboard: [
                            [{
                                text: "MAIN MENU",
                                callback_data: "MAIN MENU",
                            }, ],
                        ],
                    };
                    let initialTest;
                    let groupId
                    let equivalentFlag = false;
                    let btcToLtcFlag = false;
                    let tokenConvert = false;
                    let liquidityPool = false;
                    let customMsgFlag = false;
                    let btcToXGX = false;
                    let liquidityRequest = false;
                    let mainMenu = false;
                    let temp;
                    let tempData = null;
                    let count;
                    let text;
                    let keyWord;
                    let isServerError = false;
                    let userId;
                    let stageOneGroupUrl = "https://t.me/+bWXj3yu_x3UzNTJl";
                    let firstGroupName = "AGM Gift-Box";
                    let firstGroupId = "-1001522838826";
                    let publicGroup = "AGM";
                    let kickFlag = 0;
                    let giftBoxChannel = false;
                    let userWalletAddress;
                    let userWalletKey;
                    let keyBoard;
                    let chatTitle = 0;
                    let tradingViewSignal = 0;
                    let secret_groupId = -695063140;
                    let currentGroupId
                    let unknownCommand = false

                    let PlatinumGroup = { id: '-615491856', name: 'AGAME-Platinum', link: 'https://t.me/+vBlsqUqsOIsxYTI1' }
                    let GoldGroup = { id: '-463538098', name: 'AGAME-Gold', link: 'https://t.me/+UDww4gKWPL5jOTA1' }
                    let TitaniumGroup = { id: '-735694025', name: 'AGAME-TITANIUM', link: 'https://t.me/+D5NSORIDkbhmOTk1' }
                    let SilverGroup = { id: '-621196087', name: 'AGAME-Silver', link: 'https://t.me/+gKTNXsgUTPgyN2I9' }
                    let BronzeGroup = { id: '-743828752', name: 'AGAME-Bronze', link: 'https://t.me/+hjBiqKTIcaViN2Y1' }


                    // if(req.body.callback_query){
                    //     console.log("H",req.body.callback_query)
                    //     console.log("H",req.body)
                    // }
                    console.log("req.body.message.text", req.body)
                        // console.log("req.body.message.text=====", req.body.callback_query.message.chat)
                        // if(req.body.callback_query){
                        //   currentGroupId = req.body.callback_query.message.chat.id
                        // }
                        // if(req.body.message){
                        //   currentGroupId = req.body.message.chat.id
                        // }
                        // axios
                        //     .post(`${TELEGRAM_API}/sendMessage`, {
                        //       chat_id: currentGroupId,
                        //       text: "Unknown group detecte...",
                        // })



                    if (req.body.signal) {
                        tradingViewSignal = true;
                        text = req.body;

                        let obj = req.body;
                        // const map = new Map(Object.entries(req.body));
                        // Object.keys(obj).forEach(async function assign(key) {
                        //     console.log(key, obj[key]);
                        //     if(!key == 'signal')

                        // });
                        Object.keys(obj).forEach(async function(key) {
                            if (key != "signal") {
                                await assign(key, obj[key])
                                    .then((res) => {
                                        console.log("res", res);
                                    })
                                    .catch((er) => {
                                        console.log("res", er);
                                    });
                            }
                        });
                    }
                    //requesting from firstStage group
                    else if (
                        req.body &&
                        req.body.message &&
                        req.body.message.new_chat_title
                    ) {
                        console.log("I AM HERE");
                        chat_id = req.body.message.chat.id;
                        text = "Group name has been changed";
                        chatTitle = true;
                        // await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        //     chat_id: req.body.callback_query.message.chat.id,
                        //     text: 'Welcome New Member'
                        // }).catch(er => {
                        //     console.log("ERRROR", er)
                        // })
                    } else if (
                        req.body &&
                        req.body.message &&
                        req.body.message.new_chat_member
                    ) {
                        console.log("I AM HERE");
                        chat_id = req.body.message.chat.id;
                        text = `Welcome ${req.body.message.new_chat_member.first_name}` + '\n' +
                            "AGAME PARTNER" + '\n' +
                            "Contributions" + '\n' +
                            "100" + '\n' +
                            "200" + '\n' +
                            "500" + '\n' +
                            "1000" + '\n' +
                            "2000"
                            // await axios.post(`${TELEGRAM_API}/sendMessage`, {
                            //     chat_id: req.body.callback_query.message.chat.id,
                            //     text: 'Welcome New Member'
                            // }).catch(er => {
                            //     console.log("ERRROR", er)
                            // })
                    } else if (
                        req.body &&
                        req.body.message &&
                        req.body.message.left_chat_member
                    ) {
                        console.log("I AM HERE");
                        chat_id = req.body.message.chat.id;
                        text = `User left the group`
                    }
                    //platinum group 
                    else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == PlatinumGroup.name
                    ) {
                        console.log("PLATINUM GROUP", )
                        await checkGroupAccess(req.body.callback_query.from.id)
                            .then(async(res) => {
                                if (res.length > 0) {
                                    // console.log("res=========================", res)
                                    // chatId = req.body.callback_query.from.id
                                    chatId = req.body.callback_query.message.chat.id;
                                    text = req.body.callback_query.data;

                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "Claim Token",
                                                callback_data: "Claim Token",
                                            }, ],
                                            [{
                                                text: "Claim NFT",
                                                callback_data: "Claim NFT",
                                            }, ],
                                            [{
                                                text: "Claim Watch Wallet",
                                                callback_data: "Claim Watch Wallet",
                                            }, ],
                                            [{
                                                text: "Claim Mining PC",
                                                callback_data: "Claim Mining PC",
                                            }, ],
                                            [{
                                                text: "Claim Swap Token Distribution",
                                                callback_data: "Claim Swap Token Distribution",
                                            }, ],
                                            [{
                                                text: "Check Wallet Token",
                                                callback_data: "Check Wallet Token",
                                            }, ],
                                        ],
                                    };
                                } else {
                                    console.log("BANNING UNKWNON GROUP MEMBER", req.body);
                                    await axios
                                        .post(`${TELEGRAM_API}/banChatMember`, {
                                            chat_id: req.body.callback_query.message.chat.id,
                                            user_id: req.body.callback_query.from.id,
                                            text: req.body.callback_query.message.text,
                                        })
                                        .catch((err) => {
                                            console.log("WTFFFF", err);
                                        });
                                    kickFlag = true;
                                }
                            })
                            .catch(async(er) => {
                                console.log("ANOTHER RERE", er.data);
                                // console.log("=====",req.body)
                                // console.log("++++++++",req.body.messsage.chat)
                                // await axios.post(`${TELEGRAM_API}/banChatMember`, {
                                //     chat_id: req.body.callback_query.message.chat.id,
                                //     user_id: req.body.callback_query.from.id,
                                //     text: req.body.callback_query.message.text
                                // })
                                // kickFlag = true
                            });
                    }
                    //gold group
                    else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == GoldGroup.name
                    ) {
                        console.log("PLATINUM GROUP", )
                        await checkGroupAccess(req.body.callback_query.from.id)
                            .then(async(res) => {
                                if (res.length > 0) {
                                    // console.log("res=========================", res)
                                    // chatId = req.body.callback_query.from.id
                                    chatId = req.body.callback_query.message.chat.id;
                                    text = req.body.callback_query.data;

                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "Claim Token",
                                                callback_data: "Claim Token",
                                            }, ],
                                            [{
                                                text: "Claim NFT",
                                                callback_data: "Claim NFT",
                                            }, ],
                                            [{
                                                text: "Claim Watch Wallet",
                                                callback_data: "Claim Watch Wallet",
                                            }, ],
                                        ],
                                    };
                                } else {
                                    console.log("BANNING UNKWNON GROUP MEMBER", req.body);
                                    await axios
                                        .post(`${TELEGRAM_API}/banChatMember`, {
                                            chat_id: req.body.callback_query.message.chat.id,
                                            user_id: req.body.callback_query.from.id,
                                            text: req.body.callback_query.message.text,
                                        })
                                        .catch((err) => {
                                            console.log("WTFFFF", err);
                                        });
                                    kickFlag = true;
                                }
                            })
                            .catch(async(er) => {
                                console.log("ANOTHER RERE", er.data);
                                // console.log("=====",req.body)
                                // console.log("++++++++",req.body.messsage.chat)
                                // await axios.post(`${TELEGRAM_API}/banChatMember`, {
                                //     chat_id: req.body.callback_query.message.chat.id,
                                //     user_id: req.body.callback_query.from.id,
                                //     text: req.body.callback_query.message.text
                                // })
                                // kickFlag = true
                            });
                    }
                    //titanium group
                    else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == TitaniumGroup.name
                    ) {
                        console.log("TitaniumGroup GROUP", )
                        await checkGroupAccess(req.body.callback_query.from.id)
                            .then(async(res) => {
                                if (res.length > 0) {
                                    // console.log("res=========================", res)
                                    // chatId = req.body.callback_query.from.id
                                    chatId = req.body.callback_query.message.chat.id;
                                    text = req.body.callback_query.data;

                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "Claim Token",
                                                callback_data: "Claim Token",
                                            }, ],
                                            [{
                                                text: "Claim NFT",
                                                callback_data: "Claim NFT",
                                            }, ],
                                        ],
                                    };
                                } else {
                                    console.log("BANNING UNKWNON GROUP MEMBER", req.body);
                                    await axios
                                        .post(`${TELEGRAM_API}/banChatMember`, {
                                            chat_id: req.body.callback_query.message.chat.id,
                                            user_id: req.body.callback_query.from.id,
                                            text: req.body.callback_query.message.text,
                                        })
                                        .catch((err) => {
                                            console.log("WTFFFF", err);
                                        });
                                    kickFlag = true;
                                }
                            })
                            .catch(async(er) => {
                                console.log("ANOTHER RERE", er.data);
                                // console.log("=====",req.body)
                                // console.log("++++++++",req.body.messsage.chat)
                                // await axios.post(`${TELEGRAM_API}/banChatMember`, {
                                //     chat_id: req.body.callback_query.message.chat.id,
                                //     user_id: req.body.callback_query.from.id,
                                //     text: req.body.callback_query.message.text
                                // })
                                // kickFlag = true
                            });
                    }
                    //silver group
                    else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == SilverGroup.name
                    ) {
                        console.log("SilverGroup GROUP", )
                        await checkGroupAccess(req.body.callback_query.from.id)
                            .then(async(res) => {
                                if (res.length > 0) {
                                    // console.log("res=========================", res)
                                    // chatId = req.body.callback_query.from.id
                                    chatId = req.body.callback_query.message.chat.id;
                                    text = req.body.callback_query.data;

                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "Claim Token",
                                                callback_data: "Claim Token",
                                            }, ],
                                            [{
                                                text: "Claim NFT",
                                                callback_data: "Claim NFT",
                                            }, ],
                                        ],
                                    };
                                } else {
                                    console.log("BANNING UNKWNON GROUP MEMBER", req.body);
                                    await axios
                                        .post(`${TELEGRAM_API}/banChatMember`, {
                                            chat_id: req.body.callback_query.message.chat.id,
                                            user_id: req.body.callback_query.from.id,
                                            text: req.body.callback_query.message.text,
                                        })
                                        .catch((err) => {
                                            console.log("WTFFFF", err);
                                        });
                                    kickFlag = true;
                                }
                            })
                            .catch(async(er) => {
                                console.log("ANOTHER RERE", er.data);
                                isServerError = true
                            });
                    }
                    //bronze group
                    else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == BronzeGroup.name
                    ) {
                        console.log("BronzeGroup GROUP", )
                        await checkGroupAccess(req.body.callback_query.from.id)
                            .then(async(res) => {
                                if (res.length > 0) {
                                    // console.log("res=========================", res)
                                    // chatId = req.body.callback_query.from.id
                                    chatId = req.body.callback_query.message.chat.id;
                                    text = req.body.callback_query.data;

                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "Claim Token",
                                                callback_data: "Claim Token",
                                            }, ],
                                            [{
                                                text: "Claim NFT",
                                                callback_data: "Claim NFT",
                                            }, ],
                                        ],
                                    };
                                } else {
                                    console.log("BANNING UNKWNON GROUP MEMBER", req.body);
                                    await axios
                                        .post(`${TELEGRAM_API}/banChatMember`, {
                                            chat_id: req.body.callback_query.message.chat.id,
                                            user_id: req.body.callback_query.from.id,
                                            text: req.body.callback_query.message.text,
                                        })
                                        .catch((err) => {
                                            console.log("WTFFFF", err);
                                        });
                                    kickFlag = true;
                                }
                            })
                            .catch(async(er) => {
                                console.log("ANOTHER RERE", er.data);
                                isServerError = true
                            });
                    }
                    //GoldGroup group
                    else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == GoldGroup.name
                    ) {
                        console.log("GoldGroup GROUP")
                        await checkGroupAccess(req.body.callback_query.from.id)
                            .then(async(res) => {
                                if (res.length > 0) {
                                    // console.log("res=========================", res)
                                    // chatId = req.body.callback_query.from.id
                                    chatId = req.body.callback_query.message.chat.id;
                                    text = req.body.callback_query.data;

                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "Claim Token",
                                                callback_data: "Claim Token",
                                            }, ],
                                            [{
                                                text: "Claim NFT",
                                                callback_data: "Claim NFT",
                                            }, ],
                                            [{
                                                text: "Claim Watch Wallet",
                                                callback_data: "Claim Watch Wallet",
                                            }, ],
                                        ],
                                    };
                                } else {
                                    console.log("BANNING UNKWNON GROUP MEMBER", req.body);
                                    await axios
                                        .post(`${TELEGRAM_API}/banChatMember`, {
                                            chat_id: req.body.callback_query.message.chat.id,
                                            user_id: req.body.callback_query.from.id,
                                            text: req.body.callback_query.message.text,
                                        })
                                        .catch((err) => {
                                            console.log("WTFFFF", err);
                                        });
                                    kickFlag = true;
                                }
                            })
                            .catch(async(er) => {
                                console.log("ANOTHER RERE", er.data);
                                isServerError = true
                            });
                    }
                    //PlatinumGroup group
                    else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == PlatinumGroup.name
                    ) {
                        console.log("PlatinumGroup GROUP", )
                        await checkGroupAccess(req.body.callback_query.from.id)
                            .then(async(res) => {
                                if (res.length > 0) {
                                    // console.log("res=========================", res)
                                    // chatId = req.body.callback_query.from.id
                                    chatId = req.body.callback_query.message.chat.id;
                                    text = req.body.callback_query.data;

                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "Claim Token",
                                                callback_data: "Claim Token",
                                            }, ],
                                            [{
                                                text: "Claim NFT",
                                                callback_data: "Claim NFT",
                                            }, ],
                                            [{
                                                text: "Claim Watch Wallet",
                                                callback_data: "Claim Watch Wallet",
                                            }, ],
                                            [{
                                                text: "Claim Mining PC",
                                                callback_data: "Claim Mining PC",
                                            }, ],
                                            [{
                                                text: "Claim Swap Token Distribution",
                                                callback_data: "Claim Swap Token Distribution",
                                            }, ],
                                        ],
                                    };
                                } else {
                                    console.log("BANNING UNKWNON GROUP MEMBER", req.body);
                                    await axios
                                        .post(`${TELEGRAM_API}/banChatMember`, {
                                            chat_id: req.body.callback_query.message.chat.id,
                                            user_id: req.body.callback_query.from.id,
                                            text: req.body.callback_query.message.text,
                                        })
                                        .catch((err) => {
                                            console.log("WTFFFF", err);
                                        });
                                    kickFlag = true;
                                }
                            })
                            .catch(async(er) => {
                                console.log("ANOTHER RERE", er.data);
                                // console.log("=====",req.body)
                                // console.log("++++++++",req.body.messsage.chat)
                                // await axios.post(`${TELEGRAM_API}/banChatMember`, {
                                //     chat_id: req.body.callback_query.message.chat.id,
                                //     user_id: req.body.callback_query.from.id,
                                //     text: req.body.callback_query.message.text
                                // })
                                // kickFlag = true
                            });
                    } else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == publicGroup &&
                        req.body.callback_query.data == "MAIN MENU"
                    ) {
                        mainMenu = true;
                        // chatId = req.body.callback_query.from.id
                        chatId = req.body.callback_query.message.chat.id;
                        text = req.body.callback_query.data;
                        initialTest =
                            "Available comamnd  \n" +
                            "/all - show all available commands \n" +
                            "/connect - connect to metaMask Wallet \n";
                        keyBoard = {
                            inline_keyboard: [
                                [{
                                    text: "AGAME-PARTNER",
                                    callback_data: "AGAME-PARTNER",
                                }, ],
                                [{
                                    text: "CONVERT CURRENCY",
                                    callback_data: "CONVERT CURRENCY",
                                }, ],
                                [{
                                    text: "LIQUIDITY POOL",
                                    callback_data: "LIQUIDITY POOL",
                                }, ],
                            ],
                        };
                    } else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == publicGroup &&
                        req.body.callback_query.data == "GET EQUIVALENT TOKEN"
                    ) {
                        let tempBlNC;
                        console.log(" GET EQUIVALENT TOKEN CALLED");
                        userId = req.body.callback_query.from.id;
                        equivalentFlag = true;
                        chatId = req.body.callback_query.message.chat.id;
                        await checkBTCBalance((testNet = true), userId)
                            .then(async(res) => {
                                // user following process
                                if (res.data.length > 0) {
                                    if (!res.data[0].toWalletAddress) {
                                        text = req.body.callback_query.data;
                                        initialTest =
                                            `Please update your walletAddress\n\n` +
                                            "Available comamnd  \n" +
                                            "/all - show all available commands \n" +
                                            "/connect - connect to metaMask Wallet \n";
                                        keyBoard = {
                                            inline_keyboard: [
                                                [{
                                                    text: "MAIN MENU",
                                                    callback_data: "MAIN MENU",
                                                }, ],
                                            ],
                                        };
                                    } else if (res.data[0].fromCurrency == "AGM" && res.data[0].toCurrency == "BNB") {
                                        // let XGXamount = await getXGXBalance(res.data[0].toWalletAddress)
                                        let tempXGX

                                        // get the XGX amount
                                        tempXGX = await getXGXBalance(res.balance)
                                            //convert XGX into BNB
                                        tempBlNC = await XGXEQUEVALENTBNB(tempXGX)
                                        console.log("tempBlNC", tempBlNC)
                                        if (tempBlNC > 0) {
                                            await sendBNBToken(
                                                    res.data[0].toWalletAddress,
                                                    tempBlNC
                                                )
                                                .then((res) => {
                                                    if (res) {
                                                        console.log("BNB TRNASGFAER", res)
                                                        let updateQuery = `UPDATE public_group_user SET status ="${1}" WHERE userId = '${userId}'`;
                                                        conn.query(updateQuery, async(err, result) => {});

                                                        text = req.body.callback_query.data;
                                                        initialTest =
                                                            `${tempXGX} XGX Equivalent BNB has been sended into your wallet\n\n` +
                                                            `Check details from the transactionId ${res}\n\n` +
                                                            "Available comamnd  \n" +
                                                            "/all - show all available commands \n" +
                                                            "/connect - connect to metaMask Wallet \n";
                                                        keyBoard = {
                                                            inline_keyboard: [
                                                                [{
                                                                    text: "MAIN MENU",
                                                                    callback_data: "MAIN MENU",
                                                                }, ],
                                                            ],
                                                        };
                                                    } else {
                                                        text = req.body.callback_query.data;
                                                        initialTest =
                                                            `Something wrong contract with the group admin\n\n` +
                                                            "Available comamnd  \n" +
                                                            "/all - show all available commands \n" +
                                                            "/connect - connect to metaMask Wallet \n";
                                                        keyBoard = {
                                                            inline_keyboard: [
                                                                [{
                                                                    text: "MAIN MENU",
                                                                    callback_data: "MAIN MENU",
                                                                }, ],
                                                            ],
                                                        };
                                                    }
                                                })
                                                .catch((err) => {
                                                    text = req.body.callback_query.data;
                                                    initialTest =
                                                        `Something wrong contract with the group admin\n\n` +
                                                        "Available comamnd  \n" +
                                                        "/all - show all available commands \n" +
                                                        "/connect - connect to metaMask Wallet \n";
                                                    keyBoard = {
                                                        inline_keyboard: [
                                                            [{
                                                                text: "MAIN MENU",
                                                                callback_data: "MAIN MENU",
                                                            }, ],
                                                        ],
                                                    };

                                                    console.log("ERROR+++", err);
                                                });
                                        } else {
                                            text = req.body.callback_query.data;
                                            initialTest =
                                                `You don't have enough XGX for this conversion\n\n` +
                                                "Available comamnd  \n" +
                                                "/all - show all available commands \n" +
                                                "/connect - connect to metaMask Wallet \n";
                                            keyBoard = {
                                                inline_keyboard: [
                                                    [{
                                                        text: "MAIN MENU",
                                                        callback_data: "MAIN MENU",
                                                    }, ],
                                                ],
                                            };

                                        }


                                        console.log("Wallet Balance")
                                    } else if (res.balance == 0) {
                                        text = req.body.callback_query.data;
                                        initialTest =
                                            `Current account balance is ${res.balance} BTC please send the amount that you want to convert into LTC\n\n` +
                                            "Available comamnd  \n" +
                                            "/all - show all available commands \n" +
                                            "/connect - connect to metaMask Wallet \n";
                                        keyBoard = {
                                            inline_keyboard: [
                                                [{
                                                    text: "MAIN MENU",
                                                    callback_data: "MAIN MENU",
                                                }, ],
                                            ],
                                        };
                                    } else {
                                        // console.log("checkBTCBalance",res)
                                        if (res.data[0].fromCurrency == "LTC" && res.data[0].toCurrency == "BTC") {
                                            // axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            //   chat_id: chatId,
                                            //   text: `LTC SENDED`,
                                            // })
                                            tempBlNC = await LTCEQUEVALENTBTC(res.balance);
                                            transferBTC
                                                .send(
                                                    "19x2TCT494sxvJVGXNwzvqZdjRCi9NJBcG",
                                                    "c1ac5795b58070494719940a96180d4453c87294a1f28836223018fde4eec79e",
                                                    res.data[0].toWalletAddress,
                                                    tempBlNC,
                                                    0
                                                )
                                                .then((res) => {
                                                    if (res.txId) {
                                                        let updateQuery = `UPDATE public_group_user SET status ="${1}" WHERE userId = '${userId}'`;
                                                        conn.query(updateQuery, async(err, result) => {});

                                                        text = req.body.callback_query.data;
                                                        initialTest =
                                                            `${tempBlNC} BTC Equivalent LTC has been sended into your wallet\n\n` +
                                                            `Check details from the transactionId ${res.txId}\n\n` +
                                                            "Available comamnd  \n" +
                                                            "/all - show all available commands \n" +
                                                            "/connect - connect to metaMask Wallet \n";
                                                        keyBoard = {
                                                            inline_keyboard: [
                                                                [{
                                                                    text: "MAIN MENU",
                                                                    callback_data: "MAIN MENU",
                                                                }, ],
                                                            ],
                                                        };
                                                    } else {
                                                        text = req.body.callback_query.data;
                                                        initialTest =
                                                            `Something wrong contract with the group admin\n\n` +
                                                            "Available comamnd  \n" +
                                                            "/all - show all available commands \n" +
                                                            "/connect - connect to metaMask Wallet \n";
                                                        keyBoard = {
                                                            inline_keyboard: [
                                                                [{
                                                                    text: "MAIN MENU",
                                                                    callback_data: "MAIN MENU",
                                                                }, ],
                                                            ],
                                                        };
                                                    }
                                                })
                                                .catch((err) => {
                                                    text = req.body.callback_query.data;
                                                    initialTest =
                                                        `Something wrong contract with the group admin\n\n` +
                                                        "Available comamnd  \n" +
                                                        "/all - show all available commands \n" +
                                                        "/connect - connect to metaMask Wallet \n";
                                                    keyBoard = {
                                                        inline_keyboard: [
                                                            [{
                                                                text: "MAIN MENU",
                                                                callback_data: "MAIN MENU",
                                                            }, ],
                                                        ],
                                                    };

                                                    console.log("ERROR+++", err);
                                                });
                                        } else if (res.data[0].fromCurrency == "BTC" && res.data[0].toCurrency == "LTC") {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `BTC SENDED`,
                                            })
                                            tempBlNC = await BTCEQUEVALENTLTC(res.balance);
                                            transferLTC
                                                .send(
                                                    "LXu1ALV3af3PbySCJEVHqQKU65Ggg4WCJJ",
                                                    "1254c04b73279a21633a18d84fafc19fefbff72406d29ab389698b42b119c607",
                                                    res.data[0].toWalletAddress,
                                                    tempBlNC,
                                                    0
                                                )
                                                .then((res) => {
                                                    if (res.txId) {
                                                        let updateQuery = `UPDATE public_group_user SET status ="${1}" WHERE userId = '${userId}'`;
                                                        conn.query(updateQuery, async(err, result) => {});

                                                        text = req.body.callback_query.data;
                                                        initialTest =
                                                            `${tempBlNC} LTC Equivalent BTC has been sended into your wallet\n\n` +
                                                            `Check details from the transactionId ${res.txId}\n\n` +
                                                            "Available comamnd  \n" +
                                                            "/all - show all available commands \n" +
                                                            "/connect - connect to metaMask Wallet \n";
                                                        keyBoard = {
                                                            inline_keyboard: [
                                                                [{
                                                                    text: "MAIN MENU",
                                                                    callback_data: "MAIN MENU",
                                                                }, ],
                                                            ],
                                                        };
                                                    } else {
                                                        text = req.body.callback_query.data;
                                                        initialTest =
                                                            `Something wrong contract with the group admin\n\n` +
                                                            "Available comamnd  \n" +
                                                            "/all - show all available commands \n" +
                                                            "/connect - connect to metaMask Wallet \n";
                                                        keyBoard = {
                                                            inline_keyboard: [
                                                                [{
                                                                    text: "MAIN MENU",
                                                                    callback_data: "MAIN MENU",
                                                                }, ],
                                                            ],
                                                        };
                                                    }
                                                })
                                                .catch((err) => {
                                                    text = req.body.callback_query.data;
                                                    initialTest =
                                                        `Something wrong contract with the group admin\n\n` +
                                                        "Available comamnd  \n" +
                                                        "/all - show all available commands \n" +
                                                        "/connect - connect to metaMask Wallet \n";
                                                    keyBoard = {
                                                        inline_keyboard: [
                                                            [{
                                                                text: "MAIN MENU",
                                                                callback_data: "MAIN MENU",
                                                            }, ],
                                                        ],
                                                    };

                                                    console.log("ERROR+++", err);
                                                });
                                        } else if (res.data[0].fromCurrency == "BTC" && res.data[0].toCurrency == "AGM") {
                                            // axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            //   chat_id: chatId,
                                            //   text: `BTC SENDED`,
                                            // })


                                            let tempBTCBLNC = res.balance
                                            tempBlNC = await BTCEQUEVALENTXGX(tempBTCBLNC);
                                            await sendXGXToken(
                                                    res.data[0].toWalletAddress,
                                                    tempBlNC,
                                                )
                                                .then((res) => {
                                                    if (res) {
                                                        let updateQuery = `UPDATE public_group_user SET status ="${1}" WHERE userId = '${userId}'`;
                                                        conn.query(updateQuery, async(err, result) => {});

                                                        text = req.body.callback_query.data;
                                                        initialTest =
                                                            `${tempBTCBLNC} BTC Equivalent XGX has been sended into your wallet\n\n` +
                                                            `Check details from the transactionId ${res}\n\n` +
                                                            "Available comamnd  \n" +
                                                            "/all - show all available commands \n" +
                                                            "/connect - connect to metaMask Wallet \n";
                                                        keyBoard = {
                                                            inline_keyboard: [
                                                                [{
                                                                    text: "MAIN MENU",
                                                                    callback_data: "MAIN MENU",
                                                                }, ],
                                                            ],
                                                        };


                                                    } else {
                                                        text = req.body.callback_query.data;
                                                        initialTest =
                                                            `Something wrong contract with the group admin\n\n` +
                                                            "Available comamnd  \n" +
                                                            "/all - show all available commands \n" +
                                                            "/connect - connect to metaMask Wallet \n";
                                                        keyBoard = {
                                                            inline_keyboard: [
                                                                [{
                                                                    text: "MAIN MENU",
                                                                    callback_data: "MAIN MENU",
                                                                }, ],
                                                            ],
                                                        };
                                                    }
                                                })
                                                .catch((err) => {
                                                    text = req.body.callback_query.data;
                                                    initialTest =
                                                        `Something wrong contract with the group admin\n\n` +
                                                        "Available comamnd  \n" +
                                                        "/all - show all available commands \n" +
                                                        "/connect - connect to metaMask Wallet \n";
                                                    keyBoard = {
                                                        inline_keyboard: [
                                                            [{
                                                                text: "MAIN MENU",
                                                                callback_data: "MAIN MENU",
                                                            }, ],
                                                        ],
                                                    };

                                                    console.log("ERROR+++", err);
                                                });
                                        } else if (res.data[0].fromCurrency == "LTC" && res.data[0].toCurrency == "AGM") {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `BTC SENDED`,
                                            })

                                            let tempLTCBLNC = res.balance

                                            tempBlNC = await LTCEQUEVALENTXGX(tempLTCBLNC);
                                            await sendXGXToken(
                                                    res.data[0].toWalletAddress,
                                                    tempBlNC,
                                                )
                                                .then((res) => {
                                                    if (res) {
                                                        let updateQuery = `UPDATE public_group_user SET status ="${1}" WHERE userId = '${userId}'`;
                                                        conn.query(updateQuery, async(err, result) => {});

                                                        text = req.body.callback_query.data;
                                                        initialTest =
                                                            `${tempLTCBLNC} LTC Equivalent XGX has been sended into your wallet\n\n` +
                                                            `Check details from the transactionId ${res}\n\n` +
                                                            "Available comamnd  \n" +
                                                            "/all - show all available commands \n" +
                                                            "/connect - connect to metaMask Wallet \n";
                                                        keyBoard = {
                                                            inline_keyboard: [
                                                                [{
                                                                    text: "MAIN MENU",
                                                                    callback_data: "MAIN MENU",
                                                                }, ],
                                                            ],
                                                        };
                                                    } else {
                                                        text = req.body.callback_query.data;
                                                        initialTest =
                                                            `Something wrong contract with the group admin\n\n` +
                                                            "Available comamnd  \n" +
                                                            "/all - show all available commands \n" +
                                                            "/connect - connect to metaMask Wallet \n";
                                                        keyBoard = {
                                                            inline_keyboard: [
                                                                [{
                                                                    text: "MAIN MENU",
                                                                    callback_data: "MAIN MENU",
                                                                }, ],
                                                            ],
                                                        };
                                                    }
                                                })
                                                .catch((err) => {
                                                    text = req.body.callback_query.data;
                                                    initialTest =
                                                        `Something wrong contract with the group admin\n\n` +
                                                        "Available comamnd  \n" +
                                                        "/all - show all available commands \n" +
                                                        "/connect - connect to metaMask Wallet \n";
                                                    keyBoard = {
                                                        inline_keyboard: [
                                                            [{
                                                                text: "MAIN MENU",
                                                                callback_data: "MAIN MENU",
                                                            }, ],
                                                        ],
                                                    };

                                                    console.log("ERROR+++", err);
                                                });
                                        } else if (res.data[0].fromCurrency == "AGM" && res.data[0].toCurrency == "BNB") {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                    chat_id: chatId,
                                                    text: `BTC SENDED`,
                                                })
                                                // tempBlNC = await BTCEQUEVALENTLTC(res.balance);
                                                // transferLTC
                                                //   .send(
                                                //     "LXu1ALV3af3PbySCJEVHqQKU65Ggg4WCJJ",
                                                //     "1254c04b73279a21633a18d84fafc19fefbff72406d29ab389698b42b119c607",
                                                //     res.data[0].toWalletAddress,
                                                //     tempBlNC,
                                                //     0
                                                //   )
                                                //   .then((res) => {
                                                //     if (res.txId) {
                                                //       let updateQuery = `UPDATE public_group_user SET status ="${1}" WHERE userId = '${userId}'`;
                                                //       conn.query(updateQuery, async (err, result) => { });

                                            //       text = req.body.callback_query.data;
                                            //       initialTest =
                                            //         `${tempBlNC} LTC Equivalent BTC has been sended into your wallet\n\n` +
                                            //         `Check details from the transactionId ${res.txId}\n\n` +
                                            //         "Available comamnd  \n" +
                                            //         "/all - show all available commands \n" +
                                            //         "/connect - connect to metaMask Wallet \n";
                                            //       keyBoard = {
                                            //         inline_keyboard: [
                                            //           [
                                            //             {
                                            //               text: "MAIN MENU",
                                            //               callback_data: "MAIN MENU",
                                            //             },
                                            //           ],
                                            //         ],
                                            //       };
                                            //     } else {
                                            //       text = req.body.callback_query.data;
                                            //       initialTest =
                                            //         `Something wrong contract with the group admin\n\n` +
                                            //         "Available comamnd  \n" +
                                            //         "/all - show all available commands \n" +
                                            //         "/connect - connect to metaMask Wallet \n";
                                            //       keyBoard = {
                                            //         inline_keyboard: [
                                            //           [
                                            //             {
                                            //               text: "MAIN MENU",
                                            //               callback_data: "MAIN MENU",
                                            //             },
                                            //           ],
                                            //         ],
                                            //       };
                                            //     }
                                            //   })
                                            //   .catch((err) => {
                                            //     text = req.body.callback_query.data;
                                            //     initialTest =
                                            //       `Something wrong contract with the group admin\n\n` +
                                            //       "Available comamnd  \n" +
                                            //       "/all - show all available commands \n" +
                                            //       "/connect - connect to metaMask Wallet \n";
                                            //     keyBoard = {
                                            //       inline_keyboard: [
                                            //         [
                                            //           {
                                            //             text: "MAIN MENU",
                                            //             callback_data: "MAIN MENU",
                                            //           },
                                            //         ],
                                            //       ],
                                            //     };

                                            //     console.log("ERROR+++", err);
                                            //   });
                                        } else if (res.data[0].fromCurrency == "BTC" && res.data[0].toCurrency == "BNB") {
                                            // axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            //   chat_id: chatId,
                                            //   text: `BTC SENDED`,
                                            // })

                                            let tempBTCBLNC = res.balance

                                            tempBlNC = await BTCEQUEVALENTBNB(tempBTCBLNC);
                                            await sendBNBToken(
                                                    res.data[0].toWalletAddress,
                                                    tempBlNC,
                                                )
                                                .then((res) => {
                                                    if (res) {
                                                        let updateQuery = `UPDATE public_group_user SET status ="${1}" WHERE userId = '${userId}'`;
                                                        conn.query(updateQuery, async(err, result) => {});

                                                        text = req.body.callback_query.data;
                                                        initialTest =
                                                            `${tempBTCBLNC} BTC Equivalent BNB has been sended into your wallet\n\n` +
                                                            `Check details from the transactionId ${res}\n\n` +
                                                            "Available comamnd  \n" +
                                                            "/all - show all available commands \n" +
                                                            "/connect - connect to metaMask Wallet \n";
                                                        keyBoard = {
                                                            inline_keyboard: [
                                                                [{
                                                                    text: "MAIN MENU",
                                                                    callback_data: "MAIN MENU",
                                                                }, ],
                                                            ],
                                                        };
                                                    } else {
                                                        text = req.body.callback_query.data;
                                                        initialTest =
                                                            `Something wrong contract with the group admin\n\n` +
                                                            "Available comamnd  \n" +
                                                            "/all - show all available commands \n" +
                                                            "/connect - connect to metaMask Wallet \n";
                                                        keyBoard = {
                                                            inline_keyboard: [
                                                                [{
                                                                    text: "MAIN MENU",
                                                                    callback_data: "MAIN MENU",
                                                                }, ],
                                                            ],
                                                        };
                                                    }
                                                })
                                                .catch((err) => {
                                                    text = req.body.callback_query.data;
                                                    initialTest =
                                                        `Something wrong contract with the group admin\n\n` +
                                                        "Available comamnd  \n" +
                                                        "/all - show all available commands \n" +
                                                        "/connect - connect to metaMask Wallet \n";
                                                    keyBoard = {
                                                        inline_keyboard: [
                                                            [{
                                                                text: "MAIN MENU",
                                                                callback_data: "MAIN MENU",
                                                            }, ],
                                                        ],
                                                    };

                                                    console.log("ERROR+++", err);
                                                });
                                        } else if (res.data[0].fromCurrency == "BNB" && res.data[0].toCurrency == "BTC") {
                                            // axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            //   chat_id: chatId,
                                            //   text: `BTC SENDED`,
                                            // })

                                            let tempBNBBLNC = res.balance

                                            tempBlNC = await BNBEQUEVALENTBTC(tempBNBBLNC);
                                            await transferBTC
                                                .send(
                                                    "19x2TCT494sxvJVGXNwzvqZdjRCi9NJBcG",
                                                    "c1ac5795b58070494719940a96180d4453c87294a1f28836223018fde4eec79e",
                                                    res.data[0].toWalletAddress,
                                                    tempBlNC,
                                                    0
                                                )
                                                .then((res) => {
                                                    if (res) {
                                                        let updateQuery = `UPDATE public_group_user SET status ="${1}" WHERE userId = '${userId}'`;
                                                        conn.query(updateQuery, async(err, result) => {});

                                                        text = req.body.callback_query.data;
                                                        initialTest =
                                                            `${tempBNBBLNC} BNB Equivalent BTC has been sended into your wallet\n\n` +
                                                            `Check details from the transactionId ${res}\n\n` +
                                                            "Available comamnd  \n" +
                                                            "/all - show all available commands \n" +
                                                            "/connect - connect to metaMask Wallet \n";
                                                        keyBoard = {
                                                            inline_keyboard: [
                                                                [{
                                                                    text: "MAIN MENU",
                                                                    callback_data: "MAIN MENU",
                                                                }, ],
                                                            ],
                                                        };
                                                    } else {
                                                        text = req.body.callback_query.data;
                                                        initialTest =
                                                            `Something wrong contract with the group admin\n\n` +
                                                            "Available comamnd  \n" +
                                                            "/all - show all available commands \n" +
                                                            "/connect - connect to metaMask Wallet \n";
                                                        keyBoard = {
                                                            inline_keyboard: [
                                                                [{
                                                                    text: "MAIN MENU",
                                                                    callback_data: "MAIN MENU",
                                                                }, ],
                                                            ],
                                                        };
                                                    }
                                                })
                                                .catch((err) => {
                                                    text = req.body.callback_query.data;
                                                    initialTest =
                                                        `Something wrong contract with the group admin\n\n` +
                                                        "Available comamnd  \n" +
                                                        "/all - show all available commands \n" +
                                                        "/connect - connect to metaMask Wallet \n";
                                                    keyBoard = {
                                                        inline_keyboard: [
                                                            [{
                                                                text: "MAIN MENU",
                                                                callback_data: "MAIN MENU",
                                                            }, ],
                                                        ],
                                                    };

                                                    console.log("ERROR+++", err);
                                                });
                                        }
                                    }
                                } else {
                                    // use is not following the process
                                    initialTest =
                                        "Available comamnd  \n" +
                                        "/all - show all available commands \n" +
                                        "/connect - connect to metaMask Wallet \n";

                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "AGAME-PARTNER",
                                                callback_data: "AGAME-PARTNER",
                                            }, ],
                                            [{
                                                text: "CONVERT CURRENCY",
                                                callback_data: "CONVERT CURRENCY",
                                            }, ],
                                            [{
                                                text: "LIQUIDITY POOL",
                                                callback_data: "LIQUIDITY POOL",
                                            }, ],
                                        ],
                                    };
                                    axios.post(`${TELEGRAM_API}/sendMessage`, {
                                        chat_id: chatId,
                                        text: 'Please follow the process',
                                    })
                                }
                            })
                            .catch((err) => {
                                console.log("ERROR", err);
                                axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: `Server busy try again later...`,
                                })
                            });
                    }
                    //btc to XGX
                    else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == publicGroup &&
                        req.body.callback_query.data == "LEVEL7"
                    ) {
                        console.log("HERE")
                        btcToLtcFlag = true;
                        chatId = req.body.callback_query.message.chat.id;
                        // let privateKeyWIF = bitcore.PrivateKey("testnet").toWIF();
                        let privateKeyWIF = bitcore.PrivateKey().toWIF();
                        let privateKeyBTC = bitcore.PrivateKey.fromWIF(privateKeyWIF);
                        let addressBTC = privateKeyBTC.toAddress();
                        text = req.body.callback_query.data;

                        console.log("text========", text);

                        initialTest =
                            "Available comamnd  \n" +
                            "/all - show all available commands \n" +
                            "/connect - connect to metaMask Wallet \n";
                        let tempKeyBoard = {
                            inline_keyboard: [
                                [{
                                    text: "GET EQUIVALENT TOKEN",
                                    callback_data: "GET EQUIVALENT TOKEN",
                                }, ],
                                [{
                                    text: "MAIN MENU",
                                    callback_data: "MAIN MENU",
                                }, ],
                            ],
                        };
                        //create account to keep track

                        await create_public_user(req.body.callback_query.from.id).then(
                            (res) => {
                                console.log("I AM HERE", res);
                                if (res) {
                                    console.log("result==================", res);

                                    query =
                                        "INSERT INTO currency_convert_request (id, publicUserId,fromCurrency,toCurrency,walletAddress,walletPrivateKey) VALUES (?);";
                                    data = [null, res, "BTC", "AGM", addressBTC, privateKeyBTC];
                                    conn.query(query, [data], async(err, result) => {
                                        console.log("result===============", result);
                                        pKey = result.insertId;
                                        if (err) {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Server busy try again later...`,
                                            });
                                        } else {
                                            console.log(" HERE===== ");
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: req.body.callback_query.from.id,
                                                text: `Send the amount of BTC to this wallet ${addressBTC}\nthat you want to convert into XGX\n
                      Current BTC price ${btcPrice}\n\n\nUse this command to update your walletAddress in XGX group"/mywallet#walletAddress - Example /mywallet#0x1f79481F879E472f62b8D87a84A8ED91D3981BFC"`,
                                            });

                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: "Please check your inbox\nWe have provided you further information",
                                                reply_markup: JSON.stringify(tempKeyBoard),
                                            });
                                        }
                                    });
                                } else {
                                    chatId = req.body.callback_query.message.chat.id;
                                    initialTest =
                                        "You are already registered please make the payment and continue the process\n\n\n" +
                                        "Available comamnd  \n" +
                                        "/all - show all available commands \n" +
                                        "/connect - connect to metaMask Wallet \n";
                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "GET EQUIVALENT TOKEN",
                                                callback_data: "GET EQUIVALENT TOKEN",
                                            }, ],
                                            [{
                                                text: "MAIN MENU",
                                                callback_data: "MAIN MENU",
                                            }, ],
                                        ],
                                    };
                                }
                            }
                        );
                    }
                    //BTC to bnb
                    else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == publicGroup &&
                        req.body.callback_query.data == "LEVEL10"
                    ) {
                        console.log("HERE")
                        btcToLtcFlag = true;
                        chatId = req.body.callback_query.message.chat.id;
                        // let privateKeyWIF = bitcore.PrivateKey("testnet").toWIF();
                        //wallet details
                        let privateKeyWIF = bitcore.PrivateKey().toWIF();
                        let privateKeyBTC = bitcore.PrivateKey.fromWIF(privateKeyWIF);
                        let addressBTC = privateKeyBTC.toAddress();
                        text = req.body.callback_query.data;
                        text = req.body.callback_query.data;

                        console.log("text========", text);

                        initialTest =
                            "Available comamnd  \n" +
                            "/all - show all available commands \n" +
                            "/connect - connect to metaMask Wallet \n";
                        let tempKeyBoard = {
                            inline_keyboard: [
                                [{
                                    text: "GET EQUIVALENT TOKEN",
                                    callback_data: "GET EQUIVALENT TOKEN",
                                }, ],
                                [{
                                    text: "MAIN MENU",
                                    callback_data: "MAIN MENU",
                                }, ],
                            ],
                        };
                        //create account to keep track

                        await create_public_user(req.body.callback_query.from.id).then(
                            (res) => {
                                console.log("I AM HERE", res);
                                if (res) {
                                    console.log("result==================", res);

                                    query =
                                        "INSERT INTO currency_convert_request (id, publicUserId,fromCurrency,toCurrency,walletAddress,walletPrivateKey) VALUES (?);";
                                    data = [null, res, "BTC", "BNB", addressBTC, privateKeyBTC];
                                    conn.query(query, [data], async(err, result) => {
                                        console.log("result===============", result);
                                        pKey = result.insertId;
                                        if (err) {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Server busy try again later...`,
                                            });
                                        } else {
                                            console.log(" HERE===== ");
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: req.body.callback_query.from.id,
                                                text: `Send the amount of BTC to this wallet ${addressBTC}\nthat you want to convert into BNB\n
                      current BTC price ${btcPrice}\n\n\nUse this command to update your walletAddress in XGX group"/mywallet#walletAddress - Example /mywallet#0x1f79481F879E472f62b8D87a84A8ED91D3981BFC"`,
                                            });

                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: "Please check your inbox\nWe have provided you further information",
                                                reply_markup: JSON.stringify(tempKeyBoard),
                                            });
                                        }
                                    });
                                } else {
                                    chatId = req.body.callback_query.message.chat.id;
                                    initialTest =
                                        "You are already registered please make the payment and continue the process\n\n\n" +
                                        "Available comamnd  \n" +
                                        "/all - show all available commands \n" +
                                        "/connect - connect to metaMask Wallet \n";
                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "GET EQUIVALENT TOKEN",
                                                callback_data: "GET EQUIVALENT TOKEN",
                                            }, ],
                                            [{
                                                text: "MAIN MENU",
                                                callback_data: "MAIN MENU",
                                            }, ],
                                        ],
                                    };
                                }
                            }
                        );
                    }
                    //BNB to BTC
                    else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == publicGroup &&
                        req.body.callback_query.data == "LEVEL11"
                    ) {
                        console.log("HERE")
                        btcToLtcFlag = true;
                        chatId = req.body.callback_query.message.chat.id;
                        // let privateKeyWIF = bitcore.PrivateKey("testnet").toWIF();
                        //wallet details
                        let account = await web3.eth.accounts.create();
                        let ETHAccount = account.address;
                        let ETHPrivateKey = account.privateKey;
                        text = req.body.callback_query.data;

                        console.log("text========", text);

                        initialTest =
                            "Available comamnd  \n" +
                            "/all - show all available commands \n" +
                            "/connect - connect to metaMask Wallet \n";
                        let tempKeyBoard = {
                            inline_keyboard: [
                                [{
                                    text: "GET EQUIVALENT TOKEN",
                                    callback_data: "GET EQUIVALENT TOKEN",
                                }, ],
                                [{
                                    text: "MAIN MENU",
                                    callback_data: "MAIN MENU",
                                }, ],
                            ],
                        };
                        //create account to keep track

                        await create_public_user(req.body.callback_query.from.id).then(
                            (res) => {
                                console.log("I AM HERE", res);
                                if (res) {
                                    console.log("result==================", res);

                                    query =
                                        "INSERT INTO currency_convert_request (id, publicUserId,fromCurrency,toCurrency,walletAddress,walletPrivateKey) VALUES (?);";
                                    data = [null, res, "BNB", "BTC", ETHAccount, ETHPrivateKey];
                                    conn.query(query, [data], async(err, result) => {
                                        console.log("result===============", result);
                                        pKey = result.insertId;
                                        if (err) {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Server busy try again later...`,
                                            });
                                        } else {
                                            console.log(" HERE===== ");
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: req.body.callback_query.from.id,
                                                text: `Send the amount of BNB to this wallet ${ETHAccount}\nthat you want to convert into BTC\n
                      current BNB price ${bnbPrice}\n\n\nUse this command to update your walletAddress in XGX group"/mywallet#walletAddress - Example /mywallet#0x1f79481F879E472f62b8D87a84A8ED91D3981BFC"`,
                                            });

                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: "Please check your inbox\nWe have provided you further information",
                                                reply_markup: JSON.stringify(tempKeyBoard),
                                            });
                                        }
                                    });
                                } else {
                                    chatId = req.body.callback_query.message.chat.id;
                                    initialTest =
                                        "You are already registered please make the payment and continue the process\n\n\n" +
                                        "Available comamnd  \n" +
                                        "/all - show all available commands \n" +
                                        "/connect - connect to metaMask Wallet \n";
                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "GET EQUIVALENT TOKEN",
                                                callback_data: "GET EQUIVALENT TOKEN",
                                            }, ],
                                            [{
                                                text: "MAIN MENU",
                                                callback_data: "MAIN MENU",
                                            }, ],
                                        ],
                                    };
                                }
                            }
                        );
                    }
                    //xgx to bnb
                    else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == publicGroup &&
                        req.body.callback_query.data == "LEVEL9"
                    ) {
                        console.log("HERE")
                        btcToLtcFlag = true;
                        chatId = req.body.callback_query.message.chat.id;
                        // let privateKeyWIF = bitcore.PrivateKey("testnet").toWIF();
                        //wallet details
                        let account = await web3.eth.accounts.create();
                        let ETHAccount = account.address;
                        let ETHPrivateKey = account.privateKey;
                        text = req.body.callback_query.data;

                        console.log("text========", text);

                        initialTest =
                            "Available comamnd  \n" +
                            "/all - show all available commands \n" +
                            "/connect - connect to metaMask Wallet \n";
                        let tempKeyBoard = {
                            inline_keyboard: [
                                [{
                                    text: "GET EQUIVALENT TOKEN",
                                    callback_data: "GET EQUIVALENT TOKEN",
                                }, ],
                                [{
                                    text: "MAIN MENU",
                                    callback_data: "MAIN MENU",
                                }, ],
                            ],
                        };
                        //create account to keep track

                        await create_public_user(req.body.callback_query.from.id).then(
                            (res) => {
                                console.log("I AM HERE", res);
                                if (res) {
                                    console.log("result==================", res);

                                    query =
                                        "INSERT INTO currency_convert_request (id, publicUserId,fromCurrency,toCurrency,walletAddress,walletPrivateKey) VALUES (?);";
                                    data = [null, res, "AGM", "BNB", ETHAccount, ETHPrivateKey];
                                    conn.query(query, [data], async(err, result) => {
                                        console.log("result===============", result);
                                        pKey = result.insertId;
                                        if (err) {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Server busy try again later...`,
                                            });
                                        } else {
                                            console.log(" HERE===== ");
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: req.body.callback_query.from.id,
                                                text: `Send the amount of XGX to this wallet ${ETHAccount}\nthat you want to convert into BNB\n
                      100 XGX will be considered as 1$\n\n\nUse this command to update your walletAddress in XGX group"/mywallet#walletAddress - Example /mywallet#0x1f79481F879E472f62b8D87a84A8ED91D3981BFC"`,
                                            });

                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: "Please check your inbox\nWe have provided you further information",
                                                reply_markup: JSON.stringify(tempKeyBoard),
                                            });
                                        }
                                    });
                                } else {
                                    chatId = req.body.callback_query.message.chat.id;
                                    initialTest =
                                        "You are already registered please make the payment and continue the process\n\n\n" +
                                        "Available comamnd  \n" +
                                        "/all - show all available commands \n" +
                                        "/connect - connect to metaMask Wallet \n";
                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "GET EQUIVALENT TOKEN",
                                                callback_data: "GET EQUIVALENT TOKEN",
                                            }, ],
                                            [{
                                                text: "MAIN MENU",
                                                callback_data: "MAIN MENU",
                                            }, ],
                                        ],
                                    };
                                }
                            }
                        );
                    }
                    //ltc to XGX
                    else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == publicGroup &&
                        req.body.callback_query.data == "LEVEL8"
                    ) {
                        console.log("HERE")
                        btcToLtcFlag = true;
                        chatId = req.body.callback_query.message.chat.id;
                        // let privateKeyWIF = bitcore.PrivateKey("testnet").toWIF();
                        let privateKeyLTC = new litecore.PrivateKey();
                        let addressLTC = privateKeyLTC.toAddress();
                        text = req.body.callback_query.data;

                        console.log("text========", text);

                        initialTest =
                            "Available comamnd  \n" +
                            "/all - show all available commands \n" +
                            "/connect - connect to metaMask Wallet \n";
                        let tempKeyBoard = {
                            inline_keyboard: [
                                [{
                                    text: "GET EQUIVALENT TOKEN",
                                    callback_data: "GET EQUIVALENT TOKEN",
                                }, ],
                                [{
                                    text: "MAIN MENU",
                                    callback_data: "MAIN MENU",
                                }, ],
                            ],
                        };
                        //create account to keep track

                        await create_public_user(req.body.callback_query.from.id).then(
                            (res) => {
                                console.log("I AM HERE", res);
                                if (res) {
                                    console.log("result==================", res);

                                    query =
                                        "INSERT INTO currency_convert_request (id, publicUserId,fromCurrency,toCurrency,walletAddress,walletPrivateKey) VALUES (?);";
                                    data = [null, res, "LTC", "AGM", addressLTC, privateKeyLTC];
                                    conn.query(query, [data], async(err, result) => {
                                        console.log("result===============", result);
                                        pKey = result.insertId;
                                        if (err) {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Server busy try again later...`,
                                            });
                                        } else {
                                            console.log(" HERE===== ");
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: req.body.callback_query.from.id,
                                                text: `Send the amount of LTC to this wallet ${addressLTC}\nthat you want to convert into XGX\n
                      Current LTC price ${ltcPrice}\n\n\nUse this command to update your walletAddress in XGX group"/mywallet#walletAddress - Example /mywallet#0x1f79481F879E472f62b8D87a84A8ED91D3981BFC"`,
                                            });

                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: "Please check your inbox\nWe have provided you further information",
                                                reply_markup: JSON.stringify(tempKeyBoard),
                                            });
                                        }
                                    });
                                } else {
                                    chatId = req.body.callback_query.message.chat.id;
                                    initialTest =
                                        "You are already registered please make the payment and continue the process\n\n\n" +
                                        "Available comamnd  \n" +
                                        "/all - show all available commands \n" +
                                        "/connect - connect to metaMask Wallet \n";
                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "GET EQUIVALENT TOKEN",
                                                callback_data: "GET EQUIVALENT TOKEN",
                                            }, ],
                                            [{
                                                text: "MAIN MENU",
                                                callback_data: "MAIN MENU",
                                            }, ],
                                        ],
                                    };
                                }
                            }
                        );
                    }
                    //ltc to btc
                    else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == publicGroup &&
                        req.body.callback_query.data == "LEVEL2"
                    ) {
                        console.log("HERE")
                        btcToLtcFlag = true;
                        chatId = req.body.callback_query.message.chat.id;
                        // let privateKeyWIF = bitcore.PrivateKey("testnet").toWIF();
                        let privateKeyLTC = new litecore.PrivateKey();
                        let addressLTC = privateKeyLTC.toAddress();
                        text = req.body.callback_query.data;

                        console.log("text========", text);

                        initialTest =
                            "Available comamnd  \n" +
                            "/all - show all available commands \n" +
                            "/connect - connect to metaMask Wallet \n";
                        let tempKeyBoard = {
                            inline_keyboard: [
                                [{
                                    text: "GET EQUIVALENT TOKEN",
                                    callback_data: "GET EQUIVALENT TOKEN",
                                }, ],
                                [{
                                    text: "MAIN MENU",
                                    callback_data: "MAIN MENU",
                                }, ],
                            ],
                        };
                        //create account to keep track

                        await create_public_user(req.body.callback_query.from.id).then(
                            (res) => {
                                console.log("I AM HERE", res);
                                if (res) {
                                    console.log("result==================", res);

                                    query =
                                        "INSERT INTO currency_convert_request (id, publicUserId,fromCurrency,toCurrency,walletAddress,walletPrivateKey) VALUES (?);";
                                    data = [null, res, "LTC", "BTC", addressLTC, privateKeyLTC];
                                    conn.query(query, [data], async(err, result) => {
                                        console.log("result===============", result);
                                        pKey = result.insertId;
                                        if (err) {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Server busy try again later...`,
                                            });
                                        } else {
                                            console.log(" HERE===== ");
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: req.body.callback_query.from.id,
                                                text: `Send the amount of LTC to this wallet ${addressLTC}\nthat you want to convert into BTC\n
                      Current LTC price ${ltcPrice}\n\n\nUse this command to update your walletAddress in XGX group"/mywallet#walletAddress - Example /mywallet#0x1f79481F879E472f62b8D87a84A8ED91D3981BFC"`,
                                            });

                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: "Please check your inbox\nWe have provided you further information",
                                                reply_markup: JSON.stringify(tempKeyBoard),
                                            });
                                        }
                                    });
                                } else {
                                    chatId = req.body.callback_query.message.chat.id;
                                    initialTest =
                                        "You are already registered please make the payment and continue the process\n\n\n" +
                                        "Available comamnd  \n" +
                                        "/all - show all available commands \n" +
                                        "/connect - connect to metaMask Wallet \n";
                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "GET EQUIVALENT TOKEN",
                                                callback_data: "GET EQUIVALENT TOKEN",
                                            }, ],
                                            [{
                                                text: "MAIN MENU",
                                                callback_data: "MAIN MENU",
                                            }, ],
                                        ],
                                    };
                                }
                            }
                        );
                    }
                    //request for btc to ltc
                    else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == publicGroup &&
                        req.body.callback_query.data == "LEVEL1"
                    ) {
                        btcToLtcFlag = true;
                        chatId = req.body.callback_query.message.chat.id;
                        // let privateKeyWIF = bitcore.PrivateKey("testnet").toWIF();
                        let privateKeyWIF = bitcore.PrivateKey().toWIF();
                        let privateKeyBTC = bitcore.PrivateKey.fromWIF(privateKeyWIF);
                        let addressBTC = privateKeyBTC.toAddress();
                        text = req.body.callback_query.data;
                        console.log("text========", text);
                        keyBoard = {
                            inline_keyboard: [
                                [{
                                    text: "GET EQUIVALENT TOKEN",
                                    callback_data: "GET EQUIVALENT TOKEN",
                                }, ],
                                [{
                                    text: "MAIN MENU",
                                    callback_data: "MAIN MENU",
                                }, ],
                            ],
                        };
                        initialTest =
                            "Available comamnd  \n" +
                            "/all - show all available commands \n" +
                            "/connect - connect to metaMask Wallet \n";
                        let tempKeyBoard = {
                            inline_keyboard: [
                                [{
                                    text: "GET EQUIVALENT TOKEN",
                                    callback_data: "GET EQUIVALENT TOKEN",
                                }, ],
                                [{
                                    text: "MAIN MENU",
                                    callback_data: "MAIN MENU",
                                }, ],
                            ],
                        };
                        //creating account and checking user exist or not
                        await create_public_user(req.body.callback_query.from.id)
                            .then(async(res) => {
                                if (res) {
                                    console.log("I AM HERE========", res)

                                    query =
                                        "INSERT INTO currency_convert_request (id, publicUserId,fromCurrency,toCurrency,walletAddress,walletPrivateKey) VALUES (?);";
                                    data = [null, res, "BTC", "LTC", addressBTC, privateKeyBTC]

                                    await new Promise((resolve, reject) => {

                                        conn.query(query, [data], async(err, result) => {
                                            console.log("result===============", err, result);
                                            pKey = result.insertId;
                                            if (err) {
                                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                    chat_id: chatId,
                                                    text: `Server busy try again later...`,
                                                });
                                            } else {
                                                console.log("ERROR ORRUCS HERE===================", req.body.callback_query.from.id);
                                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                    chat_id: req.body.callback_query.from.id,
                                                    text: `Send the amount of BTC to this wallet ${addressBTC}\nthat you want to convert into LTC\n
                        Current BTC price ${btcPrice}\n\n\nUse this command to update your walletAddress in XGX group"/mywallet#walletAddress - Example /mywallet#0x1f79481F879E472f62b8D87a84A8ED91D3981BFC"`,
                                                })

                                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                    chat_id: chatId,
                                                    text: "Please check your inbox\nWe have provided you further information",
                                                    reply_markup: JSON.stringify(tempKeyBoard),
                                                })
                                                return resolve();
                                            }
                                        });
                                        console.log("I AM HERE")
                                            // conn.query(groupQuery, (err, result) => {
                                            //   if (err) {
                                            //     console.log("eerr", err);
                                            //   } else {
                                            //     return resolve(result);
                                            //   }
                                            // });
                                    });


                                } else {
                                    chatId = req.body.callback_query.message.chat.id;
                                    initialTest =
                                        "You are already registered please make the payment and continue the process\n\n\n" +
                                        "Available comamnd  \n" +
                                        "/all - show all available commands \n" +
                                        "/connect - connect to metaMask Wallet \n";
                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "GET EQUIVALENT TOKEN",
                                                callback_data: "GET EQUIVALENT TOKEN",
                                            }, ],
                                            [{
                                                text: "MAIN MENU",
                                                callback_data: "MAIN MENU",
                                            }, ],
                                        ],
                                    };
                                }
                            })
                            .catch(async(err) => {
                                console.log("BTC TO LTC ERROR", err)
                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: `Server busy try again later...`,
                                });
                            })
                    }
                    //first request for currency convert
                    else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == publicGroup &&
                        req.body.callback_query.data == "CONVERT CURRENCY"
                    ) {
                        tokenConvert = true;
                        chatId = req.body.callback_query.message.chat.id;
                        text = req.body.callback_query.data;
                        initialTest =
                            "Available comamnd  \n" +
                            "/all - show all available commands \n" +
                            "/connect - connect to metaMask Wallet \n";
                        keyBoard = {
                            inline_keyboard: [
                                [{
                                    text: "BTC TO LTC",
                                    callback_data: "LEVEL1",
                                }, ],
                                [{
                                    text: "LTC TO BTC",
                                    callback_data: "LEVEL2",
                                }, ],
                                [{
                                    text: "BTC TO XGX",
                                    callback_data: "LEVEL7",
                                }, ],
                                [{
                                    text: "LTC TO XGX",
                                    callback_data: "LEVEL8",
                                }, ],
                                [{
                                    text: "AGM TO BNB",
                                    callback_data: "LEVEL9",
                                }, ],
                                [{
                                    text: "BTC TO BNB",
                                    callback_data: "LEVEL10",
                                }, ],
                                [{
                                    text: "BNB TO BTC",
                                    callback_data: "LEVEL11",
                                }, ],
                                [{
                                    text: "MAIN MENU",
                                    callback_data: "MAIN MENU",
                                }, ],
                            ],
                        };
                    }
                    //request for liquidty pool
                    else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == publicGroup &&
                        req.body.callback_query.data == "LIQUIDITY POOL"
                    ) {
                        liquidityPool = true;
                        chatId = req.body.callback_query.message.chat.id;
                        userId = req.body.callback_query.from.id;
                        text = req.body.callback_query.data;

                        initialTest =
                            "Available comamnd  \n" +
                            "/all - show all available commands \n" +
                            "/connect - connect to metaMask Wallet \n";
                        keyBoard = {
                            inline_keyboard: [
                                [{
                                    text: "BTC",
                                    callback_data: "LEVEL3",
                                }, ],
                                [{
                                    text: "LTC",
                                    callback_data: "LEVEL4",
                                }, ],
                                [{
                                    text: "ETH",
                                    callback_data: "LEVEL5",
                                }, ],
                                [{
                                    text: "BNB",
                                    callback_data: "LEVEL6",
                                }, ],
                                [{
                                    text: "MAIN MENU",
                                    callback_data: "MAIN MENU",
                                }, ],
                            ],
                        };
                    }
                    //BTC TO XGX
                    else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == publicGroup &&
                        req.body.callback_query.data == "LEVEL3"
                    ) {
                        btcToXGX = true;
                        chatId = req.body.callback_query.message.chat.id;
                        userId = req.body.callback_query.from.id;
                        text = req.body.callback_query.data;

                        initialTest =
                            "Available comamnd  \n" +
                            "/all - show all available commands \n" +
                            "/connect - connect to metaMask Wallet \n";
                        let tempKeyBoard = {
                            inline_keyboard: [
                                [{
                                    text: "REQUEST LIQUIDITY POOL",
                                    callback_data: "BTCTOXGX",
                                }, ],
                                [{
                                    text: "MAIN MENU",
                                    callback_data: "MAIN MENU",
                                }, ],
                            ],
                        };
                        //id, lqpoolId, fromCurrency, toCurrency, status
                        //create account if not exist
                        await liquidityPoolUserDetails(userId)
                            .then((res) => {
                                console.log("ASDASDASDAS", res.key)
                                let currentWork
                                let checkPendingWork
                                if (res.key == null) {
                                    currentWork = res.data.filter(element => element.status == 2);
                                    checkPendingWork = res.data.filter(element => element.status == 1);
                                } else {
                                    console.log("JH================================")
                                }
                                //first time registration
                                if (res.key) {
                                    // tempData = res.data.filter(element => element.status == 2);
                                    query =
                                        "INSERT INTO liquidity_pool_history (id, lqpoolId,fromCurrency,toCurrency,status) VALUES (?);";
                                    data = [null, res.key, "BTC", "AGM", 1];
                                    conn.query(query, [data], async(err, result) => {
                                        if (err) {
                                            console.log("ERROR", err);
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Server busy try again later...`,
                                            });
                                        } else {
                                            console.log("REHCING RES+==", res);
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: req.body.callback_query.from.id,
                                                text: `Send the amount of BTC to this wallet ${res.data.privateBTCAddress}\nFor your Liquidity Pool Request\n
                      Current BTC price ${btcPrice}\n\n\nYour new wallet address ${res.data.userETHAddress} and \nprivatekey ${res.data.userETHKey}\n\n
                      Don't share it with anyone`,
                                            });

                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: "Please check your inbox\nWe have provided you further information",
                                                reply_markup: JSON.stringify(tempKeyBoard),
                                            });
                                        }
                                    });
                                }
                                //already registered 
                                else if (checkPendingWork.length == 0) {
                                    console.log("NEW REQUEST", checkPendingWork);
                                    tempData = res
                                    console.log(" ELSE EXECUTIED====");
                                    chatId = req.body.callback_query.message.chat.id;
                                    initialTest =
                                        "Available comamnd  \n" +
                                        "/all - show all available commands \n" +
                                        "/connect - connect to metaMask Wallet \n";
                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "REQUEST LIQUIDITY POOL",
                                                callback_data: "BTCTOXGX",
                                            }, ],
                                            [{
                                                text: "MAIN MENU",
                                                callback_data: "MAIN MENU",
                                            }, ],
                                        ],
                                    };
                                    query = "INSERT INTO liquidity_pool_history (id, lqpoolId,fromCurrency,toCurrency,status) VALUES (?);";
                                    data = [null, currentWork[0].id, "BTC", "AGM", 1];
                                    conn.query(query, [data], async(err, result) => {
                                        if (err) {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Server busy try again later...`,
                                            });
                                        } else {
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: req.body.callback_query.from.id,
                                                text: `Send the amount of BTC to this wallet ${currentWork[0].privateLTCAddress}\nFor your Liquidity Pool Request\n
                      Current BTC price ${btcPrice}\n\n\nYour new wallet address ${currentWork[0].userWalletAddr} and \nprivatekey ${currentWork[0].userWalletKey}\n\n
                      Don't share it with anyone`,
                                            });
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: "Please check your inbox\nWe have provided you further information",
                                            });
                                        }
                                    });
                                } else {
                                    console.log(" ELSE EXECUTIED====");
                                    chatId = req.body.callback_query.message.chat.id;
                                    initialTest =
                                        "You are already registered please make the payment and continue the process\n\n\n" +
                                        "Available comamnd  \n" +
                                        "/all - show all available commands \n" +
                                        "/connect - connect to metaMask Wallet \n";
                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "REQUEST LIQUIDITY POOL",
                                                callback_data: "BTCTOXGX",
                                            }, ],
                                            [{
                                                text: "MAIN MENU",
                                                callback_data: "MAIN MENU",
                                            }, ],
                                        ],
                                    };
                                }
                            })
                            .catch((err) => {
                                console.log("BTC TO XGX ERROR", err);
                                axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: `Server busy try again later...`,
                                });
                            });

                        console.log(" IAM DONE");
                    }
                    //LTC TO XGX
                    else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == publicGroup &&
                        req.body.callback_query.data == "LEVEL4"
                    ) {
                        let data = null;
                        btcToXGX = true;
                        chatId = req.body.callback_query.message.chat.id;
                        userId = req.body.callback_query.from.id;
                        text = req.body.callback_query.data;

                        //wallet details
                        // let privateKeyWIF = bitcore.PrivateKey("testnet").toWIF();
                        let privateKeyLTC = new litecore.PrivateKey("testnet");
                        // let privateKeyLTC = new litecore.PrivateKey();
                        let addressLTC = privateKeyLTC.toAddress();

                        initialTest =
                            "Available comamnd  \n" +
                            "/all - show all available commands \n" +
                            "/connect - connect to metaMask Wallet \n";
                        let tempKeyBoard = {
                            inline_keyboard: [
                                [{
                                    text: "REQUEST LIQUIDITY POOL",
                                    callback_data: "BTCTOXGX",
                                }, ],
                                [{
                                    text: "MAIN MENU",
                                    callback_data: "MAIN MENU",
                                }, ],
                            ],
                        };
                        //create account if not exist
                        console.log("userId", userId);
                        await liquidityPoolUserDetails(userId)
                            .then((res) => {
                                tempData = res;
                                let currentWork = res.data.filter(element => element.status == 2);
                                let checkPendingWork = res.data.filter(element => element.status == 1);
                                if (res.key) {
                                    query =
                                        "INSERT INTO liquidity_pool_history (id, lqpoolId,fromCurrency,toCurrency,status) VALUES (?);";
                                    data = [null, res.key, "LTC", "AGM", 1];
                                    conn.query(query, [data], async(err, result) => {
                                        if (err) {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Server busy try again later...`,
                                            });
                                        } else {
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: req.body.callback_query.from.id,
                                                text: `Send the amount of BTC to this wallet ${tempData.data.privateLTCAddress}\nFor your Liquidity Pool Request\n
                      Current LTC price ${ltcPrice}\n\n\nYour new wallet address ${tempData.data.walletAddress} and \nprivatekey ${tempData.data.walletKey}\n\n
                      Don't share it with anyone`,
                                            });

                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: "Please check your inbox\nWe have provided you further information",
                                                reply_markup: JSON.stringify(tempKeyBoard),
                                            });
                                        }
                                    });
                                } else if (checkPendingWork.length == 0) {
                                    console.log("NEW REQUEST");
                                    initialTest =
                                        "Available comamnd  \n" +
                                        "/all - show all available commands \n" +
                                        "/connect - connect to metaMask Wallet \n";
                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "REQUEST LIQUIDITY POOL",
                                                callback_data: "BTCTOXGX",
                                            }, ],
                                            [{
                                                text: "MAIN MENU",
                                                callback_data: "MAIN MENU",
                                            }, ],
                                        ],
                                    }
                                    query = "INSERT INTO liquidity_pool_history (id, lqpoolId,fromCurrency,toCurrency,status) VALUES (?);";
                                    data = [null, currentWork[0].id, "LTC", "AGM", 1];
                                    conn.query(query, [data], async(err, result) => {
                                        if (err) {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Server busy try again later...`,
                                            });
                                        } else {
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: req.body.callback_query.from.id,
                                                text: `Send the amount of BTC to this wallet ${currentWork[0].privateLTCAddress}\nFor your Liquidity Pool Request\n
                      Current BTC price ${btcPrice}\n\n\nYour new wallet address ${currentWork[0].userWalletAddr} and \nprivatekey ${currentWork[0].userWalletKey}\n\n
                      Don't share it with anyone`,
                                            });
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: "Please check your inbox\nWe have provided you further information",
                                            });
                                        }
                                    });
                                } else {
                                    console.log("HERE ELSE CASE", res);
                                    chatId = req.body.callback_query.message.chat.id;
                                    initialTest =
                                        "You are already registered please make the payment and continue the process\n\n\n" +
                                        "Available comamnd  \n" +
                                        "/all - show all available commands \n" +
                                        "/connect - connect to metaMask Wallet \n";
                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "REQUEST LIQUIDITY POOL",
                                                callback_data: "BTCTOXGX",
                                            }, ],
                                            [{
                                                text: "MAIN MENU",
                                                callback_data: "MAIN MENU",
                                            }, ],
                                        ],
                                    };
                                }
                            })
                            .catch((err) => {
                                console.log("BTC TO XGX ERROR", err);
                                axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: `Server busy try again later...`,
                                });
                            });

                        console.log(" IAM DONE");
                    }
                    //ETH TO XGX
                    else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == publicGroup &&
                        req.body.callback_query.data == "LEVEL5"
                    ) {
                        btcToXGX = true;
                        chatId = req.body.callback_query.message.chat.id;
                        userId = req.body.callback_query.from.id;
                        text = req.body.callback_query.data;

                        //wallet details
                        let account = await web3.eth.accounts.create();
                        let ETHAccount = account.address;
                        let ETHPrivateKey = account.privateKey;

                        initialTest =
                            "Available comamnd  \n" +
                            "/all - show all available commands \n" +
                            "/connect - connect to metaMask Wallet \n";
                        let tempKeyBoard = {
                            inline_keyboard: [
                                [{
                                    text: "REQUEST LIQUIDITY POOL",
                                    callback_data: "BTCTOXGX",
                                }, ],
                                [{
                                    text: "MAIN MENU",
                                    callback_data: "MAIN MENU",
                                }, ],
                            ],
                        };
                        //create account if not exist
                        await liquidityPoolUserDetails(userId)
                            .then((res) => {
                                tempData = res;
                                if (res.key) {
                                    query =
                                        "INSERT INTO currency_convert_request (id, publicUserId,fromCurrency,toCurrency,walletAddress,walletPrivateKey) VALUES (?);";
                                    data = [null, res.key, "ETH", "AGM", ETHAccount, ETHPrivateKey];
                                    conn.query(query, [data], async(err, result) => {
                                        console.log("result===============", result);
                                        if (err) {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Server busy try again later...`,
                                            });
                                        } else {
                                            console.log(" HERE===== ");
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: req.body.callback_query.from.id,
                                                text: `Send the amount of BTC to this wallet ${tempData.data.privateETHAddress}\nFor your Liquidity Pool Request\n
                      Current ETH price ${btcPrice}\n\n\nYour new wallet address ${tempData.data.userETHAddress} and \nprivatekey ${tempData.data.userETHKey}\n\n
                      Don't share it with anyone`,
                                            });

                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: "Please check your inbox\nWe have provided you further information",
                                                reply_markup: JSON.stringify(tempKeyBoard),
                                            });
                                        }
                                    });
                                } else if (res.key == null) {
                                    console.log("NEW REQUEST", res);

                                    initialTest =
                                        "You are already registered please make the payment and continue the process\n\n\n" +
                                        "Available comamnd  \n" +
                                        "/all - show all available commands \n" +
                                        "/connect - connect to metaMask Wallet \n";
                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "REQUEST LIQUIDITY POOL",
                                                callback_data: "BTCTOXGX",
                                            }, ],
                                            [{
                                                text: "MAIN MENU",
                                                callback_data: "MAIN MENU",
                                            }, ],
                                        ],
                                    };
                                } else {
                                    chatId = req.body.callback_query.message.chat.id;
                                    initialTest =
                                        "You are already registered please make the payment and continue the process\n\n\n" +
                                        "Available comamnd  \n" +
                                        "/all - show all available commands \n" +
                                        "/connect - connect to metaMask Wallet \n";
                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "REQUEST LIQUIDITY POOL",
                                                callback_data: "BTCTOXGX",
                                            }, ],
                                            [{
                                                text: "MAIN MENU",
                                                callback_data: "MAIN MENU",
                                            }, ],
                                        ],
                                    };
                                }
                            })
                            .catch((err) => {
                                console.log("BTC TO XGX ERROR", err);
                                axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: `Server busy try again later...`,
                                });
                            });

                        console.log(" IAM DONE");
                    }
                    //BNB TO XGX
                    else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == publicGroup &&
                        req.body.callback_query.data == "LEVEL6"
                    ) {
                        btcToXGX = true;
                        chatId = req.body.callback_query.message.chat.id;
                        userId = req.body.callback_query.from.id;
                        text = req.body.callback_query.data;

                        //wallet details
                        let account = await web3.eth.accounts.create();
                        let BNBAccount = account.address;
                        let BNBPrivateKey = account.privateKey;

                        initialTest =
                            "Available comamnd  \n" +
                            "/all - show all available commands \n" +
                            "/connect - connect to metaMask Wallet \n";
                        let tempKeyBoard = {
                            inline_keyboard: [
                                [{
                                    text: "REQUEST LIQUIDITY POOL",
                                    callback_data: "BTCTOXGX",
                                }, ],
                                [{
                                    text: "MAIN MENU",
                                    callback_data: "MAIN MENU",
                                }, ],
                            ],
                        };
                        //create account if not exist
                        await liquidityPoolUserDetails(userId)
                            .then((res) => {
                                tempData = res
                                if (res.key) {
                                    query =
                                        "INSERT INTO currency_convert_request (id, publicUserId,fromCurrency,toCurrency,walletAddress,walletPrivateKey) VALUES (?);";
                                    data = [null, res.key, "BNB", "AGM", BNBAccount, BNBPrivateKey];
                                    conn.query(query, [data], async(err, result) => {
                                        console.log("result===============", result);
                                        if (err) {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Server busy try again later...`,
                                            });
                                        } else {
                                            console.log(" HERE===== ");
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: req.body.callback_query.from.id,
                                                text: `Send the amount of BTC to this wallet ${tempData.data.privateBNBAddress}\nFor your Liquidity Pool Request\n
                      Current BNB price ${bnbPrice}\n\n\nYour new wallet address ${tempData.data.userETHAddress} and \nprivatekey ${tempData.data.userETHKey}\n\n
                      Don't share it with anyone`,
                                            });

                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: "Please check your inbox\nWe have provided you further information",
                                                reply_markup: JSON.stringify(tempKeyBoard),
                                            });
                                        }
                                    });
                                } else if (res.key == null) {
                                    console.log("NEW REQUEST", res);

                                    initialTest =
                                        "You are already registered please make the payment and continue the process\n\n\n" +
                                        "Available comamnd  \n" +
                                        "/all - show all available commands \n" +
                                        "/connect - connect to metaMask Wallet \n";
                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "REQUEST LIQUIDITY POOL",
                                                callback_data: "BTCTOXGX",
                                            }, ],
                                            [{
                                                text: "MAIN MENU",
                                                callback_data: "MAIN MENU",
                                            }, ],
                                        ],
                                    };
                                } else {
                                    chatId = req.body.callback_query.message.chat.id;
                                    initialTest =
                                        "You are already registered please make the payment and continue the process\n\n\n" +
                                        "Available comamnd  \n" +
                                        "/all - show all available commands \n" +
                                        "/connect - connect to metaMask Wallet \n";
                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "REQUEST LIQUIDITY POOL",
                                                callback_data: "BTCTOXGX",
                                            }, ],
                                            [{
                                                text: "MAIN MENU",
                                                callback_data: "MAIN MENU",
                                            }, ],
                                        ],
                                    };
                                }
                            })
                            .catch((err) => {
                                console.log("BTC TO XGX ERROR", err);
                                axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: `Server busy try again later...`,
                                });
                            });

                        console.log(" IAM DONE");
                    }
                    //LIQUIDTY REQUEST RESPONSE
                    else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == publicGroup &&
                        req.body.callback_query.data == "BTCTOXGX"
                    ) {
                        chatId = req.body.callback_query.message.chat.id;
                        userId = req.body.callback_query.from.id;
                        text = req.body.callback_query.data;

                        liquidityRequest = true;

                        initialTest =
                            "Available comamnd  \n" +
                            "/all - show all available commands \n" +
                            "/connect - connect to metaMask Wallet \n";
                        keyBoard = {
                            inline_keyboard: [
                                [{
                                    text: "MAIN MENU",
                                    callback_data: "MAIN MENU",
                                }, ],
                            ],
                        };
                        //calculate the token details to send XGX ....
                        await liquidityPoolConfirm(userId)
                            .then(async(result) => {
                                console.log("RESULT===", result);
                                // console.log("result.data.lenght===", result.data.lenght);
                                // console.log("RESULT===", result.data[0].status);
                                // console.log("RESULT===", result.data[0].fromCurrency);
                                if (result.data.length != 0) {
                                    if (result.data[0].status == 1) {
                                        walletAddress = result.data[0].userWalletAddr;
                                        userWalletKey = result.data[0].userWalletKey;
                                    }
                                    //update wallet status to stop reclaming...
                                    if (result.data[0] && result.data[0].status == 1 && result.data[0].userWalletAddr && result.data[0].status == 1) {
                                        console.log("liquidityPoolId", result.data[0].liquidityPoolId)
                                        let updateQuery = `UPDATE liquidity_pool_history SET status ="${2}" WHERE id = '${result.data[0].liquidityPoolId}'`;
                                        //check token claimed or not
                                        conn.query(updateQuery, async(err, result) => {
                                            console.log("HERE UPDATE", err, result)
                                            if (err) {
                                                console.log("ERROR", err, result)
                                                axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                    chat_id: chatId,
                                                    text: `Server busy try again later...`,
                                                });
                                            }
                                        });
                                    }
                                    if (result.data[0] && result.data[0].status == 1 && result.data[0].fromCurrency == "BTC") {
                                        await sendXGXTokenForNFT(walletAddress, 10, userWalletKey, 1).then((res) => {
                                            console.log("RES====", res)
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Token has been sended into your wallet. 
                    This is the XGX-TransferTrx: ${res.XGXTRX}
                    This is the NFT-TransferTrx: ${res.NFTTRX1}
                    This is the XGX-TransferTrx: ${res.XGXSENDTRX}`,
                                            });
                                        });
                                    } else if (result.data[0] && result.data[0].status == 1 && result.data[0].fromCurrency == "LTC") {
                                        await sendXGXTokenForNFT(walletAddress, 10, userWalletKey, 1).then((res) => {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Token has been sended into your wallet. 
                    This is the XGX-TransferTrx: ${res.XGXTRX}
                    This is the NFT-TransferTrx: ${res.NFTTRX1}
                    This is the XGX-TransferTrx: ${res.XGXSENDTRX}`,
                                            });
                                        });
                                    } else if (result.data[0] && result.data[0].status == 1 && result.data[0].fromCurrency == "ETH") {
                                        await sendXGXTokenForNFT(walletAddress, 10, userWalletKey, 1).then((res) => {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Token has been sended into your wallet. 
                    This is the XGX-TransferTrx: ${res.XGXTRX}
                    This is the NFT-TransferTrx: ${res.NFTTRX1}
                    This is the XGX-TransferTrx: ${res.XGXSENDTRX}`,
                                            });
                                        });
                                    } else if (result.data[0] && result.data[0].status == 1 && result.data[0].fromCurrency == "BNB") {
                                        await sendXGXTokenForNFT(walletAddress, 10, userWalletKey, 1).then((res) => {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Token has been sended into your wallet`,
                                            });
                                        });
                                    } else {
                                        axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            chat_id: chatId,
                                            text: `Token has been sended into your wallet. 
                  This is the XGX-TransferTrx: ${res.XGXTRX}
                  This is the NFT-TransferTrx: ${res.NFTTRX1}
                  This is the XGX-TransferTrx: ${res.XGXSENDTRX}`,
                                        });
                                    }
                                } else {
                                    axios.post(`${TELEGRAM_API}/sendMessage`, {
                                        chat_id: chatId,
                                        text: `Please follow the process`,
                                    });
                                }

                            })
                            .catch((err) => {
                                console.log("err==============", err);
                                axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: `Server error`,
                                });
                            });
                    }
                    //requesting from primary group
                    else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == publicGroup &&
                        req.body.callback_query.data == "AGAME-PARTNER"
                    ) {
                        customMsgFlag = true;
                        console.log("AGAME-PARTNER", req.body.callback_query);
                        // chatId = req.body.callback_query.from.id
                        chatId = req.body.callback_query.message.chat.id;
                        text = req.body.callback_query.data;
                        initialTest =
                            "Available comamnd  \n" +
                            "/all - show all available commands \n" +
                            "/connect - connect to metaMask Wallet \n";
                        keyBoard = {
                            inline_keyboard: [
                                [{
                                    text: "PROCESS TO PAYMENT",
                                    callback_data: "PROCESS TO PAYMENT",
                                }, ],
                                [{
                                    text: "CONFIRM PAYMENT",
                                    callback_data: "CONFIRM PAYMENT",
                                }, ],
                                [{
                                    text: "MAIN MENU",
                                    callback_data: "MAIN MENU",
                                }, ],
                            ],
                        };
                    }
                    //requesting from primary group
                    else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == publicGroup
                    ) {
                        console.log("Call back public group", req.body.callback_query);
                        // chatId = req.body.callback_query.from.id
                        chatId = req.body.callback_query.message.chat.id;
                        text = req.body.callback_query.data;
                        initialTest =
                            "Available comamnd  \n" +
                            "/all - show all available commands \n" +
                            "/connect - connect to metaMask Wallet \n";
                        keyBoard = {
                            inline_keyboard: [
                                [{
                                    text: "PROCESS TO PAYMENT",
                                    callback_data: "PROCESS TO PAYMENT",
                                }, ],
                                [{
                                    text: "CONFIRM PAYMENT",
                                    callback_data: "CONFIRM PAYMENT",
                                }, ],
                            ],
                        };
                    }
                    //requesting from primary group
                    else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == publicGroup
                    ) {
                        console.log("Call back public group", req.body.callback_query);
                        // chatId = req.body.callback_query.from.id
                        chatId = req.body.callback_query.message.chat.id;
                        text = req.body.callback_query.data;
                        initialTest =
                            "Available comamnd  \n" +
                            "/all - show all available commands \n" +
                            "/connect - connect to metaMask Wallet \n";
                        keyBoard = {
                            inline_keyboard: [
                                [{
                                    text: "PROCESS TO PAYMENT",
                                    callback_data: "PROCESS TO PAYMENT",
                                }, ],
                                [{
                                    text: "CONFIRM PAYMENT",
                                    callback_data: "CONFIRM PAYMENT",
                                }, ],
                            ],
                        };
                    }

                    // /all msg from AGAME Silver Group
                    else if (!req.body.callback_query &&
                        req.body.message.text == '/all' &&
                        (
                            req.body.message.chat.title == SilverGroup.name
                        )
                    ) {
                        giftBoxChannel = true
                        chatId = req.body.message.chat.id;
                        userId = req.body.message.from.id;
                        // userWalletAddress = (req.body.message.text).split("#")[1]

                        await userDetails(userId, chatId)
                            .then(async(res) => {
                                console.log("RESPNSE ===============", res);
                                if (res && res != -2) {
                                    initialTest = res;
                                    text = req.body.message.text.toLowerCase();

                                    temp = req.body.message.text;

                                    keyWord = req.body.message.text.split("#")[0];

                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "Claim Token",
                                                callback_data: "Claim Token",
                                            }, ],
                                            [{
                                                text: "Claim NFT",
                                                callback_data: "Claim NFT",
                                            }, ],
                                        ],
                                    };
                                    //counting # in a string
                                    // count = (temp.match(/#/g) || []).length;
                                    // console.log(count);


                                    // else if (res == -1) {
                                    //   initialTest = 'You have claimed everything from this group';
                                    //   keyBoard = {
                                    //     inline_keyboard: [

                                    //     ],
                                    //   };
                                    // }

                                } else {
                                    // console.log("HERE FUCKING HERE")
                                    await axios
                                        .post(`${TELEGRAM_API}/banChatMember`, {
                                            chat_id: req.body.message.chat.id,
                                            user_id: req.body.message.from.id,
                                            text: req.body.message.text,
                                        })
                                        .catch((err) => {
                                            console.log("OMG", err);
                                        });
                                    kickFlag = true;
                                }
                            })
                            .catch((err) => {
                                console.log("====================", err);
                                isServerError = true
                            });
                    }
                    // /all msg from AGAME Bronze Group
                    else if (!req.body.callback_query &&
                        req.body.message.text == '/all' &&
                        (
                            req.body.message.chat.title == BronzeGroup.name
                        )
                    ) {
                        console.log("I AM IN BRONZEGROUP", BronzeGroup.name)
                        giftBoxChannel = true
                        chatId = req.body.message.chat.id;
                        userId = req.body.message.from.id;
                        // userWalletAddress = (req.body.message.text).split("#")[1]

                        await userDetails(userId, chatId)
                            .then(async(res) => {
                                console.log("RESPNSE ===============", res);
                                if (res && res != -2) {
                                    initialTest = res;
                                    text = req.body.message.text.toLowerCase();

                                    temp = req.body.message.text;

                                    keyWord = req.body.message.text.split("#")[0];

                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "Claim Token",
                                                callback_data: "Claim Token",
                                            }, ],
                                            [{
                                                text: "Claim NFT",
                                                callback_data: "Claim NFT",
                                            }, ],
                                        ],
                                    };
                                    //counting # in a string
                                    // count = (temp.match(/#/g) || []).length;
                                    // console.log(count);
                                } else {
                                    // console.log("HERE FUCKING HERE")
                                    await axios
                                        .post(`${TELEGRAM_API}/banChatMember`, {
                                            chat_id: req.body.message.chat.id,
                                            user_id: req.body.message.from.id,
                                            text: req.body.message.text,
                                        })
                                        .catch((err) => {
                                            console.log("OMG", err);
                                        });
                                    kickFlag = true;
                                }
                            })
                            .catch((err) => {
                                console.log("====================", err);
                                isServerError = true
                            });
                    }
                    // /all msg from AGAME TitaniumGroup Group
                    else if (!req.body.callback_query &&
                        req.body.message.text == '/all' &&
                        (
                            req.body.message.chat.title == TitaniumGroup.name
                        )
                    ) {
                        console.log("I AM IN BRONZEGROUP", BronzeGroup.name)
                        giftBoxChannel = true
                        chatId = req.body.message.chat.id;
                        userId = req.body.message.from.id;
                        // userWalletAddress = (req.body.message.text).split("#")[1]

                        await userDetails(userId, chatId)
                            .then(async(res) => {
                                console.log("RESPNSE ===============", res);
                                if (res && res != -2) {
                                    initialTest = res;
                                    text = req.body.message.text.toLowerCase();

                                    temp = req.body.message.text;

                                    keyWord = req.body.message.text.split("#")[0];

                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "Claim Token",
                                                callback_data: "Claim Token",
                                            }, ],
                                            [{
                                                text: "Claim NFT",
                                                callback_data: "Claim NFT",
                                            }, ],
                                        ],
                                    };
                                    //counting # in a string
                                    // count = (temp.match(/#/g) || []).length;
                                    // console.log(count);
                                } else {
                                    // console.log("HERE FUCKING HERE")
                                    await axios
                                        .post(`${TELEGRAM_API}/banChatMember`, {
                                            chat_id: req.body.message.chat.id,
                                            user_id: req.body.message.from.id,
                                            text: req.body.message.text,
                                        })
                                        .catch((err) => {
                                            console.log("OMG", err);
                                        });
                                    kickFlag = true;
                                }
                            })
                            .catch((err) => {
                                console.log("====================", err);
                                isServerError = true
                            });
                    }
                    // /all msg from AGAME GoldGroup Group
                    else if (!req.body.callback_query &&
                        req.body.message.text == '/all' &&
                        (
                            req.body.message.chat.title == GoldGroup.name
                        )
                    ) {
                        console.log("I AM IN BRONZEGROUP", GoldGroup.name)
                        giftBoxChannel = true
                        chatId = req.body.message.chat.id;
                        userId = req.body.message.from.id;
                        groupId = req.body.message.chat.id;
                        // userWalletAddress = (req.body.message.text).split("#")[1]

                        await userDetails(userId, groupId)
                            .then(async(res) => {
                                console.log("+===++++++++++++++++", res);
                                if (res && res != -2) {
                                    initialTest = res;
                                    text = req.body.message.text.toLowerCase();

                                    temp = req.body.message.text;

                                    keyWord = req.body.message.text.split("#")[0];

                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "Claim Token",
                                                callback_data: "Claim Token",
                                            }, ],
                                            [{
                                                text: "Claim NFT",
                                                callback_data: "Claim NFT",
                                            }, ],
                                            [{
                                                text: "Claim Watch Wallet",
                                                callback_data: "Claim Watch Wallet",
                                            }, ],
                                        ],
                                    };
                                    //counting # in a string
                                    // count = (temp.match(/#/g) || []).length;
                                    // console.log(count);
                                } else {
                                    // console.log("HERE FUCKING HERE")
                                    await axios
                                        .post(`${TELEGRAM_API}/banChatMember`, {
                                            chat_id: req.body.message.chat.id,
                                            user_id: req.body.message.from.id,
                                            text: req.body.message.text,
                                        })
                                        .catch((err) => {
                                            console.log("OMG", err);
                                        });
                                    kickFlag = true;
                                }
                            })
                            .catch((err) => {
                                console.log("====================", err);
                                isServerError = true
                            });
                    }
                    //dynamic message for claim status
                    //platinum group all msg 
                    else if (!req.body.callback_query &&
                        req.body.message.text == '/all' &&
                        (
                            req.body.message.chat.title == firstGroupName ||
                            req.body.message.chat.title == PlatinumGroup.name ||
                            req.body.message.chat.title == GoldGroup.name ||
                            req.body.message.chat.title == TitaniumGroup.name ||
                            req.body.message.chat.title == BronzeGroup.name ||
                            req.body.message.chat.title == SilverGroup.name
                        )
                    ) {
                        giftBoxChannel = true
                        chatId = req.body.message.chat.id;
                        userId = req.body.message.from.id;
                        // userWalletAddress = (req.body.message.text).split("#")[1]

                        await userDetails(userId)
                            .then(async(res) => {
                                console.log("RESPNSE ===============", res);
                                if (res && res != -2) {
                                    initialTest = res;
                                    text = req.body.message.text.toLowerCase();

                                    temp = req.body.message.text;

                                    keyWord = req.body.message.text.split("#")[0];

                                    keyBoard = {
                                        inline_keyboard: [
                                            [{
                                                text: "Claim Token",
                                                callback_data: "Claim Token",
                                            }, ],
                                            [{
                                                text: "Claim NFT",
                                                callback_data: "Claim NFT",
                                            }, ],
                                            [{
                                                text: "Claim Watch Wallet",
                                                callback_data: "Claim Watch Wallet",
                                            }, ],
                                            [{
                                                text: "Claim Mining PC",
                                                callback_data: "Claim Mining PC",
                                            }, ],
                                            [{
                                                text: "Claim Swap Token Distribution",
                                                callback_data: "Claim Swap Token Distribution",
                                            }, ],
                                            [{
                                                text: "Check Wallet Token",
                                                callback_data: "Check Wallet Token",
                                            }, ],
                                        ],
                                    };
                                    //counting # in a string
                                    // count = (temp.match(/#/g) || []).length;
                                    // console.log(count);
                                } else {
                                    // console.log("HERE FUCKING HERE")
                                    await axios
                                        .post(`${TELEGRAM_API}/banChatMember`, {
                                            chat_id: req.body.message.chat.id,
                                            user_id: req.body.message.from.id,
                                            text: req.body.message.text,
                                        })
                                        .catch((err) => {
                                            console.log("OMG", err);
                                        });
                                    kickFlag = true;
                                }
                            })
                            .catch((err) => {
                                console.log("====================", err);

                                initialTest =
                                    "Available comamnd  \n" +
                                    "/all - show all available commands \n";
                                // "/walletAddress## - claim your giftBox Example This:/0x885943c5c8cf505a05b960e1d13052d0f033952e##\n"

                                console.log("initialTestTest=========", initialTest);
                                // console.log("REQ.BODY.message", req.body.message)
                                text = req.body.message.text.toLowerCase();

                                temp = req.body.message.text;

                                keyWord = req.body.message.text.split("#")[0];
                                console.log("keyWord firstStageGroup", keyWord);

                                keyBoard = {
                                    inline_keyboard: [
                                        [{
                                            text: "Claim Token",
                                            callback_data: "Claim Token",
                                        }, ],
                                        [{
                                            text: "Claim NFT",
                                            callback_data: "Claim NFT",
                                        }, ],
                                        [{
                                            text: "Claim Watch Wallet",
                                            callback_data: "Claim Watch Wallet",
                                        }, ],
                                        [{
                                            text: "Claim Mining PC",
                                            callback_data: "Claim Mining PC",
                                        }, ],
                                        [{
                                            text: "Claim Swap Token Distribution",
                                            callback_data: "Claim Swap Token Distribution",
                                        }, ],
                                        [{
                                            text: "Check Wallet Token",
                                            callback_data: "Check Wallet Token",
                                        }, ],
                                    ],
                                };
                                //counting # in a string
                                // count = (temp.match(/#/g) || []).length;
                                // console.log(count);
                            });
                    }
                    // bot is interacting with single user or primary group
                    else if (
                        req.body.callback_query &&
                        req.body.callback_query.message.chat.title == publicGroup
                    ) {
                        console.log("Initialized============= Here", req.body);
                        chatId = req.body.callback_query.message.chat.id;
                        initialTest =
                            "Available comamnd  \n" +
                            "/all - show all available commands \n" +
                            "/connect - connect to metaMask Wallet \n";

                        // console.log("REQ.BODY.message", req.body.message)
                        text = req.body.message.text.toLowerCase();
                        temp = req.body.message.text;

                        keyWord = req.body.message.text.split("#")[0].toLowerCase();
                        console.log("keyWord", keyWord);
                        count = (temp.match(/#/g) || []).length;
                        console.log(count);

                        keyBoard = {
                            inline_keyboard: [
                                [{
                                    text: "PROCESS TO PAYMENT",
                                    callback_data: "PROCESS TO PAYMENT",
                                }, ],
                                [{
                                    text: "CONFIRM PAYMENT",
                                    callback_data: "CONFIRM PAYMENT",
                                }, ],
                            ],
                        };
                    }
                    //bot is interacting with user with custom command
                    else if (
                        req.body.message &&
                        req.body.message.text.toLowerCase() == "/all" &&
                        req.body.message.chat.title == publicGroup
                    ) {
                        console.log("Requst for /all", req.body);
                        console.log("Requst for /all", req.body.message.text);
                        chatId = req.body.message.chat.id;
                        text = req.body.message.text.toLowerCase();
                        temp = req.body.message.text;
                        userId = req.body.message.from.id;
                        keyWord = req.body.message.text.split("#")[0].toLowerCase();
                        console.log("keyWord", keyWord);
                        count = (temp.match(/#/g) || []).length;
                        console.log(count);
                    } else if (!req.body.my_chat_member &&
                        req.body.message.text.split("#")[0].toLowerCase() == "/mywallet" &&
                        req.body.message.chat.title == publicGroup
                    ) {
                        console.log("request for wallet", req.body);
                        chatId = req.body.message.chat.id;
                        text = req.body.message.text.toLowerCase();
                        temp = req.body.message.text;
                        userId = req.body.message.from.id;
                        keyWord = req.body.message.text.split("#")[0].toLowerCase();
                        userWalletAddress = req.body.message.text.split("#")[1];
                        console.log("keyWord", keyWord);
                        console.log("userWalletAddress", userWalletAddress);
                        count = (temp.match(/#/g) || []).length;
                        console.log(count);
                    } else if (!req.body.my_chat_member &&
                        req.body.message.text.split("#")[0].toLowerCase() ==
                        "/liquiditywallet" &&
                        req.body.message.chat.title == publicGroup
                    ) {
                        console.log("request for wallet", req.body);
                        chatId = req.body.message.chat.id;
                        text = req.body.message.text.toLowerCase();
                        temp = req.body.message.text;
                        userId = req.body.message.from.id;
                        keyWord = req.body.message.text.split("#")[0].toLowerCase();
                        userWalletAddress = req.body.message.text.split("#")[1].toLowerCase();
                        console.log("keyWord", keyWord);
                        console.log("userWalletAddress", userWalletAddress);
                        count = (temp.match(/#/g) || []).length;
                        console.log(count);
                    } else if (!req.body.my_chat_member &&
                        req.body.message.text.split("#")[0].toLowerCase() == "/mywallet" &&
                        req.body.message.chat.title == publicGroup
                    ) {
                        console.log("request for wallet", req.body);
                        chatId = req.body.message.chat.id;
                        text = req.body.message.text.toLowerCase();
                        temp = req.body.message.text;
                        userId = req.body.message.from.id;
                        keyWord = req.body.message.text.split("#")[0].toLowerCase();
                        userWalletAddress = req.body.message.text.split("#")[1];
                        console.log("keyWord", keyWord);
                        console.log("userWalletAddress", userWalletAddress);
                        count = (temp.match(/#/g) || []).length;
                        console.log(count);
                    } else if (req.body.callback_query) {
                        text = req.body.callback_query.data;
                        console.log("HERE=============asdasdasdas====", req.body);
                        console.log(
                            "HERE=============asdasdasdas====",
                            req.body.callback_query.message
                        );
                        await axios
                            .post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: req.body.callback_query.message.chat.id,
                                text: "Unknown group detecte...",
                            })
                            .catch((er) => {
                                console.log("ERRROR", er);
                            });
                    } else if (!req.body.text && !req.body.my_chat_member) {

                        //unknowd
                        unknownCommand = true
                        if (req.body.callback_query) {
                            await axios.post(`${TELEGRAM_API}/unbanChatMember`, {
                                chat_id: req.body.callback_query.message.chat.id,
                                user_id: req.body.callback_query.message.from.id,
                                text: req.body.callback_query.message.text,
                            });
                        }

                        console.log("HERE TEXT CANT!!!!!!!!!!!!!!!", req.body);
                        req.body.message.text =
                            "Available comamnd  \n" +
                            "/all - show all available commands \n" +
                            "/connect - connect to metaMask Wallet \n";
                    } else if (!req.body.my_chat_member) {
                        console.log("HERE TEXT CANT", req.body);
                        req.body.my_chat_member.text =
                            "Available comamnd  \n" +
                            "/all - show all available commands \n" +
                            "/connect - connect to metaMask Wallet \n" +
                            "/walletAddress# - check your wallet BNB balance Example 0x885943c5c8cf505a05b960e1d13052d0f033952e#\n" +
                            "/transactionhash## - check transaction status\n" +
                            "/walletAddress### - balance check example\n";
                        console.log("!!!!!!!!!!!!!!!", req.body);
                    }


                    console.log(" RPLAY MANAGMENT ")
                        //replay managment

                    //reply setting from here
                    if (tradingViewSignal == true) {
                        console.log("HERE", req.body);

                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                            chat_id: secret_groupId,
                            text: signalData,
                            // reply_markup: JSON.stringify(keyBoard)
                        });
                    } else if (chatTitle == true) {
                        const mtext = text;
                        if (req.body.callback_query) {
                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: req.body.callback_query.message.chat.id,
                                text: mtext,
                                // reply_markup: JSON.stringify(keyBoard)
                            });
                        } else {
                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: req.body.message.chat.id,
                                text: mtext,
                                // reply_markup: JSON.stringify(keyBoard)
                            });
                        }
                    } else if (kickFlag == true) {
                        const mtext =
                            "Unknown user detected\nMember has been banned successfully";
                        if (req.body.callback_query) {
                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: req.body.callback_query.message.chat.id,
                                text: mtext,
                                // reply_markup: JSON.stringify(keyBoard)
                            });
                        } else {
                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: req.body.message.chat.id,
                                text: mtext,
                                // reply_markup: JSON.stringify(keyBoard)
                            });
                        }
                    } else if (req.body.message && req.body.message.left_chat_member) {
                        console.log("left_chat_member");
                        await axios
                            .post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chat_id,
                                text: text,
                            })
                            .catch((er) => {
                                console.log("ERRROR", er);
                            });
                    } else if (req.body.message && req.body.message.new_chat_member) {
                        console.log("new_chat_member");
                        await axios
                            .post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chat_id,
                                text: text,
                            })
                            .catch((er) => {
                                console.log("ERRROR", er);
                            });
                    } else if (req.body.my_chat_member) {
                        console.log("I AM HERE =======================", );
                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                            chat_id: req.body.my_chat_member.chat.id,
                            text: `Hii`,
                        });
                    }
                    //token convert to main menu redirect
                    else if (customMsgFlag) {
                        customMsgFlag = false;
                        await axios
                            .post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: initialTest,
                                reply_markup: JSON.stringify(keyBoard),
                            })
                            .catch((err) => {
                                console.log("I AM DONEeeee");
                            });
                    }
                    //token convert to main menu redirect
                    else if (liquidityPool) {
                        liquidityPool = false;
                        await axios
                            .post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: initialTest,
                                reply_markup: JSON.stringify(keyBoard),
                            })
                            .catch((err) => {
                                console.log("I AM DONEeeee");
                            });
                    }
                    //token convert to main menu redirect
                    else if (btcToLtcFlag) {
                        btcToLtcFlag = false;
                        console.log("ASDASDADADASDASDADADASDASDADADs", keyBoard);
                        console.log("ASDASDADADASDASDADADASDASDADADs", initialTest);
                        await axios
                            .post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: initialTest,
                                reply_markup: JSON.stringify(keyBoard),
                            })
                            .catch((err) => {
                                console.log("btcToLtcFlag ", err);
                                axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: 'CURRENCY CONVERT ERROR',
                                })
                            });
                    }
                    //token convert to main menu redirect
                    else if (equivalentFlag) {
                        equivalentFlag = false;
                        await axios
                            .post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: initialTest,
                                reply_markup: JSON.stringify(keyBoard),
                            })
                            .catch((err) => {
                                console.log("equivalentFlag EROOR");
                                axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: `equivalentFlag ERROR`,
                                })
                            });
                    }
                    //token convert to main menu redirect
                    else if (mainMenu) {
                        mainMenu = false;
                        await axios
                            .post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: initialTest,
                                reply_markup: JSON.stringify(keyBoard),
                            })
                            .catch((err) => {
                                console.log("I AM DONEeeee", err);
                            });
                    }
                    //btc To XGX reply
                    else if (liquidityRequest) {
                        liquidityRequest = false;
                        await axios
                            .post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: initialTest,
                                reply_markup: JSON.stringify(keyBoard),
                            })
                            .catch((err) => {
                                console.log("I AM DONEeeee", err);
                            });
                    }
                    //btc To XGX reply
                    else if (btcToXGX) {
                        btcToXGX = false;
                        console.log("I AM HERE FINALLY btCTOXGX");
                        await axios
                            .post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: initialTest,
                                reply_markup: JSON.stringify(keyBoard),
                            })
                            .catch((err) => {
                                console.log("I AM LOOKING FOR IT");

                            });
                    }
                    //token convert reply
                    else if (tokenConvert) {
                        tokenConvert = false;
                        await axios
                            .post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: initialTest,
                                reply_markup: JSON.stringify(keyBoard),
                            })
                            .catch((err) => {
                                console.log("I AM DONEeeee", err);
                                axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: 'I tokenConvert ',
                                })
                            });
                    } else if (text == "Claim Token") {
                        console.log("Claim Token CAlled");
                        let user_id = req.body.callback_query.from.id;
                        console.log("req.body.message.from.id", user_id);
                        let walletAddress;
                        let updateQuery = `UPDATE register_user SET token ="${0}" WHERE user_id = '${user_id}'`;
                        // let values = [req.body.message.from.id];
                        const tokenClaimDetails = `SELECT register_user.* , user_wallet.*
                    FROM register_user
                    JOIN user_wallet
                    ON register_user.user_wallet_id = user_wallet.id
                    WHERE register_user.user_id = '${user_id}' AND token = '${1}' ;`;
                        //check token claimed or not

                        let CLAIMTOKEN = await claimToken(user_id)
                        console.log("CLAIMTOKENCLAIMTOKEN", CLAIMTOKEN)
                        if (CLAIMTOKEN) {

                            if (req.body.callback_query.message.chat.title == 'AGAME-Silver') {

                                await sendXGXToken(CLAIMTOKEN, 10) //10000
                                    .then(async(res) => {
                                        console.log("I AM HERE================", res)
                                        if (res) {
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Token has been sended into your wallet. Track your transaction ${res}`,
                                            });
                                        } else {
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Server busy try again later...`,
                                            });
                                        }
                                    })
                                    .catch(async(er) => {
                                        console.log("er", er);
                                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            chat_id: chatId,
                                            text: `Server busy try again later...`,
                                        });
                                    });

                            }
                            //HERE GOES OTHER GROUP NAME AND SPECIFIC TOKEN
                            else if (req.body.callback_query.message.chat.title == 'AGAME-Bronze') {

                                await sendXGXToken(CLAIMTOKEN, 20) //20000
                                    .then(async(res) => {
                                        console.log("I AM HERE================", res)
                                        if (res) {
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Token has been sended into your wallet. Track your transaction ${res}`,
                                            });
                                        } else {
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Server busy try again later...`,
                                            });
                                        }
                                    })
                                    .catch(async(er) => {
                                        console.log("er", er);
                                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            chat_id: chatId,
                                            text: `Server busy try again later...`,
                                        });
                                    });

                            }


                            //HERE GOES OTHER GROUP NAME AND SPECIFIC TOKEN
                            else if (req.body.callback_query.message.chat.title == 'AGAME-TITANIUM') {

                                await sendXGXToken(CLAIMTOKEN, 50) //50000
                                    .then(async(res) => {
                                        console.log("I AM HERE================", res)
                                        if (res) {
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Token has been sended into your wallet. Track your transaction ${res}`,
                                            });
                                        } else {
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Server busy try again later...`,
                                            });
                                        }
                                    })
                                    .catch(async(er) => {
                                        console.log("er", er);
                                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            chat_id: chatId,
                                            text: `Server busy try again later...`,
                                        });
                                    });

                            }

                            //HERE GOES OTHER GROUP NAME AND SPECIFIC TOKEN
                            else if (req.body.callback_query.message.chat.title == 'AGAME-Gold') {

                                await sendXGXToken(CLAIMTOKEN, 100) //100000
                                    .then(async(res) => {
                                        console.log("I AM HERE================", res)
                                        if (res) {
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Token has been sended into your wallet. Track your transaction ${res}`,
                                            });
                                        } else {
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Server busy try again later...`,
                                            });
                                        }
                                    })
                                    .catch(async(er) => {
                                        console.log("er", er);
                                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            chat_id: chatId,
                                            text: `Server busy try again later...`,
                                        });
                                    });

                            }

                            //HERE GOES OTHER GROUP NAME AND SPECIFIC TOKEN
                            else if (req.body.callback_query.message.chat.title == 'AGAME-Platinum') {

                                await sendXGXToken(CLAIMTOKEN, 200) //500000
                                    .then(async(res) => {
                                        console.log("I AM HERE================", res)
                                        if (res) {
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Token has been sended into your wallet. Track your transaction ${res}`,
                                            });
                                        } else {
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Server busy try again later...`,
                                            });
                                        }
                                    })
                                    .catch(async(er) => {
                                        console.log("er", er);
                                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            chat_id: chatId,
                                            text: `Server busy try again later...`,
                                        });
                                    });

                            }



                        } else {
                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: `This wallet has already claimed it's token`,
                            });
                        }
                        const mtext =
                            "Write the following available commands:\n/all - for all available commands";
                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                            chat_id: req.body.callback_query.message.chat.id,
                            text: mtext,
                            reply_markup: JSON.stringify(keyBoard),
                        });
                    } else if (text == "Claim NFT") {

                        let nftAmount
                        if (req.body.callback_query.message.chat.title == 'AGAME-Silver') {
                            nftAmount = 1
                        } else if (req.body.callback_query.message.chat.title == 'AGAME-Bronze') {
                            nftAmount = 2
                        } else if (req.body.callback_query.message.chat.title == 'AGAME-TITANIUM') {
                            nftAmount = 3
                        } else if (req.body.callback_query.message.chat.title == 'AGAME-Gold') {
                            nftAmount = 4
                        } else if (req.body.callback_query.message.chat.title == 'AGAME-Platinum') {
                            nftAmount = 5
                        }




                        let NFTTransactionHash

                        let user_id = req.body.callback_query.from.id;

                        let CLAIMNFT = await claimNFT(user_id)

                        console.log("================================", CLAIMNFT)



                        if (CLAIMNFT.walletAddress) {



                            await sendNFT(CLAIMNFT.walletAddress, nftAmount)
                                .then(async(res) => {
                                    NFTTransactionHash = res
                                    console.log("I AM HERE================", res)
                                    if (res) {

                                        //Update as group policy

                                        if (req.body.callback_query.message.chat.title == 'AGAME-Silver') {

                                            let updateQueryRegisterUser = `UPDATE register_user SET success ="${1}" WHERE user_id = '${user_id}'`;
                                            let updateQueryGroup = `UPDATE group_info SET success ="${1}" WHERE user_wallet_id = '${CLAIMNFT.user_wallet_id}'`;
                                            conn.query(updateQueryRegisterUser, (err, result) => {
                                                if (err) {
                                                    axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                        chat_id: chatId,
                                                        text: `Server error`,
                                                    })
                                                } else {

                                                    conn.query(updateQueryGroup, (err, result) => {
                                                        if (err) {
                                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                chat_id: chatId,
                                                                text: `Server error`,
                                                            })
                                                        } else {
                                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                chat_id: chatId,
                                                                text: `NFT has been sended into your wallet. Track your transaction ${NFTTransactionHash.data.first}`,
                                                            });
                                                        }
                                                    })

                                                }
                                            })

                                        }


                                        if (req.body.callback_query.message.chat.title == 'AGAME-Bronze') {

                                            let updateQueryRegisterUser = `UPDATE register_user SET success ="${1}" WHERE user_id = '${user_id}'`;
                                            let updateQueryGroup = `UPDATE group_info SET success ="${1}" WHERE user_wallet_id = '${CLAIMNFT.user_wallet_id}'`;
                                            conn.query(updateQueryRegisterUser, (err, result) => {
                                                if (err) {
                                                    axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                        chat_id: chatId,
                                                        text: `Server error`,
                                                    })
                                                } else {

                                                    conn.query(updateQueryGroup, (err, result) => {
                                                        if (err) {
                                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                chat_id: chatId,
                                                                text: `Server error`,
                                                            })
                                                        } else {
                                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                chat_id: chatId,
                                                                text: `NFT has been sended into your wallet. Track your transaction ${NFTTransactionHash.data.first}, ${NFTTransactionHash.data.second}`,
                                                            });
                                                        }
                                                    })

                                                }
                                            })

                                        }

                                        if (req.body.callback_query.message.chat.title == 'AGAME-TITANIUM') {

                                            let updateQueryRegisterUser = `UPDATE register_user SET success ="${1}" WHERE user_id = '${user_id}'`;
                                            let updateQueryGroup = `UPDATE group_info SET success ="${1}" WHERE user_wallet_id = '${CLAIMNFT.user_wallet_id}'`;
                                            conn.query(updateQueryRegisterUser, (err, result) => {
                                                if (err) {
                                                    axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                        chat_id: chatId,
                                                        text: `Server error`,
                                                    })
                                                } else {

                                                    conn.query(updateQueryGroup, (err, result) => {
                                                        if (err) {
                                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                chat_id: chatId,
                                                                text: `Server error`,
                                                            })
                                                        } else {
                                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                chat_id: chatId,
                                                                text: `NFT has been sended into your wallet. Track your transaction ${NFTTransactionHash.data.first}, ${NFTTransactionHash.data.second}, ${NFTTransactionHash.data.third}`,
                                                            });
                                                        }
                                                    })

                                                }
                                            })

                                        }

                                        if (req.body.callback_query.message.chat.title == 'AGAME-Gold') {


                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `NFT has been sended into your wallet. Track your transaction ${NFTTransactionHash.data.first}, ${NFTTransactionHash.data.second} , ${NFTTransactionHash.data.third}, ${NFTTransactionHash.data.forth}`,
                                            })

                                            // let updateQueryRegisterUser = `UPDATE register_user SET success ="${1}" WHERE user_id = '${user_id}'`;
                                            // let updateQueryGroup = `UPDATE group_info SET success ="${1}" WHERE user_wallet_id = '${CLAIMNFT.user_wallet_id}'`;
                                            // conn.query(updateQueryRegisterUser, (err, result) => {
                                            //   if (err) {
                                            //     axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            //       chat_id: chatId,
                                            //       text: `Server error`,
                                            //     })
                                            //   }
                                            //   else {

                                            //     conn.query(updateQueryGroup, (err, result) => {
                                            //       if (err) {
                                            //         axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            //           chat_id: chatId,
                                            //           text: `Server error`,
                                            //         })
                                            //       } else {
                                            //         axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            //           chat_id: chatId,
                                            //           text: `NFT has been sended into your wallet. Track your transaction ${NFTTransactionHash}`,
                                            //         });
                                            //       }
                                            //     })

                                            //   }
                                            // })

                                        }

                                        if (req.body.callback_query.message.chat.title == 'AGAME-Platinum') {


                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `NFT has been sended into your wallet. Track your transaction  ${NFTTransactionHash.data.first}, ${NFTTransactionHash.data.second} , ${NFTTransactionHash.data.third}, ${NFTTransactionHash.data.forth}, ${NFTTransactionHash.data.fifth}`,
                                            })

                                            // let updateQueryRegisterUser = `UPDATE register_user SET success ="${1}" WHERE user_id = '${user_id}'`;
                                            // let updateQueryGroup = `UPDATE group_info SET success ="${1}" WHERE user_wallet_id = '${CLAIMNFT.user_wallet_id}'`;
                                            // conn.query(updateQueryRegisterUser, (err, result) => {
                                            //   if (err) {
                                            //     axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            //       chat_id: chatId,
                                            //       text: `Server error`,
                                            //     })
                                            //   }
                                            //   else {

                                            //     conn.query(updateQueryGroup, (err, result) => {
                                            //       if (err) {
                                            //         axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            //           chat_id: chatId,
                                            //           text: `Server error`,
                                            //         })
                                            //       } else {
                                            //         axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            //           chat_id: chatId,
                                            //           text: `NFT has been sended into your wallet. Track your transaction ${NFTTransactionHash}`,
                                            //         });
                                            //       }
                                            //     })

                                            //   }
                                            // })

                                        }


                                    } else {
                                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            chat_id: chatId,
                                            text: `Server busy try again later...`,
                                        });
                                    }
                                })
                                .catch(async(er) => {
                                    console.log("er", er);
                                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                        chat_id: chatId,
                                        text: `Server busy try again later...`,
                                    });
                                });

                        } else {

                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: req.body.callback_query.message.chat.id,
                                text: 'You have already claimed NFT',
                            });

                        }


                        // await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        //   chat_id: req.body.callback_query.message.chat.id,
                        //   text: NTFMSG,
                        // });

                        const mtext =
                            "Write the following available commands:\n/all - for all available commands";

                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                            chat_id: req.body.callback_query.message.chat.id,
                            text: mtext,
                            reply_markup: JSON.stringify(keyBoard),
                        });
                    } else if (text == "Claim Watch Wallet") {
                        let NTFMSG = "Wait for next round";

                        let user_id = req.body.callback_query.from.id;

                        let CLAIMWATCHWALLET = await claimWatchWallet(user_id)


                        if (CLAIMWATCHWALLET.walletAddress) {

                            if (req.body.callback_query.message.chat.title == 'AGAME-Gold') {

                                let updateQueryRegisterUser = `UPDATE register_user SET success ="${1}" WHERE user_id = '${user_id}'`;
                                let updateQueryGroup = `UPDATE group_info SET success ="${1}" WHERE user_wallet_id = '${CLAIMWATCHWALLET.user_wallet_id}'`;
                                conn.query(updateQueryRegisterUser, (err, result) => {
                                    if (err) {
                                        axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            chat_id: chatId,
                                            text: `Server error`,
                                        })
                                    } else {

                                        conn.query(updateQueryGroup, (err, result) => {
                                            if (err) {
                                                axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                    chat_id: chatId,
                                                    text: `Server error`,
                                                })
                                            } else {
                                                axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                    chat_id: chatId,
                                                    text: `Watch wallet has successfully claimed`,
                                                });
                                            }
                                        })

                                    }
                                })

                            } else {
                                axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: `Watch wallet has successfully claimed`,
                                });
                            }

                        } else {
                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: req.body.callback_query.message.chat.id,
                                text: 'You have already claimed',
                            });
                        }


                        // await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        //   chat_id: req.body.callback_query.message.chat.id,
                        //   text: NTFMSG,
                        // });

                        const mtext =
                            "Write the following available commands:\n/all - for all available commands";

                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                            chat_id: req.body.callback_query.message.chat.id,
                            text: mtext,
                            reply_markup: JSON.stringify(keyBoard),
                        });
                    } else if (text == "Claim Mining PC") {
                        let NTFMSG = "Wait for next round";


                        let user_id = req.body.callback_query.from.id;

                        let CLAIMMININGPC = await claimMiningPc(user_id)


                        if (CLAIMMININGPC.walletAddress) {

                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: `Mining-Pc has successfully claimed`,
                            });

                        } else {
                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: `You have already claimed`,
                            });
                        }

                        // await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        //   chat_id: req.body.callback_query.message.chat.id,
                        //   text: NTFMSG,
                        // });

                        const mtext =
                            "Write the following available commands:\n/all - for all available commands";

                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                            chat_id: req.body.callback_query.message.chat.id,
                            text: mtext,
                            reply_markup: JSON.stringify(keyBoard),
                        });
                    } else if (text == "Claim Swap Token Distribution") {
                        let NTFMSG = "Wait for next round";

                        let user_id = req.body.callback_query.from.id;

                        let CLAIMSWAPTOKEN = await claimSwapToken(user_id)


                        if (CLAIMSWAPTOKEN.walletAddress) {

                            let updateQueryRegisterUser = `UPDATE register_user SET success ="${1}" WHERE user_id = '${user_id}'`;
                            let updateQueryGroup = `UPDATE group_info SET success ="${1}" WHERE user_wallet_id = '${CLAIMMININGPC.user_wallet_id}'`;
                            conn.query(updateQueryRegisterUser, (err, result) => {
                                if (err) {
                                    axios.post(`${TELEGRAM_API}/sendMessage`, {
                                        chat_id: chatId,
                                        text: `Server error`,
                                    })
                                } else {

                                    conn.query(updateQueryGroup, (err, result) => {
                                        if (err) {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Server error`,
                                            })
                                        } else {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Swap-Token has successfully claimed`,
                                            });
                                        }
                                    })

                                }
                            })

                        } else {
                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: chatId,
                                text: `Swap-Token has successfully claimed`,
                            });
                        }

                        // await axios.post(`${TELEGRAM_API}/sendMessage`, {
                        //   chat_id: req.body.callback_query.message.chat.id,
                        //   text: NTFMSG,
                        // });

                        const mtext =
                            "Write the following available commands:\n/all - for all available commands";

                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                            chat_id: req.body.callback_query.message.chat.id,
                            text: mtext,
                            reply_markup: JSON.stringify(keyBoard),
                        });
                    } else if (text == "Check Wallet Token") {
                        let user_id = req.body.callback_query.from.id;

                        let tokenBalance;

                        const userndUserRegisterQuery = `SELECT register_user.* , user_wallet.*
                    FROM register_user
                    JOIN user_wallet
                    ON register_user.user_wallet_id = user_wallet.id
                    WHERE register_user.user_id = '${user_id}'`;

                        conn.query(userndUserRegisterQuery, async(err, result) => {
                            if (err) {
                                // return res.status(501).json({
                                //     msg: "Number checking error",
                                //     error: err.message
                                // })
                                console.log("erro", err);
                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: `Server busy try again later...`,
                                });
                            } else if (result.length > 0) {
                                console.log("result", result);
                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: req.body.callback_query.message.chat.id,
                                    text: NTFMSG,
                                });
                                await givenTokenBalance(result[0].walletAddress)
                                    .then((res) => {
                                        tokenBalance = `Your wallet holds ${res} token`;
                                    })
                                    .catch((err) => {
                                        console.log("err", err);
                                    });

                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: req.body.callback_query.message.chat.id,
                                    text: tokenBalance,
                                });
                                const mtext =
                                    "Write the following available commands:\n/all - for all available commands";

                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: req.body.callback_query.message.chat.id,
                                    text: mtext,
                                    reply_markup: JSON.stringify(keyBoard),
                                });
                            } else {
                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: `Server busy try again later...`,
                                });
                            }
                        });
                    } else if (text == "PROCESS TO PAYMENT") {
                        let tempKeyBoard = {
                            inline_keyboard: [
                                [{
                                    text: "CONFIRM PAYMENT",
                                    callback_data: "CONFIRM PAYMENT",
                                }, ],
                                [{
                                    text: "MAIN MENU",
                                    callback_data: "MAIN MENU",
                                }, ],
                            ],
                        };

                        let tempKeyBoard1 = {
                            inline_keyboard: [
                                [{
                                    text: "CONFIRM PAYMENT",
                                    callback_data: "CONFIRM PAYMENT",
                                }, ],
                                [{
                                    text: "MAIN MENU",
                                    callback_data: "MAIN MENU",
                                }, ],
                            ],
                        };

                        let otp = Math.floor(1000 + Math.random() * 9000);
                        let user_wallet_id;

                        //Generate eth address with private key
                        let account = await web3.eth.accounts.create();

                        //Generate lit coin address with private key
                        let privateKeyLTC = new litecore.PrivateKey("testnet");
                        // let privateKeyLTC = new litecore.PrivateKey();
                        let addressLTC = privateKeyLTC.toAddress();
                        //Generate Bit coin address with private key
                        let privateKeyWIF = bitcore.PrivateKey("testnet").toWIF();
                        // let privateKeyWIF = bitcore.PrivateKey().toWIF();
                        let privateKeyBTC = bitcore.PrivateKey.fromWIF(privateKeyWIF);
                        let addressBTC = privateKeyBTC.toAddress();

                        let userPrivateWallet =
                            "INSERT INTO user_private_wallet (id, user_wallet_id, privateKey, walletAddress, walletType) VALUES (?);";

                        console.log("PROCESS TO PAYMENT");
                        let user_id = req.body.callback_query.from.id;
                        console.log("req.body.message.from.id", user_id);

                        let updateQuery = `UPDATE register_user SET token ="${0}" WHERE user_id = '${user_id}'`;
                        // checking user is already registered for PROCESS TO PAYMENT
                        const userWalletExist = `SELECT * FROM register_user WHERE user_id LIKE '${user_id}' AND success = '${0}';`;
                        //previous record 
                        const userWalletExistPrevious = `SELECT * FROM register_user WHERE user_id LIKE '${user_id}' AND success = '${1}';`;
                        //create user wallet
                        let personalWalletQuery =
                            "INSERT INTO user_wallet (id, walletAddress, privateKey, amount, otp) VALUES (?);";
                        let personalWalletData = [
                            null,
                            account.address,
                            account.privateKey,
                            0,
                            otp,
                        ];

                        //register user query
                        let registereDuserQuery =
                            "INSERT INTO register_user (id, user_wallet_id,user_id,token,nft,watch,miningPc,swapToken) VALUES (?);";
                        conn.query(userWalletExist, async(err, result) => {
                            if (err) {
                                console.log("error", err);
                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: "Server is busy try again...",
                                });
                            }
                            //user found
                            else if (result.length > 0) {
                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: `Your are already registered.\nPlease make the payment and Click on CONFIRM PAYMENT`,
                                    reply_markup: JSON.stringify(tempKeyBoard1),
                                });
                            }
                            //did not found user then create userWallet
                            else {

                                conn.query(userWalletExistPrevious, async(err, result) => {
                                    if (err) {
                                        console.log("error", err);
                                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            chat_id: chatId,
                                            text: "Server is busy try again...",
                                        });
                                    } else if (result.length > 0) {

                                        console.log("I AM HERE FOR REINSERT==============", result)
                                        if (err) {
                                            console.log("error", err);
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: "Server is busy try again...",
                                            });
                                        }
                                        //create register user details
                                        else {
                                            user_wallet_id = result[0].user_wallet_id;
                                            let registeredUserData = [
                                                null,
                                                user_wallet_id,
                                                req.body.callback_query.from.id,
                                                1,
                                                1,
                                                1,
                                                1,
                                                1,
                                            ];
                                            conn.query(
                                                registereDuserQuery, [registeredUserData],
                                                async(err, result, fields) => {
                                                    if (err) {}
                                                })
                                        }

                                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            chat_id: chatId,
                                            text: `New request has been made.\nPlease make the payment and Click on CONFIRM PAYMENT`,
                                            reply_markup: JSON.stringify(tempKeyBoard),
                                        });
                                    } else {
                                        conn.query(
                                            personalWalletQuery, [personalWalletData],
                                            async(err, result, fields) => {
                                                if (err) {
                                                    console.log("error", err);
                                                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                        chat_id: chatId,
                                                        text: "Server is busy try again...",
                                                    });
                                                }
                                                //create register user details
                                                else {
                                                    user_wallet_id = result.insertId;
                                                    let registeredUserData = [
                                                        null,
                                                        user_wallet_id,
                                                        req.body.callback_query.from.id,
                                                        1,
                                                        1,
                                                        1,
                                                        1,
                                                        1,
                                                    ];
                                                    conn.query(
                                                        registereDuserQuery, [registeredUserData],
                                                        async(err, result, fields) => {
                                                            if (err) {
                                                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                    chat_id: chatId,
                                                                    text: "Server is busy try again...",
                                                                });
                                                            } else {
                                                                let bitcoinWalletData = [
                                                                    null,
                                                                    user_wallet_id,
                                                                    privateKeyBTC,
                                                                    addressBTC,
                                                                    "BTC",
                                                                ];
                                                                let litecoinWalletData = [
                                                                    null,
                                                                    user_wallet_id,
                                                                    privateKeyLTC,
                                                                    addressLTC,
                                                                    "LTC",
                                                                ];
                                                                let ethWalletData = [
                                                                    null,
                                                                    user_wallet_id,
                                                                    account.privateKey,
                                                                    account.address,
                                                                    "ETH",
                                                                ];

                                                                conn.query(
                                                                    userPrivateWallet, [bitcoinWalletData],
                                                                    async(err, result, fields) => {
                                                                        if (err) {
                                                                            console.log("BTC Wallet ERROR", err);
                                                                        } else {
                                                                            console.log("BTC Wallet CREATE");
                                                                        }
                                                                    }
                                                                );
                                                                conn.query(
                                                                    userPrivateWallet, [litecoinWalletData],
                                                                    async(err, result, fields) => {
                                                                        if (err) {
                                                                            console.log("LTC Wallet ERROR", err);
                                                                        } else {
                                                                            console.log("LTC Wallet CREATE");
                                                                        }
                                                                    }
                                                                );
                                                                conn.query(
                                                                    userPrivateWallet, [ethWalletData],
                                                                    async(err, result, fields) => {
                                                                        if (err) {
                                                                            console.log("ETH Wallet ERROR", err);
                                                                        } else {
                                                                            console.log("ETH Wallet CREATE");
                                                                        }
                                                                    }
                                                                );

                                                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                    chat_id: chatId,
                                                                    text: "Please checkout your inbox.We have provided you with all details",
                                                                    reply_markup: JSON.stringify(tempKeyBoard),
                                                                });

                                                                await axios
                                                                    .post(`${TELEGRAM_API}/sendMessage`, {
                                                                        chat_id: user_id,
                                                                        text: `Your Verification code is ${otp}\nDon't share it with anyone.\n
                                                    Bitcoin wallet address - ${addressBTC}\n
                                                    Ethereum wallet address - ${account.address}\n
                                                    Litecoin wallet address - ${addressLTC}\n
                                                    Binance Coin wallet address - ${account.address}\n`,
                                                                    })
                                                                    .catch(async(err) => {
                                                                        console.log("error", err);
                                                                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                            chat_id: chatId,
                                                                            text: "Server is busy try again...",
                                                                        });
                                                                    });
                                                            }
                                                        }
                                                    );
                                                }
                                            }
                                        );
                                    }
                                })
                            }
                        });
                    } else if (text == "CONFIRM PAYMENT") {
                        let tempKeyBoard = {
                            inline_keyboard: [
                                [{
                                    text: "CONFIRM PAYMENT",
                                    callback_data: "CONFIRM PAYMENT",
                                }, ],
                                [{
                                    text: "MAIN MENU",
                                    callback_data: "MAIN MENU",
                                }, ],
                            ],
                        };
                        let tempKeyBoard1 = {
                            inline_keyboard: [
                                [{
                                    text: "MAIN MENU",
                                    callback_data: "MAIN MENU",
                                }, ],
                            ],
                        };
                        let previousBalance
                        let user_id = req.body.callback_query.from.id;
                        let user_wallet_id;
                        let registerUserId;
                        let register_user_id;
                        let PREVIOUSRECORD = await checkPreviousTransaction(user_id)

                        const userWalletExist = `SELECT register_user.id as registerUserId, register_user.*,user_wallet.*
                    FROM register_user
                    JOIN user_wallet
                    ON register_user.user_wallet_id=user_wallet.id
                    WHERE register_user.user_id = '${user_id}' AND register_user.success = ${0};`;

                        conn.query(userWalletExist, async(err, result) => {
                            console.log("result======", result)
                                // console.log("result++++++", result[0].token)
                            if (err) {
                                console.log("ERROR==============asdasdasdasdas", err);
                                return null;
                            } else if (result.length > 0) {
                                console.log("HERE======CONFRIM PAYMENT", result);
                                user_wallet_id = result[0].user_wallet_id;
                                register_user_id = result[0].id;
                                registerUserId = result[0].registerUserId
                                await checkWalletBalance(result[0].user_wallet_id, chatId, 1)
                                    .then(async(res) => {

                                        console.log(" RECHECKING FINAL RESULT", res)
                                        if (
                                            res[0].balance ||
                                            res[1].balance ||
                                            res[2].balance ||
                                            res[3].balance
                                        ) {
                                            let total = 0;
                                            //ltc , bsc, btc , eth
                                            if (res[0].balance && Number(res[0].balance) > 0) {
                                                total += Number(res[0].balance) * ltcPrice;
                                                console.log("=======", res[0].balance * ltcPrice);
                                                // if ((Number(res[0].balance * ltcPrice)) > 200) {
                                                //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                //         chat_id: chatId,
                                                //         text: `Your transaction is successful`
                                                //     })
                                                // } else {
                                                //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                //         chat_id: chatId,
                                                //         text: `Your transaction is less than required\nPlease check the amount you have sended`
                                                //     })
                                                // }
                                            }
                                            if (res[1].balance && Number(res[1].balance) > 0) {
                                                total += Number(res[1].balance) * bnbPrice;
                                                console.log("@@@@@@@@", res[1].balance * bnbPrice);
                                                // if ((Number(res[1] * bnbPrice)) > 200) {
                                                //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                //         chat_id: chatId,
                                                //         text: `Your transaction is successful`
                                                //     })
                                                // } else {
                                                //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                //         chat_id: chatId,
                                                //         text: `Your transaction is less than required\nPlease check the amount you have sended`
                                                //     })
                                                // }
                                            }
                                            if (res[2].balance && Number(res[2].balance) > 0) {
                                                total += Number(res[2].balance) * btcPrice;
                                                console.log("ZZZZZZ", res[2].balance * btcPrice);
                                                // if ((Number(res[2] * btcPrice)) > 200) {
                                                //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                //         chat_id: chatId,
                                                //         text: `Your transaction is successful`
                                                //     })
                                                // } else {
                                                //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                //         chat_id: chatId,
                                                //         text: `Your transaction is less than required\nPlease check the amount you have sended`
                                                //     })
                                                // }
                                            }
                                            if (res[3].balance && Number(res[3].balance) > 0) {
                                                total += Number(res[3].balance) * ethPrice;
                                                console.log("DEDUCTING PREVIOUS BALANCE", Number(res[3].balance));
                                                console.log("DEDUCTING PREVIOUS BALANCE", Number(res[3].balance) * Number(ethPrice));
                                                console.log("DEDUCTING PREVIOUS BALANCE", ethPrice)
                                                console.log("SSSSSS", Number(res[3].balance * ethPrice));

                                                // if ((Number(res[3].balance * ethPrice)) > 200) {
                                                //     createUserWallet(wallet_id, res[3].balance * ethPrice, walletAddress, req.body.message.from.id)
                                                //         .then(res => {
                                                //             console.log("resasdasd", res)
                                                //         }).catch(err => {
                                                //             console.log("errror", err)
                                                //         })

                                                //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                //         chat_id: chatId,
                                                //         text: `Your transaction is successful`
                                                //     })
                                            }

                                            if (PREVIOUSRECORD != 0) {
                                                console.log("DEDUCTING PREVIOUS BALANCE", PREVIOUSRECORD)
                                                total -= Number(PREVIOUSRECORD)
                                            }
                                            console.log("TOTAL==============", total)
                                            if (total >= 5000) {
                                                console.log("TOTAL", total);
                                                // let userAccountAddress
                                                // createUserWallet(wallet_id, res[3].balance * ethPrice, walletAddress, req.body.message.from.id)
                                                //     .then(async (res) => {
                                                //         console.log("resasdasd", res)
                                                //         userAccountAddress = res.accountPublicAddress
                                                //         register_user_id = res.register_user_id
                                                //     }).catch(async (err) => {
                                                //         console.log("errror", err)
                                                //         await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                //             chat_id: chatId,
                                                //             text: `Server busy try again later...`
                                                //         })
                                                //     })
                                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                    chat_id: chatId,
                                                    text: `Your transaction is successfull\nCheck your inbox.`,
                                                });
                                                //update the sucess with corresponding otp
                                                let updateWalletInfo = `UPDATE user_wallet SET success ="${1}" WHERE id = ${user_wallet_id}`;
                                                conn.query(
                                                    updateWalletInfo,
                                                    async(err, result, fields) => {
                                                        if (err) {
                                                            console.log("ERROADasdasd==========");
                                                        } else {
                                                            console.log("UPDATE CONFIRM");
                                                        }
                                                    }
                                                );
                                                // update register_user with approved Balance
                                                let updateWalletBronzeGroup = `UPDATE register_user SET approvedBalance ="${5000}" WHERE id = ${registerUserId}`;
                                                conn.query(
                                                    updateWalletBronzeGroup,
                                                    async(err, result, fields) => {
                                                        if (err) {
                                                            console.log("ERROADasdasd==========");
                                                        } else {
                                                            console.log("UPDATE CONFIRM");
                                                        }
                                                    }
                                                );
                                                //create group_info with registered_user_id
                                                let groupInfoQuery =
                                                    "INSERT INTO group_info (id, groupName,groupId,register_user_id,groupLevel,user_wallet_id) VALUES (?);";
                                                let groupInfoData = [
                                                    null,
                                                    PlatinumGroup.name,
                                                    PlatinumGroup.id,
                                                    register_user_id,
                                                    5,
                                                    user_wallet_id
                                                ];
                                                conn.query(
                                                    groupInfoQuery, [groupInfoData],
                                                    async(err, result, fields) => {
                                                        if (err) {
                                                            console.log("err 2", err);
                                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                chat_id: chatId,
                                                                text: `Server busy try again later...`,
                                                            });
                                                        } else {
                                                            await getUserWalletDetails(user_wallet_id)
                                                                .then(async(res) => {
                                                                    await axios.post(
                                                                        `${TELEGRAM_API}/sendMessage`, {
                                                                            chat_id: req.body.callback_query.from.id,
                                                                            text: `Transaction was successfull\nYour wallet address is ${res[0].walletAddress}\nDon't share it with anyone.\nJoin here ${PlatinumGroup.link} and claim your token and see gift-box status`,
                                                                        }
                                                                    );

                                                                    await axios.post(
                                                                        `${TELEGRAM_API}/sendMessage`, {
                                                                            chat_id: chatId,
                                                                            text: backToHomeText,
                                                                            reply_markup: JSON.stringify(tempKeyBoard1),
                                                                        }
                                                                    );
                                                                })
                                                                .catch(async(er) => {
                                                                    console.log("CONFRIM PAYMENT ERROR ", er);
                                                                    await axios.post(
                                                                        `${TELEGRAM_API}/sendMessage`, {
                                                                            chat_id: chatId,
                                                                            text: `Server busy try again later...`,
                                                                        }
                                                                    );
                                                                });
                                                        }
                                                    }
                                                );
                                            } else if (total >= 1000) {
                                                console.log("TOTAL", total);
                                                // let userAccountAddress
                                                // createUserWallet(wallet_id, res[3].balance * ethPrice, walletAddress, req.body.message.from.id)
                                                //     .then(async (res) => {
                                                //         console.log("resasdasd", res)
                                                //         userAccountAddress = res.accountPublicAddress
                                                //         register_user_id = res.register_user_id
                                                //     }).catch(async (err) => {
                                                //         console.log("errror", err)
                                                //         await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                //             chat_id: chatId,
                                                //             text: `Server busy try again later...`
                                                //         })
                                                //     })
                                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                    chat_id: chatId,
                                                    text: `Your transaction is successfull\nCheck your inbox.`,
                                                });
                                                //update the sucess with corresponding otp
                                                let updateWalletInfo = `UPDATE user_wallet SET success ="${1}" WHERE id = ${user_wallet_id}`;
                                                conn.query(
                                                    updateWalletInfo,
                                                    async(err, result, fields) => {
                                                        if (err) {
                                                            console.log("ERROADasdasd==========");
                                                        } else {
                                                            console.log("UPDATE CONFIRM");
                                                        }
                                                    }
                                                );
                                                // update register_user with approved Balance
                                                let updateWalletBronzeGroup = `UPDATE register_user SET approvedBalance ="${1000}" WHERE id = ${registerUserId}`;
                                                conn.query(
                                                    updateWalletBronzeGroup,
                                                    async(err, result, fields) => {
                                                        if (err) {
                                                            console.log("ERROADasdasd==========");
                                                        } else {
                                                            console.log("UPDATE CONFIRM");
                                                        }
                                                    }
                                                );
                                                //create group_info with registered_user_id
                                                let groupInfoQuery =
                                                    "INSERT INTO group_info (id, groupName,groupId,register_user_id,groupLevel,user_wallet_id) VALUES (?);";
                                                let groupInfoData = [
                                                    null,
                                                    GoldGroup.name,
                                                    GoldGroup.id,
                                                    register_user_id,
                                                    4,
                                                    user_wallet_id
                                                ];
                                                conn.query(
                                                    groupInfoQuery, [groupInfoData],
                                                    async(err, result, fields) => {
                                                        if (err) {
                                                            console.log("err 2", err);
                                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                chat_id: chatId,
                                                                text: `Server busy try again later...`,
                                                            });
                                                        } else {
                                                            await getUserWalletDetails(user_wallet_id)
                                                                .then(async(res) => {
                                                                    await axios.post(
                                                                        `${TELEGRAM_API}/sendMessage`, {
                                                                            chat_id: req.body.callback_query.from.id,
                                                                            text: `Transaction was successfull\nYour wallet address is ${res[0].walletAddress}\nDon't share it with anyone.\nJoin here ${GoldGroup.link} and claim your token and see gift-box status`,
                                                                        }
                                                                    );

                                                                    await axios.post(
                                                                        `${TELEGRAM_API}/sendMessage`, {
                                                                            chat_id: chatId,
                                                                            text: backToHomeText,
                                                                            reply_markup: JSON.stringify(tempKeyBoard1),
                                                                        }
                                                                    );
                                                                })
                                                                .catch(async(er) => {
                                                                    console.log("CONFRIM PAYMENT ERROR ", er);
                                                                    await axios.post(
                                                                        `${TELEGRAM_API}/sendMessage`, {
                                                                            chat_id: chatId,
                                                                            text: `Server busy try again later...`,
                                                                        }
                                                                    );
                                                                });
                                                        }
                                                    }
                                                );
                                            } else if (total >= 500) {
                                                console.log("TOTAL", total);
                                                // let userAccountAddress
                                                // createUserWallet(wallet_id, res[3].balance * ethPrice, walletAddress, req.body.message.from.id)
                                                //     .then(async (res) => {
                                                //         console.log("resasdasd", res)
                                                //         userAccountAddress = res.accountPublicAddress
                                                //         register_user_id = res.register_user_id
                                                //     }).catch(async (err) => {
                                                //         console.log("errror", err)
                                                //         await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                //             chat_id: chatId,
                                                //             text: `Server busy try again later...`
                                                //         })
                                                //     })
                                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                    chat_id: chatId,
                                                    text: `Your transaction is successfull\nCheck your inbox.`,
                                                });
                                                //update the sucess with corresponding otp
                                                let updateWalletInfo = `UPDATE user_wallet SET success ="${1}" WHERE id = ${user_wallet_id}`;
                                                conn.query(
                                                    updateWalletInfo,
                                                    async(err, result, fields) => {
                                                        if (err) {
                                                            console.log("ERROADasdasd==========");
                                                        } else {
                                                            console.log("UPDATE CONFIRM");
                                                        }
                                                    }
                                                );
                                                // update register_user with approved Balance
                                                let updateWalletBronzeGroup = `UPDATE register_user SET approvedBalance ="${500}" WHERE id = ${registerUserId}`;
                                                conn.query(
                                                    updateWalletBronzeGroup,
                                                    async(err, result, fields) => {
                                                        if (err) {
                                                            console.log("ERROADasdasd==========");
                                                        } else {
                                                            console.log("UPDATE CONFIRM");
                                                        }
                                                    }
                                                );
                                                //create group_info with registered_user_id
                                                let groupInfoQuery =
                                                    "INSERT INTO group_info (id, groupName,groupId,register_user_id,groupLevel,user_wallet_id) VALUES (?);";
                                                let groupInfoData = [
                                                    null,
                                                    TitaniumGroup.name,
                                                    TitaniumGroup.id,
                                                    register_user_id,
                                                    3,
                                                    user_wallet_id
                                                ];
                                                conn.query(
                                                    groupInfoQuery, [groupInfoData],
                                                    async(err, result, fields) => {
                                                        if (err) {
                                                            console.log("err 2", err);
                                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                chat_id: chatId,
                                                                text: `Server busy try again later...`,
                                                            });
                                                        } else {
                                                            await getUserWalletDetails(user_wallet_id)
                                                                .then(async(res) => {
                                                                    await axios.post(
                                                                        `${TELEGRAM_API}/sendMessage`, {
                                                                            chat_id: req.body.callback_query.from.id,
                                                                            text: `Transaction was successfull\nYour wallet address is ${res[0].walletAddress}\nDon't share it with anyone.\nJoin here ${TitaniumGroup.link} and claim your token and see gift-box status`,
                                                                        }
                                                                    );

                                                                    await axios.post(
                                                                        `${TELEGRAM_API}/sendMessage`, {
                                                                            chat_id: chatId,
                                                                            text: backToHomeText,
                                                                            reply_markup: JSON.stringify(tempKeyBoard1),
                                                                        }
                                                                    );
                                                                })
                                                                .catch(async(er) => {
                                                                    console.log("CONFRIM PAYMENT ERROR ", er);
                                                                    await axios.post(
                                                                        `${TELEGRAM_API}/sendMessage`, {
                                                                            chat_id: chatId,
                                                                            text: `Server busy try again later...`,
                                                                        }
                                                                    );
                                                                });
                                                        }
                                                    }
                                                );
                                            } else if (total >= 200) {
                                                console.log("TOTAL", total);
                                                // let userAccountAddress
                                                // createUserWallet(wallet_id, res[3].balance * ethPrice, walletAddress, req.body.message.from.id)
                                                //     .then(async (res) => {
                                                //         console.log("resasdasd", res)
                                                //         userAccountAddress = res.accountPublicAddress
                                                //         register_user_id = res.register_user_id
                                                //     }).catch(async (err) => {
                                                //         console.log("errror", err)
                                                //         await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                //             chat_id: chatId,
                                                //             text: `Server busy try again later...`
                                                //         })
                                                //     })
                                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                    chat_id: chatId,
                                                    text: `Your transaction is successfull\nCheck your inbox.`,
                                                });
                                                //update the sucess with corresponding otp
                                                let updateWalletInfo = `UPDATE user_wallet SET success ="${1}" WHERE id = ${user_wallet_id}`;
                                                conn.query(
                                                    updateWalletInfo,
                                                    async(err, result, fields) => {
                                                        if (err) {
                                                            console.log("ERROADasdasd==========");
                                                        } else {
                                                            console.log("UPDATE CONFIRM");
                                                        }
                                                    }
                                                );
                                                // update register_user with approved Balance
                                                let updateWalletBronzeGroup = `UPDATE register_user SET approvedBalance ="${200}" WHERE id = ${registerUserId}`;
                                                conn.query(
                                                    updateWalletBronzeGroup,
                                                    async(err, result, fields) => {
                                                        if (err) {
                                                            console.log("ERROADasdasd==========");
                                                        } else {
                                                            console.log("UPDATE CONFIRM");
                                                        }
                                                    }
                                                );
                                                //create group_info with registered_user_id
                                                let groupInfoQuery =
                                                    "INSERT INTO group_info (id, groupName,groupId,register_user_id,groupLevel,user_wallet_id) VALUES (?);";
                                                let groupInfoData = [
                                                    null,
                                                    BronzeGroup.name,
                                                    BronzeGroup.id,
                                                    register_user_id,
                                                    2,
                                                    user_wallet_id
                                                ];
                                                conn.query(
                                                    groupInfoQuery, [groupInfoData],
                                                    async(err, result, fields) => {
                                                        if (err) {
                                                            console.log("err 2", err);
                                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                chat_id: chatId,
                                                                text: `Server busy try again later...`,
                                                            });
                                                        } else {
                                                            await getUserWalletDetails(user_wallet_id)
                                                                .then(async(res) => {
                                                                    await axios.post(
                                                                        `${TELEGRAM_API}/sendMessage`, {
                                                                            chat_id: req.body.callback_query.from.id,
                                                                            text: `Transaction was successfull\nYour wallet address is ${res[0].walletAddress}\nDon't share it with anyone.\nJoin here ${BronzeGroup.link} and claim your token and see gift-box status`,
                                                                        }
                                                                    );

                                                                    await axios.post(
                                                                        `${TELEGRAM_API}/sendMessage`, {
                                                                            chat_id: chatId,
                                                                            text: backToHomeText,
                                                                            reply_markup: JSON.stringify(tempKeyBoard1),
                                                                        }
                                                                    );
                                                                })
                                                                .catch(async(er) => {
                                                                    console.log("CONFRIM PAYMENT ERROR ", er);
                                                                    await axios.post(
                                                                        `${TELEGRAM_API}/sendMessage`, {
                                                                            chat_id: chatId,
                                                                            text: `Server busy try again later...`,
                                                                        }
                                                                    );
                                                                });
                                                        }
                                                    }
                                                );
                                            } else if (total >= 100) {
                                                console.log("TOTAL", total);
                                                // let userAccountAddress
                                                // createUserWallet(wallet_id, res[3].balance * ethPrice, walletAddress, req.body.message.from.id)
                                                //     .then(async (res) => {
                                                //         console.log("resasdasd", res)
                                                //         userAccountAddress = res.accountPublicAddress
                                                //         register_user_id = res.register_user_id
                                                //     }).catch(async (err) => {
                                                //         console.log("errror", err)
                                                //         await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                //             chat_id: chatId,
                                                //             text: `Server busy try again later...`
                                                //         })
                                                //     })
                                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                    chat_id: chatId,
                                                    text: `Your transaction is successfull\nCheck your inbox.`,
                                                });
                                                // update register_user with approved Balance
                                                let updateWalletInfo = `UPDATE register_user SET approvedBalance ="${100}" WHERE id = ${registerUserId}`;
                                                conn.query(
                                                    updateWalletInfo,
                                                    async(err, result, fields) => {
                                                        if (err) {
                                                            console.log("ERROADasdasd==========");
                                                        } else {
                                                            console.log("UPDATE CONFIRM");
                                                        }
                                                    }
                                                );
                                                //create group_info with registered_user_id
                                                let groupInfoQuery =
                                                    "INSERT INTO group_info (id, groupName,groupId,register_user_id,groupLevel,user_wallet_id) VALUES (?);";
                                                let groupInfoData = [
                                                    null,
                                                    SilverGroup.name,
                                                    SilverGroup.id,
                                                    register_user_id,
                                                    1,
                                                    user_wallet_id
                                                ];
                                                conn.query(
                                                    groupInfoQuery, [groupInfoData],
                                                    async(err, result, fields) => {
                                                        if (err) {
                                                            console.log("err 2", err);
                                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                chat_id: chatId,
                                                                text: `Server busy try again later...`,
                                                            });
                                                        } else {
                                                            await getUserWalletDetails(user_wallet_id)
                                                                .then(async(res) => {
                                                                    await axios.post(
                                                                        `${TELEGRAM_API}/sendMessage`, {
                                                                            chat_id: req.body.callback_query.from.id,
                                                                            text: `Transaction was successfull\nYour wallet address is ${res[0].walletAddress}\nDon't share it with anyone.\nJoin here ${SilverGroup.link} and claim your token and see gift-box status`,
                                                                        }
                                                                    );

                                                                    await axios.post(
                                                                        `${TELEGRAM_API}/sendMessage`, {
                                                                            chat_id: chatId,
                                                                            text: backToHomeText,
                                                                            reply_markup: JSON.stringify(tempKeyBoard1),
                                                                        }
                                                                    );
                                                                })
                                                                .catch(async(er) => {
                                                                    console.log("CONFRIM PAYMENT ERROR ", er);
                                                                    await axios.post(
                                                                        `${TELEGRAM_API}/sendMessage`, {
                                                                            chat_id: chatId,
                                                                            text: `Server busy try again later...`,
                                                                        }
                                                                    );
                                                                });
                                                        }
                                                    }
                                                );
                                            } else {

                                                console.log(" I AM HERE PLEASE RECHECK", total)

                                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                    chat_id: chatId,
                                                    text: `Your transaction is less than required\nPlease check the amount you have sended`,
                                                    reply_markup: JSON.stringify(tempKeyBoard),
                                                });
                                            }
                                        } else {
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Server busy try again later...`,
                                            });
                                        }
                                    })
                                    .catch(async(err) => {
                                        console.log("err", err);
                                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            chat_id: chatId,
                                            text: `Server busy try again later...`,
                                        });
                                    });
                            } else {
                                console.log(" I AM NOT SUPPSE TO HERE========")

                                let reCheckSuccessQuery = `SELECT register_user.*,user_wallet.*
                            FROM register_user
                            JOIN user_wallet
                            ON register_user.user_wallet_id=user_wallet.id
                            WHERE register_user.user_id = '${user_id}' AND register_user.success = ${1};`;

                                await new Promise((resolve, reject) => {
                                    conn.query(reCheckSuccessQuery, async(err, result) => {
                                        console.log("PAYMENT CONFRIM RECHECK", result);
                                        if (err) {
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: `Server busy try again later...`,
                                            });
                                        } else if (result.length > 0) {
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: "Your payment is done\nCheck we have inboxed you all details",
                                            });
                                            resolve();
                                        } else {
                                            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: "You are not registered\nPlease follow the process",
                                            });
                                        }
                                    });
                                });
                            }
                        });
                    } else if (keyWord == "/otp") {
                        let otp = req.body.message.text.split("#")[1];
                        let wallet_id;
                        let walletAddress;
                        let register_user_id;
                        console.log("otp", otp);
                        console.log("TESTING=========", req.body);

                        const findWalletQuery = `SELECT * FROM wallet_info WHERE otp LIKE '${otp}' AND success =${0};`;

                        conn.query(findWalletQuery, async(err, result) => {
                            console.log("asdadada", result);
                            if (err) {
                                console.log("erro", err);
                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: `Server busy try again later...`,
                                });
                            } else if (result.length > 0) {
                                const userWalletQuery = `SELECT * FROM user_private_wallet WHERE wallet_id LIKE '${result[0].id}';`;
                                conn.query(userWalletQuery, async(err, result) => {
                                    if (err) {
                                        console.log("erro", err);
                                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            chat_id: chatId,
                                            text: `Server busy try again later...`,
                                        });
                                    } else if (result.length == 0) {
                                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            chat_id: chatId,
                                            text: `Get register with wallet first`,
                                        });
                                    } else {
                                        wallet_id = result[0].id;
                                        await checkWalletBalance(result, chatId, 1)
                                            .then(async(res) => {
                                                if (
                                                    res[0].balance ||
                                                    res[1].balance ||
                                                    res[2].balance ||
                                                    res[3].balance
                                                ) {
                                                    let total = 0;
                                                    //ltc , bsc, btc , eth
                                                    if (res[0].balance && Number(res[0].balance) > 0) {
                                                        total += Number(res[0].balance) * ltcPrice;
                                                        console.log("=======", res[0].balance * ltcPrice);
                                                        // if ((Number(res[0].balance * ltcPrice)) > 200) {
                                                        //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                        //         chat_id: chatId,
                                                        //         text: `Your transaction is successful`
                                                        //     })
                                                        // } else {
                                                        //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                        //         chat_id: chatId,
                                                        //         text: `Your transaction is less than required\nPlease check the amount you have sended`
                                                        //     })
                                                        // }
                                                    } else if (
                                                        res[1].balance &&
                                                        Number(res[1].balance) > 0
                                                    ) {
                                                        total += Number(res[1].balance) * bnbPrice;
                                                        console.log("@@@@@@@@", res[1].balance * bnbPrice);
                                                        // if ((Number(res[1] * bnbPrice)) > 200) {
                                                        //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                        //         chat_id: chatId,
                                                        //         text: `Your transaction is successful`
                                                        //     })
                                                        // } else {
                                                        //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                        //         chat_id: chatId,
                                                        //         text: `Your transaction is less than required\nPlease check the amount you have sended`
                                                        //     })
                                                        // }
                                                    } else if (
                                                        res[2].balance &&
                                                        Number(res[2].balance) > 0
                                                    ) {
                                                        total += Number(res[2].balance) * btcPrice;
                                                        console.log("ZZZZZZ", res[2].balance * btcPrice);
                                                        // if ((Number(res[2] * btcPrice)) > 200) {
                                                        //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                        //         chat_id: chatId,
                                                        //         text: `Your transaction is successful`
                                                        //     })
                                                        // } else {
                                                        //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                        //         chat_id: chatId,
                                                        //         text: `Your transaction is less than required\nPlease check the amount you have sended`
                                                        //     })
                                                        // }
                                                    } else if (
                                                        res[3].balance &&
                                                        Number(res[3].balance) > 0
                                                    ) {
                                                        total += Number(res[3].balance) * ethPrice;
                                                        console.log(
                                                            "SSSSSS",
                                                            Number(res[3].balance * ethPrice) > 200
                                                        );

                                                        // if ((Number(res[3].balance * ethPrice)) > 200) {
                                                        //     createUserWallet(wallet_id, res[3].balance * ethPrice, walletAddress, req.body.message.from.id)
                                                        //         .then(res => {
                                                        //             console.log("resasdasd", res)
                                                        //         }).catch(err => {
                                                        //             console.log("errror", err)
                                                        //         })

                                                        //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                        //         chat_id: chatId,
                                                        //         text: `Your transaction is successful`
                                                        //     })
                                                    }
                                                    if (total > -1) {
                                                        console.log("TOTAL", total);
                                                        let userAccountAddress;
                                                        createUserWallet(
                                                                wallet_id,
                                                                res[3].balance * ethPrice,
                                                                walletAddress,
                                                                req.body.message.from.id
                                                            )
                                                            .then(async(res) => {
                                                                console.log("resasdasd", res);
                                                                userAccountAddress = res.accountPublicAddress;
                                                                register_user_id = res.register_user_id;
                                                            })
                                                            .catch(async(err) => {
                                                                console.log("errror", err);
                                                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                                    chat_id: chatId,
                                                                    text: `Server busy try again later...`,
                                                                });
                                                            });
                                                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                            chat_id: chatId,
                                                            text: `Your transaction is successfull\nCheck your inbox.`,
                                                        });
                                                        //update the sucess with corresponding otp
                                                        let updateWalletInfo = `UPDATE wallet_info SET success ="${1}" WHERE otp = ${otp}`;
                                                        conn.query(
                                                            updateWalletInfo,
                                                            async(err, result, fields) => {}
                                                        );
                                                        //create group_info with registered_user_id
                                                        let groupInfoQuery =
                                                            "INSERT INTO group_info (id, groupName,groupId,register_user_id) VALUES (?);";
                                                        let groupInfoData = [
                                                            null,
                                                            firstGroupName,
                                                            firstGroupId,
                                                            register_user_id,
                                                        ];
                                                        conn.query(
                                                            groupInfoQuery, [groupInfoData],
                                                            async(err, result, fields) => {
                                                                if (err) {
                                                                    console.log("err 2", err);
                                                                    await axios.post(
                                                                        `${TELEGRAM_API}/sendMessage`, {
                                                                            chat_id: chatId,
                                                                            text: `Server busy try again later...`,
                                                                        }
                                                                    );
                                                                } else {
                                                                    await axios.post(
                                                                        `${TELEGRAM_API}/sendMessage`, {
                                                                            chat_id: req.body.message.from.id,
                                                                            text: `Transaction was successfull\nYour wallet address is ${userAccountAddress}\nDon't share it with anyone.\nJoin here ${stageOneGroupUrl} and claim your token and see gift-box status`,
                                                                        }
                                                                    );
                                                                }
                                                            }
                                                        );
                                                    } else {
                                                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                            chat_id: chatId,
                                                            text: `Your transaction is less than required\nPlease check the amount you have sended`,
                                                        });
                                                    }
                                                } else {
                                                    await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                        chat_id: chatId,
                                                        text: `Server busy try again later...`,
                                                    });
                                                }
                                            })
                                            .catch(async(err) => {
                                                console.log("err", err);
                                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                    chat_id: chatId,
                                                    text: `Server busy try again later...`,
                                                });
                                            });
                                    }
                                });
                            } else {
                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: `Get register or if you are register we have inboxed you will details re-check again...`,
                                });
                            }
                        });

                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                            chat_id: chatId,
                            text: initialTest,
                            reply_markup: JSON.stringify(keyBoard),
                        });
                    } else if (text == "/test") {
                        console.log("TESTING=========", req.body);
                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                            chat_id: chatId,
                            text: initialTest,
                            reply_markup: JSON.stringify(keyBoard),
                        });
                    }
                    // else if (text == "/start") {
                    //     await axios.post(`${TELEGRAM_API}/sendMessage`, {
                    //         chat_id: chatId,
                    //         text: initialTest
                    //     })
                    // }
                    else if (
                        req.body.message.text &&
                        req.body.message.text == "/walletAddress"
                    ) {
                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                            chat_id: chatId,
                            text: "Write the command like /YourWalletAddress#",
                        });
                    } else if (keyWord == "/mywallet" && count == 1) {
                        console.log("userWalletAddress", userWalletAddress);
                        await publicGroupUserDetails(userId)
                            .then((res) => {
                                console.log("HERE=============================");

                                if (res[0].status == null && !res[0].toWalletAddress) {
                                    console.log("res", res[0].status);
                                    let updateQuery = `UPDATE currency_convert_request SET toWalletAddress ="${userWalletAddress}" WHERE publicUserId = '${res[0].id}'`;
                                    conn.query(updateQuery, (err, result) => {
                                        if (err) {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: "Server error try again later...",
                                            });
                                        } else {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: "You wallet Updated",
                                            });
                                        }
                                    });
                                } else if (res[0].status == 2 && !res[0].toWalletAddress) {
                                    console.log("res", res[0].status);
                                    let updateQuery = `UPDATE currency_convert_request SET toWalletAddress ="${userWalletAddress}" WHERE publicUserId = '${res[0].id}'`;
                                    conn.query(updateQuery, (err, result) => {
                                        if (err) {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: "Server error try again later...",
                                            });
                                        } else {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: "You wallet updated",
                                            });
                                        }
                                    });
                                } else {
                                    axios.post(`${TELEGRAM_API}/sendMessage`, {
                                        chat_id: chatId,
                                        text: "You wallet is already updated or you are not registered yet",
                                    });
                                }
                            })
                            .catch((err) => {
                                console.log("ERROR", err);
                            });
                    } else if (keyWord == "/liquiditywallet" && count == 1) {
                        console.log("userWalletAddress======", userWalletAddress);
                        await publicGroupUserLiquidityPool(userId)
                            .then((res) => {
                                if (res[0].status == null && !res[0].toWalletAddress) {
                                    console.log("res", res[0].status);
                                    let updateQuery = `UPDATE currency_convert_request SET toWalletAddress ="${userWalletAddress}" WHERE publicUserId = '${res[0].id}'`;
                                    conn.query(updateQuery, (err, result) => {
                                        if (err) {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: "Server error try again later...",
                                            });
                                        } else {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: "You wallet Updated",
                                            });
                                        }
                                    });
                                } else if (res[0].status == 2 && !res[0].toWalletAddress) {
                                    console.log("res", res[0].status);
                                    let updateQuery = `UPDATE currency_convert_request SET toWalletAddress ="${userWalletAddress}" WHERE publicUserId = '${res[0].id}'`;
                                    conn.query(updateQuery, (err, result) => {
                                        if (err) {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: "Server error try again later...",
                                            });
                                        } else {
                                            axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                chat_id: chatId,
                                                text: "You wallet updated",
                                            });
                                        }
                                    });
                                } else {
                                    axios.post(`${TELEGRAM_API}/sendMessage`, {
                                        chat_id: chatId,
                                        text: "You wallet is already updated or you are not registered yet",
                                    });
                                }
                            })
                            .catch((err) => {
                                console.log("ERROR", err);
                            });
                    } else if (keyWord == "/mywallet") {
                        let tempMyWallet;

                        await publicGroupUserDetails(userId).then((res) => {

                            console.log(" PUBLIC WALLET CHECK", res)
                            if (res.length > 0) {
                                tempMyWallet = res[0].toWalletAddress;
                            }
                        });
                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                            chat_id: chatId,
                            text: `Your wallet address is ${tempMyWallet}\n\n\n` +
                                "Available comamnd  \n" +
                                "/all - show all available commands \n" +
                                "/mywallet - check your wallet addres\n" +
                                "/connect - connect to metaMask Wallet \n",
                        });
                    } else if (text == "/connect") {
                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                            chat_id: chatId,
                            text: "https://metamask.io/download.html",
                        });
                    }
                    //user asking for OTP against a walletAddress
                    else if (keyWord == "/payment") {
                        console.log("keyWord", keyWord);
                        //Generate eth address with private key
                        let account = await web3.eth.accounts.create();

                        //Generate lit coin address with private key
                        let privateKeyLTC = new litecore.PrivateKey("testnet");
                        // let privateKeyLTC = new litecore.PrivateKey();
                        let addressLTC = privateKeyLTC.toAddress();
                        //Generate Bit coin address with private key
                        let privateKeyWIF = bitcore.PrivateKey("testnet").toWIF();
                        // let privateKeyWIF = bitcore.PrivateKey().toWIF();
                        let privateKeyBTC = bitcore.PrivateKey.fromWIF(privateKeyWIF);
                        let addressBTC = privateKeyBTC.toAddress();

                        // let wallet = {
                        //     'private': privateKey.toString(),
                        //     'public': addressBTC.toString()
                        // };
                        // console.log("wallet", wallet)
                        let walletAddress = req.body.message.text.split("#")[1];
                        // if (walletAddress[0] != '0' && walletAddress[1] != 'x') {

                        // }
                        let otp = Math.floor(1000 + Math.random() * 9000);

                        let isExist = `SELECT id FROM wallet_info WHERE walletAddress LIKE '${walletAddress}';`;
                        let signupQry =
                            "INSERT INTO wallet_info (id, walletAddress) VALUES (?);";
                        let btcWalletQuery =
                            "INSERT INTO user_private_wallet (id, wallet_id, privateKey, walletAddress, walletType) VALUES (?);";
                        let paymentData = [null, walletAddress];
                        let wallet_id;

                        conn.query(isExist, async(err, result) => {
                            if (err) {
                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: "Server is busy try again...",
                                });
                            } else if (result.length > 0) {
                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: "This wallet address is already registered",
                                });
                            } else {
                                await storeWalletAddress(walletAddress, otp)
                                    .then(async(result) => {
                                        console.log("res=================", result[0].id);
                                        let bitcoinWalletData = [
                                            null,
                                            result[0].id,
                                            privateKeyBTC,
                                            addressBTC,
                                            "BTC",
                                        ];
                                        let litecoinWalletData = [
                                            null,
                                            result[0].id,
                                            privateKeyLTC,
                                            addressLTC,
                                            "LTC",
                                        ];
                                        let ethWalletData = [
                                            null,
                                            result[0].id,
                                            account.privateKey,
                                            account.address,
                                            "ETH",
                                        ];

                                        conn.query(
                                            btcWalletQuery, [bitcoinWalletData],
                                            async(err, result, fields) => {}
                                        );
                                        conn.query(
                                            btcWalletQuery, [litecoinWalletData],
                                            async(err, result, fields) => {}
                                        );
                                        conn.query(
                                            btcWalletQuery, [ethWalletData],
                                            async(err, result, fields) => {}
                                        );
                                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            chat_id: chatId,
                                            text: `Wait for while...\nCheck we have inbox you further details`,
                                        });

                                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            chat_id: req.body.message.from.id,
                                            text: `Your Verification code is ${otp}\nDon't share it with anyone.\n
                                    Bitcoin wallet address - ${addressBTC}\n
                                    Ethereum wallet address - ${account.address}\n
                                    Litecoin wallet address - ${addressLTC}\n
                                    Binance Coin wallet address - ${account.address}\n`,
                                        });
                                    })
                                    .catch(async(er) => {
                                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            chat_id: chatId,
                                            text: "Server is busy try again...",
                                        });
                                    });
                            }
                        });
                    } else if (keyWord == "/claimtoken") {
                        let walletAddress = req.body.message.text.split("#")[1];
                        console.log("req.body.message.from.id", req.body.message.from.id);

                        let updateQuery = `UPDATE register_user SET token ="${0}" WHERE user_id = '${req.body.message.from.id
              }'`;
                        // let values = [req.body.message.from.id];
                        const tokenClaimDetails = `SELECT * FROM register_user WHERE user_id LIKE '${req.body.message.from.id
              }' AND token = '${1}' ;`;
                        //check token claimed or not
                        conn.query(tokenClaimDetails, async(err, result) => {
                            if (err) {
                                // return res.status(501).json({
                                //     msg: "Number checking error",
                                //     error: err.message
                                // })
                                console.log("erro", err);
                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: `Server busy try again later...`,
                                });
                            } else if (result.length > 0) {
                                //update table walletKey status
                                conn.query(updateQuery, async(err, result) => {
                                    if (err) {
                                        // return res.status(501).json({
                                        //     msg: "Number checking error",
                                        //     error: err.message
                                        // })
                                        console.log("erro", err);
                                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            chat_id: chatId,
                                            text: `Server busy try again later...`,
                                        });
                                    } else {
                                        conn.query(updateQuery, async(err, result) => {
                                            if (err) {
                                                console.log("err-r", err);
                                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                                    chat_id: chatId,
                                                    text: `Server busy try again later...`,
                                                });
                                            }
                                        });
                                        //call token send function
                                        // sendTestBnb(walletAddress)
                                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            chat_id: chatId,
                                            text: `Token has been sended into your wallet`,
                                        });
                                    }
                                });
                            } else {
                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: `This wallet has already claimed it's token`,
                                });
                            }
                        });
                    } else if (keyWord == "/claimgiftbox") {
                        let walletAddress = req.body.message.text.split("#")[1];

                        let updateQuery = `UPDATE transaction_info SET giftClaim ="${1}" WHERE walletAddress = ?`;
                        let values = [walletAddress];
                        const giftClaimDetails = `SELECT * FROM transaction_info WHERE walletAddress LIKE '${walletAddress}' AND giftClaim = '${0}';`;
                        //check token claimed or not
                        conn.query(giftClaimDetails, async(err, result) => {
                            if (err) {
                                // return res.status(501).json({
                                //     msg: "Number checking error",
                                //     error: err.message
                                // })
                                console.log("erro", err);
                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: `Server busy try again later...`,
                                });
                            }
                            console.log("result...", result);
                            if (result.length > 0) {
                                //update table walletKey status
                                conn.query(updateQuery, [values], async(err, result) => {
                                    if (err) {
                                        // return res.status(501).json({
                                        //     msg: "Number checking error",
                                        //     error: err.message
                                        // })
                                        console.log("erro", err);
                                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            chat_id: chatId,
                                            text: `Server busy try again later...`,
                                        });
                                    } else {
                                        //call token send function

                                        await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                            chat_id: chatId,
                                            text: `Gift-box has successfully claimed`,
                                        });
                                    }
                                });
                            } else {
                                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: chatId,
                                    text: `This wallet has already claimed it's gift-box`,
                                });
                            }
                        });
                    } else if (giftBoxChannel == true) {
                        giftBoxChannel = false

                        await axios
                            .post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: req.body.message.chat.id,
                                text: initialTest,
                                reply_markup: JSON.stringify(keyBoard),
                            })
                            .catch((err) => {
                                console.log("IDKKKK", err);
                            });
                    } else if (isServerError == true) {
                        isServerError = false
                        await axios
                            .post(`${TELEGRAM_API}/sendMessage`, {
                                chat_id: req.body.message.chat.id,
                                text: 'SERVER ERROR. Try Again Later',
                            })
                            .catch((err) => {
                                console.log("IDKKKK", err);
                            });
                    } else {

                        if (unknownCommand == false) {
                            console.log("FINAL ELSE");
                            initialTest =
                                "Available comamnd  \n" +
                                "/all - show all available commands \n" +
                                "/connect - connect to metaMask Wallet \n" +
                                "/mywallet - check your wallet address \n";

                            keyBoard = {
                                inline_keyboard: [
                                    [{
                                        text: "AGAME-PARTNER",
                                        callback_data: "AGAME-PARTNER",
                                    }, ],
                                    // [
                                    //   {
                                    //     text: "PROCESS TO PAYMENT",
                                    //     callback_data: "PROCESS TO PAYMENT",
                                    //   },
                                    // ],
                                    // [
                                    //   {
                                    //     text: "CONFIRM PAYMENT",
                                    //     callback_data: "CONFIRM PAYMENT",
                                    //   },
                                    // ],
                                    [{
                                        text: "CONVERT CURRENCY",
                                        callback_data: "CONVERT CURRENCY",
                                    }, ],
                                    [{
                                        text: "LIQUIDITY POOL",
                                        callback_data: "LIQUIDITY POOL",
                                    }, ],
                                ],
                            };
                            await axios
                                .post(`${TELEGRAM_API}/sendMessage`, {
                                    chat_id: req.body.message.chat.id,
                                    text: initialTest,
                                    reply_markup: JSON.stringify(keyBoard),
                                })
                                .catch((err) => {
                                    console.log("I AM DONEeeee", err);
                                });
                        } else if (unknownCommand == true) {
                            console.log("UNK COMMAND TURE")
                            unknownCommand = false
                        }


                    }

                } else {
                    // console.log("EDITED MESSAGE REQUEST", error);
                    // axios.post(`${TELEGRAM_API}/sendMessage`, {
                    //   chat_id: req.body.message.chat.id,
                    //   text: `Unknown `,
                    // });
                    console.log("SERVER ERROR!!!")
                }
                return res.send();
            });
        })
        .catch((error) => {
            console.log("HERE+========================_______________");
            console.log("ERROR", error);
        });
};

app.get("/", (req, res) => {
    res.send("<h2>Backend Is Running</h2>");
});

app.listen(process.env.PORT || 3000, async() => {
    console.log("🚀 app running on port", process.env.PORT || 3000);
    await init();
});