## 1. A screenshot of the console output immediately after you have successfully issued a smart contract call.
![](./contract_call.png)
## 2. The transaction hash from the console output (in text format).
0xc736920d23dfa2226abdfeea0431b05c32dbfe6146752fac763e0b37ac918342
## 3. The contract address that you called (in text format).
0x5B45A23B6b8394c1dA3d098b8706F4e4875682Fe
## 4. The ABI for contract you made a call on (in text format).
```json
[
    {
      "inputs": [],
      "stateMutability": "payable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "x",
          "type": "uint256"
        }
      ],
      "name": "set",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "get",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
]
```
