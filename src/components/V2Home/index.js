import React, { Component } from "react";

import CrowdFunding from "./CrowdFunding";
import Oficina from "./Oficina";
import Datos from "./Datos";
import Depositos from "./Depositos";

export default class Home extends Component {
  
  render() {

    return (
      <div className="container">
        <div  className="row row-eq-height justify-content-center">
          <CrowdFunding  wallet={this.props.wallet} currentAccount={this.props.currentAccount} view={this.props.view}/>

          <Oficina  wallet={this.props.wallet} currentAccount={this.props.currentAccount} view={this.props.view}/>

          <Datos admin={this.props.admin}  wallet={this.props.wallet} currentAccount={this.props.currentAccount} view={this.props.view}/>
          
          <Depositos  wallet={this.props.wallet} currentAccount={this.props.currentAccount} view={this.props.view}/>

        </div>

      </div>
    );
  }
}
