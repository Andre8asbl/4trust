const express = require('express');
var cors = require('cors')
const Web3 = require('web3');
const Cryptr = require('cryptr');
const bodyParser = require('body-parser');
const BigNumber = require('bignumber.js');

require('dotenv').config();

const app = express();
//app.use(cors())
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
  })

app.use(bodyParser.json());

const port = process.env.PORT || "3332"

const abiContrato = require("./binaryV2.js"); //V2 nuevo

const addressContrato = "0x6b0fF1579C4e71717a4cDdB9bE69D204E1079F42" //Nevo v2

const WALLET_API = "0x00326ad2E5ADb9b95035737fD4c56aE452C2c965";

const RED = process.env.APP_RED || "https://bsc-dataseed.binance.org/";

const account_1_priv = process.env.REACT_APP_PRIVATE_KY;

const KEY = process.env.REACT_APP_ENCR_STO || 'AAAAAAAAAAAAAAAA';
const cryptr = new Cryptr(KEY); 
const TOKEN = process.env.REACT_APP_API_KEY || "1234567890" ;


var base = "/api"
var version = "/v1"

const URL = base+version+"/"

let web3 = new Web3(new Web3.providers.HttpProvider(RED));

web3.eth.accounts.wallet.add(account_1_priv);

var nonces = 0

var gasPrice = '3000000000'

var contrato = new web3.eth.Contract(abiContrato, addressContrato, {
    from: WALLET_API, // default from address
    //gasPrice: '3000000000' //defautl gas price
});

web3.eth.getGasPrice()
.then((g)=>{
    gasPrice = g
})
.catch((e)=>{
    console.log(e)
})

nonce(0);

async function nonce(){

    var activo = await web3.eth.getTransactionCount(WALLET_API,"pending")
    console.log(activo)

    gasPrice = await web3.eth.getGasPrice();

    console.log(gasPrice)

    if(activo > nonces){
        nonces = activo
    }else{
        nonces++;
    }

    return nonces;
}


async function hagase(){ // muestra que se pueden gestionar varias operaciones al tiempo

    console.log(await contrato.methods.MIN_RETIRO().call())

    contrato.methods.setPlan('2000000').send({nonce:nonces+""}).then((result)=>console.log(result))
    console.log(nonces)

    contrato.methods.setPlan('90909000').send({nonce:await nonce(nonces)+""}).then((result)=>console.log(result))
    console.log(nonces)

    contrato.methods.setPlan('707000').send({nonce:await nonce(nonces)+""}).then((result)=>console.log(result))
    console.log(nonces)

}


function encryptString(s){
    if (typeof s === 'string'){return cryptr.encrypt(s)}else{return {};}
} 

function decryptString(s){
    if (typeof s === 'string'){return cryptr.decrypt(s)}else{return {};}
}

app.get(URL , (req, res) => {

    res.send({online: true})
} )

