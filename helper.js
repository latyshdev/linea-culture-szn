/* ========================================================================= */
const pause = async (ms) => await new Promise(r=>setTimeout( r, ms));

/* ========================================================================= */
const consoleTime = ()=> `${new Date(Date.now()).toLocaleString()}`;

/* ========================================================================= */
const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

/* ========================================================================= */
exports.telegramNotify = telegramNotify;
exports.pause = pause ;
exports.shuffle = shuffle ;
exports.consoleTime = consoleTime ;
exports.randomBetweenInt = randomBetweenInt;
exports.randomBetween = randomBetween;
exports.randomIndexArray = randomIndexArray;
exports.extendObject = extendObject;
exports.evaluateProxy = evaluateProxy;
exports.ceil10 = ceil10;
exports.floor10 = floor10;
exports.hexLog = hexLog;
exports.logWarn = logWarn;
exports.logInfo = logInfo;
exports.logError = logError;
exports.logSuccess = logSuccess;
exports.SECOND = SECOND;
exports.MINUTE = MINUTE;
exports.HOUR = HOUR;
exports.DAY = DAY;
exports.randomDelayInDays = randomDelayInDays;
exports.delayInWeeks = delayInWeeks;
exports.timeUntilTomorrow = timeUntilTomorrow;

/* ========================================================================= */
function randomIndexArray(array){
    return randomBetweenInt(0, array.length);
};

/* ========================================================================= */
function randomBetweenInt(min, max){
        min = Math.ceil(min);
        max = Math.floor(max);
        // The maximum is exclusive and the minimum is inclusive
        return Math.floor(Math.random() * (max - min) + min); 
};

/* ========================================================================= */
function randomBetween(min, max, fixed){
    fixed = (fixed) ? fixed : 6;
    min = parseFloat(min);
    max = parseFloat(max);
    // The maximum is exclusive and the minimum is inclusive
    return (Math.random() * (max - min) + min).toFixed(fixed); 
};

/* ========================================================================= */
function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
};

/* ========================================================================= */
// TELEGRAM
async function telegramNotify(object){
    return;
    let {server, message, API_KEY, options} = object;
    // console.log("server:", server);
    // console.log("message:", message);
    // console.log("API_KEY:", API_KEY);
    // console.log("options:", options);
    // return;
    const TelegramBot = require('node-telegram-bot-api');
    // replace the value below with the Telegram token you receive from @BotFather
    const bot = new TelegramBot(API_KEY);

    options = (options) 
        ? options
        : {
            message_thread_id: "",
            'parse_mode': 'HTML',
            'disable_web_page_preview': true
        };

    try {
        return bot.sendMessage(server, message, options); 
    }catch (error) {
        console.log(`ERROR TG:`, error.message.red);
    }
     
};

/* ========================================================================= */
function extendObject(obj1, obj2) {

    for (let prop in obj2){
        obj1[prop] = obj2[prop];
    }

    return obj1;
};

/* ========================================================================= */
function evaluateProxy(proxy, type) {
    type = (type) ? type : `https`;
    type = type.toLowerCase();
    type = (type === "https" || type === "socks5")
            ? type
            : `https`;
    proxy = proxy.replaceAll('https://', '');
    proxy = proxy.replaceAll('http://', '');
    proxy = proxy.replaceAll('socks5://', '');

    if (proxy.split(":").length - 1 === 3) {
        proxy = proxy.split(":");
        if (proxy[0].split(".").length - 1 === 3){
            proxy = `${proxy[0]}:${proxy[1]}@${proxy[2]}:${proxy[3]}`;
        }else{
            proxy = `${proxy[2]}:${proxy[3]}@${proxy[0]}:${proxy[1]}`;
        }
    }

    if (proxy.split(":").length - 1 === 2) {
        if (!proxy.includes("@")) return false;
        proxy = proxy.split("@");
        if (proxy[0].split(".").length - 1 === 3) {
            proxy = `${proxy[1]}@${proxy[0]}`;
        }else{
            proxy = `${proxy[0]}@${proxy[1]}`;
        }
    }    

    proxy = `${type}://${proxy}`;
    return proxy;
}


function ceil10(number, decimals) {
    if (typeof number === `string`) {
        number = parseFloat(number);
    }
    return Math.ceil10(number, decimals);
}


function floor10(number, decimals) {
    if (typeof number === `string`) {
        number = parseFloat(number);
    }
    return Math.floor10(number, decimals);
}

