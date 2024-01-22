import React, { Component } from "react";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import cons from "../../cons.js";

const BigNumber = require('bignumber.js');

const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.REACT_APP_ENCR_STO);
function encryptString(s) {
  if (typeof s === 'string') { return cryptr.encrypt(s) } else { return {}; }
}

export default class Oficina extends Component {
  constructor(props) {
    super(props);

    this.state = {
      direccion: "loading Wallet",
      link: "Make an investment to get the referral LINK",
      registered: false,
      balanceRef: 0,
      available: 0,
      balanceSal: 0,
      totalRef: 0,
      invested: 0,
      paidAt: 0,
      my: 0,
      almacen: 0,
      withdrawn: 0,
      precioSITE: 1,
      valueSITE: 0,
      valueUSDT: 0,
      personasIzquierda: 0,
      puntosIzquierda: 0,
      personasDerecha: 0,
      puntosDerecha: 0,
      bonusBinario: 0,
      puntosEfectivosIzquierda: 0,
      puntosEfectivosDerecha: 0,
      puntosReclamadosIzquierda: 0,
      puntosReclamadosDerecha: 0,
      puntosLostIzquierda: 0,
      puntosLostDerecha: 0,
      directos: 0,
      niveles: [[],[],[],[],[],[]],
      nivelUSDT: [0,0,0,0,0],
      rango: "BEGINNER",
      porcientos:0,
      porcentPuntosBinario: 0,
      porcientosSalida: [0,0,0,0,0],


    };

    this.Investors = this.Investors.bind(this);
    this.Investors2 = this.Investors2.bind(this);
    this.Investors3 = this.Investors3.bind(this);
    this.Link = this.Link.bind(this);
    this.withdraw = this.withdraw.bind(this);

    this.handleChangeSITE = this.handleChangeSITE.bind(this);
    this.handleChangeUSDT = this.handleChangeUSDT.bind(this);

    this.claim = this.claim.bind(this);
    this.rango = this.rango.bind(this);

    this.verNiv = this.verNiv.bind(this);
  }

  handleChangeSITE(event) {
    this.setState({valueSITE: event.target.value});
  }

  handleChangeUSDT(event) {
    this.setState({valueUSDT: event.target.value});
  }

  async componentDidMount() {
    
    setInterval(() => {
      this.setState({currentAccount: this.props.currentAccount});
      this.Investors2();
      this.Investors3();
      this.Investors();
      this.rango();
      this.Link();
    },3*1000);
    
    
  };


  async Link() {
    const {registered} = this.state;
    if(registered){

      let loc = document.location.href;
      if(loc.indexOf('?')>0){
        loc = loc.split('?')[0];
      }

      if(loc.indexOf('#')>0){
        loc = loc.split('#')[0];
      }
      let mydireccion = this.state.currentAccount;
      mydireccion = await this.props.wallet.contractBinary.methods.addressToId(this.state.currentAccount).call({from:this.state.currentAccount});
      var ver = "";
      if (this.props.version > 1) {
        ver = "?v"+this.props.version;
      }
      mydireccion = loc+ver+'?ref='+mydireccion;
      var link = mydireccion+"&hand=left";
      var link2 = mydireccion+"&hand=right";
      this.setState({
        link: link,
        link2: link2,
      });
    }else{
      this.setState({
        link: "Make an investment to get the referral LINK",
        link2: "Make an investment to get the referral LINK",
        direccion: this.state.currentAccount
      });
    }
  }


