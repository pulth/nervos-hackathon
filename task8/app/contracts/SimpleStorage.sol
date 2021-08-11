pragma solidity >=0.8.0;

contract SimpleStorage {
  string storedData;

  constructor() payable {
    storedData = 'Nervos';
  }

  function set(string memory x) public {
    storedData = x;
  }

  function get() public view returns (string memory) {
    return storedData;
  }
}
