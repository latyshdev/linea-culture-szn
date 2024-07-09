/* ========================================================================= */
// Библиотеки
const fs = require('fs');
const inquirer = require('inquirer');

/* ========================================================================= */
// Модули
const mint = require('./mint').mint;
const {logError, logInfo, hexLog, logWarn, evaluateProxy, logSuccess, pause,
  randomBetweenInt, consoleTime,
  MINUTE, SECOND,
  shuffle} = require('./helper');
const {getWallet, getBalance, waitGwei} = require('./ethers_helper');
const {createProvider} = require('./providers');
// console.log(mint);

/* ========================================================================= */
// Код
const mintArray = Object.keys(mint).map(element => element).reverse();
// console.log(mintArray);

/* ========================================================================= */
// Меню
const questions = [
  {
    name: "choice",
    type: "list",
    message: " ",
    choices: mintArray.map(function(key){
      return {
        name: (!mint[key].ended) ? mint[key].name : `${mint[key].name} [ENDED]`, 
        value: key}
    })
  }
];

/* ========================================================================= */
(
  async () => {
    // Выбор минта
    const answers = await inquirer.prompt(questions);
    let choice = await answers.choice;
    // console.log("Выбрали для минта:", mint[choice].name, choice);
    logInfo(`Выбрали для минта: ${hexLog(mint[choice].name, 'balance')}`)

    if (mint[choice].ended || choice === "mintFunctions") {
      logError(`Выбрали неактивный минт.`);
      return false;
    }

    // Проверяем приватные адреса
    const privatesExist = fs.existsSync('privates.txt');
    if (!privatesExist) {
      logError(`Файл privates.txt не существует. Создаю`);
      fs.writeFileSync(`privates.txt`, ``, `utf-8`);
      return false;
    }

    // Считываем приватные адреса
    const privateKeys = fs.readFileSync(`privates.txt`, `utf-8`)
      .split("\n")
      .map(row => row.trim())
      .filter(pk => pk !== "");
    // console.log(privateKeys.length, privateKeys);
    if (privateKeys.length === 0) {
      logError(`Файл privates.txt пуст.`);
      return false;
    }

    // Проверяем прокси
    const proxyExist = fs.existsSync('proxy.txt');
    if (!proxyExist) {
      logError(`Файл proxy.txt не существует. Создаю`);
      fs.writeFileSync(`proxy.txt`, ``, `utf-8`);
      return false;
    }

    // Считываем прокси
    const proxyList = fs.readFileSync(`proxy.txt`, `utf-8`)
      .split("\n")
      .map(row => row.trim())
      .filter(proxy => proxy !== "");
    if (proxyList.length === 0) {
      logError(`Файл proxy.txt пуст.`);
      return false;
    }    

    // Проверяем соответствие
    if (proxyList.length !== privateKeys.length) {
      logError(`Количество прокси не соответствует количеству приватных ключей`);
      logWarn(`Прокси: ${proxyList.length}. Приватных ключей: ${privateKeys.length}`)
      return false;
    }


    const configExist = fs.existsSync('./_CONFIGS/linea.json');
    if (!configExist) {
      logError(`Конфиг linea.json не существует. Копирую конфиг по умолчанию.`);
      logWarn(`Заполните linea.json`);
      fs.copyFileSync('./_CONFIGS/linea.json_', './_CONFIGS/linea.json');
      return false;
    };

    const CONFIG = require('./_CONFIGS/linea.json');
    // console.log(CONFIG);
    if (CONFIG.SHUFFLE_PK) {
      logWarn(`Включена рандомизация кошельков`);
    }

    // Стартуем
    // const privateKeysOld = JSON.parse(JSON.stringify(privateKeys));

    for await (let [i, privateKey] of (CONFIG.SHUFFLE_PK) ? shuffle(JSON.parse(JSON.stringify(privateKeys))).entries() : privateKeys.entries()) {
      console.log();

      // console.log(privateKeys);
      let k = privateKeys.indexOf(privateKey);
      // console.log(k, i, proxyList[k], privateKey);
      // console.log(privateKeysOld, privateKeys)
      // continue;
      const BOT = {};
      BOT.configs = {"LINEA": CONFIG};
      BOT.tx_params = {"LINEA": {}};
      // Создаем провайдера
      BOT.providers = {};

      BOT.providers["LINEA"] = await createProvider({
        RPC: CONFIG.RPC,
        proxy: evaluateProxy(proxyList[k], CONFIG.PROXY_TYPE)
      });

      // Создаем провайдера ETHEREUM
      if (CONFIG.MAX_GWEI_ETHEREUM) {
        BOT.providers["ETHEREUM"] = await createProvider({
          RPC: CONFIG.RPC_ETHEREUM,
          proxy: evaluateProxy(proxyList[k], CONFIG.PROXY_TYPE)
        });
      };

      // Создаем кошелек
      BOT.wallets = {};
      BOT.wallets["LINEA"] = await getWallet(privateKeys[k], BOT.providers["LINEA"]);

      // console.log(BOT);

      // let balance = await getBalance(BOT, "LINEA");
      // logInfo(`Баланс кошелька: ${balance}`);

      let standardMsg = `Кошелек [${BOT.wallets["LINEA"].address}] [${parseInt(i) + 1} из ${privateKeys.length}]`;
      standardMsg += ` | ${mint[choice].name} `;
      try {

        logInfo(standardMsg);

        //Ждем газ и выставляем параметры транзакции (gasPrice)
        // BOT.tx_params["LINEA"].maxFeePerGas = 0;
        // BOT.tx_params["LINEA"].maxPriorityFeePerGas = 0;

        // Txn Type: 0 (Legacy) Rabby Wallet
        BOT.tx_params["LINEA"].type = 0;
        await waitGwei(BOT, "LINEA");

        let msg = ``;

        // Делаем минт
        let tx = await  mint.mintFunctions[choice](BOT, mint[choice]);
        if (tx === true) {
          logSuccess(standardMsg + `| Минт уже был совершен.`);
          msg = consoleTime() + " | " + standardMsg + `| Минт уже был совершен.\n`;
        }
        else {
          logWarn(standardMsg + `| ${tx.hash}`);
          msg = consoleTime() + " | " + standardMsg + `| Транзакция в очереди | ${tx.hash}\n`;
          await tx.wait();
          logSuccess(standardMsg + `| ${tx.hash}`);
          msg += consoleTime() + " | " + standardMsg + `| Транзакция готова | ${tx.hash}\n`;
        }

        // Записываем логи
        fs.appendFileSync(`./_LOGS/logs.txt`, msg, `utf-8`);
        fs.appendFileSync(`./_LOGS/${BOT.wallets["LINEA"].address}.txt`, msg, `utf-8`);
       
        if (tx === true) continue;
        // Пауза между кошельками
        let pauseSeconds = randomBetweenInt(
          CONFIG.PAUSE_BETWEEN_ACCOUNTS[0],
          CONFIG.PAUSE_BETWEEN_ACCOUNTS[1]
        );
        let pauseSecondsMs = pauseSeconds * SECOND;
        logInfo(standardMsg + ` | Пауза ${pauseSecondsMs / SECOND} секунд`)
        await pause(pauseSecondsMs);
        
      } catch (err) {
        logError(standardMsg + ` | ${err.message}`);
        msg = consoleTime() + " | " + standardMsg + ` | ERROR: ${err.message}` + "\n";
        fs.appendFileSync(`./_LOGS/logs.txt`, msg, `utf-8`);
        fs.appendFileSync(`./_LOGS/${BOT.wallets["LINEA"].address}.txt`, msg, `utf-8`);
      }

    }
  }
)();