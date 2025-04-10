import React from 'react';

function RoundSelector({ data, selectedRound, setSelectedRound }) {
  const rounds = [...new Set(data.map(d => d.회차))].sort((a, b) => b - a);
  const latestRound = rounds[0] || 0;
  const winningNumbers = selectedRound <= latestRound
    ? data.find(d => d.회차 === selectedRound)
    : null;

  return (
    <div className="round-selector">
      <label>🔄 회차 선택: </label>
      <select value={selectedRound} onChange={(e) => setSelectedRound(Number(e.target.value))}>
        <option value={latestRound + 1}>{latestRound + 1} (예측)</option>
        {rounds.map(round => (
          <option key={round} value={round}>{round}</option>
        ))}
      </select>
      <span>
        1등 당첨 번호: {winningNumbers
          ? `${[winningNumbers.번호1, winningNumbers.번호2, winningNumbers.번호3, winningNumbers.번호4, winningNumbers.번호5, winningNumbers.번호6].join(', ')} + ${winningNumbers.보너스}`
          : '-'}
      </span>
    </div>
  );
}

export default RoundSelector;
