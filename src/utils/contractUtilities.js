import { ethers } from 'ethers';
import votokenABI from '../ABIs/Votoken.json';
import partyVoteABI from '../ABIs/PartyVote.json';

export const TOKEN_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // FILL IN TOKEN CONTRACT ADDRESS HERE
export const VOTE_CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'; // FILL IN PARTY VOTE CONTRACT ADDRESS HERE

const getContract = async (contractAdress, abi) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAdress, abi, signer);
    return contract;
};

const addTokenToMetaMask = async () => {
    try {
        const wasAdded = await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                address: TOKEN_CONTRACT_ADDRESS,
                symbol: 'VTK',
                decimals: 18,
                },
            },
        });
        wasAdded ? console.log('Token added to MetaMask') : console.log('Token not added');
    } catch (error) {
        console.error('Error adding token:', error);
    }
};

const getUsedToken = async () => {
    const voteContract = await getContract(VOTE_CONTRACT_ADDRESS, partyVoteABI.abi);
    const used = await voteContract.totalVoteUsed();
    const count = Number(used);
    return count;
};

export const mintToken = async () => {
    const tokenContract = await getContract(TOKEN_CONTRACT_ADDRESS, votokenABI.abi);
    try{
        const tx = await tokenContract.mint();
        console.log('Mint transaction:', tx);
        await tx.wait();
        console.log('Minting completed!');
        await addTokenToMetaMask();
    } catch (error) {
        if (error.reason && error.reason.includes('This user has already got the token')) {
            console.log('user already got the token');
        } else {
            alert('token minting fail! please relogin again!');
        }
    }
};

export const getTokenMinted = async () => {
    try {
        const tokenContract = await getContract(TOKEN_CONTRACT_ADDRESS, votokenABI.abi);
        const mintedToken = await tokenContract?.totalSupply();
        const supply = displayBigInt(mintedToken);
        const usedVote = await getUsedToken();
        const remaining = supply - usedVote;
        
        return {
            minted: supply,
            used: usedVote,
            remain: remaining
        };
    } catch (e) {
        console.log(e);
    }
    return {
        minted: '0',
        used: '0',
        remain: '0'
    };
};

export const addParty = async (name) => {
    const voteContract = await getContract(VOTE_CONTRACT_ADDRESS, partyVoteABI.abi);
    try {
        const tx = await voteContract.addParty(name);
        console.log('add party transaction:', tx);
        await tx.wait();
        alert(`successfully added ${name} to the party!`);
    } catch (e) {
        alert('adding party rejected!');
    }
};

export const getParties = async () => {
    const voteContract = await getContract(VOTE_CONTRACT_ADDRESS, partyVoteABI.abi);
    const parties = await voteContract.getParties();
    return parties ?? [];
};

export const callVote = async (name) => {
    const voteContract = await getContract(VOTE_CONTRACT_ADDRESS, partyVoteABI.abi);
    try {
        const tx = await voteContract.vote(name);
        console.log('voting transaction:', tx);
        await tx.wait();
        alert(`You have voted for ${name}!`);
    } catch (error) {
        if (error.reason && error.reason.includes(`You don't have the token to vote!`)) {
            alert(`You don't have the token! you're not eligible to vote.`);
        } else if (error.reason && error.reason.includes('You have already voted')) {
            alert('You have already voted!');
        } else {
            alert(`Voting failed! Please try again!`);
        }
    }
};

export const getVotes = async (voter) => {
    const voteContract = await getContract(VOTE_CONTRACT_ADDRESS, partyVoteABI.abi);
    try{
        const votes = await voteContract.getVotes(voter);
        return votes ?? null;
    } catch(error) {
        alert("Address not found! Please enter a valid address");
    }
};

export const displayBigInt = (count) => {
    const supply = ethers.formatUnits(count?.toString(), 18);
    return Math.round(Number(supply));
};

export const checkOwner = async (address) => {
    const voteContract = await getContract(VOTE_CONTRACT_ADDRESS, partyVoteABI.abi);
    const owner = await voteContract.owner();
    return ethers.getAddress(owner) === ethers.getAddress(address);
}
