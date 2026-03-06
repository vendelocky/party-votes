import React from 'react';
import dayjs from 'dayjs';

const VoteCard = ({account, voter}) => {
    const blockTimeStamp = () => {
      const timestampInSeconds = Number(voter?.[2]);
      const date = new Date(timestampInSeconds * 1000);
      const formattedDate = dayjs(date).format('DD MMM YYYY, HH:mm:ss');
      return formattedDate;
    }

    const hasVoted = voter?.[0]?.[0] && voter[0][0] !== '';

    return (
        <div className="token-container">
          <div className="token-div">
            <div className="token-section-title">Voter Record</div>
            <div className="token-stat-row">
              <span>Address</span>
              <span className="address" style={{ textAlign: 'right', maxWidth: '280px' }}>{account}</span>
            </div>
            <div className="token-stat-row">
              <span>Voted for</span>
              <span className="token-stat-value" style={{ color: hasVoted ? '#a89fff' : '#475569' }}>
                {hasVoted ? voter[0][0] : '--'}
              </span>
            </div>
            <div className="token-stat-row">
              <span>Voted on</span>
              <span className="token-stat-value" style={{ fontSize: '0.9rem', color: voter?.[2] ? '#94a3b8' : '#475569' }}>
                {voter?.[2] ? blockTimeStamp() : '--'}
              </span>
            </div>
          </div>
        </div>
    );
}

export default VoteCard;