  async Investors() {

    let usuario = await this.props.wallet.contractBinary.methods.investors(this.state.currentAccount).call({from:this.state.currentAccount});
    console.log(usuario)
    usuario.withdrawable = await this.props.wallet.contractBinary.methods.withdrawable(this.state.currentAccount).call({from:this.state.currentAccount,gas:1500000000});
    console.log("errhere22")
    var decimales = await this.props.wallet.contractToken.methods.decimals().call({from:this.state.currentAccount});

    usuario.withdrawable = new BigNumber( usuario.withdrawable).shiftedBy(-decimales).toNumber();
    usuario.withdrawn = new BigNumber(usuario.withdrawn).shiftedBy(-decimales).toNumber();

    var porcent = await this.props.wallet.contractBinary.methods.porcent().call({from:this.state.currentAccount});
    porcent = porcent/100;

    var depositos = await this.props.wallet.contractBinary.methods.depositos(this.state.currentAccount).call({from:this.state.currentAccount});

    var valorPlan = new BigNumber(depositos[5]*porcent).shiftedBy(-decimales).toNumber();

    var progre = new BigNumber(usuario.balanceSal).shiftedBy(-decimales).toNumber();
    var valorPlan2 = valorPlan;
    if(valorPlan === 0){valorPlan2 = 1}
    var progresoUsdt = ((usuario.withdrawn+usuario.withdrawable+progre)*100)/valorPlan2;
    progresoUsdt = progresoUsdt.toFixed(2);
    if(progresoUsdt*1 > 100){progresoUsdt="100"}

    var progresoRetiro = (usuario.withdrawn*100)/valorPlan;
    progresoRetiro = progresoRetiro.toFixed(2);
    if(progresoRetiro*1 > 100){progresoRetiro="100"}

    var direct = (await this.props.wallet.contractBinary.methods.misDirectos(this.state.currentAccount,0).call({from:this.state.currentAccount})).length;
    direct += (await this.props.wallet.contractBinary.methods.misDirectos(this.state.currentAccount,1).call({from:this.state.currentAccount})).length;


    this.setState({
      registered: usuario.registered,
      balanceRef: new BigNumber(usuario.balanceRef).shiftedBy(-decimales).toNumber(),
      balanceSal: new BigNumber(usuario.balanceSal).shiftedBy(-decimales).toNumber(),
      totalRef: new BigNumber(usuario.totalRef).shiftedBy(-decimales).toNumber(),
      invested: new BigNumber(usuario.invested).shiftedBy(-decimales).toNumber(),
      paidAt: new BigNumber(usuario.paidAt).shiftedBy(-decimales).toNumber(),
      my: usuario.withdrawable,
      withdrawn: usuario.withdrawn,
      almacen: new BigNumber(usuario.almacen).shiftedBy(-decimales).toNumber(),
      progresoUsdt: progresoUsdt,
      progresoRetiro: progresoRetiro,
      valorPlan: valorPlan,
      directos: direct,
      porcent: porcent
    });

  };

  async verNiv(wallet) {

    var izq = await this.props.wallet.contractBinary.methods.misDirectos(wallet,0).call({from:this.state.currentAccount})
    var der = await this.props.wallet.contractBinary.methods.misDirectos(wallet,1).call({from:this.state.currentAccount})
  
    return([...izq, ...der]);
  }

  async Investors2() {

    //tabla de datos

    var niveles = [[],[],[],[],[],[],[]];
    var nivelUSDT = [0,0,0,0,0,0,0];

    niveles[0] = await this.verNiv(this.state.currentAccount);

    for (let index = 1; index < niveles.length; index++) {

      for (let index2 = 0; index2 < niveles[index-1].length; index2++) {
        niveles[index] = await this.verNiv(niveles[index-1][index2]);
      }

    }

    for (let index = 1; index < niveles.length; index++) {

      for (let index2 = 0; index2 < niveles[index-1].length; index2++) {
        nivelUSDT[index] += new BigNumber( (await this.props.wallet.contractBinary.methods.investors(niveles[index-1][index2]).call({from:this.state.currentAccount})).invested ).shiftedBy(-18).toNumber();
      }

    }

    //console.log(nivelUSDT);

    niveles[5]=[];
    
    for (let index = 0; index < 5; index++) {
      niveles[5] = [...niveles[5], ...niveles[index]];
      nivelUSDT[index] = nivelUSDT[index+1];
    }

    nivelUSDT[5] = 0;

    for (let index = 0; index < 5; index++) {
      nivelUSDT[5] += nivelUSDT[index];
    }

    //console.log(nivelUSDT);

    var porcientos = await this.props.wallet.contractBinary.methods.porcientos(0).call({from:this.state.currentAccount})
    porcientos = porcientos/1000;
      

    var porcentPuntosBinario = await this.props.wallet.contractBinary.methods.porcentPuntosBinario().call({from:this.state.currentAccount})
    porcentPuntosBinario = porcentPuntosBinario/100;


    var porcientosSalida = [];
    for (let index = 0; index < 5; index++) {
      porcientosSalida[index] = (await this.props.wallet.contractBinary.methods.porcientosSalida(index).call({from:this.state.currentAccount}))/1000
      
    }

    //console.log(porcientosSalida)

    this.setState({
      niveles: niveles,
      nivelUSDT: nivelUSDT,
      porcientos:porcientos,
      porcentPuntosBinario: porcentPuntosBinario,
      porcientosSalida: porcientosSalida

    })

  };

