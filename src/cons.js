var proxy = "";
var API = process.env.REACT_APP_URL_API; 

const WS = "0x0000000000000000000000000000000000000000";//0x0000000000000000000000000000000000000000 recibe los huerfanos por defecto

var SC = "0x512cF2588a0d6C96C9d6b5Bde27c2a6Bd87f8D63";// NUEVO
var SC_old = "0x4Bc61a50d1c974347db9b61d8719a59D02288156";//OLD Antiguo

var TOKEN = "0x55d398326f99059fF775485246999027B3197955";
var chainId = '0x38'; // bnb mainnet

const testnet = false; // habilitar red de pruebas

if(testnet){
    proxy = ""
    API = process.env.REACT_APP_URL_API_2
    SC = "0xc1cb55eCC429949F25baAEB751Fe70f57B99C74c" //Nuevo V2
    SC_old = "0xAb304aEbD091c3479C05029AB44f31C32D5dE4bd" //OLD antiguo 

    TOKEN = "0xd5881b890b443be0c609BDFAdE3D8cE886cF9BAc";
    chainId = '0x61'; // bnb testnet

}

export default {proxy, API, WS, SC, SC_old, TOKEN, chainId};
