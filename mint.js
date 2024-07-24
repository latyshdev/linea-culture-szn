/* ========================================================================= */
const ethers = require('ethers');
const {gasMultiplicate, waitGwei} = require('./ethers_helper');
const { logError, pause, SECOND, logInfo } = require('./helper');
/* ========================================================================= */
exports.mint = {
  1: {name: `W3: AscendTheEnd`, mint: `0xbcfa22a36e555c507092ff16c1af4cb74b8514c8`, NFT: `0xc83ccbd072b0cc3865dbd4bc6c3d686bb0b85915`, ended: true, launchpadId: `0x19a747c1`}, // Linus 
  2: {name: `W3: SendingMe`, mint: `0xeaea2fa0dea2d1191a584cfbb227220822e29086`, NFT: `0xeaea2fa0dea2d1191a584cfbb227220822e29086`, ended: true}, // SendingMe 
  3: {name: `W3: Townstory`, mint: `0x8Ad15e54D37d7d35fCbD62c0f9dE4420e54Df403`, NFT: `0x8ad15e54d37d7d35fcbd62c0f9de4420e54df403`, ended: true}, // Townstory 
  4: {name: `W3: Danielle Zosavac`, mint: `0x3A21e152aC78f3055aA6b23693FB842dEFdE0213`, NFT: `0x3A21e152aC78f3055aA6b23693FB842dEFdE0213`, ended: true}, // DanielleZosavac 
  5: {name: `W3: Demmortal Treasure`, mint: `0x5A77B45B6f5309b07110fe98E25A178eEe7516c1`, NFT: `0x5A77B45B6f5309b07110fe98E25A178eEe7516c1`, ended: true}, // W3: Demmortal Treasure
  6: {name: `W3: Foxy`, mint: `0xBcFa22a36E555c507092FF16c1af4cB74B8514C8`, NFT: `0x56223a633b78dccf6926c4734b2447a4b2018cce`, ended: true, launchpadId: `0x2968bd75`}, // W3: Foxy

  7: {name: `W4: Coop Records`, ended: true,}, // W3: Coop Records
  8: {name: `W4: Borja Moskv`, mint: `0x3f0A935c8f3Eb7F9112b54bD3b7fd19237E441Ee`, NFT: `0x3f0A935c8f3Eb7F9112b54bD3b7fd19237E441Ee`, ended: true, phosphor_id: `849e42a7-45dd-4a5b-a895-f5496e46ade2`, token_id: 1}, // W3: Borja Moskv
  9: {name: `W4: Forbidden Fruit - JT`, mint: `0x3EB78e881b28B71329344dF622Ea3A682538EC6a`, NFT: `0x3EB78e881b28B71329344dF622Ea3A682538EC6a`, ended: false, phosphor_id: `3d595f3e-6609-405f-ba3c-d1e28381f11a`, token_id: 3}, // W4: Forbidden Fruit - JT


  
  
  // BASE 

  mintFunctions: {
    name: `Выберите минт`,
    value: false,
    1: elementNFT,
    2: samuel,
    3: mintNFTS2ME,
    4: mintNFTS2ME,
    5: mintPad,
    6: elementNFT,
    7: phosphor,
    8: phosphor,
    9: phosphor,
  }
} 

/* ========================================================================= */
// Функции получения данных
async function getPhosphorData(BOT, id) {

  // console.log(id);

  const axios = require('axios');
  const { HttpsProxyAgent } = require('https-proxy-agent');
  const {isbot} = require('isbot');
  const {HeaderGenerator} = require('header-generator');
  const agent =  new HttpsProxyAgent(BOT.proxy);
  // console.log(isbot, HeaderGenerator);
  const headerGenerator = new HeaderGenerator();
  let headers = headerGenerator.getHeaders(); 
  // console.log(headers);
  let validHeader = false;
  // console.log(headers['user-agent']);

  let headersHaveChPlatformAgent = headers.hasOwnProperty('sec-ch-ua') &&
    headers.hasOwnProperty('sec-ch-ua-platform') &&
    headers.hasOwnProperty('user-agent');

  validHeader = (isbot(headers['user-agent']) && headersHaveChPlatformAgent) 
    ? false 
    : true;
  // console.log("validHeader", validHeader);
  // console.log("isbot", isbot(headers['user-agent']));

  while (!validHeader) {
    headers = headerGenerator.getHeaders();

    headersHaveChPlatformAgent = headers.hasOwnProperty('sec-ch-ua') &&
      headers.hasOwnProperty('sec-ch-ua-platform') &&
      headers.hasOwnProperty('user-agent');

    // console.log(headers['user-agent']);
    validHeader = (isbot(headers['user-agent']) && headersHaveChPlatformAgent) 
      ? false 
      : true;
    // console.log("validHeader", validHeader);
  }

  // console.log(headers);

  // return false;

  const url = `https://public-api.phosphor.xyz/v1/purchase-intents`;

  const dataHeaders = {
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.5',
    'Content-Type': 'application/json',
    'Origin': 'https://app.phosphor.xyz',
    'Priority': 'u=1, i',
    'Referer': 'https://app.phosphor.xyz/',
    'Sec-Ch-Ua': headers['sec-ch-ua'],
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': headers['sec-ch-ua-platform'],
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'User-Agent': headers['user-agent']
  };

  let IP = await axios({
    method: 'GET',
    url: `https://api.ipify.org?format=json`,
    httpsAgent: agent,
  }).catch(err => false);

  if (IP && IP.data && IP.data.ip) console.log("IP:", IP.data.ip);

  return await axios({
    method: 'POST',
    url: url,
    httpsAgent: agent,
    header: dataHeaders,
    data: {
      buyer: {
          eth_address: BOT.wallets['LINEA'].address
        },
        listing_id: id,
        provider: 'MINT_VOUCHER',
        quantity: 1
  }
  })


}