/*
app.post(URL+'migrate',async(req,res) => {

    let result = {
        "result": false
    }

    if( typeof req.body.data === "string"){

        var data = JSON.parse(decryptString(req.body.data))


        if(data.token == TOKEN ){

            var investor = await contrato_old.methods.investors(data.wallet).call()

            var Id = await contrato_old.methods.addressToId(data.wallet).call()

            var soponsor = await contrato_old.methods.padre(data.wallet).call()

            var sponsorHands = await contrato_old.methods.miHands(soponsor, 1).call()

            var hand = 0
            if(sponsorHands.referer.indexOf(data.wallet) >= 0){
                hand = 1
            }

            var espaciosRango = [false,false,false,false,false,false,false,false,false,false,false,false]

            for (let index = 0; index < espaciosRango.length; index++) {
                if(await contrato_old.methods.rangoReclamado(data.wallet, index).call()){
                    espaciosRango[index] = true;

                }
                
            }

            for (let index = 0; index < espaciosRango.length; index++) {
                espaciosRango[index] = await contrato_old.methods.miHands(soponsor, 1).call()
                
            }

            investor.directosL = await contrato_old.methods.misDirectos(data.wallet, 0).call()
            investor.directosR = await contrato_old.methods.misDirectos(data.wallet, 1).call()
                                //  tiempo   amount*2  valor  pasivo

            var depositos = await contrato_old.methods.depositos(data.wallet).call()
            var porcent = await contrato_old.methods.porcent().call()/100
            investor.depositos = []

            //console.log(depositos)
            for (let index = 0; index < depositos[0].length; index++) {

                if( depositos[3][index]){

                    investor.depositos.push([depositos[1][index],depositos[0][index],new BigNumber(depositos[0][index]).div(porcent).toString(10),depositos[2][index]])
                  
                }
            }
                
            //console.log(investor.depositos)

            var gas = await contrato.methods.migrate(investor,data.wallet,  Id,  espaciosRango, soponsor, hand ).estimateGas({from: WALLET_API})

            //console.log(gas)

            await contrato.methods.migrate(investor,data.wallet,  Id,  espaciosRango, soponsor, hand).send({gasPrice: gasPrice,gas: gas})
            .then(async(r)=>{
                //console.log(r)
                result.hash = r.transactionHash;
                result.result = r.status;
                console.log("Migracion OK "+data.wallet)

            })
            .catch((e)=>{
                console.error(e);
                console.log("Fallo Migracion "+data.wallet)
                result.result = false;
                result.error = JSON.stringify(e);
            })

            

        }
    }

    res.send(result);
    
});

app.post(URL+'calculate/migrate',async(req,res) => {

    let result = {
        "result": false
    }

    if( typeof req.body.data === "string"){

        var data = JSON.parse(decryptString(req.body.data))


        if(data.token == TOKEN ){

            var investor = await contrato_old.methods.investors(data.wallet).call()

            var Id = await contrato_old.methods.addressToId(data.wallet).call()

            var soponsor = await contrato_old.methods.padre(data.wallet).call()

            var sponsorHands = await contrato_old.methods.miHands(soponsor, 1).call()
            
            var hand = 0

            if(sponsorHands.referer.indexOf(data.wallet) >= 0){
                hand = 1
            }

            var espaciosRango = [false,false,false,false,false,false,false,false,false,false,false,false]

            for (let index = 0; index < espaciosRango.length; index++) {
                if(await contrato_old.methods.rangoReclamado(data.wallet, index).call()){
                    espaciosRango[index] = true;

                }
                
            }

            for (let index = 0; index < espaciosRango.length; index++) {
                espaciosRango[index] = await contrato_old.methods.miHands(soponsor, 1).call()
                
            }

            investor.directosL = await contrato_old.methods.misDirectos(data.wallet, 0).call()
            investor.directosR = await contrato_old.methods.misDirectos(data.wallet, 1).call()
                                //  tiempo   amount*2  valor  pasivo

            var depositos = await contrato_old.methods.depositos(data.wallet).call()
            var porcent = await contrato_old.methods.porcent().call()/100
            investor.depositos = []

            //console.log(depositos)
            for (let index = 0; index < depositos[0].length; index++) {

                if( depositos[3][index]){

                    investor.depositos.push([depositos[1][index],depositos[0][index],new BigNumber(depositos[0][index]).div(porcent).toString(10),depositos[2][index]])
                  
                }
            }
                

            await contrato.methods.migrate(investor,data.wallet,  Id,  espaciosRango, soponsor, hand ).estimateGas({from: WALLET_API})
            .then((r)=>{
                result.result=true
                result.gas= r*gasPrice*5
            })
            .catch(()=>{
                result.error="error calculate Gas"
                console.log(data.wallet+" error estimate gas")

            })          

        }
    }

    res.send(result);
    
});
*/

app.post(URL+'retiro',async(req,res) => {

    let result = {
        "result": false
    }

    if( typeof req.body.data === "string"){

        var data = JSON.parse(decryptString(req.body.data))

        if(data.token == TOKEN ){

            let wT = await contrato.methods.withdrawable(data.wallet).call()
            let wB = await contrato.methods.withdrawableBinary(data.wallet).call()

            var gas = await contrato.methods.corteBinarioDo(data.wallet, wB.left, wB.rigth, wT, wB.amount).estimateGas({from: WALLET_API})// gas: 1000000});

            await contrato.methods.corteBinarioDo(data.wallet, wB.left, wB.rigth, wT, wB.amount).send({gasPrice: gasPrice,gas: gas})
            .then(async(r)=>{
                //console.log(r)
                result.hash = r.transactionHash;
                result.result = r.status;
                console.log("Registro Retiro "+data.wallet)

            })
            .catch((e)=>{
                console.error(e);
                console.log("RR Fallo "+data.wallet)
                result.result = false;
                result.error = JSON.stringify(e);
            })
            
        }
    }
		
    res.send(result);
    
});

app.post(URL+'calculate/retiro',async(req,res) => {

    let result = {
        "result": false
    }

    if( typeof req.body.data === "string"){

        var data = JSON.parse(decryptString(req.body.data))

        if(data.token == TOKEN ){

            let wT = await contrato.methods.withdrawable(data.wallet).call()
            let wB = await contrato.methods.withdrawableBinary(data.wallet).call()

            await contrato.methods.corteBinarioDo(data.wallet, wB.left, wB.rigth, wT, wB.amount).estimateGas({from: WALLET_API})
            .then((r)=>{
                result.result = true;
                result.gas= r * gasPrice * 7;
            })
            .catch(()=>{
                result.result = false;
                result.error = "error calculate Gas";
            })   
            
        }
    }
		
    res.send(result);
    
});



app.listen(port, () => {
    console.log(`Listening on: http://localhost:${port+URL} `)
})