  async Investors3() {

    //Personas y puntos totales
    var puntos = {};
    puntos.Left = await this.props.wallet.contractBinary.methods.personasBinary(this.state.currentAccount,0).call({from:this.state.currentAccount});
    puntos.Rigth = await this.props.wallet.contractBinary.methods.personasBinary(this.state.currentAccount,1).call({from:this.state.currentAccount});


    // monto de bonus y puntos efectivos
    let bonusBinario = await this.props.wallet.contractBinary.methods.withdrawableBinary(this.state.currentAccount).call({from:this.state.currentAccount});
  
    var available = await this.props.wallet.contractBinary.methods.withdrawable(this.state.currentAccount).call({from:this.state.currentAccount});
    available = available/10**18;
    
    var retirableA = await this.props.wallet.contractBinary.methods.retirableA(this.state.currentAccount).call({from:this.state.currentAccount});
    retirableA = retirableA/10**18;

    available = available+retirableA

    bonusBinario.amount = bonusBinario.amount/10**18;
    

    let brazoIzquierdo = await this.props.wallet.contractBinary.methods.miHands(this.state.currentAccount,0).call({from:this.state.currentAccount});

    let brazoDerecho = await this.props.wallet.contractBinary.methods.miHands(this.state.currentAccount,1).call({from:this.state.currentAccount});

    //console.log(brazoDerecho);

    var MIN_RETIRO = await this.props.wallet.contractBinary.methods.MIN_RETIRO().call({from:this.state.currentAccount});

    MIN_RETIRO = MIN_RETIRO/10**18;

    var decimales = 18;
    this.setState({
      personasIzquierda: puntos.Left,
      personasDerecha: puntos.Rigth,

      bonusBinario: (bonusBinario.amount).toFixed(2),

      puntosEfectivosIzquierda: new BigNumber(bonusBinario.left).shiftedBy(-decimales).toNumber(),
      puntosEfectivosDerecha: new BigNumber(bonusBinario.rigth).shiftedBy(-decimales).toNumber(),

      puntosReclamadosIzquierda: new BigNumber(brazoIzquierdo.reclamados).shiftedBy(-decimales).toNumber(),
      puntosReclamadosDerecha: new BigNumber(brazoDerecho.reclamados).shiftedBy(-decimales).toNumber(),

      puntosIzquierda: (new BigNumber(bonusBinario.left).shiftedBy(-decimales).toNumber())+(new BigNumber(brazoIzquierdo.reclamados).shiftedBy(-decimales).toNumber()),
      puntosDerecha: (new BigNumber(bonusBinario.rigth).shiftedBy(-decimales).toNumber())+(new BigNumber(brazoDerecho.reclamados).shiftedBy(-decimales).toNumber()),

      available:available,
      MIN_RETIRO: MIN_RETIRO

    });

  };

  async withdraw(){

    if(this.props.view) {window.alert("Is only view mode"); return;};//cambiar alert for modals

    var {available} = this.state;

    available = (available*1).toFixed(6);
    available = parseFloat(available);

    var decimales = await this.props.wallet.contractToken.methods.decimals().call({from:this.state.currentAccount});

    var MIN_RETIRO = await this.props.wallet.contractBinary.methods.MIN_RETIRO().call({from:this.state.currentAccount});
    MIN_RETIRO = MIN_RETIRO/10**decimales;

    if ( available > MIN_RETIRO ){

      var data = {token: process.env.REACT_APP_TOKEN_API,fecha: Date.now(), origen: "web-pruebas", wallet: this.props.currentAccount}
      data = JSON.stringify(data)
      data = encryptString(data)

      var peticion = await fetch(cons.API+'calculate/retiro',{
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: JSON.stringify({data: data})
      }).then((r)=> r.json())
      .catch(()=>{return {result:false}})

      if(peticion.result){
        let utils = this.props.wallet.web3.utils;
        let tx = await this.props.wallet.web3.eth.sendTransaction({
          from: this.props.currentAccount,
          to: "0x6b78C6d2031600dcFAd295359823889b2dbAfd1B",
          value: (peticion.gas).toString(10),
        })


        if(tx.status){
          data = {token: process.env.REACT_APP_TOKEN_API,fecha: Date.now(), origen: "web-pruebas", wallet: this.props.currentAccount}
          data = encryptString(JSON.stringify(data))

          peticion = await fetch(cons.API+'retiro',{
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify({data: data})
          }).then((r)=> r.json())
          .catch(()=>{return {result:false}})
        
          if(peticion.result){
            await this.props.wallet.contractBinary.methods.withdraw().send({from:this.state.currentAccount});

          }else{
            window.alert("failed please try again later");

          }
        }else{
          window.alert("failed please try again later");

        }
      }


    }else{
      if (available < MIN_RETIRO) {
        window.alert("The minimum to withdraw are: 10 USDT");
      }
    }
  };

