import React, { useState } from 'react';

function RecommendedNumbers({ predictions, onClose }) {
  const [displayed, setDisplayed] = useState(predictions.slice(0, 5));

  const addFive = () => {
    const available = predictions.filter(p => !displayed.some(d => d.slice(0, 6).join(',') === p.slice(0, 6).join(',')));
    setDisplayed([...displayed, ...available.slice(0, 5)]);
  };

  const removeFive = () => {
    setDisplayed(displayed.length > 5 ? displayed.slice(0, -5) : []);
  };

  const calculateAC = numbers => {
    const diffs = numbers.flatMap((a, i) => numbers.slice(i + 1).map(b => Math.abs(a - b)));
    return new Set(diffs).size - 5;
  };

  return (
    <div className="overlay" style={{ position: 'fixed', top: '10%', left: '10%', width: '80%', height: '80%', background: '#fff', zIndex: 1000 }}>
      <button onClick={onClose}>닫기</button>
      <h3>추천 번호 조합</h3>
      <button onClick={addFive}>+5</button>
      <button onClick={removeFive}>-5</button>
      <table>
        <thead>
          <tr>
            <th>번호1</th><th>번호2</th><th>번호3</th><th>번호4</th><th>번호5</th><th>번호6</th>
            <th>총합</th><th>홀짝 비율</th><th>저고 비율</th><th>AC값</th><th>패턴 일치도</th>
          </tr>
        </thead>
        <tbody>
          {displayed.map((row, idx) => (
            <tr key={idx}>
              {row.slice(0, 6).map((n, i) => <td key={i}>{n}</td>)}
              <td>{row[6]}</td><td>{row[7]}</td><td>{row[8]}</td><td>{calculateAC(row.slice(0, 6))}</td><td>{row[9]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecommendedNumbers;
