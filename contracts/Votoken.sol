//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Votoken is ERC20 {
    address public owner;
    mapping(address => bool) public hasMinted;
    uint constant _one_token = 1 * (10**18);

    constructor() ERC20("Votoken", "VTK") {
        owner = msg.sender;
    }

    function mint() public {
        require(!hasMinted[msg.sender], "This user has already got the token");
        _mint(msg.sender, _one_token);
        hasMinted[msg.sender] = true;
    }

    // Override transfer function to prevent transfers
    function transfer(address recipient, uint256 amount) public pure override returns (bool) {
        require(false, "This token cannot be transferred");
        return false;
    }

    // Override transferFrom function to prevent transfers
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public pure override returns (bool) {
        require(false, "This token cannot be transferred");
        return false;
    }

    // Override approve function to prevent allowance approvals
    function approve(address spender, uint256 amount) public pure override returns (bool) {
        require(false, "Approval is not allowed for this token");
        return false;
    }
}