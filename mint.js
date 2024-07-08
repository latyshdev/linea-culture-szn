/* ========================================================================= */
// 
const ethers = require('ethers');
const {gasMultiplicate} = require('./ethers_helper');
/* ========================================================================= */
exports.mint = {
  1: {name: `W1: OctoMos`, mint: ``, NFT: ``, ended: true},
  2: {name: `W1: Push`, mint: ``, NFT: ``, ended: true},
  3: {name: `W1: Crazy Gang`, mint: ``, NFT: ``, ended: true}, // crazy gang
  4: {name: `W1: Wizards of Linea`, mint: `0xD540038B0B427238984E0341bA49F69CD80DC139`, NFT: `0xD540038B0B427238984E0341bA49F69CD80DC139`, ended: true}, // wizards
  5: {name: `W1: eFrogs`, mint: `0xf4AA97cDE2686Bc5ae2Ee934a8E5330B8B13Be64`, NFT: `0xf4aa97cde2686bc5ae2ee934a8e5330b8b13be64`, ended: true}, //frogs
  6: {name: `W2: Satoshi Universe`, mint: `0xc0A2a606913A49a0B0a02F682C833EFF3829B4bA`, NFT: `0xc0A2a606913A49a0B0a02F682C833EFF3829B4bA`, ended: false}, //Satoshi Universe

  mintFunctions: {
    name: `Выберите минт`,
    value: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: mint6,
  }
} 



/* ========================================================================= */
// Минты
// Satoshi Universe 
// NFTS2ME
async function mint6(BOT, contractAddress){
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
