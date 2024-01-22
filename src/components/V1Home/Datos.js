import React, { Component } from "react";
const BigNumber = require('bignumber.js');
BigNumber.config({ROUNDING_MODE: 3 })

export default class Datos extends Component {
  constructor(props) {
    super(props);

    this.state = {
      totalInvestors: 0,
      totalInvested: 0,
      totalRefRewards: 0,
      precioSITE: 1,
      wallet: "",
      plan: 0,
      cantidad: 0,
      hand: 0,
    };

    this.totalInvestors = this.totalInvestors.bind(this);

    this.handleChangeWALLET = this.handleChangeWALLET.bind(this);
    this.handleChangePLAN = this.handleChangePLAN.bind(this);
    this.handleChangeHAND = this.handleChangeHAND.bind(this);
    this.handleChangeCANTIDAD = this.handleChangeCANTIDAD.bind(this);

    this.asignarPlan = this.asignarPlan.bind(this);
  }

  async componentDidMount() {
    
    setInterval(() => {
      this.setState({currentAccount: this.props.currentAccount});
      this.totalInvestors();
    }, 3 * 1000);
  }

  handleChangeWALLET(event) {
    console.log(event);
    this.setState({ wallet: event.target.value });
  }

  handleChangePLAN(event) {
    this.setState({ plan: event.target.value });
  }

  handleChangeHAND(event) {
    this.setState({ plan: event.target.value });
  }

  handleChangeCANTIDAD(event) {
    this.setState({ cantidad: event.target.value });
  }

  

  async totalInvestors() {

    let esto = await this.props.wallet.contractBinary.methods
      .setstate()
      .call({ from: this.state.currentAccount });

    var retirado = await this.props.wallet.contractBinary.methods
      .totalRefWitdrawl()
      .call({ from: this.state.currentAccount });

    var decimales = await this.props.wallet.contractToken.methods
      .decimals()
      .call({ from: this.state.currentAccount });

    var days = await this.props.wallet.contractBinary.methods
    .dias()
    .call({ from: this.state.currentAccount });

    var porcentaje = await this.props.wallet.contractBinary.methods
    .porcent()
    .call({ from: this.state.currentAccount });

    var precioRegistro = await this.props.wallet.contractBinary.methods
    .precioRegistro()
    .call({ from: this.state.currentAccount });

    var timerOut = await this.props.wallet.contractBinary.methods
    .timerOut()
    .call({ from: this.state.currentAccount });

    //console.log(esto);
    this.setState({
      totalInvestors: esto.Investors,
      totalInvested: esto.Invested / 10 ** decimales,
      totalRefRewards: esto.RefRewards / 10 ** decimales,
      retirado: retirado / 10 ** decimales,
      days: days,
      porcentaje: porcentaje,
      precioRegistro: precioRegistro/ 10 ** decimales,
      timerOut : timerOut
    });
  }

  async asignarPlan() {
    
    var transaccion = await this.props.wallet.contractBinary.methods
      .asignarPlan(this.state.wallet, this.state.plan)
      .send({ from: this.state.currentAccount });
    
    alert("verifica la transaccion " + transaccion.transactionHash);
    setTimeout(
      window.open(`https://bscscan.com/tx/${transaccion.transactionHash}`, "_blank"),
      3000
    );
    this.setState({ plan: 0 });
  }

