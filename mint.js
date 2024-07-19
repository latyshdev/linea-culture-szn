/* ========================================================================= */
// 
const ethers = require('ethers');
const {gasMultiplicate, waitGwei} = require('./ethers_helper');
const { logError } = require('./helper');
/* ========================================================================= */
exports.mint = {
  1: {name: `W3: AscendTheEnd`, mint: `0xbcfa22a36e555c507092ff16c1af4cb74b8514c8`, NFT: `0xc83ccbd072b0cc3865dbd4bc6c3d686bb0b85915`, ended: true, launchpadId: `0x19a747c1`}, // Linus 
  2: {name: `W3: SendingMe`, mint: `0xeaea2fa0dea2d1191a584cfbb227220822e29086`, NFT: `0xeaea2fa0dea2d1191a584cfbb227220822e29086`, ended: true}, // SendingMe 
  3: {name: `W3: Townstory`, mint: `0x8Ad15e54D37d7d35fCbD62c0f9dE4420e54Df403`, NFT: `0x8ad15e54d37d7d35fcbd62c0f9de4420e54df403`, ended: true}, // Townstory 
  4: {name: `W3: Danielle Zosavac`, mint: `0x3A21e152aC78f3055aA6b23693FB842dEFdE0213`, NFT: `0x3A21e152aC78f3055aA6b23693FB842dEFdE0213`, ended: true}, // DanielleZosavac 
  5: {name: `W3: Demmortal Treasure`, mint: `0x5A77B45B6f5309b07110fe98E25A178eEe7516c1`, NFT: `0x5A77B45B6f5309b07110fe98E25A178eEe7516c1`, ended: false}, // W3: Demmortal Treasure
  
  
  // BASE 

  mintFunctions: {
    name: `Выберите минт`,
    value: false,
    1: elementNFT,
    2: samuel,
    3: mintNFTS2ME,
    4: mintNFTS2ME,
    5: mintPad,
  }
} 




/* ========================================================================= */
// Минты

//
async function mintPad(BOT, choise){
  let contractAddress = choise.mint;

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
async function samuel(BOT, choise) {
  let contractAddress = choise.mint;

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
async function elementNFT(BOT, choise) {
  let contractAddress = choise.mint;
  let NFTAddress = choise.NFT;

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
    let launchpadId = choise.launchpadId;
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
async function mintNFTS2ME(BOT, choise){
  let contractAddress = choise.mint;
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