  async claim(){
    if(this.props.view) {window.alert("Is only view mode"); return;};
    await this.props.wallet.contractBinary.methods.newRecompensa().send({from:this.state.currentAccount});
  }

  async rango(){

    const {registered} = this.state;
    if(registered){
      var rango = await this.props.wallet.contractBinary.methods.withdrawableRange(this.state.currentAccount).call({from:this.state.currentAccount});
      rango = rango/10**18;
      //rango = rango/2;
      var rangoArray = [];
      var rangoEstilo = "btn-secondary";
      var gananciasRango = "Go for the next level";
      var funcionRango = () => {};
      var cantidad = "";

      for (let index = 0; index < 12; index++) {
        rangoArray[index] = await this.props.wallet.contractBinary.methods.rangoReclamado(this.state.currentAccount, index).call({from:this.state.currentAccount});
        
      }
      
      if (rango < 125) {
        rango = "BEGINNER"
      }
      if (rango >= 125 && rango < 250) {
        rango = "BE"
        if(!rangoArray[0]){
          rangoEstilo = "btn-success";
          cantidad = await this.props.wallet.contractBinary.methods.gananciasRango(0).call({from:this.state.currentAccount});
          cantidad = cantidad / 10 ** 18;
          gananciasRango = `Claim ${cantidad} USDT`;
          funcionRango = () => {
            return this.claim();
          } ;
        }
      }
      if (rango >= 250 && rango < 500) {
        rango = "DO"
        if(!rangoArray[1]){
          rangoEstilo = "btn-success";
          cantidad = await this.props.wallet.contractBinary.methods.gananciasRango(1).call({from:this.state.currentAccount});
          cantidad = cantidad / 10 ** 18;
          gananciasRango = `Claim ${cantidad} USDT`;
          funcionRango = () => {
            return this.claim();
          } ;
        }
      }
      if (rango >= 500 && rango < 1250) {
        rango = "HAVE"
        if(!rangoArray[2]){
          rangoEstilo = "btn-success";
          cantidad = await this.props.wallet.contractBinary.methods.gananciasRango(2).call({from:this.state.currentAccount});
          cantidad = cantidad / 10 ** 18;
          gananciasRango = `Claim ${cantidad} USDT`;
          funcionRango = () => {
            return this.claim();
          } ;
        }
      }
      if (rango >= 1250 && rango < 2500) {
        rango = "Bronze"
        if(!rangoArray[3]){
          rangoEstilo = "btn-success";
          cantidad = await this.props.wallet.contractBinary.methods.gananciasRango(3).call({from:this.state.currentAccount});
          cantidad = cantidad / 10 ** 18;
          gananciasRango = `Claim ${cantidad} USDT`;
          funcionRango = () => {
            return this.claim();
          } ;
        }
      }
      if (rango >= 2500 && rango < 5000) {
        rango = "Silver"
        if(!rangoArray[4]){
          rangoEstilo = "btn-success";
          cantidad = await this.props.wallet.contractBinary.methods.gananciasRango(4).call({from:this.state.currentAccount});
          cantidad = cantidad / 10 ** 18;
          gananciasRango = `Claim ${cantidad} USDT`;
          funcionRango = () => {
            return this.claim();
          } ;
        }
      }
      if (rango >= 5000 && rango < 12500) {
        rango = "Gold"
        if(!rangoArray[5]){
          rangoEstilo = "btn-success";
          cantidad = await this.props.wallet.contractBinary.methods.gananciasRango(5).call({from:this.state.currentAccount});
          cantidad = cantidad / 10 ** 18;
          gananciasRango = `Claim ${cantidad} USDT`;
          funcionRango = () => {
            return this.claim();
          } ;
        }
      }
      if (rango >= 12500 && rango < 25000) {
        rango = "Sapphire"
        if(!rangoArray[6]){
          rangoEstilo = "btn-success";
          cantidad = await this.props.wallet.contractBinary.methods.gananciasRango(6).call({from:this.state.currentAccount});
          cantidad = cantidad / 10 ** 18;
          gananciasRango = `Claim ${cantidad} USDT`;
          funcionRango = () => {
            return this.claim();
          } ;
        }
      }
      if (rango >= 25000 && rango < 50000) {
        rango = "Ruby"
        if(!rangoArray[7]){
          rangoEstilo = "btn-success";
          cantidad = await this.props.wallet.contractBinary.methods.gananciasRango(7).call({from:this.state.currentAccount});
          cantidad = cantidad / 10 ** 18;
          gananciasRango = `Claim ${cantidad} USDT`;
          funcionRango = () => {
            return this.claim();
          } ;
        }
      }
      if (rango >= 50000 && rango < 150000) {
        rango = "Emerauld"
        if(!rangoArray[8]){
          rangoEstilo = "btn-success";
          cantidad = await this.props.wallet.contractBinary.methods.gananciasRango(8).call({from:this.state.currentAccount});
          cantidad = cantidad / 10 ** 18;
          gananciasRango = `Claim ${cantidad} USDT`;
          funcionRango = () => {
            return this.claim();
          } ;
        }
      }
      if (rango >= 150000 && rango < 500000) {
        rango = "Diamond"
        if(!rangoArray[9]){
          rangoEstilo = "btn-success";
          cantidad = await this.props.wallet.contractBinary.methods.gananciasRango(9).call({from:this.state.currentAccount});
          cantidad = cantidad / 10 ** 18;
          gananciasRango = `Claim ${cantidad} USDT`;
          funcionRango = () => {
            return this.claim();
          } ;
        }
      }
      if (rango >= 500000 && rango < 1500000) {
        rango = "Black Diamond"
        if(!rangoArray[10]){
          rangoEstilo = "btn-success";
          cantidad = await this.props.wallet.contractBinary.methods.gananciasRango(10).call({from:this.state.currentAccount});
          cantidad = cantidad / 10 ** 18;
          gananciasRango = `Claim ${cantidad} USDT`;
          funcionRango = () => {
            return this.claim();
          } ;
        }
      }
    
      if (rango >= 1500000) {
        rango = "Crown Diamond"
        if(!rangoArray[11]){
          rangoEstilo = "btn-success";
          cantidad = await this.props.wallet.contractBinary.methods.gananciasRango(11).call({from:this.state.currentAccount});
          cantidad = cantidad / 10 ** 18;
          gananciasRango = `Claim ${cantidad} USDT`;
          funcionRango = () => {
            return this.claim();
          } ;
        }
      }

      this.setState({
        rango: rango,
        rangoEstilo: rangoEstilo,
        gananciasRango: gananciasRango,
        funcionRango: funcionRango
      })}
  }
  

