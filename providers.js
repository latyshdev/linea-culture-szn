const {pause, SECOND, logWarn, logError} = require('./helper');

async function createProvider({RPC, proxy}) {
  // console.log("CreateProvider");
  const { JsonRpcProvider, FetchRequest } = require('ethers');

  try  {
    // console.log("используем прокси", proxy);
    // console.log("используем RPC", RPC);
    if (proxy) FetchRequest.registerGetUrl(getUrl);
    let provider =  new JsonRpcProvider(RPC);
    return provider;
  }catch(err){
    logError(`createProvider | ERROR: ${err.message}`)
    await pause(SECOND * 5)
    return false;
  }


/* ========================================================================= */
// Основная логика
/* ========================================================================= */
  async function getUrl(req, _signal) {
    const fetch = require('cross-fetch');
    const { HttpsProxyAgent } = require('https-proxy-agent');
    // Inherited from https://github.com/ethers-io/ethers.js/blob/main/src.ts/utils/geturl-browser.ts
    let signal;
  
    if (_signal) {
        const controller = new AbortController();
        signal = controller.signal;
        _signal.addListener(() => { controller.abort(); });
    }
  
    const init = {
      method: req.method,
      headers: req.headers,
      body: req.body || undefined,
      signal
    };
  
    // This is what we want
    init.agent = new HttpsProxyAgent(proxy);
  
    // Inherited from https://github.com/ethers-io/ethers.js/blob/main/src.ts/utils/geturl-browser.ts
    const resp = await fetch(req.url, init);
  
    const headers = {};
    resp.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });
  
    const respBody = await resp.arrayBuffer();
    const body = (respBody == null) ? null: new Uint8Array(respBody);
    
    return {
      statusCode: resp.status,
      statusMessage: resp.statusText,
      headers,
      body
    };
  };
};

/* ========================================================================= */
// Export
exports.createProvider = createProvider;