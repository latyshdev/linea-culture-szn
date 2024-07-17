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
const {getWallet} = require('./ethers_helper');
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

    // Проверяем файл unready.txt
    const unreadyExist = fs.existsSync('./_CONFIGS/unready.txt');
    if (!unreadyExist) {
      logError(`Файл unready.txt не существует. Создаю`);
      fs.writeFileSync(`./_CONFIGS/unready.txt`, ``, `utf-8`);

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

      // Объединяем privateKeys и proxyList
      let unready = ``;
      for await (let [i, privateKey] of privateKeys.entries()) {
        unready += `id${i+1};${privateKey};${proxyList[i]}\n`;
      }
      fs.writeFileSync(`./_CONFIGS/unready.txt`, unready, `utf-8`);

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
    };

    // Стартуем
    // const privateKeysOld = JSON.parse(JSON.stringify(privateKeys));
    let unready = fs
      .readFileSync(`./_CONFIGS/unready.txt`, `utf-8`)
      .split("\n")
      .filter(row => row !== "");

    unready =  (CONFIG.SHUFFLE_PK) ? shuffle(unready) : unready;

    logWarn(`RPC: ${CONFIG.RPC}`);
    if (CONFIG.MAX_GWEI_ETHEREUM) logWarn(`Включено отслеживание gwei в Ethereum: ${CONFIG.MAX_GWEI_ETHEREUM}`);
    if (!CONFIG.MAX_ERRORS) {
      logError(`Не установлен параметр MAX_ERRORS в конфиге`);
    }

    logWarn(`Количество ошибок: ${CONFIG.MAX_ERRORS}`);
    logWarn(`Максимальный gwei: ${CONFIG.MAX_GWEI_PROJECT}`);
    logWarn(`Пауза между кошельками: от ${CONFIG.PAUSE_BETWEEN_ACCOUNTS[0]} до ${CONFIG.PAUSE_BETWEEN_ACCOUNTS[1]} секунд`);
    logWarn(`Тип прокси: ${CONFIG.PROXY_TYPE}`);
    logWarn(`RPC: ${CONFIG.RPC}`);
    console.log();

    if (unready.length === 0) {
      logError(`Файл unready.txt существует, но пуст.`);
      fs.unlinkSync(`./_CONFIGS/unready.txt`);
      return false;
    }

    let length = unready.length;
    fs.appendFileSync(`./_LOGS/logs.txt`, `${"*".repeat(100)}\n${consoleTime()}\n${mint[choice].name} | Кошельков: ${length}\n${"*".repeat(100)}\n`);

    for await (let [i, row] of unready.entries()) {
      // console.log(row);
      console.log();

      // Удаляем кошелек из файла неготовых
      unready = unready.filter(el => el !== row); 
      fs.writeFileSync(`./_CONFIGS/unready.txt`, unready.join("\n"), `utf-8`);


      let [id, privateKey, proxy] = row.split(";").map(el => el.trim());
      // console.log(id, privateKey, proxy);
      // continue;

      const BOT = {};
      BOT.configs = {"LINEA": CONFIG};
      BOT.tx_params = {"LINEA": {}};
      // Создаем провайдера
      BOT.providers = {};

      BOT.providers["LINEA"] = await createProvider({
        RPC: CONFIG.RPC,
        proxy: evaluateProxy(proxy, CONFIG.PROXY_TYPE)
      });

      // Создаем провайдера ETHEREUM
      if (CONFIG.MAX_GWEI_ETHEREUM) {
        BOT.providers["ETHEREUM"] = await createProvider({
          RPC: CONFIG.RPC_ETHEREUM,
          proxy: evaluateProxy(proxy, CONFIG.PROXY_TYPE)
        });
      };

      // Создаем кошелек
      BOT.wallets = {};
      BOT.wallets["LINEA"] = await getWallet(privateKey, BOT.providers["LINEA"]);
      BOT.errors = {};
      BOT.errors["LINEA"] = 0;
      // console.log(BOT);

      // let balance = await getBalance(BOT, "LINEA");
      // logInfo(`Баланс кошелька: ${balance}`);

      let standardMsg = `Кошелек [${BOT.wallets["LINEA"].address} | ${id}] [${parseInt(i) + 1} из ${length}]`;
      standardMsg += ` | ${mint[choice].name} `;
      try {

        logInfo(standardMsg);

        //Ждем газ и выставляем параметры транзакции (gasPrice)
        // BOT.tx_params["LINEA"].maxFeePerGas = 0;
        // BOT.tx_params["LINEA"].maxPriorityFeePerGas = 0;

        // Txn Type: 0 (Legacy) Rabby Wallet
        BOT.tx_params["LINEA"].type = 0;

        let msg = ``;

        // Делаем минт
        let tx = await  mint.mintFunctions[choice](BOT, mint[choice]);
        if (tx === true) {
          logSuccess(standardMsg + `| Минт уже был совершен.`);
          msg = consoleTime() + " | " + standardMsg + `| Минт уже был совершен.\n`;
        }
        else {
          logWarn(standardMsg + `| ${tx.hash}`);
          // msg = consoleTime() + " | " + standardMsg + `| Транзакция в очереди | ${tx.hash}\n`;
          await tx.wait();
          logSuccess(standardMsg + `| ${tx.hash}`);
          msg += consoleTime() + " | " + standardMsg + `| Транзакция готова | ${tx.hash}\n`;
        }

        // Записываем логи и обновляем файлы
        fs.appendFileSync(`./_LOGS/logs.txt`, msg, `utf-8`);
        fs.appendFileSync(`./_CONFIGS/ready.txt`, row + "\n", `utf-8`);
       
        // Если минт был совершен ранее, то пропускаем паузу
        if (tx === true) continue;

        // Если последний кошелек, то ждать не нужно
        if (i+1 === unready.length) continue;

        // Пауза между кошельками
        let pauseSeconds = randomBetweenInt(
          CONFIG.PAUSE_BETWEEN_ACCOUNTS[0],
          CONFIG.PAUSE_BETWEEN_ACCOUNTS[1]
        );
        let pauseSecondsMs = pauseSeconds * SECOND;
        logInfo(standardMsg + ` | Пауза ${pauseSecondsMs / SECOND} секунд`);

        // Пауза между кошельками
        await pause(pauseSecondsMs);
        
      } catch (err) {
        logError(standardMsg + ` | ${err.message}`);
        msg = consoleTime() + " | " + standardMsg + ` | ERROR: ${err.message}` + "\n";
        fs.appendFileSync(`./_LOGS/logs.txt`, msg, `utf-8`);
        fs.appendFileSync(`./_CONFIGS/fail.txt`, row + "\n", `utf-8`);
      }

    };

    process.exit(1);
  }
)();