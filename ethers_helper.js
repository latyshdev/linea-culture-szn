const ethers = require('ethers');

/* ========================================================================= */
// Цветные сообщения
const HEX = require('./_CONFIGS/chalkColors.json');

const {
  hexLog, logWarn, logInfo, ceil10, logError, logSuccess, pause, shuffle, 
  randomBetweenInt, SECOND, consoleTime
} = require('./helper');


/* ========================================================================= */
function ceilFeeData(feeData, decimals) {
  // console.log("ceilFeeData", feeData);
  let newFeeData = {};
  for (let data in feeData) {
    if (feeData[data]) {
      let mutableValue = ethers.formatUnits(feeData[data], 'gwei');
      // console.log(mutableValue);
      mutableValue = ceil10(mutableValue, decimals);
      mutableValue = `${mutableValue}`;
      // console.log(data, mutableValue);
      newFeeData[data] = ethers.parseUnits(mutableValue, 'gwei');
    }
  }
  // console.log("feeData ceilFeeData", feeData);
  return newFeeData;
};

async function getNetworkGas(BOT, PROJECT_NAME) {
  let gwei = {};
  gwei[PROJECT_NAME] = await BOT.providers[PROJECT_NAME].getFeeData()
    .catch(err => false);

  while (gwei[PROJECT_NAME] === false)   {
    console.log("Не смогли получить данные о комиссиях");
    await pause(SECOND * 15);
    gwei[PROJECT_NAME] = await BOT.providers[PROJECT_NAME].getFeeData()
      .catch(err => false);
  }

  gwei[PROJECT_NAME] = ceilFeeData(gwei[PROJECT_NAME], 
    BOT.configs[PROJECT_NAME].PROJECT_GAS_DECIMALS);

  let gasPrice =  ethers.formatUnits(gwei[PROJECT_NAME].gasPrice, 'gwei');
  gasPrice = parseFloat(gasPrice);

  // logInfo(`${PROJECT_NAME} | Газ ${gasPrice} | `+
  // `MAX: ${BOT.configs[PROJECT_NAME].MAX_GWEI_PROJECT}`); 

  BOT.tx_params[PROJECT_NAME].gasPrice = gwei[PROJECT_NAME].gasPrice;
  return gwei[PROJECT_NAME];
}

/* ========================================================================= */
async function waitGwei(BOT, PROJECT_NAME) {
  // console.log(BOT);
  // console.log();
  // console.log("waitGwei | ");
  process.stdout.write("waitGwei | " + "       " + "\r");
  let ready = false;
  let gwei = {};
  while (!ready) {
    // logInfo(`Аккаунтов в очереди: ${BOT.queue[PROJECT_NAME]}`);
    process.stdout.write('\r');  // needs return '/r'
    await pause(SECOND * 3);
    try {

      // Если нам нужно следить за Ethereum Gwei
      if (BOT.configs[PROJECT_NAME].MAX_GWEI_ETHEREUM) {
       
        if (PROJECT_NAME === 'ETHEREUM') {
          gwei[PROJECT_NAME] = await BOT.providers[PROJECT_NAME].getFeeData();
        } else {
          gwei[PROJECT_NAME] = await BOT.providers[PROJECT_NAME].getFeeData();
          gwei['ETHEREUM'] = await BOT.providers['ETHEREUM'].getFeeData()
          .catch(err => false);
        }
        
        if (!gwei['ETHEREUM'] || !gwei[PROJECT_NAME]) {
          logError("Не смогли получить данные о комиссиях");
        }
        // console.log(gwei)

        gwei[PROJECT_NAME] = ceilFeeData(gwei[PROJECT_NAME], 
          BOT.configs[PROJECT_NAME].PROJECT_GAS_DECIMALS);
          
        let gasPrice =  ethers.formatUnits(gwei[PROJECT_NAME].gasPrice, 'gwei');
        gasPrice = parseFloat(gasPrice);

        gwei['ETHEREUM'] = ceilFeeData(gwei['ETHEREUM'], 0);
        let gasPriceEthereum =  ethers.formatUnits(gwei['ETHEREUM'].gasPrice, 'gwei');
        gasPriceEthereum = parseFloat(gasPriceEthereum);

        // console.log(gasPrice, typeof gasPrice);
        // console.log(BOT.configs[PROJECT_NAME].MAX_GWEI_PROJECT, typeof BOT.configs[PROJECT_NAME].MAX_GWEI_PROJECT);
        // console.log(gasPrice <= BOT.configs[PROJECT_NAME].MAX_GWEI_PROJECT);

        let gasPriceProjectOK = gasPrice <= BOT.configs[PROJECT_NAME].MAX_GWEI_PROJECT ;
        let gasPriceProjectETH = gasPriceEthereum <= BOT.configs[PROJECT_NAME].MAX_GWEI_ETHEREUM ;

        if (gasPriceProjectOK) {
          gasPrice = hexLog(gasPrice, `success`)
        } else {
          gasPrice = hexLog(gasPrice, `error`)
        }

        if (gasPriceProjectETH) {
          gasPriceEthereum = hexLog(gasPriceEthereum, `success`)
        } else {
          gasPriceEthereum = hexLog(gasPriceEthereum, `error`)
        }


        // console.log(gwei);gwei...
        let msg = `${consoleTime()} | ETHEREUM: ${gasPriceEthereum}|`+
        `${BOT.configs[PROJECT_NAME].MAX_GWEI_ETHEREUM}` +
        " || " +
        `${PROJECT_NAME}: ${gasPrice}|` +
        `${BOT.configs[PROJECT_NAME].MAX_GWEI_PROJECT}` +
        "\r";
        // process.stdout.write(msg);
        process.stdout.write(msg);

        if (gasPriceProjectOK && gasPriceProjectETH) {
          console.log();
          ready = true;
          continue;
        }

      // Если нам не нужно следить за Ethereum Gwei
      } else {

      gwei[PROJECT_NAME] = await BOT.providers[PROJECT_NAME].getFeeData()
        .catch(err => false);
      
      if (!gwei[PROJECT_NAME]) {
        logError("Не смогли получить данные о комиссиях");
      }
      // console.log(gwei)

      gwei[PROJECT_NAME] = ceilFeeData(gwei[PROJECT_NAME], 
        BOT.configs[PROJECT_NAME].PROJECT_GAS_DECIMALS);
        
      let gasPrice =  ethers.formatUnits(gwei[PROJECT_NAME].gasPrice, 'gwei');
      gasPrice = parseFloat(gasPrice);

      let gasPriceProjectOK = gasPrice < BOT.configs[PROJECT_NAME].MAX_GWEI_PROJECT ;

      // console.log(gwei);

      if (gasPriceProjectOK) {
        logInfo(`${PROJECT_NAME} | Газ ${gasPrice} | `+
        `MAX: ${BOT.configs[PROJECT_NAME].MAX_GWEI_PROJECT}`);
        ready = true;
        continue;
      } else {
        logInfo(`${PROJECT_NAME} | Газ ${gasPrice} | `+
        `MAX: ${BOT.configs[PROJECT_NAME].MAX_GWEI_PROJECT}`);
      }
      // console.log();

      };

    } catch (err) {
      console.error(err);
      logError(`Ошибка при получении газа`);
      await pause(SECOND * 30);
    };

    await pause(SECOND * 15);
  }

  BOT.tx_params[PROJECT_NAME].gasPrice = gwei[PROJECT_NAME].gasPrice;

  return gwei[PROJECT_NAME];

};

