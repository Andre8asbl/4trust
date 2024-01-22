import React, { Component } from "react";
import cons from "../../cons.js";

const BigNumber = require('bignumber.js');

const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.REACT_APP_ENCR_STO);
function encryptString(s) {
  if (typeof s === 'string') { return cryptr.encrypt(s) } else { return {}; }
}

export default class CrowdFunding extends Component {
  constructor(props) {
    super(props);

    this.state = {

      min: 100,
      deposito: "Loading...",
      balance: "Loading...",
      accountAddress: "0x0000000000000000000000000000000000000000",
      currentAccount: "0x0000000000000000000000000000000000000000",
      porcentaje: "Loading...",
      dias: "Loading...",
      partner: "Loading...",
      balanceTRX: "Loading...",
      balanceUSDT: "Loading...",
      precioSITE: 1,
      valueUSDT: 1,
      valueUSDTResult: 25,
      hand: 0,
      balanceSite: 0,

    };

    this.deposit = this.deposit.bind(this);
    this.estado2 = this.estado2.bind(this);

    this.handleChangeUSDT = this.handleChangeUSDT.bind(this);
    this.handleChangeUSDTResult = this.handleChangeUSDTResult.bind(this);

    this.migrate = this.migrate.bind(this);
  }

  async handleChangeUSDT(event) {

    this.setState({valueUSDT: event.target.value});

    if(parseInt(this.state.valueUSDT) < 1 || false){
      this.setState({valueUSDT: 1});
    }

    this.setState({valueUSDTResult: parseInt(this.state.valueUSDT*25)});
  }

  async handleChangeUSDTResult(event) {

    let value = event.target.value

    this.setState({valueUSDTResult: value});
    //console.log(this.state.valueUSDTResult%25)
    /*if(parseInt(this.state.valueUSDTResult) < 25){
      await this.setState({valueUSDTResult: 25});
    }else{
      if(this.state.valueUSDTResult%25 === 0){
        await this.setState({valueUSDTResult: this.state.valueUSDTResult-(this.state.valueUSDTResult%25)});
      }else{
        await this.setState({valueUSDTResult: this.state.valueUSDTResult-(this.state.valueUSDTResult%25)+25});

      }
      
    }*/
    
    this.setState({valueUSDT: parseInt(value/25)});
  }

  async componentDidMount() {
    
    setInterval(() => {
      this.setState({currentAccount: this.props.currentAccount});
      this.estado2();
    },3*1000);

    this.migrate()
    
  };