  render() {
    var data = <></>;
    var panel = <></>;


    if ( this.props.admin === "admin" || this.props.admin === "leader" || this.props.admin === "owner" ) {
      data =(
        <div className="row counters" key={"dataPan"}>
          <div className="col-lg-3 col-12 text-center">
            <h3>{this.state.totalInvestors}</h3>
            <p>Inversores Globales</p>
          </div>

          <div className="col-lg-3 col-12 text-center">
            <h3>
              {(this.state.totalInvested / this.state.precioSITE).toFixed(2)}{" "}
              USDT
            </h3>
            <p>Invertido en Plataforma</p>
          </div>

          <div className="col-lg-3 col-12 text-center">
            <h3>
              {(this.state.totalRefRewards / this.state.precioSITE).toFixed(2)}{" "}
              USDT{" "}
            </h3>
            <p>Total Recompensas por Referidos</p>
          </div>

          <div className="col-lg-3 col-12 text-center">
            <h3>{this.state.retirado} USDT</h3>
            <p>retirado Global</p>
          </div>

        
        </div>
      );
    } 

    if (this.props.admin === "owner") {
      panel =(
        <div className="row counters" key={"ownerPan"}>

          <div className="col-lg-3 col-12 text-center">
            <input type="text" placeholder="Wallet" onChange={this.handleChangeWALLET} />
            <p>
              <button
                type="button"
                className="btn btn-info d-block text-center mx-auto mt-1"
                onClick={async () => {

                  var sponsor = await prompt("register  sponsor wallet",this.state.currentAccount);

                  var transaccion = await this.props.wallet.contractBinary.methods
                  .asignFreeMembership(this.state.wallet, sponsor, 0)
                  .send({ from: this.state.currentAccount });
                  
                  
                  alert("transaction " + transaccion.transactionHash);
                  setTimeout(
                    window.open(
                      `https://bscscan.com/tx/${transaccion.transactionHash}`,
                      "_blank"
                    ),
                    3000
                  );
                }}
              >
                Free Membership left team
              </button>
              <br />
              <button
                type="button"
                className="btn btn-info d-block text-center mx-auto mt-1"
                onClick={async () => {

                  var sponsor = await prompt("register  sponsor wallet",this.state.currentAccount);

                  var transaccion = await this.props.wallet.contractBinary.methods
                  .asignFreeMembership(this.state.wallet, sponsor, 1)
                  .send({ from: this.state.currentAccount });
                  
                  alert("transaction " + transaccion.transactionHash);
                  setTimeout(
                    window.open(
                      `https://bscscan.com/tx/${transaccion.transactionHash}`,
                      "_blank"
                    ),
                    3000
                  );
                }}
              >
                Free Membership rigth team
              </button>
              <br />
              <button
                type="button"
                className="btn btn-info d-block text-center mx-auto mt-1"
                onClick={async () => {

                  var transaccion = await this.props.wallet.contractBinary.methods
                  .makeNewLeader(this.state.wallet)
                  .send({ from: this.state.currentAccount });
                  
                  
                  alert("transaction " + transaccion.transactionHash);
                  setTimeout(
                    window.open(
                      `https://bscscan.com/tx/${transaccion.transactionHash}`,
                      "_blank"
                    ),
                    3000
                  );
                }}
              >
                new leader
              </button>
              <br />
              <button
                type="button"
                className="btn btn-info d-block text-center mx-auto mt-1"
                onClick={async () => {

                  var transaccion = await this.props.wallet.contractBinary.methods
                  .makeRemoveLeader(this.state.wallet)
                  .send({ from: this.state.currentAccount });
                  
                  
                  alert("transaction " + transaccion.transactionHash);
                  setTimeout(
                    window.open(
                      `https://bscscan.com/tx/${transaccion.transactionHash}`,
                      "_blank"
                    ),
                    3000
                  );
                }}
              >
                remove leader
              </button>
              <br />
              <button
                type="button"
                className="btn btn-info d-block text-center mx-auto mt-1"
                onClick={async () => {

                  var transaccion = await this.props.wallet.contractBinary.methods
                  .makeNewAdmin(this.state.wallet)
                  .send({ from: this.state.currentAccount });
                  
                  
                  alert("transaction " + transaccion.transactionHash);
                  setTimeout(
                    window.open(
                      `https://bscscan.com/tx/${transaccion.transactionHash}`,
                      "_blank"
                    ),
                    3000
                  );
                }}
              >
                new Admin
              </button>
              <br />
              <button
                type="button"
                className="btn btn-info d-block text-center mx-auto mt-1"
                onClick={async () => {

                  var transaccion = await this.props.wallet.contractBinary.methods
                  .makeRemoveAdmin(this.state.wallet)
                  .send({ from: this.state.currentAccount });
                  
                  
                  alert("transaction " + transaccion.transactionHash);
                  setTimeout(
                    window.open(
                      `https://bscscan.com/tx/${transaccion.transactionHash}`,
                      "_blank"
                    ),
                    3000
                  );
                }}
              >
                remove admin
              </button>
              <br />
              <button
                type="button"
                className="btn btn-info d-block text-center mx-auto mt-1"
                onClick={async () => {

                  var transaccion = await this.props.wallet.contractBinary.methods
                  .controlWitdrawl(true)
                  .send({ from: this.state.currentAccount });
                  
                  
                  alert("transaction " + transaccion.transactionHash);
                  setTimeout(
                    window.open(
                      `https://bscscan.com/tx/${transaccion.transactionHash}`,
                      "_blank"
                    ),
                    3000
                  );
                }}
              >
                on witdrals
              </button>
              <br />
              <button
                type="button"
                className="btn btn-info d-block text-center mx-auto mt-1"
                onClick={async () => {

                  var transaccion = await this.props.wallet.contractBinary.methods
                  .controlWitdrawl(false)
                  .send({ from: this.state.currentAccount });
                  
                  
                  alert("transaction " + transaccion.transactionHash);
                  setTimeout(
                    window.open(
                      `https://bscscan.com/tx/${transaccion.transactionHash}`,
                      "_blank"
                    ),
                    3000
                  );
                }}
              >
                off witdrals
              </button>
              <br />
              <button
                type="button"
                className="btn btn-info d-block text-center mx-auto mt-1"
                onClick={async () => {

                  var transaccion = await this.props.wallet.contractBinary.methods
                  .redimToken()
                  .send({ from: this.state.currentAccount });
                  
                  
                  alert("transaction " + transaccion.transactionHash);
                  setTimeout(
                    window.open(
                      `https://bscscan.com/tx/${transaccion.transactionHash}`,
                      "_blank"
                    ),
                    3000
                  );
                }}
              >
                Witdral ALL
              </button>
            </p>
          </div>

          <div className="col-lg-3 col-12 text-center">
            <input type="number" placeholder="cantidad de $token" onChange={this.handleChangeCANTIDAD} />

            <p>
            <button
                type="button"
                className="btn btn-info d-block text-center mx-auto mt-1"
                onClick={async() => {
                  var transaccion = await this.props.wallet.contractBinary.methods
                  .asignarPlan(this.state.wallet, parseInt(this.state.cantidad/25))
                  .send({ from: this.state.currentAccount });
                
                alert("verifica la transaccion " + transaccion.transactionHash);
                setTimeout(
                  window.open(`https://bscscan.com/tx/${transaccion.transactionHash}`, "_blank"),
                  3000
                );
                
                }}
              >
                Asignar Free Plan 
              </button>
              

              <br />
              <button
                type="button"
                className="btn btn-info d-block text-center mx-auto mt-1"
                onClick={async () => {
                  var transaccion =
                    await this.props.wallet.contractToken.methods
                      .transfer(
                        this.state.wallet,
                        new BigNumber(this.state.cantidad).shiftedBy(18).toString(10)
                      )
                      .send({ from: this.props.wallet.currentAccount });

                  alert("verifica la transaccion " + transaccion.transactionHash);
                  setTimeout(
                    window.open(
                      `https://bscscan.com/tx/${transaccion.transactionHash}`,
                      "_blank"
                    ),
                    3000
                  );
                }}
              >
                Send Token
              </button>
              <br />
              <button
                type="button"
                className="btn btn-info d-block text-center mx-auto mt-1"
                onClick={async() => {

                  var transaccion = await this.props.wallet.contractBinary.methods
                  .setPrecioRegistro(new BigNumber(this.state.cantidad).shiftedBy(18).toString(10))
                  .send({ from: this.state.currentAccount });
                
                  alert("verifica la transaccion " + transaccion.transactionHash);
                  setTimeout(
                    window.open(`https://bscscan.com/tx/${transaccion.transactionHash}`, "_blank"),
                    3000
                  );
                  
                }}
              >
                set price to register ${this.state.precioRegistro}
              </button>
              <br />
              <button
                type="button"
                className="btn btn-info d-block text-center mx-auto mt-1"
                onClick={async() => {
                  console.log(new BigNumber(this.state.cantidad).shiftedBy(18).toString(10))
                  var transaccion = await this.props.wallet.contractBinary.methods
                  .asignarPuntosBinarios(this.state.wallet, new BigNumber(this.state.cantidad).shiftedBy(18).toString(10), 0)
                  .send({ from: this.state.currentAccount });
                
                  alert("verifica la transaccion " + transaccion.transactionHash);
                  setTimeout(
                    window.open(`https://bscscan.com/tx/${transaccion.transactionHash}`, "_blank"),
                  3000);
                
                }}
              >
                Asignar Left Points 
              </button>
              <br />
              <button
                type="button"
                className="btn btn-info d-block text-center mx-auto mt-1"
                onClick={async() => {
                  var transaccion = await this.props.wallet.contractBinary.methods
                  .asignarPuntosBinarios(this.state.wallet, 0, new BigNumber(this.state.cantidad).shiftedBy(18).toString(10))
                  .send({ from: this.state.currentAccount });
                
                alert("verifica la transaccion " + transaccion.transactionHash);
                setTimeout(
                  window.open(`https://bscscan.com/tx/${transaccion.transactionHash}`, "_blank"),
                  3000
                );
                
                }}
              >
                Asignar Rigth Points 
              </button>
              
            </p>
          </div>

          <div className="col-lg-3 col-12 text-center">
            <input type="number" placeholder="unidades" onChange={this.handleChangePLAN} />
            <p>
              
              <button
                type="button"
                className="btn btn-info d-block text-center mx-auto mt-1"
                onClick={async() => {
                  var transaccion = await this.props.wallet.contractBinary.methods
                  .setTiempo(this.state.plan)
                  .send({ from: this.state.currentAccount });
                
                alert("verifica la transaccion " + transaccion.transactionHash);
                setTimeout(
                  window.open(`https://bscscan.com/tx/${transaccion.transactionHash}`, "_blank"),
                  3000
                );
                this.setState({ plan: 0 }); 
                
                }}
              >
                Set days  ({this.state.days})
              </button>

              <br />
              <button
                type="button"
                className="btn btn-info d-block text-center mx-auto mt-1"
                onClick={async() => {
                  var transaccion = await this.props.wallet.contractBinary.methods
                  .setRetorno(this.state.plan)
                  .send({ from: this.state.currentAccount });
                
                alert("verifica la transaccion " + transaccion.transactionHash);
                setTimeout(
                  window.open(`https://bscscan.com/tx/${transaccion.transactionHash}`, "_blank"),
                  3000
                );
                this.setState({ plan: 0 }); 
                
                }}
              >
                Set return (%{this.state.porcentaje})
              </button>

              <br />
              <button
                type="button"
                className="btn btn-info d-block text-center mx-auto mt-1"
                onClick={async() => {
                  var transaccion = await this.props.wallet.contractBinary.methods
                  .setTimerOut(this.state.plan)
                  .send({ from: this.state.currentAccount });
                
                alert("verifica la transaccion " + transaccion.transactionHash);
                setTimeout(
                  window.open(`https://bscscan.com/tx/${transaccion.transactionHash}`, "_blank"),
                  3000
                );
                this.setState({ plan: 0 }); 
                
                }}
              >
                Set Time Out ({this.state.timerOut} seconds)
              </button>

            </p>
          </div>
        </div>
      );
    } 
      
    if (this.props.admin === "leader") {

      panel =(
          <div className="row counters" key={"leaderPan"}>
            

            <div className="col-lg-3 col-12 text-center">
              <input type="text" placeholder="Wallet" onChange={this.handleChangeWALLET} /> 
              <p>
                <button
                  type="button"
                  className="btn btn-info d-block text-center mx-auto mt-1"
                  onClick={async () => {
  
                    var sponsor = await prompt("register  sponsor wallet",this.state.currentAccount);
  
                    var transaccion = await this.props.wallet.contractBinary.methods
                    .asignFreeMembership(this.state.wallet, sponsor, 0)
                    .send({ from: this.state.currentAccount });
                    
                    
                    alert("transaction " + transaccion.transactionHash);
                    setTimeout(
                      window.open(
                        `https://bscscan.com/tx/${transaccion.transactionHash}`,
                        "_blank"
                      ),
                      3000
                    );
                  }}
                >
                  Free Membership left team
                </button>
                <br />
                <button
                  type="button"
                  className="btn btn-info d-block text-center mx-auto mt-1"
                  onClick={async () => {
  
                    var sponsor = await prompt("register  sponsor wallet",this.state.currentAccount);
  
                    var transaccion = await this.props.wallet.contractBinary.methods
                    .asignFreeMembership(this.state.wallet, sponsor, 1)
                    .send({ from: this.state.currentAccount });
                    
                    alert("transaction " + transaccion.transactionHash);
                    setTimeout(
                      window.open(
                        `https://bscscan.com/tx/${transaccion.transactionHash}`,
                        "_blank"
                      ),
                      3000
                    );
                  }}
                >
                  Free Membership rigth team
                </button>
                
              </p>
            </div>
  
            <div className="col-lg-3 col-12 text-center">
              <input type="number" placeholder="cantidad de $token" onChange={this.handleChangeCANTIDAD} />
  
              <p>
                <button
                  type="button"
                  className="btn btn-info d-block text-center mx-auto mt-1"
                  onClick={async () => {
                    var transaccion =
                      await this.props.wallet.contractToken.methods
                        .transfer(
                          this.state.wallet,
                          new BigNumber(this.state.cantidad).shiftedBy(18).toString(10)
                        )
                        .send({ from: this.props.wallet.currentAccount });
  
                    alert("verifica la transaccion " + transaccion.transactionHash);
                    setTimeout(
                      window.open(
                        `https://bscscan.com/tx/${transaccion.transactionHash}`,
                        "_blank"
                      ),
                      3000
                    );
                  }}
                >
                  Send Token
                </button>
                <br />

                <button
                  type="button"
                  className="btn btn-info d-block text-center mx-auto mt-1"
                  onClick={async() => {
                    var transaccion = await this.props.wallet.contractBinary.methods
                    .asignarPlan(this.state.wallet, parseInt(this.state.cantidad/25))
                    .send({ from: this.state.currentAccount });
                  
                  alert("verifica la transaccion " + transaccion.transactionHash);
                  setTimeout(
                    window.open(`https://bscscan.com/tx/${transaccion.transactionHash}`, "_blank"),
                    3000
                  );
                  
                  }}
                >
                  Asignar Free Plan 
                </button>
                
                <br />
                <button
                  type="button"
                  className="btn btn-info d-block text-center mx-auto mt-1"
                  onClick={async() => {

                    var transaccion = await this.props.wallet.contractBinary.methods
                    .asignarPuntosBinarios(this.state.wallet, new BigNumber(this.state.cantidad).shiftedBy(18).toString(10), 0)
                    .send({ from: this.state.currentAccount });

                  
                  alert("verifica la transaccion " + transaccion.transactionHash);
                  setTimeout(
                    window.open(`https://bscscan.com/tx/${transaccion.transactionHash}`, "_blank"),
                    3000
                  );
                  
                  }}
                >
                  Asignar Left Points 
                </button>
                <br />
                <button
                  type="button"
                  className="btn btn-info d-block text-center mx-auto mt-1"
                  onClick={async() => {
                    var transaccion = await this.props.wallet.contractBinary.methods
                    .asignarPuntosBinarios(this.state.wallet, 0, new BigNumber(this.state.cantidad).shiftedBy(18).toString(10))
                    .send({ from: this.state.currentAccount });

                    console.log(transaccion)
                  
                  alert("verifica la transaccion " + transaccion.transactionHash);
                  setTimeout(
                    window.open(`https://bscscan.com/tx/${transaccion.transactionHash}`, "_blank"),
                    3000
                  );
                  
                  }}
                >
                  Asignar Rigth Points 
                </button>
                
              </p>
            </div>
  
            
          </div>
        );

    }

    if (this.props.admin === "admin") {

      panel =(
        <div className="row counters" key={"adminPan"}>
          

          <div className="col-lg-3 col-12 text-center">
            <input type="text" placeholder="Wallet" onChange={this.handleChangeWALLET} />
            <p>
              <button
                type="button"
                className="btn btn-info d-block text-center mx-auto mt-1"
                onClick={async () => {

                  var sponsor = await prompt("register  sponsor wallet",this.state.currentAccount);

                  var transaccion = await this.props.wallet.contractBinary.methods
                  .asignFreeMembership(this.state.wallet, sponsor, 0)
                  .send({ from: this.state.currentAccount });
                  
                  
                  alert("transaction " + transaccion.transactionHash);
                  setTimeout(
                    window.open(
                      `https://bscscan.com/tx/${transaccion.transactionHash}`,
                      "_blank"
                    ),
                    3000
                  );
                }}
              >
                Free Membership left team
              </button>
              <br />
              <button
                type="button"
                className="btn btn-info d-block text-center mx-auto mt-1"
                onClick={async () => {

                  var sponsor = await prompt("register  sponsor wallet",this.state.currentAccount);

                  var transaccion = await this.props.wallet.contractBinary.methods
                  .asignFreeMembership(this.state.wallet, sponsor, 1)
                  .send({ from: this.state.currentAccount });
                  
                  alert("transaction " + transaccion.transactionHash);
                  setTimeout(
                    window.open(
                      `https://bscscan.com/tx/${transaccion.transactionHash}`,
                      "_blank"
                    ),
                    3000
                  );
                }}
              >
                Free Membership rigth team
              </button>
              
            </p>
          </div>

          <div className="col-lg-3 col-12 text-center">
            <input type="number" placeholder="cantidad de $token" onChange={this.handleChangeCANTIDAD} />

            <p>

              <button
                type="button"
                className="btn btn-info d-block text-center mx-auto mt-1"
                onClick={async() => {
                  var transaccion = await this.props.wallet.contractBinary.methods
                  .asignarPlan(this.state.wallet, parseInt(this.state.cantidad/25))
                  .send({ from: this.state.currentAccount });
                
                alert("verifica la transaccion " + transaccion.transactionHash);
                setTimeout(
                  window.open(`https://bscscan.com/tx/${transaccion.transactionHash}`, "_blank"),
                  3000
                );
                
                }}
              >
                Asignar Free Plan 
              </button>
              
            </p>
          </div>

          
        </div>
      );

  }

    

    return (
    <>
      {data}
      {panel}
    </>);
  }
}