function gasMultiplicate(amount, multiplicate) {
  let amountFloat = ethers.formatUnits(amount, `wei`);
  amountFloat = amountFloat * multiplicate;
  return ethers.parseUnits(`${parseInt(Math.ceil(amountFloat))}`, `wei`);
}

/* ========================================================================= */
// 
function getAmountInDecimals(amount, decimals) {
  // console.log(amount, decimals);
  amount = parseFloat(`${amount}`);
  amount = amount.toFixed(decimals.toString());
  return ethers.parseUnits(`${amount}`, decimals);
}

/* ========================================================================= */
// 
function getAmountSlippage(amount, SLIPPAGE) {

  const ONE_HUNDRED = BigInt(100);

  let getAmountOutAfterSlippage = amount
    * (ONE_HUNDRED * ONE_HUNDRED - BigInt(SLIPPAGE * 100))
    / (ONE_HUNDRED * ONE_HUNDRED);
  // console.log("getAmountOut SLIPPAGE", getAmountOutAfterSlippage);

  return getAmountOutAfterSlippage;
}

/* ========================================================================= */
// Получаем рандомное приложение для взаимодействия с определенным токеном
function getRandomDEX(coin, PROJECT_NAME) {

  let DEX = getAllDEX(PROJECT_NAME);

  // Собираем массив DEX'ов
  let sorted = Object.keys(DEX);
  // console.log(sorted);

  // Оставляем только активные
  sorted = sorted.filter(dex => DEX[dex].enable);
  // console.log(sorted);

  // Фильтруем по взаимодействию с токеном
  sorted = sorted.filter(dex => {
    // console.log(DEX[dex]);
    return DEX[dex].coins.includes(coin)
  });

  if (sorted.length === 0) return false;

  // Перемешиваем
  sorted = shuffle(sorted);

  return DEX[sorted[0]];
}

/* ========================================================================= */
// getDEX
function getAllDEX(PROJECT_NAME) {
  try {
    const DEXES = require(`./_PROTOCOLS/${PROJECT_NAME}.json`);
    for (let dex in DEXES) {
      // dexesUpperCased[dex.toUpperCase()] = DEXES[dex]
      DEXES[dex].coins = DEXES[dex].coins.map(el => el.toUpperCase());
    }
    // console.log("DEXES", DEXES)
    return DEXES;

  } catch (err) {
    return false;
  }
};

