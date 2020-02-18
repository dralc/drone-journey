# drone-journey

## Background
Inspired by the NASA Ames research paper [Air Traffic Management Blockchain Infrastructure for Security, Authentication, and Privacy](https://ntrs.nasa.gov/archive/nasa/casi.ntrs.nasa.gov/20190000022.pdf)


## Todo
- look to implement best practice optional Contract interface:
    - unknownTransaction(ctx)
    - Add any functions that are suitable for each transaction in the Context object [createContext()](https://hyperledger.github.io/fabric-chaincode-node/release-1.4/api/fabric-contract-api.Contract.html#createContext__anchor) , [extending the transaction context](https://hyperledger.github.io/fabric-chaincode-node/release-1.4/api/tutorial-using-contractinterface.html)