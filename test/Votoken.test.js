const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Votoken", function () {
  let votoken;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Votoken = await ethers.getContractFactory("Votoken");
    votoken = await Votoken.deploy();
  });

  describe("Deployment", function () {
    it("should have the correct name and symbol", async function () {
      expect(await votoken.name()).to.equal("Votoken");
      expect(await votoken.symbol()).to.equal("VTK");
    });

    it("should start with zero total supply", async function () {
      expect(await votoken.totalSupply()).to.equal(0);
    });
  });

  describe("mint()", function () {
    it("should mint exactly 1 token (1e18) to caller", async function () {
      await votoken.connect(addr1).mint();
      const balance = await votoken.balanceOf(addr1.address);
      expect(balance).to.equal(ethers.parseEther("1"));
    });

    it("should increase total supply by 1 token after mint", async function () {
      await votoken.connect(addr1).mint();
      expect(await votoken.totalSupply()).to.equal(ethers.parseEther("1"));
    });

    it("should allow different addresses to each mint once", async function () {
      await votoken.connect(addr1).mint();
      await votoken.connect(addr2).mint();
      expect(await votoken.balanceOf(addr1.address)).to.equal(ethers.parseEther("1"));
      expect(await votoken.balanceOf(addr2.address)).to.equal(ethers.parseEther("1"));
      expect(await votoken.totalSupply()).to.equal(ethers.parseEther("2"));
    });

    it("should revert with mint__gotToken() on second mint from same address", async function () {
      await votoken.connect(addr1).mint();
      await expect(votoken.connect(addr1).mint()).to.be.revertedWithCustomError(
        votoken,
        "mint__gotToken"
      );
    });
  });

  describe("transfer() — blocked", function () {
    it("should revert transfer with 'This token cannot be transferred'", async function () {
      await votoken.connect(addr1).mint();
      await expect(
        votoken.connect(addr1).transfer(addr2.address, ethers.parseEther("1"))
      ).to.be.revertedWith("This token cannot be transferred");
    });
  });

  describe("transferFrom() — blocked", function () {
    it("should revert transferFrom with 'This token cannot be transferred'", async function () {
      await votoken.connect(addr1).mint();
      await expect(
        votoken.connect(owner).transferFrom(addr1.address, addr2.address, ethers.parseEther("1"))
      ).to.be.revertedWith("This token cannot be transferred");
    });
  });

  describe("approve() — blocked", function () {
    it("should revert approve with 'Approval is not allowed for this token'", async function () {
      await expect(
        votoken.connect(addr1).approve(addr2.address, ethers.parseEther("1"))
      ).to.be.revertedWith("Approval is not allowed for this token");
    });
  });
});
