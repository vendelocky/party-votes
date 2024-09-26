// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ITokenContract {
    function balanceOf(address account) external view returns (uint256);
    function totalSupply() external view returns (uint256);
}

contract PartyVote is Ownable {
    ITokenContract public token;
    struct Party {
        string name;
        uint count;
    }
    Party[] public parties;
    struct Votes {
        Party party;
        bool hasVoted;
        uint time;
    }
    mapping(address=>Votes) public votes;
    uint public totalVoteUsed;

    constructor(string memory name, address tokenAddress) Ownable(msg.sender) {
        token = ITokenContract(tokenAddress); // insert token contract address here
        parties.push(Party(name, 0));
    }

    function addParty(string memory name) public onlyOwner {
        Party memory party = Party(name, 0);
        parties.push(party);
    }

    function getParties() public view returns (Party[] memory) {
        return parties;
    }

    function vote(string memory name) public {
        require(token.balanceOf(msg.sender) >= 1, "You don't have the token to vote!");
        require(!votes[msg.sender].hasVoted, "You have already voted");

        for (uint i = 0; i < parties.length; i++) {
            if (keccak256(bytes(parties[i].name)) == keccak256(bytes(name))) {
                parties[i].count += 1;
                votes[msg.sender] = Votes({
                    party: parties[i],
                    hasVoted: true, 
                    time: block.timestamp
                });
                totalVoteUsed ++;
                return;
            }
        }
        revert("Party not found");
    }

    function getVotes(address voter) public view returns (Votes memory) {
        return votes[voter];
    }
}
