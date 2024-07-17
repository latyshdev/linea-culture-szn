/* ========================================================================= */
// 
const ethers = require('ethers');
const {gasMultiplicate, waitGwei} = require('./ethers_helper');
const { logError } = require('./helper');
/* ========================================================================= */
exports.mint = {
  12: {name: `W3: AscendTheEnd`, mint: `0xbcfa22a36e555c507092ff16c1af4cb74b8514c8`, NFT: `0xc83ccbd072b0cc3865dbd4bc6c3d686bb0b85915`, ended: true, launchpadId: `0x19a747c1`}, // Linus 
  13: {name: `W3: SendingMe`, mint: `0xeaea2fa0dea2d1191a584cfbb227220822e29086`, NFT: `0xeaea2fa0dea2d1191a584cfbb227220822e29086`, ended: false}, // SendingMe 
  
  
  the_base_era_begins: {name: `BASE: The Base Era Begins`, mint: `0x00005EA00Ac477B1030CE78506496e8C2dE24bf5`, NFT: `0x0852af8836a0fbf8dc7a3556b3dd46109d29d0fb`, ended: false}, // SendingMe 

  // BASE 

  mintFunctions: {
    name: `Выберите минт`,
    value: false,
    the_base_era_begins: the_base_era_begins,
    12: elementNFT,
    13: samuel,
  }
} 




/* ========================================================================= */
// Минты

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


// The Base Era Begins 

async function the_base_era_begins(BOT, choise) {

  if (BOT.configs["LINEA"].RPC.toLowerCase().includes('linea')) {
    logError(`Необходимо поменять RPC в конфиге`);
    process.exit(0);
    return false;
  }

  let contractAddress = choise.mint;
  let NFTAddress = choise.NFT;

  const ABI = `[{"internalType":"uint256","name":"quantity","type":"uint256"}],"name":"mintPublic","outputs":[],"stateMutability":"payable","type":"function"}]`;

  const contract = new ethers.Contract(contractAddress, ABI, BOT.wallets["LINEA"]);
  const contractNFT = new ethers.Contract(NFTAddress, [{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}], BOT.wallets["LINEA"]);

  const balanceOf = await contractNFT.balanceOf(BOT.wallets["LINEA"].address);
  console.log("balanceOf", balanceOf);
  if (balanceOf > 0) {
    return true;
  } else {

    // Ждем газ
    let gasIsNormal = await waitGwei(BOT, `LINEA`);
    if (!gasIsNormal) return false;

    // mintPublic
    // Определяем сколько нужно газа на транзакцию
    // mintPublic(address nftContract,address feeRecipient,address minterIfNotPayer,uint256 quantity)
    let nftContract = `0x0852af8836A0Fbf8dc7a3556B3Dd46109d29D0Fb`;
    let feeRecipient = `0x0000a26b00c1F0DF003000390027140000fAa719`;
    let minterIfNotPayer = `0x0000000000000000000000000000000000000000`;
    let quantity = 1;


    const gasAmount = await contract["mintPublic"].estimateGas(
      nftContract,
      feeRecipient,
      minterIfNotPayer,
      quantity,
      BOT.tx_params["LINEA"]
    );

    BOT.tx_params["LINEA"].gasLimit = gasMultiplicate(gasAmount, BOT.configs["LINEA"].GAS_AMOUNT_MULTIPLICATOR);
    console.log(gasAmount, BOT.tx_params["LINEA"].gasLimit);
    console.log(BOT.tx_params["LINEA"]);
    return true;
    let tx = await contract["mintPublic"](
      nftContract,
      feeRecipient,
      minterIfNotPayer,
      quantity,
      BOT.tx_params["LINEA"]
    );
    return tx;
  }

}