/* ========================================================================= */
// Получаем адреса токенов в сети
function getCoins(PROJECT_NAME) {
  // console.log(PROJECT_NAME)
  let coinsBuffer = require(`./_TOKENS/${PROJECT_NAME.toLowerCase()}.json`);
  let coins = {};
  for (let coin in coinsBuffer) {
    coins[coin.toUpperCase()] = coinsBuffer[coin]
  }
  return coins;
};

/* ========================================================================= */
// baseContract
async function Contract(contractAddress, ABI, wallet) {
  const contract = new ethers.Contract(contractAddress, ABI, wallet);
  return contract;
};

/* ========================================================================= */
// getERC20BalancesInUSD
async function getERC20BalancesInUSD(BOT, PROJECT_NAME, PRICES) {
  let Coins = getCoins(PROJECT_NAME);
  console.log(Coins, PRICES);
  console.log("BOT.balances", BOT.balances[PROJECT_NAME]);
  // console.log("PRICES", PRICES);

  const result = [];

  for (let token in BOT.balances[PROJECT_NAME]) {
    // console.log(token);
    if (BOT.configs[PROJECT_NAME]["NATIVE_TOKEN"] === token) {
      continue;
    }

    if (BOT.balances[PROJECT_NAME][token] > 0) {

      let balance = BOT.balances[PROJECT_NAME][token];
      let decimals = await BOT.ERC20_contracts[PROJECT_NAME][token].decimals();
      // console.log(token, balance, decimals);

      let amount = ethers.formatUnits(balance, decimals);

      if (!PRICES[token]) {
        logError("Нет цены для токена", token);
        if (token === "DAI") {
          PRICES[token] = PRICES["USDC"] || PRICES["USDT"] || 1;
        }
      }

      amount = parseFloat(amount);
      result.push({
        token: token,
        amount: amount,
        amountInUsd: amount * PRICES[token]
      })
    }

  }
  return result.sort((a,b) => b.amountInUsd - a.amountInUsd);
}

/* ========================================================================= */
// Получаем нативный баланс
async function getBalance(BOT, PROJECT_NAME) {
  // console.log("getBalance:")
  try {
    return await BOT.providers[PROJECT_NAME]
      .getBalance(BOT.wallets[PROJECT_NAME].address);
  } catch (error) {
  logError(`${PROJECT_NAME} | ${BOT.session} | Не смогли получить баланс | `
      + error.message);
    return false;
  }
}


/* ========================================================================= */ 
async function txnAmount(provider, walletAddress) {
  return (await provider.getTransactionCount(walletAddress));
};

/* ========================================================================= */
// Функция для пауз между транзакциями
async function pauseBetweenTx({min, max}) {
  if (!min || !max) {
    logWarn(`В функцию pauseBetweenTx не переданы значения для min или max`);
    return false;
  }
  let pauseInMs = randomBetweenInt(min, max);
  pauseInMs = pauseInMs * 1000;
  logInfo(`Пауза между активностями ${parseInt(pauseInMs / 1000)} секунд`);

  return await pause(pauseInMs);
}

/* ========================================================================= */
// Получаем кошелек
async function getWallet(privateKey, provider) {
  // console.log(privateKey, provider)
  let wallet = new ethers.Wallet(privateKey, provider);
  // console.log(wallet.address);
  return wallet;
};

/* ========================================================================= */
// Из строки в ETHEREUM BigInt
function parseEther(string) {
  return ethers.parseEther(`${string}`);
}

/* ========================================================================= */
// Из BigInt в строку
function formatEther(bigInt) {
  return ethers.formatEther(bigInt);
}

/* ========================================================================= */
// Отправка нативки
async function transfer({BOT, PROJECT_NAME}) {
  let wallet = BOT.wallets[PROJECT_NAME];
  return wallet.sendTransaction(BOT.tx_params[PROJECT_NAME]);
}

/* ========================================================================= */
// Проверка транзакции по хэшу
// 0 = failed, 1 = ok, null = not minted
async function checkTxn(BOT, PROJECT_NAME, TXN_HASH) {
  const txn = await BOT.providers[PROJECT_NAME].getTransactionReceipt(TXN_HASH);
  // console.log(txn);
  return (txn && txn.hasOwnProperty('status')) ? txn.status : null;
}


/* ========================================================================= */
exports.waitGwei = waitGwei;
exports.getNetworkGas = getNetworkGas;
exports.getAmountInDecimals = getAmountInDecimals;
exports.getAmountSlippage = getAmountSlippage;
exports.getCoins = getCoins;
exports.getRandomDEX = getRandomDEX;
exports.getBalance = getBalance;
// exports.getERC20Balances = getERC20Balances;
// exports.getERC20BalancesInUSD = getERC20BalancesInUSD;
exports.txnAmount = txnAmount;
exports.gasMultiplicate = gasMultiplicate;
exports.pauseBetweenTx = pauseBetweenTx;
exports.getWallet = getWallet;
exports.parseEther = parseEther;
exports.formatEther = formatEther;
exports.transfer = transfer;
exports.checkTxn = checkTxn;