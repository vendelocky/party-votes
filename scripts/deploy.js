const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
  
    // deploying token contract
    const Token = await ethers.getContractFactory("Votoken");
    const token = await Token.deploy();
    await token.waitForDeployment();
    const tokenContractAddress = await token.getAddress();
    console.log("Token address:", tokenContractAddress);
    // TODO: find another way to store contract address
    // localStorage.setItem('tokenContractAddress', tokenContractAddress);

    // deploying voting contract
    const Party = await ethers.getContractFactory("PartyVote");
    const party = await Party.deploy("Democrats", tokenContractAddress);
    await party.waitForDeployment();
    const partyContractAddress = await party.getAddress();
    console.log("Party address:", partyContractAddress);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
  });
  