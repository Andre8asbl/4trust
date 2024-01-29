import React, { Component } from "react";
import Web3 from "web3";
import detectEthereumProvider from '@metamask/detect-provider';

import HomeV2 from "../V2Home";
import TronLinkGuide from "../MetamaskConect";
import cons from "../../cons"

import abiToken from "../../token";
import abiBinario from "../../binaryV2"; //version 2 nuevo


var addressToken = cons.TOKEN;
var addressBinary = cons.SC;
var chainId = cons.chainId;


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      admin: false,
      metamask: false,
      conectado: false,
      currentAccount: "0x0000000000000000000000000000000000000000",
      binanceM: {
        web3: null,
        contractToken: null,
        contractBinary: null,
        contractBinaryOld: null
      }

    };
  }

  async componentDidMount() {

    this.conectar();

    setInterval(() => {
      this.conectar();
    }, 3 * 1000);

  }

  async conectar() {

    if (typeof window.ethereum !== 'undefined') {

      this.setState({
        metamask: true
      })

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainId }],
      });


      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(async (accounts) => {

          const provider = await detectEthereumProvider();

          var web3 = new Web3(provider);
          var contractToken = new web3.eth.Contract(
            abiToken,
            addressToken
          );
          
          var contractBinary = new web3.eth.Contract(
            abiBinario,
            addressBinary
          );

          var isAdmin = false;

          if (await contractBinary.methods.admin(accounts[0]).call({ from: accounts[0] }) ) {
            isAdmin = "admin"
          }

          if (await contractBinary.methods.leader(accounts[0]).call({ from: accounts[0] }) ) {
            isAdmin = "leader"
          }

          if ((await contractBinary.methods.owner().call({ from: accounts[0] })).toLowerCase() === accounts[0] ) {
            isAdmin = "owner"
          }

          var verWallet = accounts[0];
          var loc = document.location.href;

          if (loc.indexOf('?') > 0 && loc.indexOf('view') > 0) {

            verWallet = loc.split('?')[1];
            verWallet = verWallet.split('=')[1];
            verWallet = verWallet.split('#')[0];

            if (!web3.utils.isAddress(verWallet)) {
              verWallet = await contractBinary.methods.idToAddress(verWallet).call({ from: accounts[0] });
            }

          }

          this.setState({
            conectado: true,
            currentAccount: verWallet,
            admin: isAdmin,
            binanceM: {
              web3: web3,
              contractToken: contractToken,
              contractBinary: contractBinary
            }
          })

        })
        .catch((error) => {
          console.error(error)
          this.setState({
            conectado: false,
            admin: false,
            binanceM: {
              web3: null,
              contractToken: null,
              contractBinary: null
            }
          })
        });

    } else {
      this.setState({

        metamask: false,
        conectado: false,
        admin: false,
        binanceM: {
          web3: null,
          contractToken: null,
          contractBinary: null
        }
      })

    }

  }




  render() {

    var ruta = "";
    var loc = document.location.href;

    var vWallet = "0x0000000000000000000000000000000000000000"
    //console.log(loc);
    if (loc.indexOf('?') > 0) {

      ruta = loc.split('?')[1];
      ruta = ruta.split('&')[0];
      ruta = ruta.split('=')[0];
      ruta = ruta.split('#')[0];

      if (loc.indexOf('wallet') > 0) {
        vWallet = loc.split('?')[1];
        vWallet = vWallet.split('&')[1];
        vWallet = vWallet.split('=')[1];
      }

    }

    if (!this.state.metamask) return (
      <>
        <div className="container">
          <TronLinkGuide />
        </div>
      </>
    );

    if (!this.state.conectado) return (
      <>
        <div className="container">
          <TronLinkGuide installed />
        </div>
      </>
    );

 
    switch (ruta) {
         
      case "view":
        return (<HomeV2 admin={this.state.admin} view={true} wallet={this.state.binanceM} currentAccount={vWallet} />);
      
      default:
        return (<HomeV2 admin={"owner"} view={false} wallet={this.state.binanceM} currentAccount={this.state.currentAccount} />);
    }


  }
}
export default App;