/* ========================================================================= */
// Минты
async function phosphor(BOT, choice) {
  let contractAddress = choice.mint;
  const ABI = `[{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}, {"inputs":[{"components":[{"internalType":"address","name":"netRecipient","type":"address"},{"internalType":"address","name":"initialRecipient","type":"address"},{"internalType":"uint256","name":"initialRecipientAmount","type":"uint256"},{"internalType":"uint256","name":"quantity","type":"uint256"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address","name":"currency","type":"address"}],"internalType":"struct MintVoucherVerification.MintVoucher","name":"voucher","type":"tuple"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"mintWithVoucher","outputs":[],"stateMutability":"payable","type":"function"}]`;
  const contract = new ethers.Contract(contractAddress, ABI, BOT.wallets["LINEA"]);
  const balanceOf = await contract.balanceOf(BOT.wallets["LINEA"].address, choice.token_id);
  // console.log(balanceOf);
  logInfo(`У нас этих NFT: ${balanceOf.toString()}`);

  if (balanceOf > 0) return true;

  let ready = false;

  while (BOT.errors["LINEA"] < BOT.configs['LINEA'].MAX_ERRORS) {

    let response = await getPhosphorData(BOT, choice.phosphor_id);
    // console.log("data", response, BOT.errors["LINEA"]);

    let dataIsValid = [200, 201].includes(response.status) &&
      response.data &&
      response.data.data &&
      response.data?.data?.voucher?.expiry &&
      response?.data?.data?.signature;
    // console.log(response.status);
    // console.log(response.data.data);

    // console.log(response.data?.data?.voucher?.expiry);
    // console.log(response?.data?.data?.signature);

    if (!dataIsValid) {
      logError(`Не смогли получить данные для минта на phosphor`);
      BOT.errors["LINEA"]++;
      await pause(SECOND * 15);
      continue;
    }
    else {
      // Можно минтить
      // получаем газ
      // console.log("можно минтить")

      let signature = response?.data?.data?.signature;
      let voucher = response?.data?.data?.voucher;

    // Определяем сколько нужно газа на транзакцию

    // console.log(contract["mintWithVoucher"]._contract.interface.fragments[1].inputs[0].components)
    // console.log(voucher);

    // console.log(voucher.net_recipient);
    // console.log(voucher.initial_recipient);
    // console.log(voucher.initial_recipient_amount);
    // console.log(voucher.quantity);
    // console.log(voucher.nonce);
    // console.log(voucher.expiry);
    // console.log(voucher.price);
    // console.log(voucher.token_id);
    // console.log(voucher.currency);


    const gasAmount = await contract["mintWithVoucher"].estimateGas(
      [
        voucher.net_recipient,
        voucher.initial_recipient,
        voucher.initial_recipient_amount,
        voucher.quantity,
        voucher.nonce,
        voucher.expiry,
        voucher.price,
        voucher.token_id,
        voucher.currency
      ],
      signature,
      BOT.tx_params["LINEA"]).catch(err=>{
        console.log(err.message);
        return false;
      });
    
    BOT.tx_params["LINEA"].gasLimit = gasMultiplicate(gasAmount, BOT.configs["LINEA"].GAS_AMOUNT_MULTIPLICATOR);
    // console.log(gasAmount, BOT.tx_params["LINEA"].gasLimit);      
    // return true;
    let tx = await contract["mintWithVoucher"](
      [
        voucher.net_recipient,
        voucher.initial_recipient,
        voucher.initial_recipient_amount,
        voucher.quantity,
        voucher.nonce,
        voucher.expiry,
        voucher.price,
        voucher.token_id,
        voucher.currency
      ],
      signature,
      BOT.tx_params["LINEA"])
    return tx;

    }
  } 
  return ready;
}