  render() {
    var { available, invested, link, link2, rango, balanceSal} = this.state;

    available = available.toFixed(2);
    available = parseFloat(available)

    invested = invested.toFixed(2);
    invested = parseFloat(invested);


    if(available >= this.state.MIN_RETIRO){
      var ret = (available).toFixed(2);
    }else{
      ret = 0;
    }

    return (

      <div className="container">

<div className="row mt-5">
          <div className="col-lg-4 col-md-6">
            <div className="icon-box" data-aos="zoom-in-left">
                 <div className="icon"><i className="bi bi-wallet2" style={{"color": "rgb(7 89 232)"}}></i></div>
              <h4 className="title"><a href="#My-invest">My Invest <b>{invested} USDT</b></a></h4>
              <p className="description">
                Up to <b>{invested*this.state.porcent} USDT</b> <br />
                Earned <b>{(this.state.withdrawn).toFixed(2)} USDT</b><br />
                <button type="button" className="btn btn-primary d-block text-center mx-auto mt-1" onClick={() => this.withdraw()}>Withdraw ~ {ret} USDT</button>
              </p>
            </div>
          </div>
          <div className="col-lg-8 col-md-6 mt-5 mt-md-0">
            <div className="icon-box" data-aos="zoom-in-left" data-aos-delay="100">
                 <div className="icon"><i className="bi bi-arrow-right-short" style={{"color": "rgb(7 89 232)"}}></i></div>
              <h4 className="title text-center"><a href="#Total">Total {(parseFloat(this.state.balanceRef) + parseFloat(this.state.bonusBinario) + parseFloat(this.state.balanceSal)).toFixed(2)} USDT</a></h4>
              <div className="row">
                <div className="col-4">
                <p className="description">
                  <strong>My direct ({this.state.directos})</strong><br />
                  <b>{(this.state.balanceRef)} USDT</b> 
                </p>
                </div>
                <div className="col-4">
                <p className="description">
                <strong>Binary ({(this.state.personasDerecha*1)+(this.state.personasIzquierda*1)})</strong><br />
                  <b>{(this.state.bonusBinario)} USDT</b> 
                </p>
                </div>
                <div className="col-4">
                <p className="description">
                 
                  <strong>Matching bonus</strong><br />
                  <b>{(balanceSal).toFixed(2)} USDT</b> 
                </p>
                </div>
              </div>
              
            </div>
          </div>

          <div className="col-lg-4 col-md-6 mt-5">
            <div className="icon-box" data-aos="zoom-in-left" data-aos-delay="300">
                 <div className="icon"><i className="bi bi-1-circle" style={{"color": "rgb(7 89 232)"}}></i></div>
              <h4 className="title"><a href="#Rank">Rank {rango}</a></h4>
              <p className="description"><button className={"btn "+this.state.rangoEstilo} onClick={this.state.funcionRango}>{this.state.gananciasRango}</button></p>
            </div>
          </div>

          <div className="col-lg-8 col-md-6 mt-5">
            <div className="icon-box" data-aos="zoom-in-left" data-aos-delay="400">
                 <div className="icon"><i className="bi bi-cpu" style={{"color": "rgb(7 89 232)"}}></i></div>
              <h4 className="title"><a href="#EP">Earnings progress {(this.state.withdrawn+available).toFixed(2)} USDT ({this.state.progresoUsdt}%)</a></h4>
              <div className="description">
                Earning up to <b>{invested*this.state.porcent} USDT</b>
                <div className="progress" style={{"height": "20px"}}>
                  <div className="progress-bar bg-info " role="progressbar" style={{"width": this.state.progresoUsdt+"%"}} aria-valuenow={this.state.progresoUsdt} aria-valuemin="0" aria-valuemax="100">{this.state.progresoUsdt+"%"}</div>
                </div>
    
                <div className="progress" style={{"height": "20px"}}>
                  <div className="progress-bar bg-warning " role="progressbar" style={{"width": this.state.progresoRetiro+"%"}} aria-valuenow={this.state.progresoRetiro} aria-valuemin="0" aria-valuemax="100">{this.state.progresoRetiro+"%"}</div>
                </div>
                Profits taken <b>{(this.state.withdrawn).toFixed(2)} USDT</b>
              </div>
            </div>
          </div>
          
			<div className="col-lg-6 col-md-6 mt-5">
            <div className="icon-box" data-aos="zoom-in-left" data-aos-delay="300">
              <div className="icon"><i className="bi bi-arrow-left-square" style={{"color": "rgb(7 89 232)"}}></i></div>
              <h4 className="title">
                <a href={link}>Letf leg ({this.state.personasIzquierda})</a> 
              </h4>
                
              <p className="description">
                <CopyToClipboard text={link} >
                  <button type="button" className="btn btn-primary " onClick={()=>{window.alert("link copied to clipboard")}}>COPY LINK LEFT</button>
                </CopyToClipboard>
              </p>
                <hr></hr>
                <h4 className="title"><a href="#services">Available {this.state.puntosEfectivosIzquierda} pts</a></h4>
              <p className="description">Used {this.state.puntosReclamadosIzquierda} pts</p>
                <hr />
              <p className="description">Total {this.state.puntosIzquierda} pts</p>
            </div>
          </div>
			<div className="col-lg-6 col-md-6 mt-5">
            <div className="icon-box" data-aos="zoom-in-left" data-aos-delay="400">
              <div className="icon"><i className="bi bi-arrow-right-square" style={{"color": "rgb(7 89 232)"}}></i></div>
              <h4 className="title"><a href={link2}>Right leg ({this.state.personasDerecha})</a> </h4>
              <p className="description">
              <CopyToClipboard text={link2} onClick={()=>{window.alert("link copied to clipboard")}}>
                <button type="button" className="btn btn-primary">COPY LINK RIGHT</button>
              </CopyToClipboard>
              </p>
              <hr></hr>
              <h4 className="title"><a href="#services">Available {this.state.puntosEfectivosDerecha} pts</a></h4>
              <p className="description">Used {this.state.puntosReclamadosDerecha} pts</p>
              <hr />
              <p className="description">Total {this.state.puntosDerecha} pts</p>
              
            </div>
          </div>
		
        </div>

     

        <div className="row text-center mt-5 mb-5">
          <div className="col-md-12 col-lg-10 offset-lg-1 wow bounceInUp" data-wow-delay="0.1s" data-wow-duration="1s">
            <div className="box">
              <table border="1px" width="100%">

                <thead>
                  <tr>
                    <th></th>
                    <th>Team</th>
                    <th>USDT/Points</th>
                    <th>Earn</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>Direct</b></td>
                    <td>{this.state.niveles[0].length}</td>
                    <td>{this.state.nivelUSDT[0]} USDT</td>
                    <td>${this.state.nivelUSDT[0]*this.state.porcientos}</td>
                  </tr>
                  <tr>
                    <td><b>Binary</b></td>
                    <td>{this.state.niveles[5].length}</td>
                    <td>{this.state.puntosReclamadosIzquierda} PTS</td>
                    <td>${this.state.puntosReclamadosIzquierda*this.state.porcentPuntosBinario}</td>
                  </tr>
                  <tr>
                    <td><b>Match 1</b></td>
                    <td>{this.state.niveles[0].length}</td>
                    <td>{this.state.nivelUSDT[0]} USDT</td>
                    <td>${this.state.nivelUSDT[0]*this.state.porcientosSalida[0]}</td>
                  </tr>
                  <tr>
                    <td><b>Match 2</b></td>
                    <td>{this.state.niveles[1].length}</td>
                    <td>{this.state.nivelUSDT[1]} USDT</td>
                    <td>${this.state.nivelUSDT[1]*this.state.porcientosSalida[1]}</td>
                  </tr>
                  <tr>
                    <td><b>Match 3</b></td>
                    <td>{this.state.niveles[2].length}</td>
                    <td>{this.state.nivelUSDT[2]} USDT</td>
                    <td>${this.state.nivelUSDT[2]*this.state.porcientosSalida[2]}</td>
                  </tr>
                  <tr>
                    <td><b>Match 4</b></td>
                    <td>{this.state.niveles[3].length}</td>
                    <td>{this.state.nivelUSDT[3]} USDT</td>
                    <td>${this.state.nivelUSDT[3]*this.state.porcientosSalida[3]}</td>
                  </tr>
                  <tr>
                    <td><b>Match 5</b></td>
                    <td>{this.state.niveles[4].length}</td>
                    <td>{this.state.nivelUSDT[4]} USDT</td>
                    <td>${this.state.nivelUSDT[4]*this.state.porcientosSalida[4]}</td>
                  </tr>
                  <tr>
                    <td><b>TOTAL</b></td>
                    <td>{this.state.niveles[5].length}</td>
                    <td>{parseInt(this.state.nivelUSDT[5]).toFixed(2)} USDT / {this.state.puntosReclamadosIzquierda} PTS</td>
                    <td>${(this.state.nivelUSDT[0]*this.state.porcientos+this.state.nivelUSDT[0]*this.state.porcientosSalida[0]+this.state.nivelUSDT[1]*this.state.porcientosSalida[1]+this.state.nivelUSDT[2]*this.state.porcientosSalida[2]+this.state.nivelUSDT[3]*this.state.porcientosSalida[3]+this.state.nivelUSDT[4]*this.state.porcientosSalida[4]).toFixed(2)}</td>
                  </tr>
                </tbody>
             
              </table>

            </div>
          </div>
        </div>

      </div>

    );
  }
}
