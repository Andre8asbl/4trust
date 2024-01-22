pragma solidity >=0.8.0;
// SPDX-License-Identifier: Apache-2.0

library SafeMath {

  function mul(uint a, uint b) internal pure returns (uint) {
    if (a == 0) {return 0;}
    uint c = a * b;
    require(c / a == b);
    return c;
  }

  function div(uint a, uint b) internal pure returns (uint) {
    require(b > 0);
    uint c = a / b;
    return c;
  }

  function sub(uint a, uint b) internal pure returns (uint) {
    require(b <= a);
    uint c = a - b;
    return c;
  }

  function add(uint a, uint b) internal pure returns (uint) {
    uint c = a + b;
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

interface TRC20_Interface {
  function allowance(address _owner, address _spender) external view returns (uint);
  function transferFrom(address _from, address _to, uint _value) external returns (bool);
  function transfer(address direccion, uint cantidad) external returns (bool);
  function balanceOf(address who) external view returns (uint256);
  function decimals() external view returns(uint);
}

abstract contract Context {
  function _msgSender() internal view virtual returns (address) {
    return msg.sender;
  }

  function _msgData() internal view virtual returns (bytes calldata) {
    return msg.data;
  }
}

contract Admin is Context{

  address payable public owner;
  address public API;

  mapping (address => bool) public admin;
  mapping (address => bool) public leader;

  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
  event NewAdmin(address indexed admin);
  event AdminRemoved(address indexed admin);

  constructor(){
    owner = payable(_msgSender());
    admin[_msgSender()] = true;
    leader[_msgSender()] = true;
  }
 
  function onlyOwner() view internal  {
    if(_msgSender() != owner)revert();
  }
  function transferOwnership(address payable newOwner) public { onlyOwner();
    if(newOwner == address(0))revert();
    emit OwnershipTransferred(owner, newOwner);
    owner = newOwner;
    admin[newOwner] = true;
    leader[newOwner] = true;
  }

  function onlyAdmin() view internal {
    if(!admin[_msgSender()])revert();
  }

  function makeNewAdmin(address payable _newadmin) public { onlyOwner();
    if(_newadmin == address(0))revert();
    emit NewAdmin(_newadmin);
    admin[_newadmin] = true;
  }

  function makeRemoveAdmin(address payable _oldadmin) public { onlyOwner();
    if(_oldadmin == address(0))revert();
    emit AdminRemoved(_oldadmin);
    admin[_oldadmin] = false;
  }
  function onlyLeader() view internal{
    if(!leader[_msgSender()])revert();
  }
  function makeNewLeader(address payable _newadmin) public { onlyOwner();
    if(_newadmin == address(0))revert();
    emit NewAdmin(_newadmin);
    leader[_newadmin] = true;
    admin[_newadmin] = true;
  }
  function makeRemoveLeader(address payable _oldadmin) public { onlyOwner();
    if(_oldadmin == address(0))revert();
    emit AdminRemoved(_oldadmin);
    leader[_oldadmin] = false;
    admin[_oldadmin] = false;
  }
  function onlyApi() view internal {
    if(API != _msgSender())revert();
  }
  function makeNewApi(address payable _newapi) public { onlyOwner();
    API = _newapi;
  }
}

contract BinarySystemV2 is Admin{
  using SafeMath for uint256;
  using Array for uint256[];
  using Array for address[];
  using Array for bool[];

  address token = 0x55d398326f99059fF775485246999027B3197955;
  TRC20_Interface USDT_Contract = TRC20_Interface(token);

  struct Hand {
    uint256 reclamados;
    uint256 extra;
    address referer;
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
  }

  mapping (address => Investor) public investors;
  mapping (address => Deposito[]) public depositos;
  mapping (address => Hand) public handL;
  mapping (address => Hand) public handR;
  mapping (address => address[]) public directosL;
  mapping (address => address[]) public directosR;

  mapping (address => uint256) public retirableA;
  mapping (address => address) public padre;
  mapping (uint256 => address) public idToAddress;
  mapping (address => uint256) public addressToId;
  mapping (address => bool[]) public rangoReclamado;

  uint256 public MIN_RETIRO = 10*10**18;
  uint256 public MAX_RETIRO = 3000*10**18;

  uint256 public GanaMax;
  uint256 public plan = 25*10**18;
  address public tokenPricipal = token;

  uint256 public inversiones = 1;
  uint256[] public primervez = [80];
  uint256[] public porcientos = [40];
  uint256[] public porcientosSalida = [20, 5, 5, 5, 5];

  bool[] public espaciosRango = [false,false,false,false,false,false,false,false,false,false,false,false];
  uint256[] public gananciasRango = [10*10**18, 20*10**18, 40*10**18, 100*10**18, 200*10**18, 400*10**18, 1000*10**18, 2000*10**18, 4000*10**18, 5000*10**18, 10000*10**18, 20000*10**18, 50000*10**18 ];
  uint256[] public puntosRango = [125*10**18, 250*10**18, 500*10**18, 1250*10**18, 2500*10**18, 5000*10**18, 12500*10**18, 25000*10**18, 50000*10**18, 125000*10**18, 250000*10**18, 500000*10**18, 1250000*10**18];

  bool public onOffWitdrawl = true;

  uint256 public dias = 1000;
  uint256 public unidades = 86400;

  uint256 public timerOut = 86400;
  uint256 public porcent = 200;

  uint256 public multiPuntos = 1;
  uint256 public factorPuntos = 2;

  uint256 public porcentPuntosBinario = 10;
  uint256 public directosBinario = 2;

  uint256 public descuento = 92;

  uint256 public totalInvestors = 524;
  uint256 public totalInvested;
  uint256 public totalRefRewards;
  uint256 public totalRefWitdrawl;

  uint256 public lastUserId = 1;
  uint256 public valorFee = 4;
  address public walletFee = 0xDF835Cb0935FdBC51BBf730599B57b21815441Dd;
  address[] public walletRegistro = [0xDF835Cb0935FdBC51BBf730599B57b21815441Dd,0x52F77B3283C5627FDd827eF62a32D9E90910a6b5];
  uint256 public precioRegistro = 10 * 10**18;
  uint256[] public porcientoRegistro = [50,50];
  uint256 public activerFee = 2;// 0 desactivada | 1 fee retiro | 2 fee + precio registro

  address[] public wallet = [0xDF835Cb0935FdBC51BBf730599B57b21815441Dd, 0x52F77B3283C5627FDd827eF62a32D9E90910a6b5, 0x6bD8C114DDe23c9d543E1974822646eE840B7D33];
  uint256[] public valor = [5, 5, 65];

  constructor() {
    Investor storage usuario = investors[owner];
    usuario.registered = true;
    rangoReclamado[_msgSender()] = espaciosRango;
    idToAddress[0] = _msgSender();
    addressToId[_msgSender()] = 0;
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

    if(_hand == 0){
      return (personasBinary(_user,  _hand), handL[_user].extra, handL[_user].reclamados, investors[_user].invested, misDirectos(_user, _hand).length, handL[_user].referer);
    }else{
      return (personasBinary(_user,  _hand), handR[_user].extra, handR[_user].reclamados, investors[_user].invested, misDirectos(_user, _hand).length, handR[_user].referer);
    }
  }
  function misDirectos(address _user, uint256 _hand) public view returns(address[] memory){
    if(_hand == 0){
      return directosL[_user];
    }else{
      return directosR[_user];
    }
  }
  function verDepositos(address _user) public view returns(uint256[] memory amount, uint256[] memory time, bool[] memory pasive, bool[] memory activo, uint256 total, uint256 totalValue){
    
    for (uint i = 0; i < depositos[_user].length; i++) {
      time = time.addUint(depositos[_user][i].inicio);
      uint finish = depositos[_user][i].inicio + tiempo();
      uint since = investors[_user].paidAt > depositos[_user][i].inicio ? investors[_user].paidAt : depositos[_user][i].inicio;
      uint till = block.timestamp > finish ? finish : block.timestamp;
      if (since != 0 && since < till) {
        if (depositos[_user][i].pasivo) {
          total += depositos[_user][i].amount * (till - since) / tiempo() ;
        } 
        activo = activo.addBool(true);
      }else{
        activo = activo.addBool(false);
      }
      amount = amount.addUint(depositos[_user][i].amount);
      pasive = pasive.addBool(depositos[_user][i].pasivo); 
      totalValue += depositos[_user][i].valor;
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

    for (uint i = 0; i < depositos[_user].length; i++) {
      if(_valor == 0)break;
      if(_valor > depositos[_user][i].amount ){
        _valor = _valor-depositos[_user][i].amount;
        delete depositos[_user][i].amount;
      }else{
        depositos[_user][i].amount = depositos[_user][i].amount-_valor;
        delete _valor;
      }
    }
  }

  function registro(address _sponsor, uint8 _hand) public{
    if(precioRegistro > 0){
      if( !USDT_Contract.transferFrom(_msgSender(), address(this), precioRegistro))revert();
      if (activerFee >= 2){
        for (uint256 i = 0; i < walletRegistro.length; i++) {
          USDT_Contract.transfer(walletRegistro[i], precioRegistro.mul(porcientoRegistro[i]).div(100));
        }
      }
    }
    _registro( _msgSender(), _sponsor, _hand);

  }
  function _registro(address _user, address _sponsor, uint8 _hand) public{
    if( _hand > 1) revert();
    Investor storage usuario = investors[_user];
    if(usuario.withdrawn != 0)revert();
    
    usuario.registered = true;
    padre[_user] = _sponsor;
    if (_sponsor != address(0) ){
      if ( _hand == 0 ) {
        directosL[_sponsor].push(_user);
        if (handL[_sponsor].referer == address(0) ) {
          handL[_sponsor].referer = _user;
        } else {
          address[] memory network;
          handL[insertion(network.addAddress(handL[_sponsor].referer), _hand)].referer = _user;
        }
      }else{
        directosR[_sponsor].push(_user);
        if ( handR[_sponsor].referer == address(0) ) {
          handR[_sponsor].referer = _user;
        } else {
          address[] memory network;
          handR[insertion(network.addAddress(handR[_sponsor].referer), _hand)].referer = _user;
        }
      }
    }
    if(_user!=owner)totalInvestors++;
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
      if( USDT_Contract.allowance(_msgSender(), address(this)) < _value)revert();
      if( !USDT_Contract.transferFrom(_msgSender(), address(this), _value) )revert();
      for (uint256 i = 0; i < wallet.length; i++) {
        USDT_Contract.transfer(wallet[i], _value.mul(valor[i]).div(100));
      }
    _buyPlan(_msgSender(), _value, true);
  }
  function _buyPlan(address _user, uint256 _value, bool _passive) private {
    if(_value < 0 )revert();
    if(!investors[_user].registered)revert();
    depositos[_user].push(Deposito(block.timestamp,_value.mul(porcent.div(100)),_value, _passive));
    investors[_user].invested += _value;
    investors[_user].amount += _value.mul(porcent.div(100));
  }
  function withdrawableBinary(address any_user) public view returns (uint256 left, uint256 rigth, uint256 amount) {

    if ( handL[any_user].referer != address(0)) {
      address[] memory network;
      network = allnetwork(network.addAddress(handL[any_user].referer));
      for (uint i = 0; i < network.length; i++) {
        left += investors[network[i]].invested.div(factorPuntos);
      }
    }
    left = handL[any_user].extra.sub(handL[any_user].reclamados);
    if ( handR[any_user].referer != address(0)) {
        address[] memory network;
        network = allnetwork(network.addAddress(handR[any_user].referer));
        for (uint i = 0; i < network.length; i++) {
          rigth += investors[network[i]].invested.mul(multiPuntos).div(factorPuntos);
        }
    }
    rigth = handR[any_user].extra.sub(handR[any_user].reclamados);
    if (misDirectos(any_user,0).length+misDirectos(any_user,1).length >= directosBinario){
      if (left < rigth) {
        if (left.mul(porcentPuntosBinario).div(100) <= investors[any_user].amount ) {
          amount = left.mul(porcentPuntosBinario).mul(multiPuntos).div(100) ;
        }else{
          amount = investors[any_user].amount;
        }
      }else{
        if (rigth.mul(porcentPuntosBinario).div(100) <= investors[any_user].amount ) {
          amount = rigth.mul(porcentPuntosBinario).div(100) ;
        }else{
          amount = investors[any_user].amount;
        }
      }
    }
  }

  function withdrawableRange(address any_user) public view returns (uint256) {
    uint256 left = handL[any_user].reclamados.add(handL[any_user].extra);
    uint256 rigth = handR[any_user].reclamados.add(handR[any_user].extra);
    if (left < rigth) {
      return left;
    }else{
      return rigth;
    }
  }

  function newRecompensa() public {
    if (!onOffWitdrawl)revert();
    uint256 amount = withdrawableRange(_msgSender());
    for (uint256 index = 0; index < gananciasRango.length; index++) {
      if(amount >= puntosRango[index] && !rangoReclamado[_msgSender()][index]){
        USDT_Contract.transfer(_msgSender(), gananciasRango[index]);
        rangoReclamado[_msgSender()][index] = true;
      }
    }
  }

  function personasBinary(address _user, uint256 _hand) public view returns (uint256 miTeam) {
    if(_hand == 0){
      if ( handL[_user].referer != address(0)) {
      address[] memory network;
      network = allnetwork(network.addAddress(handL[_user].referer));
      miTeam += network.length; 
    }
    }else{
      if ( handR[_user].referer != address(0)) {
        address[] memory network;
        network = allnetwork(network.addAddress(handR[_user].referer));
        miTeam += network.length;
      }
    }
  }

  function allnetwork( address[] memory network ) public view returns ( address[] memory result) {

    for (uint i = 0; i < network.length; i++) {
      address userLeft = handL[network[i]].referer;
      address userRigth = handR[network[i]].referer;
      for (uint u = 0; u < network.length; u++) {
        if (userLeft == network[u]){
          userLeft = address(0);
        }
        if (userRigth == network[u]){
          userRigth = address(0);
        }
      }
      if( userLeft != address(0) ){
        result = network.addAddress(userLeft);
      }
      if( userRigth != address(0) ){
        result = network.addAddress(userRigth);
      }
    }
  }

  function insertion(address[] memory network, uint256 _hand) public view returns ( address wallett) {
    if(_hand == 0){
      for (uint i = 0; i < network.length; i++) {
        address userLeft = handL[network[i]].referer;
        if( userLeft == address(0) ){
          return  network[i];
        }
        network = network.addAddress(userLeft);
      }
      insertion(network, 0);
    }else{
      for (uint i = 0; i < network.length; i++) {
        address userRigth = handR[network[i]].referer;
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
    uint256 binary;
    uint256 left;
    uint256 rigth;
    uint256[] memory amount;
    uint256[] memory time;
    bool[] memory pasive;
    bool[] memory activo;
    uint256 total;
    (left, rigth, binary) = withdrawableBinary(any_user);
    (amount, time, pasive, activo, total,) = verDepositos(any_user);
    total += binary+investor2.balanceRef+investor2.balanceSal;
    if (total > investor2.amount) {
      total = investor2.amount;
    }
    return total;
  }

  function corteBinarioDo(address any_user, uint256 left, uint256 rigth, uint256 _retirableA, uint256 _retirableB) public  {
    Admin.onlyApi();
    if(investors[any_user].paidAt+timerOut <= block.timestamp){
      if ( left != 0 && rigth != 0 ) {
      if(left < rigth){
        handL[any_user].reclamados += left;
        handR[any_user].reclamados += left;
      }else{
        handL[any_user].reclamados += rigth;
        handR[any_user].reclamados += rigth;
      }
      }
      if(_retirableA > 0)retirableA[any_user] = _retirableA;///whittrable normal
      if(_retirableB > 0)discountDeposits(any_user, _retirableB);///wthitrableBinario
      investors[any_user].paidAt = block.timestamp;
      delete investors[any_user].balanceRef;
      delete investors[any_user].balanceSal;
    }
  }
  function migrate(Investor calldata _inTo, Hand calldata hL, Hand calldata hR, Deposito[] calldata dP, address[] memory dL, address[] memory dR ,address _user, uint256 _userId, bool[] memory _espaciosRango, address _sponsor, uint8 _hand) public  {
    Admin.onlyApi();
    if(!investors[_user].registered || (_user == owner && investors[_user].withdrawn == 0)){
      rangoReclamado[_user] = _espaciosRango;
      idToAddress[_userId] = _user;
      addressToId[_user] = _userId;
      _registro(_user, _sponsor, _hand);
      investors[_user] = _inTo ;
      handL[_user] = hL;
      handR[_user] = hR;
      depositos[_user] = dP;
      directosL[_user] = dL;
      directosR[_user] = dR;


    }
    
  }
  function withdraw() public {
    if (!onOffWitdrawl)revert();
    uint256 _value = retirableA[_msgSender()];
    if( USDT_Contract.balanceOf(address(this)) < _value )revert();
    if( _value < MIN_RETIRO )revert();
    Investor storage usuario = investors[_msgSender()];
    usuario.withdrawn += _value;
    if(_value > MAX_RETIRO){
      GanaMax += _value-MAX_RETIRO;
      _value = MAX_RETIRO;
    }
    if ( activerFee >= 1 ) {
      USDT_Contract.transfer(walletFee, _value.mul(valorFee).div(100));
    }
    USDT_Contract.transfer(_msgSender(), _value.mul(descuento).div(100));
    rewardReferers(_msgSender(), _value, porcientosSalida, true);
    if(_value >= usuario.amount){
      delete usuario.amount;
    }else{
      usuario.amount = usuario.amount.sub(_value);
    }
    delete retirableA[_msgSender()];
    totalRefWitdrawl += _value;
  }

  function asignFreeMembership(address _user, address _sponsor, uint8 _hand ) public {
    Admin.onlyAdmin();
    _registro( _user, _sponsor, _hand);
    
  }

  function asignarPlan(address _user ,uint256 _plan, bool _depago) public { Admin.onlyAdmin();
    _plan = plan * _plan;
    _buyPlan(_user, _plan, _depago);
  }

  function asignarPuntosBinarios(address _user ,uint256 _puntosLeft, uint256 _puntosRigth) public { Admin.onlyLeader();
    require(investors[_user].registered, "UNR");
    if(_puntosLeft > 0){
      handL[_user].extra += _puntosLeft;
    }
    if(_puntosRigth > 0){
      handR[_user].extra += _puntosRigth;
    }
  }

  function setPrecioRegistro(uint256 _precio, uint256[] memory _porcentaje) public { Admin.onlyOwner();
    precioRegistro = _precio;
    porcientoRegistro = _porcentaje;
  }

  function controlWitdrawl(bool _true_false) public { Admin.onlyOwner();
    onOffWitdrawl = _true_false;
  }

  function setPrimeravezPorcientos(uint256 _nivel, uint256 _value) public { Admin.onlyOwner();
    primervez[_nivel] = _value;
  }

  function setPorcientos(uint256 _nivel, uint256 _value) public { Admin.onlyOwner();
    porcientos[_nivel] = _value;
  }

  function setPorcientosSalida(uint256 _nivel, uint256 _value) public { Admin.onlyOwner();
    porcientosSalida[_nivel] = _value;
  }

  function setDescuento(uint256 _descuento) public { Admin.onlyOwner();
    descuento = _descuento;
  }

  function setWalletstransfers(address[] memory _wallets, uint256[] memory _valores) public { Admin.onlyOwner();
    wallet = _wallets;
    valor = _valores;
  }
  function setWalletFee(address _wallet, uint256 _fee , uint256 _activerFee ) public { Admin.onlyOwner();
    walletFee = _wallet;
    valorFee = _fee;
    activerFee = _activerFee;
  }
  function setMIN_RETIRO(uint256 _min) public { Admin.onlyOwner();
    MIN_RETIRO = _min;
  }
  function setPlan(uint256 _value) public { Admin.onlyOwner();
    plan = _value;
  }
  function redimToken() public { Admin.onlyOwner();
    USDT_Contract.transfer(owner, USDT_Contract.balanceOf(address(this)));
  }
  function redimBNB() public { Admin.onlyOwner();
    owner.transfer(address(this).balance);
  }
  fallback() external payable {}
  receive() external payable {}
}