//
async function mintPad(BOT, choice){
  let contractAddress = choice.mint;

  const ABI = `[{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]`;
  const contract = new ethers.Contract(contractAddress, ABI, BOT.wallets["LINEA"]);
  const balanceOf = await contract.balanceOf(BOT.wallets["LINEA"].address, 0);
  // console.log("balanceOf", balanceOf);
  if (balanceOf > 0) {
    return true;
  } else {

    // Ждем газ
    let gasIsNormal = await waitGwei(BOT, `LINEA`);
    if (!gasIsNormal) return false;
    // console.log(BOT.tx_params["LINEA"]);

    // Определяем сколько нужно газа на транзакцию
    const gasAmount = await contract["mint"].estimateGas(
      BOT.wallets["LINEA"].address,
      0,
      1,
      `0x`,
      BOT.tx_params["LINEA"]);
    
    BOT.tx_params["LINEA"].gasLimit = gasMultiplicate(gasAmount, BOT.configs["LINEA"].GAS_AMOUNT_MULTIPLICATOR);
    console.log(gasAmount, BOT.tx_params["LINEA"].gasLimit);
    // return true;

    let tx = await contract["mint"](
      BOT.wallets["LINEA"].address,
      0,
      1,
      `0x`,
      BOT.tx_params["LINEA"]);
    return tx;
  }
}

//W3: SendingMe
async function samuel(BOT, choice) {
  let contractAddress = choice.mint;

  const ABI = `["function mint()", {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]`;
  const contract = new ethers.Contract(contractAddress, ABI, BOT.wallets["LINEA"]);
  const balanceOf = await contract.balanceOf(BOT.wallets["LINEA"].address);
  // console.log("balanceOf", balanceOf);
  if (balanceOf > 0) {
    return true;
  } else {

    // Ждем газ
    let gasIsNormal = await waitGwei(BOT, `LINEA`);
    if (!gasIsNormal) return false;
    // console.log(BOT.tx_params["LINEA"]);

    // Определяем сколько нужно газа на транзакцию
    const gasAmount = await contract["mint"].estimateGas(BOT.tx_params["LINEA"]);
    
    BOT.tx_params["LINEA"].gasLimit = gasMultiplicate(gasAmount, BOT.configs["LINEA"].GAS_AMOUNT_MULTIPLICATOR);
    // console.log(gasAmount, BOT.tx_params["LINEA"].gasLimit);
    // return true;

    let tx = await contract.mint(BOT.tx_params["LINEA"]);
    return tx;
  }
}

