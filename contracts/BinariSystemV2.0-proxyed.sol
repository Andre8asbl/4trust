pragma solidity >=0.8.0;
// SPDX-License-Identifier: Apache-2.0

library SafeMath {
function mul(uint256 a, uint256 b) internal pure returns (uint256) {
if (a == 0) {return 0;}
uint256 c = a * b;
require(c / a == b);
return c;
}
function div(uint256 a, uint256 b) internal pure returns (uint256) {
require(b > 0);
uint256 c = a / b;
return c;
}
function sub(uint256 a, uint256 b) internal pure returns (uint256) {
require(b <= a);
uint256 c = a - b;
return c;
}
function add(uint256 a, uint256 b) internal pure returns (uint256) {
uint256 c = a + b;
require(c >= a);
return c;
}
}

library Array {
function addUint(uint256[] memory oldArray, uint256 data)internal pure returns ( uint256[] memory newArray) {
newArray = new uint256[](oldArray.length+1);
for(uint256 i = 0; i < oldArray.length; i++){
newArray[i] = oldArray[i];
}
newArray[oldArray.length]=data;
return newArray;
}
function addAddress(address[] memory oldArray, address data)internal pure returns ( address[] memory newArray) {
newArray =   new address[](oldArray.length+1);
for(uint i = 0; i < oldArray.length; i++){
newArray[i] = oldArray[i];
}
newArray[oldArray.length]=data;
return newArray;
}
function addBool(bool[] memory oldArray, bool data)internal pure returns ( bool[] memory newArray) {
newArray =   new bool[](oldArray.length+1);
for(uint i = 0; i < oldArray.length; i++){
newArray[i] = oldArray[i];
}
newArray[oldArray.length]=data;
return newArray;
}
}

interface Proxy_Interface{
  function admin() external view returns(address);
  function changeAdmin(address _admin) external;
}

interface TRC20_Interface {
function allowance(address _owner, address _spender) external view returns (uint);
function transferFrom(address _from, address _to, uint _value) external returns (bool);
function transfer(address direccion, uint cantidad) external returns (bool);
function balanceOf(address who) external view returns (uint256);
function decimals() external view returns(uint);
}

