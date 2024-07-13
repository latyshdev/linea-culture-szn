/* ========================================================================= */
// 
const ethers = require('ethers');
const {gasMultiplicate} = require('./ethers_helper');
/* ========================================================================= */
exports.mint = {
  6: {name: `W2: Satoshi Universe`, mint: `0xc0A2a606913A49a0B0a02F682C833EFF3829B4bA`, NFT: `0xc0A2a606913A49a0B0a02F682C833EFF3829B4bA`, ended: true}, // Satoshi Universe
  7: {name: `W2: Linus`, mint: `0xbcfa22a36e555c507092ff16c1af4cb74b8514c8`, NFT: `0xfca530bc063c2e1eb1d399a7a43f8991544b57bf`, ended: true}, // Linus 
  8: {name: `W2: Yooldo`, mint: `0xf502aa456c4ace0d77d55ad86436f84b088486f1`, NFT: `0xf502aa456c4ace0d77d55ad86436f84b088486f1`, ended: true}, // yooldo 
  9: {name: `W2: Frog Wars`, mint: `0x32DeC694570ce8EE6AcA08598DaEeA7A3e0168A3`, NFT: `0x32DeC694570ce8EE6AcA08598DaEeA7A3e0168A3`, ended: true}, // frogwars 
  10: {name: `W2: ACG`, mint: `0x057b0080120D89aE21cC622db34f2d9Ae9fF2BDE`, NFT: `0xef31f7a35a21c43ef4ab2e1ac3f93116d3b38346`, ended: true}, // ACG 
  11: {name: `W2: Toad the Great`, mint: `0x0841479e87Ed8cC7374d3E49fF677f0e62f91fa1`, NFT: `0x0841479e87Ed8cC7374d3E49fF677f0e62f91fa1`, ended: false}, // ACG 

  mintFunctions: {
    name: `Выберите минт`,
    value: false,
    6: mintNFTS2ME,
    7: elementLinusEggs,
    8: yooldoMint,
    9: mintNFTS2ME,
    10: ACG,
    11: mintNFTS2ME,
  }
} 




/* ========================================================================= */
// Минты

// W2: ACG BUG
// {
//   "func": "setApprovalForAll",
//   "params": [
//       "0x0caB6977a9c70E04458b740476B498B214019641",
//       true
//   ]
// }
async function bugACG(BOT, choise) {
  let NFTAddress = choise.NFT;

  const ABI = `[{"inputs":[{"internalType":"address","name":"owner_","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"}]`
  const contract = new ethers.Contract(NFTAddress, ABI, BOT.wallets["LINEA"]);

  // 0x0caB6977a9c70E04458b740476B498B214019641 https://element.market/ 
  let isApprovedForAll = await contract.isApprovedForAll(BOT.wallets["LINEA"].address, `0x0caB6977a9c70E04458b740476B498B214019641`);
  // console.log("isApprovedForAll", isApprovedForAll);
  // если isApprovedForAll, то Layer3 должен засчитать
  if (isApprovedForAll) return true;

  // Даем апрув коллекции элементу
  // Определяем газ
  const gasAmount = await contract["setApprovalForAll"].estimateGas(
    `0x0caB6977a9c70E04458b740476B498B214019641`,
    true,
    BOT.tx_params["LINEA"]
  );
  
  BOT.tx_params["LINEA"].gasLimit = gasMultiplicate(gasAmount, BOT.configs["LINEA"].GAS_AMOUNT_MULTIPLICATOR);
  // console.log(BOT.tx_params["LINEA"]);

  let tx = await contract["setApprovalForAll"](
    `0x0caB6977a9c70E04458b740476B498B214019641`,
    true,
    BOT.tx_params["LINEA"]
  );
  return tx;

}

// W2: ACG
async function ACG(BOT, choise) {
  let contractAddress = choise.mint;
  let NFTAddress = choise.NFT;
  const ABI = `["function mint()", {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]`;
  const contract = new ethers.Contract(contractAddress, ABI, BOT.wallets["LINEA"]);
  const contractNFT = new ethers.Contract(NFTAddress, ABI, BOT.wallets["LINEA"]);

  const balanceOf = await contractNFT.balanceOf(BOT.wallets["LINEA"].address);
  // console.log("balanceOf", balanceOf);

  if (balanceOf > 0) {
    return true;
  } else {

    // Платный минт!
    BOT.tx_params["LINEA"].value = ethers.parseEther(`0.0001`);
    // Определяем сколько нужно газа на транзакцию
    // console.log(BOT.tx_params["LINEA"]);

    const gasAmount = await contract["mint"].estimateGas(BOT.tx_params["LINEA"]);
    BOT.tx_params["LINEA"].gasLimit = gasMultiplicate(gasAmount, BOT.configs["LINEA"].GAS_AMOUNT_MULTIPLICATOR);
    // console.log(gasAmount, BOT.tx_params["LINEA"].gasLimit);
    // console.log(BOT.tx_params["LINEA"]);
    // return gasAmount

    let tx = await contract["mint"](BOT.tx_params["LINEA"]);
    return tx;
  }
}

// W2: Yooldo
async function yooldoMint(BOT, choise){
  let contractAddress = choise.mint;
  const ABI = `["function mint()", {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]`;
  const contract = new ethers.Contract(contractAddress, ABI, BOT.wallets["LINEA"]);

  const balanceOf = await contract.balanceOf(BOT.wallets["LINEA"].address);
  // console.log("balanceOf", balanceOf);

  if (balanceOf > 0) {
    return true;
  } else {
    // Определяем сколько нужно газа на транзакцию
    // console.log(BOT.tx_params["LINEA"])
    const gasAmount = await contract["mint"].estimateGas(BOT.tx_params["LINEA"]);
    BOT.tx_params["LINEA"].gasLimit = gasMultiplicate(gasAmount, BOT.configs["LINEA"].GAS_AMOUNT_MULTIPLICATOR);
    // console.log(gasAmount, BOT.tx_params["LINEA"].gasLimit);
    // return gasAmount
    // console.log(BOT.tx_params["LINEA"]);
    let tx = await contract["mint"](BOT.tx_params["LINEA"]);
    return tx;
  }
}

// W2: Linus 
async function elementLinusEggs(BOT, choise) {
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
    let launchpadId = `0x1ffca9db`;
    let slotId = 0;
    let quantity = 1;
    let quanadditionaltity = [];
    let data = `0x`;

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
}

// Satoshi Universe 
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
    const gasAmount = await contract["mintEfficientN2M_001Z5BWH"].estimateGas(BOT.tx_params["LINEA"]);
    BOT.tx_params["LINEA"].gasLimit = gasMultiplicate(gasAmount, BOT.configs["LINEA"].GAS_AMOUNT_MULTIPLICATOR);
    // console.log(gasAmount, BOT.tx_params["LINEA"].gasLimit);
    // console.log(BOT.tx_params["LINEA"]);
    let tx = await contract["mintEfficientN2M_001Z5BWH"](BOT.tx_params["LINEA"]);
    return tx;
  }
}