function decimalAdjust(type, value, exp) {
    // Если степень не определена, либо равна нулю...
    if (typeof exp === "undefined" || +exp === 0) {
    return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // Если значение не является числом, либо степень не является целым числом...
    if (isNaN(value) || !(typeof exp === "number" && exp % 1 === 0)) {
    return NaN;
    }
    // Сдвиг разрядов
    value = value.toString().split("e");
    value = Math[type](+(value[0] + "e" + (value[1] ? +value[1] - exp : -exp)));
    // Обратный сдвиг
    value = value.toString().split("e");
    return +(value[0] + "e" + (value[1] ? +value[1] + exp : exp));
}
  
// Десятичное округление к ближайшему
if (!Math.round10) {
    Math.round10 = function (value, exp) {
    return decimalAdjust("round", value, exp);
    };
}
// Десятичное округление вниз
if (!Math.floor10) {
    Math.floor10 = function (value, exp) {
    return decimalAdjust("floor", value, exp);
    };
}
// Десятичное округление вверх
if (!Math.ceil10) {
    Math.ceil10 = function (value, exp) {
    return decimalAdjust("ceil", value, exp);
    };
}

/* ========================================================================= */
// Цветное HEX сообщение
const colors = require('./_CONFIGS/chalkColors.json');

function hexLog (msg, hex) {
    const chalk = require('chalk');
    const logMe = chalk.hex(hexColorExist(hex));
    return logMe(msg);
}

/* ========================================================================= */
// Цветное warn-info сообщение
function logWarn (msg) {
    return console.log(
        hexLog(`${consoleTime()} |`),
        hexLog(`WARN`, `warn`),
        hexLog(`|`, `info`),
        hexLog(msg, `warn`)
    );
}

/* ========================================================================= */
// Цветное warn-info сообщение
function logSuccess (msg) {
    return console.log(
        hexLog(`${consoleTime()} |`),
        hexLog(`OKAY`, `success`),
        hexLog(`|`, `info`),
        hexLog(msg, `success`)
    );
}


/* ========================================================================= */
// Цветное error сообщение
function logInfo (msg) {
  
    return console.log(
        hexLog(`${consoleTime()} |`, `info`),
        hexLog(`INFO`, `info`),
        hexLog(`|`, `info`),
        hexLog(msg, `info`)
    );
}

/* ========================================================================= */
// Цветное error сообщение
function logError (msg) {
    return console.log(
        hexLog(`${consoleTime()} |`, `error`),
        hexLog(`FAIL |`, `error`),
        hexLog(msg, `error`)
    );
}

/* ========================================================================= */
// Цветное HEX сообщение
function hexColorExist (hex) {
    return (colors[hex])
        ? colors[hex]
        : `#808080`;
}

/* ========================================================================= */
// Рандомная пауза в днях

function randomDelayInDays(daysToDelayMin, daysToDelayMax) {

    daysToDelayMin = parseFloat(daysToDelayMin);
    daysToDelayMax = parseFloat(daysToDelayMax);

    // Check if either parameter is NaN, indicating an invalid value
    if (isNaN(daysToDelayMin)) {
        throw new Error("Invalid value for daysToDelayMin: " + daysToDelayMin);
    }

    if (isNaN(daysToDelayMax)) {
        throw new Error("Invalid value for daysToDelayMax: " + daysToDelayMax);
    }

    if (daysToDelayMin > daysToDelayMax) {
        throw new Error("daysToDelayMin > daysToDelayMax");
    }

    let timeToDelayInMs;
    
    // Some extra time to add to the day if there is Max and Min are the same
    let extraTimeHours = 5;
    let extraTimeMs = extraTimeHours * HOUR;

    if (daysToDelayMin === daysToDelayMax) {
        timeToDelayInMs = randomBetweenInt(
            daysToDelayMin * DAY,   daysToDelayMax * DAY + extraTimeMs);
    } else {
        timeToDelayInMs = randomBetweenInt(daysToDelayMin * DAY, daysToDelayMax * DAY);
    }

    timeToDelayInMs = timeToDelayInMs + timeUntilTomorrow();
    return timeToDelayInMs;
}

/* ========================================================================= */
// Количество мс до следующего дня
function timeUntilTomorrow() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow-now;
    return diff
};

/* ========================================================================= */
// Количество недель паузы в мс
function delayInWeeks(WEEKS) {
    let weeksToDelay = WEEKS;
    const removeDays = 3;

    const now = new Date();
    // Sunday - 0, Monday - 1, ..., Saturday - 6
    const dayOfWeek = now.getDay(); 
    // console.log(`Current day is: ${dayOfWeek}`);
    const fullDaysUntilSunday = (6 - dayOfWeek);

    // 168 hours in milliseconds
    const oneWeekInMilliseconds = 7 * DAY; 

    // remove x days from the full week so that the account has some time to work
    const removeTime = daysToTime(removeDays);
    const trimmedWeekInMilliseconds = oneWeekInMilliseconds - removeTime;
    const trimmedWeekRandomTime = Math.random() * trimmedWeekInMilliseconds;

    const timeUntilNextSunday = timeUntilTomorrow() + daysToTime(fullDaysUntilSunday);
    const fullWeeksToAdd = weeksToDelay - 1;
    
    const fullWeeksToAddInMilliseconds = fullWeeksToAdd * oneWeekInMilliseconds;

    const randomTimeUntilSundayPlusWeeks = timeUntilNextSunday 
        + fullWeeksToAddInMilliseconds + trimmedWeekRandomTime;
    return randomTimeUntilSundayPlusWeeks;

    function daysToTime(days) {
        const timeInDays = days * DAY;
        return timeInDays;
    }
}