contract BinarySystemV2 {
  using SafeMath for uint256;
  using Array for uint256[];
  using Array for address[];
  using Array for bool[];
  TRC20_Interface USDT_Contract = TRC20_Interface(0x55d398326f99059fF775485246999027B3197955);
  struct Hand {
    uint256 lReclamados;
    uint256 lExtra;
    address lReferer;
    uint256 rReclamados;
    uint256 rExtra;
    address rReferer;
  }
  struct Deposito {
    uint256 inicio;
    uint256 amount;
    uint256 valor;
    bool pasivo;
  }
  struct Investor {
    bool registered;
    uint256 balanceRef;
    uint256 balanceSal;
    uint256 totalRef;
    uint256 invested;
    uint256 paidAt;
    uint256 amount;
    uint256 withdrawn;
    address[] directosL;
    address[] directosR;
    Deposito[] depositos;
    Hand hands;
  }
  mapping (address => bool) public admin;
  mapping (address => bool) public leader;
  mapping (address => uint256) public retirableA;
  mapping (address => Investor) public investors;
  mapping (address => address) public padre;
  mapping (uint256 => address) public idToAddress;
  mapping (address => uint256) public addressToId;
  mapping (address => bool[]) public rangoReclamado;
  address public API;
  uint256 public MIN_RETIRO;
  uint256 public MAX_RETIRO;
  uint256 public GanaMax;
  uint256 public plan;
  uint256 public inversiones;
  uint256[] public porcientos;
  uint256[] public porcientosSalida;
  bool[] public espaciosRango;
  uint256[] public gananciasRango;
  uint256[] public puntosRango;
  bool public onOffWitdrawl;
  uint256 public dias;
  uint256 public unidades;
  uint256 public timerOut;
  uint256 public porcent;
  uint256 public multiPuntos;
  uint256 public factorPuntos;
  uint256 public porcentPuntosBinario;
  uint256 public directosBinario;
  uint256 public descuento;
  uint256 public totalInvestors;
  uint256 public totalInvested;
  uint256 public totalRefRewards;
  uint256 public totalRefWitdrawl;
  uint256 public lastUserId;
  address[] public walletFee;
  uint256[] public porcientoFee;
  address[] public walletRegistro;
  uint256 public precioRegistro;
  uint256[] public porcientoRegistro;
  uint256 public activerFee;
  address[] public walletBuy;
  uint256[] public valorBuy;
  bool public iniciado = true;
  constructor() {}
  function inicializar() public{
    require(!iniciado);
    iniciado = true;
    admin[msg.sender] = true;
    leader[msg.sender] = true;
    Investor storage usuario = investors[msg.sender];
    usuario.registered = true;
    rangoReclamado[msg.sender] = espaciosRango;
    idToAddress[0] = msg.sender;
    addressToId[msg.sender] = 0;
    MIN_RETIRO = 10*10**18;
    MAX_RETIRO = 1100*10**18;
    plan = 25*10**18;
    inversiones = 1;
    porcientos = [300];
    porcientosSalida = [20, 5, 5, 5, 5];
    espaciosRango = [false,false,false,false,false,false,false,false,false,false,false,false];
    gananciasRango = [1*10**18, 2*10**18, 4*10**18, 10*10**18, 20*10**18, 40*10**18, 100*10**18, 200*10**18, 400*10**18, 500*10**18, 1000*10**18, 2000*10**18, 5000*10**18 ];
    puntosRango = [125*10**18, 250*10**18, 500*10**18, 1250*10**18, 2500*10**18, 5000*10**18, 12500*10**18, 25000*10**18, 50000*10**18, 125000*10**18, 250000*10**18, 500000*10**18, 1250000*10**18];
    onOffWitdrawl = true;
    dias = 1000;
    unidades = 86400;
    timerOut = 86400;
    porcent = 300;
    multiPuntos = 1;
    factorPuntos = 1;
    porcentPuntosBinario = 10;
    directosBinario = 2;
    descuento = 70;
    lastUserId = 1;
    precioRegistro = 10 * 10**18;
    walletRegistro = [0x361Db60d275b4328Fd35733b93ceB1A3D22BBf6A];
    porcientoRegistro = [100];
    walletBuy = [0x6b78C6d2031600dcFAd295359823889b2dbAfd1B,0x642974e00445f31c50e7CEC34B24bC8b6aefd3De,0x2198b0D4f54925DCCA173a84708BA284Ac85Cc37];
    valorBuy = [1,5,26];
    walletFee = [0x4593739d3A5849562E7e647B44b9a7ee3Ba1E8D5,address(this)];
    porcientoFee = [26,4];
    activerFee = 2;// 0 desactivada | 1 fee retiro | 2 fee retiro + precio registro
    
  }
  function setstate() public view  returns(uint256 Investors,uint256 Invested,uint256 RefRewards){
    return (totalInvestors, totalInvested, totalRefRewards);
  }
  function tiempo() public view returns (uint256){
    return dias.mul(unidades);
  }
  function column(address yo, uint256 _largo) public view returns(address[] memory res) {
    for (uint256 i = 0; i < _largo; i++) {
      res = res.addAddress(padre[yo]);
      yo = padre[yo];
    }
  }
  function miHands(address _user, uint256 _hand) public view returns(uint256 equipo, uint256 extra, uint256 reclamados,uint256 capital, uint256 directos,address referer) {
    Investor memory usuario = investors[_user];
    Hand memory hands = usuario.hands;
    if(_hand == 0){
      return (personasBinary(_user,  _hand), hands.lExtra, hands.lReclamados, usuario.invested, misDirectos(_user, _hand).length, hands.lReferer);
    }else{
      return (personasBinary(_user,  _hand), hands.rExtra, hands.rReclamados, usuario.invested, misDirectos(_user, _hand).length, hands.rReferer);
    }
  }
  function misDirectos(address _user, uint256 _hand) public view returns(address[] memory){
    if(_hand == 0){
      return (investors[_user].directosL);
    }else{
      return (investors[_user].directosR);
    }
  }
  function depositos(address _user) public view returns(uint256[] memory amount, uint256[] memory time, bool[] memory pasive, bool[] memory activo, uint256 total, uint256 totalValue){
    Investor memory usuario = investors[_user];
    for (uint i = 0; i < usuario.depositos.length; i++) {
      Deposito memory dep = usuario.depositos[i];
      time = time.addUint(dep.inicio);
      uint finish = dep.inicio + tiempo();
      uint since = usuario.paidAt > dep.inicio ? usuario.paidAt : dep.inicio;
      uint till = block.timestamp > finish ? finish : block.timestamp;
      if (since != 0 && since < till) {
        if (dep.pasivo) {
          total += dep.amount * (till - since) / tiempo() ;
        } 
        activo = activo.addBool(true);
      }else{
        activo = activo.addBool(false);
      }
      amount = amount.addUint(dep.amount);
      pasive = pasive.addBool(dep.pasivo); 
      totalValue += dep.valor;
    }
  }
  function rewardReferers(address yo, uint256 amount, uint256[] memory array, bool _sal) internal {
    address[] memory referi;
    referi = column(yo, array.length);
    uint256 a;
    Investor storage usuario;
    for (uint256 i = 0; i < array.length; i++) {
      if (array[i] != 0) {
        usuario = investors[referi[i]];
        if (usuario.registered && usuario.amount > 0){
          if ( referi[i] != address(0) ) {
            a = amount.mul(array[i]).div(1000);
            if (usuario.amount > a) {
              discountDeposits(referi[i], a);
              if(_sal){
                usuario.balanceSal += a;
              }else{
                usuario.balanceRef += a;
                usuario.totalRef += a;
              }
              totalRefRewards += a;
            }else{
              if(_sal){
                usuario.balanceSal += usuario.amount;
              }else{
                usuario.balanceRef += usuario.amount;
                usuario.totalRef += usuario.amount;
              }
              totalRefRewards += usuario.amount;
              discountDeposits(referi[i], usuario.amount);
            }
          }else{
            break;
          }
        }
      } else {
        break;
      }
    }
  }
  function discountDeposits(address _user, uint256 _valor) internal { 
    Investor storage usuario = investors[_user];
    Deposito storage dep;
    for (uint i = 0; i < usuario.depositos.length; i++) {
    if(_valor == 0)break;
    dep = usuario.depositos[i];
    if(_valor > dep.amount ){
    _valor = _valor-dep.amount;
    delete dep.amount;
    }else{
    dep.amount = dep.amount-_valor;
    delete _valor;
    }
    }
  }

  function registro(address _sponsor, uint8 _hand) public{
    if(precioRegistro > 0){
      if( !USDT_Contract.transferFrom(msg.sender, address(this), precioRegistro))revert();
      if (activerFee >= 2){
        for (uint256 i = 0; i < walletRegistro.length; i++) {
          USDT_Contract.transfer(walletRegistro[i], precioRegistro.mul(porcientoRegistro[i]).div(100));
        }
      }
    }
    _registro( msg.sender, _sponsor, _hand);

  }
  function _registro(address _user, address _sponsor, uint8 _hand) public{
    if( _hand > 1) revert();
    Investor storage usuario = investors[_user];
    if(usuario.withdrawn != 0)revert();
    
    usuario.registered = true;
    padre[_user] = _sponsor;
    if (_sponsor != address(0) ){
      Investor storage sponsor = investors[_sponsor];
      if ( _hand == 0 ) {
        sponsor.directosL.push(_user);
        if (sponsor.hands.lReferer == address(0) ) {
          sponsor.hands.lReferer = _user;
        } else {
          address[] memory network;
          sponsor = investors[insertion(network.addAddress(sponsor.hands.lReferer), _hand)];
          sponsor.hands.lReferer = _user;
        }
      }else{
        sponsor.directosR.push(_user);
        if ( sponsor.hands.rReferer == address(0) ) {
          sponsor.hands.rReferer = _user;
        } else {
          address[] memory network;
          sponsor = investors[insertion(network.addAddress(sponsor.hands.rReferer), _hand)];
          sponsor.hands.rReferer = _user;
        }
      }
    }
    if(_user!=owner())totalInvestors++;
    if(idToAddress[lastUserId] == address(0)){
      rangoReclamado[_user] = espaciosRango;
      idToAddress[lastUserId] = _user;
      addressToId[_user] = lastUserId;
      lastUserId++;
    }
    
  }
  function buyPlan(uint256 _value) public{
    _value = plan * _value;
    totalInvested += _value;
      if( USDT_Contract.allowance(msg.sender, address(this)) < _value)revert();
      if( !USDT_Contract.transferFrom(msg.sender, address(this), _value) )revert();
      for (uint256 i = 0; i < walletBuy.length; i++) {
        USDT_Contract.transfer(walletBuy[i], _value.mul(valorBuy[i]).div(100));
      }
    _buyPlan(msg.sender, _value, false);
    rewardReferers(msg.sender, _value, porcientos, false);
  }
  function _buyPlan(address _user, uint256 _value, bool _passive) private {
    if(_value < 0 )revert();
    Investor storage usuario = investors[_user];
    if(!usuario.registered)revert();
    usuario.depositos.push(Deposito(block.timestamp,_value.mul(porcent.div(100)),_value, _passive));
    usuario.invested += _value;
    usuario.amount += _value.mul(porcent.div(100));
  }
  function withdrawableBinary(address any_user) public view returns (uint256 left, uint256 rigth, uint256 amount) {
    Investor storage user = investors[any_user];
    address[] memory network;

    if ( user.hands.lReferer != address(0) && investors[user.hands.lReferer].registered) {
      network = allnetwork(network.addAddress(user.hands.lReferer));
      for (uint i = 0; i < network.length; i++) {
        user = investors[network[i]];
        left += user.invested.div(factorPuntos);
      }
        user = investors[any_user];
        left += user.hands.lExtra;
        if(user.hands.lReclamados>left){
            delete left;
        }else{
            left -= user.hands.lReclamados;
        }
    }
    
    if ( user.hands.rReferer != address(0) && investors[user.hands.rReferer].registered) {
        network = allnetwork(network.addAddress(user.hands.rReferer));
        for (uint i = 0; i < network.length; i++) {
          user = investors[network[i]];
          rigth += user.invested.mul(multiPuntos).div(factorPuntos);
        }
        user = investors[any_user];
        rigth += user.hands.rExtra;
        if(user.hands.rReclamados>left){
            delete left;
        }else{
            rigth -= user.hands.rReclamados;

        }
    }
    
    if (misDirectos(any_user,0).length+misDirectos(any_user,1).length >= directosBinario){
      if (left < rigth) {
        if (left.mul(porcentPuntosBinario).div(100) <= user.amount ) {
          amount = left.mul(porcentPuntosBinario).mul(multiPuntos).div(100) ;
        }else{
          amount = user.amount;
        }
      }else{
        if (rigth.mul(porcentPuntosBinario).div(100) <= user.amount ) {
          amount = rigth.mul(porcentPuntosBinario).div(100) ;
        }else{
          amount = user.amount;
        }
      }
    }
  }

  function withdrawableRange(address any_user) public view returns (uint256 amount) {
    Investor storage user = investors[any_user];
    uint256 left = user.hands.lReclamados.add(user.hands.lExtra);
    uint256 rigth = user.hands.rReclamados.add(user.hands.rExtra);
    if (left < rigth) {
      amount = left ;
    }else{
      amount = rigth;
    }
  }

  function newRecompensa() public {
    if (!onOffWitdrawl)revert();
    uint256 amount = withdrawableRange(msg.sender);
    for (uint256 index = 0; index < gananciasRango.length; index++) {
      if(amount >= puntosRango[index] && !rangoReclamado[msg.sender][index]){
        USDT_Contract.transfer(msg.sender, gananciasRango[index]);
        rangoReclamado[msg.sender][index] = true;
      }
    }
  }

  function personasBinary(address _user, uint256 _hand) public view returns (uint256 miTeam) {
    Investor memory referer = investors[_user];
    if(_hand == 0){
      if ( referer.hands.lReferer != address(0) && referer.registered) {
      address[] memory network;
      network = allnetwork(network.addAddress(referer.hands.lReferer));
      for (uint i = 0; i < network.length; i++) {
        if(referer.registered)miTeam++;
        referer = investors[network[i]];
      }
    }
    }else{
      if ( referer.hands.rReferer != address(0) && referer.registered) {
        address[] memory network;
        network = allnetwork(network.addAddress(referer.hands.rReferer));
        for (uint b = 0; b < network.length; b++) {
            if(referer.registered)miTeam++;
          referer = investors[network[b]];
        }
      }
    }
  }

  function allnetwork( address[] memory network ) public view returns ( address[] memory) {
    Investor memory user;
    for (uint i = 0; i < network.length; i++) {
      user = investors[network[i]];
      address userLeft = user.hands.lReferer;
      address userRigth = user.hands.rReferer;
      for (uint u = 0; u < network.length; u++) {
        if (userLeft == network[u]){
          userLeft = address(0);
        }
        if (userRigth == network[u]){
          userRigth = address(0);
        }
      }
      if( userLeft != address(0) ){
        network = network.addAddress(userLeft);
      }
      if( userRigth != address(0) ){
        network = network.addAddress(userRigth);
      }
    }
    return network;
  }
  function insertion(address[] memory network, uint256 _hand) public view returns ( address wallett) {
    Investor memory user;
    if(_hand == 0){
      for (uint i = 0; i < network.length; i++) {
        user = investors[network[i]];
        address userLeft = user.hands.lReferer;
        if( userLeft == address(0) ){
          return  network[i];
        }
        network = network.addAddress(userLeft);
      }
      insertion(network, 0);
    }else{
      for (uint i = 0; i < network.length; i++) {
        user = investors[network[i]];
        address userRigth = user.hands.rReferer;
        if( userRigth == address(0) ){
          return network[i];
        }
        network = network.addAddress(userRigth);
      }
      insertion(network, 1);
    }
  }
  function withdrawable(address any_user) public view returns (uint256) {
    Investor memory investor2 = investors[any_user];
    (, , uint256 binary) = withdrawableBinary(any_user);
    (, , , , uint256 total,) = depositos(any_user);
    total += binary+investor2.balanceRef+investor2.balanceSal;
    if (total > investor2.amount) {
      total = investor2.amount;
    }
    return total;
  }
  function corteBinarioDo(address any_user, uint256 left, uint256 rigth, uint256 _retirableA, uint256 _retirableB) public  {
    onlyApi();
    if(investors[any_user].paidAt+timerOut <= block.timestamp){
      if ( left != 0 && rigth != 0 ) {
      Investor storage usuario = investors[any_user];
      if(left < rigth){
        usuario.hands.lReclamados += left;
        usuario.hands.rReclamados += left;
      }else{
        usuario.hands.lReclamados += rigth;
        usuario.hands.rReclamados += rigth;
      }
      }
      if(_retirableA > 0)retirableA[any_user] = _retirableA;
      if(_retirableB > 0)discountDeposits(any_user, _retirableB);
      investors[any_user].paidAt = block.timestamp;
      delete investors[any_user].balanceRef;
      delete investors[any_user].balanceSal;
    }
  }
  function withdraw() public {
    if (!onOffWitdrawl)revert();
    uint256 _value = retirableA[msg.sender];
    if( USDT_Contract.balanceOf(address(this)) < _value)revert();
    if( _value < MIN_RETIRO )revert();
    Investor storage usuario = investors[msg.sender];
    usuario.withdrawn += _value;
    if(_value > MAX_RETIRO){
      GanaMax += _value-MAX_RETIRO;
      _value = MAX_RETIRO;
    }

    uint256 discont = 100;
    if ( activerFee >= 1 ) {
      
      for (uint256 i = 0; i < walletFee.length; i++) {
        if(walletFee[i] != address(this)){
          USDT_Contract.transfer(walletFee[i], _value.mul(porcientoFee[i]).div(100));
        }
        discont = discont.sub(porcientoFee[i]);
      }
    }
    USDT_Contract.transfer(msg.sender, _value.mul(discont).div(100));
    rewardReferers(msg.sender, _value, porcientosSalida, true);
    if(_value >= usuario.amount){
      delete usuario.amount;
    }else{
      usuario.amount = usuario.amount.sub(_value);
    }
    delete retirableA[msg.sender];
    totalRefWitdrawl += _value;
  }
  function onlyOwner() internal view{require(msg.sender == owner());}
  function owner() public view returns(address){
    Proxy_Interface Proxy_Contract = Proxy_Interface(address(this));
    return Proxy_Contract.admin();
  }
  function onlyAdmin() view internal {
  if(!admin[msg.sender])revert();
  }

  function makeNewAdmin(address payable _newadmin) public { onlyOwner();
  if(_newadmin == address(0))revert();
  admin[_newadmin] = true;
  }
  function makeRemoveAdmin(address payable _oldadmin) public { onlyOwner();
  if(_oldadmin == address(0))revert();
  admin[_oldadmin] = false;
  }
  function onlyLeader() view internal{
  if(!leader[msg.sender])revert();
  }
  function makeNewLeader(address payable _newadmin) public { onlyOwner();
  if(_newadmin == address(0))revert();
  leader[_newadmin] = true;
  admin[_newadmin] = true;
  }
  function makeRemoveLeader(address payable _oldadmin) public { onlyOwner();
  if(_oldadmin == address(0))revert();
  leader[_oldadmin] = false;
  admin[_oldadmin] = false;
  }
  function onlyApi() view internal {
  require(API == msg.sender);
  }
  function makeNewApi(address payable _newapi) public { onlyOwner();
  API = _newapi;
  }
  function asignFreeMembership(address _user, address _sponsor, uint8 _hand ) public {
    onlyAdmin();
    _registro( _user, _sponsor, _hand);
  }
  function asignarPlan(address _user ,uint256 _plan, bool _depago) public { onlyAdmin();
    _plan = plan * _plan;
    _buyPlan(_user, _plan, _depago);
  }
  function asignarPuntosBinarios(address _user ,uint256 _puntosLeft, uint256 _puntosRigth) public { onlyLeader();
    Investor storage usuario = investors[_user];
    require(usuario.registered);
    if(_puntosLeft > 0){
      usuario.hands.lExtra += _puntosLeft;
    }
    if(_puntosRigth > 0){
      usuario.hands.rExtra += _puntosRigth;
    }
  }
  function setPrecioRegistro(uint256 _precio, uint256[] memory _porcentaje) public { onlyOwner();
    precioRegistro = _precio;
    porcientoRegistro = _porcentaje;
  }
  function controlWitdrawl(bool _true_false) public { onlyOwner();
    onOffWitdrawl = _true_false;
  }
  function setPorcientos(uint256 _nivel, uint256 _value) public { onlyOwner();
    porcientos[_nivel] = _value;
  }
  function setPorcientosSalida(uint256 _nivel, uint256 _value) public { onlyOwner();
    porcientosSalida[_nivel] = _value;
  }
  function setDescuento(uint256 _descuento) public { onlyOwner();
    descuento = _descuento;
  }
  function setWalletstransfers(address[] memory _wallets, uint256[] memory _valores) public { onlyOwner();
    walletBuy = _wallets;
    valorBuy = _valores;
  }
  function setWalletFee(address[] memory _wallet, uint256[] memory _fee , uint256 _activerFee ) public { onlyOwner();
    walletFee = _wallet;
    porcientoFee = _fee;
    activerFee = _activerFee;
  }
  function setMIN_RETIRO(uint256 _min) public { onlyOwner();
    MIN_RETIRO = _min;
  }
  function setPlan(uint256 _value) public { onlyOwner();
    plan = _value;
  }
  function updateTotalInvestors(uint256 _index) public { onlyOwner();
    totalInvestors = _index;
  }
  function redimToken() public { onlyOwner();
    USDT_Contract.transfer(owner(), USDT_Contract.balanceOf(address(this)));
  }
  function redimBNB() public { onlyOwner();
    payable(address (owner())).transfer(address(this).balance);
  }
  fallback() external payable {}
  receive() external payable {}
}