  async estado2(){

    var accountAddress =  this.props.currentAccount;
    var inversors = await this.props.wallet.contractBinary.methods.investors(this.props.currentAccount).call({from:this.props.currentAccount});

    //console.log("estadooooo: ",await this.props.wallet.contractBinary.methods.setstate().call({from:this.props.currentAccount}))
    
    var inicio = accountAddress.substr(0,4);
    var fin = accountAddress.substr(-4);

    var texto = inicio+"..."+fin;

    document.getElementById("login").href = `https://bscscan.com/address/${accountAddress}`;
    document.getElementById("login-my-wallet").innerHTML = texto;

    var nameToken1 = await this.props.wallet.contractToken.methods.symbol().call({from:this.props.currentAccount});

    var aprovado = await this.props.wallet.contractToken.methods.allowance(accountAddress,this.props.wallet.contractBinary._address).call({from:this.props.currentAccount});

    if (aprovado > 0) {
      if(!inversors.registered){
        aprovado = "Register";
      }else{
        aprovado = "Buy Plan";
      }
      
    }else{
      aprovado = "Allow wallet";
    }

    inversors.inicio = 1000;
    
    var tiempo = await this.props.wallet.contractBinary.methods.tiempo().call({from:this.props.currentAccount});

    tiempo = tiempo*1000;

    var porcentiempo = ((Date.now()-inversors.inicio)*100)/tiempo;

    var decimales = await this.props.wallet.contractToken.methods.decimals().call({from:this.props.currentAccount});

    var balance = await this.props.wallet.contractToken.methods.balanceOf(this.props.currentAccount).call({from:this.props.currentAccount});

    balance = new BigNumber(balance).shiftedBy(-decimales).toString(10);

    var valorPlan = 0;

    if( porcentiempo < 100 ){
      aprovado = "Update Plan";

      valorPlan = inversors.plan/10**8;
      
    }

    var partner = cons.WS;

    var hand = "Left ";

    if ( inversors.registered ) {
      partner = await this.props.wallet.contractBinary.methods.padre(this.props.currentAccount).call({from:this.props.currentAccount});

    }else{

      var loc = document.location.href;
      if(loc.indexOf('?')>0){
          var getString = loc.split('?');
          //console.log(getString)
          getString = getString[getString.length-1];
          //console.log(getString);
          var GET = getString.split('&');
          var get = {};
          for(var i = 0, l = GET.length; i < l; i++){
              var tmp = GET[i].split('=');
              get[tmp[0]] = unescape(decodeURI(tmp[1]));
          }

          if (get['hand']){
            tmp = get['hand'].split('#');

            //console.log(tmp);

            if (tmp[0] === "right") {
              hand = "Rigth ";
            }
          }

          if (get['ref']) {
            tmp = get['ref'].split('#');

            //console.log(tmp[0]);

            var wallet = await this.props.wallet.contractBinary.methods.idToAddress(tmp[0]).call({from:this.props.currentAccount});

            inversors = await this.props.wallet.contractBinary.methods.investors(wallet).call({from:this.props.currentAccount});
            //console.log(wallet);
            if ( inversors.registered ) {
              partner = hand+" of "+wallet;
            }
          }

        
      }

    }

    if(partner === "0x0000000000000000000000000000000000000000"){
      partner = "---------------------------------";
    }
    
    var dias = await this.props.wallet.contractBinary.methods.tiempo().call({from:this.props.currentAccount});

    //dias = (parseInt(dias)/86400);

    var porcentaje = await this.props.wallet.contractBinary.methods.porcent().call({from:this.props.currentAccount});

    porcentaje = parseInt(porcentaje);

    var decimals = await this.props.wallet.contractToken.methods.decimals().call({from:this.props.currentAccount});

    var balanceUSDT = await this.props.wallet.contractToken.methods.balanceOf(this.props.currentAccount).call({from:this.props.currentAccount});

    balanceUSDT = parseInt(balanceUSDT)/10**decimals;

    this.setState({
      deposito: aprovado,
      balance: valorPlan,
      decimales: decimales,
      accountAddress: accountAddress,
      porcentaje: porcentaje,
      dias: dias,
      partner: partner,
      balanceSite: balance,
      balanceUSDT: balanceUSDT,
      nameToken1: nameToken1
    });
  }


