# Application Name
### Vote-Chain v1.0.0
<br/>

# Description
### A decentralized web3 voting platform designed to enhance transparency and prevent vote manipulation. It ensures only registered voters can participate, guaranteeing a secure and tamper-proof election process.
<br/>

# Getting Started

### You must have a Metamask wallet. Download [here](https://metamask.io/).
<br/>

## To install dependencies

```
npm install
```
<br/>

## To compile the contract
```
npx hardhat compile
```
### After compiling, you need to copy both json files from
```
artifacts/contracts/<fileName>.sol/<fileName>.json
```
### to 
```
src/ABIs/<fileName>.json
```
### This need to be done everytime if the contract is changed and compiled in order to get the correct ABIs which we will be using to get the contract.
<br/>

## To Start the server locally

```
npx hardhat node
```
<br/>

## To deploy the contract

```
npx hardhat run scripts/deploy.js --network <localhost|sepolia>
```
### After deploying, you will see 2 contract addresses on the log.<br/>
### 1 for the token smart contract address and 1 for the party smart contract address.<br/>
### Copy the contract addresses and go to 
```
src/utils/contractUtilities.js
```
and then replace `TOKEN_CONTRACT_ADDRESS` with the _token smart contract address_ and `VOTE_CONTRACT_ADDRESS` with _party smart contract address_. 
<br/>
<br/>

## To run the webapp

```
npm start
```
<br/>

### Have fun voting!