// elementNFT
async function elementNFT(BOT, choice) {
  let contractAddress = choice.mint;
  let NFTAddress = choice.NFT;

  const ABI = `[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[{"internalType":"bytes4","name":"proxyId","type":"bytes4"},{"internalType":"bytes4","name":"launchpadId","type":"bytes4"},{"internalType":"uint256","name":"slotId","type":"uint256"},{"internalType":"uint256","name":"quantity","type":"uint256"}],"name":"getAccountInfoInLaunchpad","outputs":[{"internalType":"bool[]","name":"boolData","type":"bool[]"},{"internalType":"uint256[]","name":"intData","type":"uint256[]"},{"internalType":"bytes[]","name":"byteData","type":"bytes[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bytes4","name":"","type":"bytes4"},{"internalType":"bytes4","name":"launchpadId","type":"bytes4"},{"internalType":"uint256","name":"slotId","type":"uint256"},{"internalType":"uint256","name":"quantity","type":"uint256"}],"name":"getAccountInfoInLaunchpadV2","outputs":[{"internalType":"bool[]","name":"boolData","type":"bool[]"},{"internalType":"uint256[]","name":"intData","type":"uint256[]"},{"internalType":"bytes[]","name":"byteData","type":"bytes[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bytes4","name":"launchpadId","type":"bytes4"},{"internalType":"uint256","name":"slotId","type":"uint256"}],"name":"getAlreadyBuyBty","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes4","name":"","type":"bytes4"},{"internalType":"bytes4","name":"launchpadId","type":"bytes4"},{"internalType":"uint256[]","name":"","type":"uint256[]"}],"name":"getLaunchpadInfo","outputs":[{"internalType":"bool[]","name":"boolData","type":"bool[]"},{"internalType":"uint256[]","name":"intData","type":"uint256[]"},{"internalType":"address[]","name":"addressData","type":"address[]"},{"internalType":"bytes[]","name":"bytesData","type":"bytes[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes4","name":"","type":"bytes4"},{"internalType":"bytes4","name":"launchpadId","type":"bytes4"},{"internalType":"uint256","name":"slotId","type":"uint256"}],"name":"getLaunchpadSlotInfo","outputs":[{"internalType":"bool[]","name":"boolData","type":"bool[]"},{"internalType":"uint256[]","name":"intData","type":"uint256[]"},{"internalType":"address[]","name":"addressData","type":"address[]"},{"internalType":"bytes4[]","name":"bytesData","type":"bytes4[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bytes4","name":"launchpadId","type":"bytes4"},{"internalType":"uint256","name":"slot","type":"uint256"},{"internalType":"uint256","name":"maxBuy","type":"uint256"}],"name":"hashForWhitelist","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes4","name":"launchpadId","type":"bytes4"},{"internalType":"uint256","name":"slotId","type":"uint256"},{"internalType":"address[]","name":"accounts","type":"address[]"},{"internalType":"uint256[]","name":"offChainMaxBuy","type":"uint256[]"},{"internalType":"bytes[]","name":"offChainSign","type":"bytes[]"}],"name":"isInWhiteList","outputs":[{"internalType":"uint8[]","name":"wln","type":"uint8[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes4","name":"","type":"bytes4"},{"internalType":"bytes4","name":"launchpadId","type":"bytes4"},{"internalType":"uint256","name":"slotId","type":"uint256"},{"internalType":"uint256","name":"quantity","type":"uint256"},{"internalType":"uint256[]","name":"additional","type":"uint256[]"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"launchpadBuy","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"bytes4","name":"launchpadId","type":"bytes4"},{"internalType":"uint256","name":"slotId","type":"uint256"},{"internalType":"uint256","name":"quantity","type":"uint256"},{"internalType":"uint256","name":"maxWhitelistBuy","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"struct DataType.BuyParameter[]","name":"parameters","type":"tuple[]"}],"name":"launchpadBuys","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]`;
  const contract = new ethers.Contract(contractAddress, ABI, BOT.wallets["LINEA"]);
  const contractNFT = new ethers.Contract(NFTAddress, [{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}], BOT.wallets["LINEA"]);

  const balanceOf = await contractNFT.balanceOf(BOT.wallets["LINEA"].address);
  if (balanceOf > 0) {
    return true;
  } else {
    // Определяем сколько нужно газа на транзакцию
    // console.log(BOT.tx_params["LINEA"])

    let undefinedParam = `0x0c21cfbb`;
    let launchpadId = choice.launchpadId;
    let slotId = 0;
    let quantity = 1;
    let quanadditionaltity = [];
    let data = `0x`;


    // Ждем газ
    let gasIsNormal = await waitGwei(BOT, `LINEA`);
    if (!gasIsNormal) return false;
    // console.log(BOT.tx_params["LINEA"]);

    const gasAmount = await contract["launchpadBuy"].estimateGas(
      undefinedParam,
      launchpadId,
      slotId,
      quantity,
      quanadditionaltity,
      data,
      BOT.tx_params["LINEA"]);
    
    BOT.tx_params["LINEA"].gasLimit = gasMultiplicate(gasAmount, BOT.configs["LINEA"].GAS_AMOUNT_MULTIPLICATOR);
    // console.log(gasAmount, BOT.tx_params["LINEA"].gasLimit);
    // return true;

    let tx = await contract.launchpadBuy(
      undefinedParam,
      launchpadId,
      slotId,
      quantity,
      quanadditionaltity,
      data,
      BOT.tx_params["LINEA"]);
    return tx;
  }
};


// NFTS2ME
async function mintNFTS2ME(BOT, choice){
  let contractAddress = choice.mint;
  const ABI = `[{"inputs":[],"name":"mintEfficientN2M_001Z5BWH","outputs":[],"stateMutability":"payable","type":"function"}, {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]`;
  const contract = new ethers.Contract(contractAddress, ABI, BOT.wallets["LINEA"]);

  const balanceOf = await contract.balanceOf(BOT.wallets["LINEA"].address);
  // console.log("balanceOf", balanceOf);

  if (balanceOf > 0) {
    return true;
  } else {
    // Определяем сколько нужно газа на транзакцию
    // console.log(BOT.tx_params["LINEA"])

    // Ждем газ
    let gasIsNormal = await waitGwei(BOT, `LINEA`);
    if (!gasIsNormal) return false;

    const gasAmount = await contract["mintEfficientN2M_001Z5BWH"].estimateGas(BOT.tx_params["LINEA"]);
    BOT.tx_params["LINEA"].gasLimit = gasMultiplicate(gasAmount, BOT.configs["LINEA"].GAS_AMOUNT_MULTIPLICATOR);
    // console.log(gasAmount, BOT.tx_params["LINEA"].gasLimit);
    // console.log(BOT.tx_params["LINEA"]);
    let tx = await contract["mintEfficientN2M_001Z5BWH"](BOT.tx_params["LINEA"]);
    return tx;
  }
};