  async deposit() {

    if(this.props.view) {window.alert("Is only view mode"); return;};

    var { balanceSite, valueUSDT , balance} = this.state;

    var aprovado = await this.props.wallet.contractToken.methods.allowance(this.props.currentAccount,this.props.wallet.contractBinary._address).call({from:this.props.currentAccount});

    if (aprovado*1 <= 0 ){
      await this.props.wallet.contractToken.methods.approve(this.props.wallet.contractBinary._address, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({from:this.props.currentAccount});
      window.alert("Balance approval for exchange: successful");
      aprovado = await this.props.wallet.contractToken.methods.allowance(this.props.currentAccount,this.props.wallet.contractBinary._address).call({from:this.props.currentAccount});


    }

    var amount = await this.props.wallet.contractBinary.methods.plan().call({from:this.props.currentAccount});
    amount = new BigNumber(amount).shiftedBy(-18).toNumber();
    amount = amount*valueUSDT;
    amount = amount-balance;

    if ( aprovado > 0 && balanceSite >= amount ){

        var loc = document.location.href;
        var sponsor = cons.WS;
        var hand = 0;
        var investors = await this.props.wallet.contractBinary.methods.investors(this.props.currentAccount).call({from:this.props.currentAccount});

        if (investors.registered) {

          sponsor = await this.props.wallet.contractBinary.methods.padre(this.props.currentAccount).call({from:this.props.currentAccount});

        }else{

          if(loc.indexOf('?')>0){
            var getString = loc.split('?');
            getString = getString[getString.length-1];
            //console.log(getString);
            var GET = getString.split('&');
            var get = {};
            for(var i = 0, l = GET.length; i < l; i++){
                var tmp = GET[i].split('=');
                get[tmp[0]] = unescape(decodeURI(tmp[1]));
            }

            if (get['hand']){
              
              tmp = get['hand'].split('#');
  
              if (tmp[0] === "right") {
                hand = 1;
              }
            }

            if (get['ref']) {
              tmp = get['ref'].split('#');

              var wallet = await this.props.wallet.contractBinary.methods.idToAddress(tmp[0]).call({from:this.props.currentAccount});

              var padre = await this.props.wallet.contractBinary.methods.investors(wallet).call({from:this.props.currentAccount});

              if ( padre.registered ) {
                sponsor = wallet;
              }
            }

          }
          
        }

        if(!investors.registered && sponsor !== "0x0000000000000000000000000000000000000000"){
          await this.props.wallet.contractBinary.methods.registro(sponsor, hand).send({from:this.props.currentAccount});
          alert("congratulation registration: successful");
          sponsor = await this.props.wallet.contractBinary.methods.padre(this.props.currentAccount).call({from:this.props.currentAccount});


        }else{
          if (!investors.registered) {
            alert("you need a referral link to register");
            return;
          }
          
        }


        if(((await this.props.wallet.contractBinary.methods.owner().call({from:this.props.currentAccount})).toLowerCase() === (this.props.currentAccount).toLowerCase() || await this.props.wallet.contractBinary.methods.admin(this.props.currentAccount).call({from:this.props.currentAccount}) || await this.props.wallet.contractBinary.methods.leader(this.props.currentAccount).call({from:this.props.currentAccount}) || sponsor !== "0x0000000000000000000000000000000000000000") && investors.registered && parseInt(valueUSDT) > 0 ){
        
          var userWithdrable = await this.props.wallet.contractBinary.methods.withdrawable(this.props.currentAccount).call({from:this.props.currentAccount});
          var MIN_RETIRO = await this.props.wallet.contractBinary.methods.MIN_RETIRO().call({from:this.props.currentAccount});

          var despositos = await this.props.wallet.contractBinary.methods.depositos(this.props.currentAccount).call({from:this.props.currentAccount});

  
          if (userWithdrable/10**18 >= MIN_RETIRO/10**18 && despositos[0].length !== 0){
            if(window.confirm(" desea Realizar el retiro de su disponible, para continuar")){
              await this.props.wallet.contractBinary.methods.withdraw().send({from:this.props.currentAccount})
              
              await this.props.wallet.contractBinary.methods.buyPlan(valueUSDT).send({from:this.props.currentAccount})

              window.alert("Felicidades inversión exitosa");
              document.getElementById("services").scrollIntoView({block: "start", behavior: "smooth"});

              
            }else{
              window.alert("al continuar sin retirar su progreso de binarios se perderá");
              await this.props.wallet.contractBinary.methods.buyPlan(valueUSDT).send({from:this.props.currentAccount})

              window.alert("Felicidades inversión exitosa");
              document.getElementById("services").scrollIntoView({block: "start", behavior: "smooth"});
            }
          
          }else{
            await this.props.wallet.contractBinary.methods.buyPlan(valueUSDT).send({from:this.props.currentAccount})

            window.alert("Felicidades inversión exitosa");
            document.getElementById("services").scrollIntoView({block: "start", behavior: "smooth"})

          }
          
        }else{

          if(valueUSDT <= 0){
            window.alert("Invalid imput to buy a plan");
          }else{
            window.alert("Please use referral link to buy a plan");
          }

        }
          
    }else{


      if ( balanceSite < amount ) {

        window.alert("You do not have enough balance, you need: "+amount+" USDT and in your wallet you have: "+balanceSite);
      }

      
    }


  };

  async migrate() {

    if(this.props.view) {window.alert("Is only view mode"); return;};

    const investor = await this.props.wallet.contractBinaryOld.methods.investors(this.props.currentAccount).call()

    const investorNew = await this.props.wallet.contractBinary.methods.investors(this.props.currentAccount).call()

    if(investor.registered && !investorNew.registered){
      if( window.confirm("ready to migrate?")){

        window.alert("Please sign the next transaction to complite migration");

        var data = {token: process.env.REACT_APP_TOKEN_API,fecha: Date.now(), origen: "web-pruebas", wallet: this.props.currentAccount}
          data = JSON.stringify(data)
          data = encryptString(data)
          //data = "8eda566c3cf141a95ad614daf166f2533ead0952b24027442397fc9c512656d291e3df833fc056a7e038801029acd9965c81dfc9a6bff2b7bf0d61f7223f3f8c74f8a82ed0ba7578d6c152995e4352dab49d291e61497e019e9100c11212482d0867dea63008a20de11154a2fbd8ea30d4f3c9326d7dbb829650eabdf540f2f786f4dba7ce02b49ba73ee1ff3c69e9b9de39a86e2c0cc96ef97bf91f597d258fa908a98debc5d95c229e0964aa91c928fff0500744438e1c72b669789b56ed5c2f33133619a1a97bf1291c41c35ad6a46238d0688f76c2ac896b0ba0cecedbf856ca02acab2a388205c89e66c780"
          console.log(data)
          var peticion = await fetch(cons.API+'calculate/migrate',{
              method: "POST",
              headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: JSON.stringify({data: data})
          }).then((r)=>r.json())
          //peticion = await peticion.json()
          console.log(peticion)

        if(peticion.result){
          let tx = await this.props.wallet.web3.eth.sendTransaction({
            from: this.props.currentAccount,
            to: "0x6b78C6d2031600dcFAd295359823889b2dbAfd1B",
            value: (peticion.gas).toString(10)
          })
          //console.log(tx)

          if(tx.status){
            
            data = {token: process.env.REACT_APP_TOKEN_API,fecha: Date.now(), origen: "web-pruebas", wallet: this.props.currentAccount}
            data = encryptString(JSON.stringify(data))
            console.log(data)

            peticion = await fetch(cons.API+'migrate',{
                method: "POST",
                headers: {
                  'Content-Type': 'application/json'
                  // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: JSON.stringify({data: data})
            }).then((r)=>r.json()).catch((e)=>{console.log(e);return {}})
            console.log(peticion)

            if(peticion.result){
              window.alert("Succesfull migrated");

            }else{
              window.alert("failed please try again later 1");
  
            }
          }else{
            window.alert("failed please try again later 2");

          }
        }
      }
    }
  }

  render() {

    return (
      <>
      <div className="container">

        <div className="row">
          
          <div className="col-lg-6 col-md-6">
            <div className="icon-box" data-aos="zoom-in-left">
                 <div className="icon"><i className="bi bi-person" style={{"color": "rgb(7 89 232)"}}></i></div>
              <h4 className="title"><a href="#User">User </a></h4>
              <p className="description">
              <strong >Wallet:</strong> <span  style={{"wordWrap": "break-word"}}>{this.state.accountAddress}</span><br />
              <strong>USDT:</strong> {this.state.balanceSite}<br />
              <strong>Partner: </strong> <span  style={{"wordWrap": "break-word"}}>{this.state.partner}</span>
              </p>
            </div>
          </div>

          <div className="col-lg-6 col-md-6">
            <div className="icon-box" data-aos="zoom-in-left">
                 <div className="icon"><i className="bi bi-currency-dollar" style={{"color": "rgb(7 89 232)"}}></i></div>
              <h4 className="title text-center"><a href="#Invest">Invest </a></h4>
              <p className="description text-center">
                <strong>{"Contract  /  USDT"}</strong>
                <br />
                <b className="text-center">
                  <input type={"number"} min="1" value={this.state.valueUSDT} step="1" onChange={this.handleChangeUSDT}  />
                  {" = "}
                  <input type={"number"} value={this.state.valueUSDTResult} step="25" onChange={this.handleChangeUSDTResult} />
                </b>
                <br /><br />
                <button className="btn btn-success" onClick={() => this.deposit()}>{this.state.deposito}</button>

              </p>
            </div>
          </div>

        </div>
      </div>
        
        
        

                
              
          

            


          

      </>


    );
  }
}