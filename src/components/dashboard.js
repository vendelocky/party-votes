import React, { useContext, useEffect, useState } from 'react';
import '../styles/dashboard.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Modal, Button } from 'react-bootstrap';
import { AccountContext } from '../Provider';
import { getTokenMinted, getParties, callVote } from '../utils/contractUtilities';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PARTY_PALETTE = [
  '#7c6fff', '#22d3ee', '#10b981', '#f59e0b',
  '#ec4899', '#ef4444', '#8b5cf6', '#06b6d4',
  '#a3e635', '#fb923c',
];

const getPartyColor = (index) => PARTY_PALETTE[index % PARTY_PALETTE.length];

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: {
        color: '#94a3b8',
        font: { size: 13, weight: '500', family: 'Inter, sans-serif' },
      },
    },
    y: {
      grid: {
        color: 'rgba(255,255,255,0.06)',
        drawBorder: false,
      },
      border: { display: false, dash: [4, 4] },
      ticks: {
        color: '#64748b',
        stepSize: 1,
        font: { size: 12, family: 'Inter, sans-serif' },
      },
      beginAtZero: true,
    },
  },
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: 'Vote Distribution',
      color: '#e2e8f0',
      font: { size: 17, weight: '700', family: 'Inter, sans-serif' },
      padding: { bottom: 24 },
    },
    tooltip: {
      backgroundColor: 'rgba(13,14,20,0.95)',
      titleColor: '#e2e8f0',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(124,111,255,0.4)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 10,
      callbacks: {
        label: (ctx) => `  ${ctx.parsed.y} vote${ctx.parsed.y !== 1 ? 's' : ''}`,
      },
    },
  },
  borderRadius: 10,
  borderSkipped: false,
  barThickness: 52,
  animation: { duration: 700, easing: 'easeOutQuart' },
};

const Dashboard = () => {
  const { account, isConnected } = useContext(AccountContext);
  const [tokenSupply, setTokenSupply] = useState({ minted: '0', used: '0', remain: '0' });
  const [partyList, setPartyList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showParty, setShowParty] = useState(true);
  const [partyName, setPartyName] = useState('');
  const [isVoting, setIsVoting] = useState(false);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const fetchTotalSupply = async () => {
    const supply = await getTokenMinted();
    setTokenSupply(supply);
  };

  const fetchParty = async () => {
    const parties = await getParties();
    const partiesWithColor = parties?.map((party, index) => ({
      name: party[0],
      count: Number(party[1]),
      color: getPartyColor(index),
    }));
    setShowParty(partiesWithColor?.length > 0 ? true : false);
    setPartyList(partiesWithColor);
  };

  const initialise = () => {
    fetchParty();
    fetchTotalSupply();
  };

  useEffect(() => {
    isConnected && initialise();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  const handleOnClick = (name) => {
    handleShow();
    setPartyName(name);
  };

  const handleVote = async () => {
    setIsVoting(true);
    await callVote(partyName);
    setIsVoting(false);
    handleClose();
    initialise();
  };

  const displayCard = () => {
    return partyList?.map((party) => (
      <div key={party.name} className="party-card" style={{ borderLeftColor: party.color }}>
        <div className="card-title" style={{ color: party.color }}>{party.name}</div>
        <div className="card-description">
          <div>
            <div className="card-vote-count">{party.count}</div>
            <div className="card-vote-label">votes</div>
          </div>
          {!!account && (
            <Button variant="success" id="vote" size="sm" onClick={() => handleOnClick(party.name)}>
              Vote
            </Button>
          )}
        </div>
      </div>
    ));
  };

  const data = {
    labels: partyList?.map(p => p.name),
    datasets: [{
      label: 'Votes',
      data: partyList?.map(p => p.count),
      backgroundColor: partyList?.map(p => `${p.color}bb`),
      borderColor: partyList?.map(p => p.color),
      borderWidth: 2,
      borderRadius: 10,
      borderSkipped: false,
    }],
  };

  return (
    <div>
      <h1>Vote for your party</h1>

      {showParty ? (
        <>
          <div className="party-card-div">
            {displayCard()}
          </div>
          <div className="vote-bar-div">
            <Bar data={data} options={CHART_OPTIONS} />
          </div>
        </>
      ) : (
        <div className="no-party">
          <h4>
            If you are seeing this message instead of the party list and the distribution,<br />
            please make sure you have a Metamask wallet on your browser.<br />
            Connect your wallet to this page and accept the permission request.<br /><br />
            Refresh the page for the permission re-request in case that you have rejected it previously.
          </h4>
        </div>
      )}

      <div className="token-container">
        <div className="token-div">
          <div className="token-section-title">Token Stats</div>
          <div className="token-stat-row">
            <span>Total Minted</span>
            <span className="token-stat-value">{tokenSupply.minted}</span>
          </div>
          <div className="token-stat-row">
            <span>Used (voted)</span>
            <span className="token-stat-value">{tokenSupply.used}</span>
          </div>
          <div className="token-stat-row">
            <span>Unused (no vote)</span>
            <span className="token-stat-value">{tokenSupply.remain}</span>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Vote for {partyName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to vote for <strong style={{ color: '#a89fff' }}>{partyName}</strong> party?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleVote} disabled={isVoting}>
            {isVoting ? 'Submitting...' : 'Confirm Vote'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Dashboard;
