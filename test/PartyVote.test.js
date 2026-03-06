const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PartyVote", function () {
  let votoken, partyVote;
  let owner, voter1, voter2, noTokenUser;

  beforeEach(async function () {
    [owner, voter1, voter2, noTokenUser] = await ethers.getSigners();

    // Deploy Votoken
    const Votoken = await ethers.getContractFactory("Votoken");
    votoken = await Votoken.deploy();

    // Deploy PartyVote with initial party "Democrats"
    const PartyVote = await ethers.getContractFactory("PartyVote");
    partyVote = await PartyVote.deploy("Democrats", await votoken.getAddress());

    // Mint tokens for voters
    await votoken.connect(voter1).mint();
    await votoken.connect(voter2).mint();
    // noTokenUser does NOT mint
  });

  describe("Deployment", function () {
    it("should set the deployer as owner", async function () {
      expect(await partyVote.owner()).to.equal(owner.address);
    });

    it("should initialise with the first party passed to constructor", async function () {
      const parties = await partyVote.getParties();
      expect(parties.length).to.equal(1);
      expect(parties[0].name).to.equal("Democrats");
      expect(parties[0].count).to.equal(0);
    });

    it("should start with zero totalVoteUsed", async function () {
      expect(await partyVote.totalVoteUsed()).to.equal(0);
    });
  });

  describe("addParty()", function () {
    it("should allow owner to add a new party", async function () {
      await partyVote.connect(owner).addParty("Republicans");
      const parties = await partyVote.getParties();
      expect(parties.length).to.equal(2);
      expect(parties[1].name).to.equal("Republicans");
      expect(parties[1].count).to.equal(0);
    });

    it("should revert when non-owner calls addParty", async function () {
      await expect(
        partyVote.connect(voter1).addParty("Republicans")
      ).to.be.revertedWithCustomError(partyVote, "OwnableUnauthorizedAccount");
    });
  });

  describe("getParties()", function () {
    it("should return all parties", async function () {
      await partyVote.connect(owner).addParty("Republicans");
      await partyVote.connect(owner).addParty("Greens");
      const parties = await partyVote.getParties();
      expect(parties.length).to.equal(3);
      expect(parties[0].name).to.equal("Democrats");
      expect(parties[1].name).to.equal("Republicans");
      expect(parties[2].name).to.equal("Greens");
    });
  });

  describe("vote()", function () {
    it("should allow a token holder to vote for an existing party", async function () {
      await partyVote.connect(voter1).vote("Democrats");
      const parties = await partyVote.getParties();
      expect(parties[0].count).to.equal(1);
    });

    it("should increment totalVoteUsed after a vote", async function () {
      await partyVote.connect(voter1).vote("Democrats");
      expect(await partyVote.totalVoteUsed()).to.equal(1);
    });

    it("should record the vote details for the voter", async function () {
      await partyVote.connect(voter1).vote("Democrats");
      const record = await partyVote.getVotes(voter1.address);
      expect(record.hasVoted).to.equal(true);
      expect(record.party.name).to.equal("Democrats");
      expect(record.time).to.be.gt(0);
    });

    it("should tally votes for different parties independently", async function () {
      await partyVote.connect(owner).addParty("Republicans");
      await partyVote.connect(voter1).vote("Democrats");
      await partyVote.connect(voter2).vote("Republicans");

      const parties = await partyVote.getParties();
      expect(parties[0].count).to.equal(1); // Democrats
      expect(parties[1].count).to.equal(1); // Republicans
      expect(await partyVote.totalVoteUsed()).to.equal(2);
    });

    it("should revert with vote__noToken() when caller has no tokens", async function () {
      await expect(
        partyVote.connect(noTokenUser).vote("Democrats")
      ).to.be.revertedWithCustomError(partyVote, "vote__noToken");
    });

    it("should revert with vote__doneVoting() on a second vote from the same address", async function () {
      await partyVote.connect(voter1).vote("Democrats");
      await expect(
        partyVote.connect(voter1).vote("Democrats")
      ).to.be.revertedWithCustomError(partyVote, "vote__doneVoting");
    });

    it("should revert with vote__noParty() when party name does not exist", async function () {
      await expect(
        partyVote.connect(voter1).vote("Libertarians")
      ).to.be.revertedWithCustomError(partyVote, "vote__noParty");
    });
  });

  describe("getVotes()", function () {
    it("should return hasVoted=false for an address that has not voted", async function () {
      const record = await partyVote.getVotes(voter1.address);
      expect(record.hasVoted).to.equal(false);
    });

    it("should return the correct party and timestamp after voting", async function () {
      const txReceipt = await (await partyVote.connect(voter1).vote("Democrats")).wait();
      const block = await ethers.provider.getBlock(txReceipt.blockNumber);

      const record = await partyVote.getVotes(voter1.address);
      expect(record.party.name).to.equal("Democrats");
      expect(record.time).to.equal(block.timestamp);
    });
  });
});
