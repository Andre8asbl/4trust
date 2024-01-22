var proxy = "";
var API = process.env.REACT_APP_URL_API; 

const WS = "0x0000000000000000000000000000000000000000";//0x0000000000000000000000000000000000000000 recibe los huerfanos por defecto
const walletAPI = "0x00326ad2E5ADb9b95035737fD4c56aE452C2c965";

var SC = "0x6b0fF1579C4e71717a4cDdB9bE69D204E1079F42";// NUEVO

var TOKEN = "0x55d398326f99059fF775485246999027B3197955";
var chainId = '0x38'; // bnb mainnet

const testnet = false; // habilitar red de pruebas

if(testnet){
    proxy = ""
    API = process.env.REACT_APP_URL_API_2
    SC = "0xc1cb55eCC429949F25baAEB751Fe70f57B99C74c" //Nuevo V2

    TOKEN = "0xd5881b890b443be0c609BDFAdE3D8cE886cF9BAc";
    chainId = '0x61'; // bnb testnet

}

export default {proxy, API, WS, SC, TOKEN, chainId, walletAPI};
