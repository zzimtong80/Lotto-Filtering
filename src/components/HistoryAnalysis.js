import React, { useState, useEffect } from 'react';

function HistoryAnalysis({ data, usedNumbers, excludedNumbers, onClose }) {
  const [matches, setMatches] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const analyze = async () => {
      const rounds = data.filter(d => d.회차 >= 24).map(d => d.회차).sort((a, b) => a - b);
      const totalRounds = rounds.length;
      let processed = 0;

      for (const round of rounds) {
        const pastData = data.filter(d => d.회차 < round).slice(0, 24);
        const allNumbers = pastData.flatMap(d => [d.번호1, d.번호2, d.번호3, d.번호4, d.번호5, d.번호6]);
        const numberCounts = allNumbers.reduce((acc, num) => { acc[num] = (acc[num] || 0) + 1; return acc; }, {});
        const validNumbers = Object.keys(numberCounts).filter(num => numberCounts[num] >= 1 && numberCounts[num] <= 4 && !excludedNumbers.includes(Number(num))).map(Number);

        const winningRow = data.find(d => d.회차 === round);
        const winningNumbers = [winningRow.번호1, winningRow.번호2, winningRow.번호3, winningRow.번호4, winningRow.번호5, winningRow.번호6];
        const predictions = generatePredictions(pastData, validNumbers);
        const match = predictions.find(p => p.slice(0, 6).join(',') === winningNumbers.join(','));
        if (match) setMatches(m => [...m, [round, ...match]]);

        processed++;
        setProgress((processed / totalRounds) * 100);
      }
    };

    analyze();
  }, [data, usedNumbers, excludedNumbers]);

  const generatePredictions = (latestData, validNumbers) => {
    const allNumbers = latestData.flatMap(d => [d.번호1, d.번호2, d.번호3, d.번호4, d.번호5, d.번호6]);
    const numberCounts = allNumbers.reduce((acc, num) => { acc[num] = (acc[num] || 0) + 1; return acc; }, {});
    const predictedCountDist = { 1: 0, 2: 0, 3: 0, 4: 0 };
    validNumbers.forEach(num => { const count = Math.min(4, numberCounts[num] || 0); predictedCountDist[count] = (predictedCountDist[count] || 0) + 1; });
    Object.keys(predictedCountDist).forEach(k => predictedCountDist[k] /= 24);

    const oddEvenHistory = latestData.map(d => [d.번호1, d.번호2, d.번호3, d.번호4, d.번호5, d.번호6].map(n => n % 2));
    const predictedOddEven = oddEvenHistory[0].map((_, i) => {
      const avg = oddEvenHistory.reduce((sum, row) => sum + row[i], 0) / oddEvenHistory.length;
      return avg > 0.5 ? '홀' : '짝';
    });

    const lowHighHistory = latestData.map(d => [d.번호1, d.번호2, d.번호3, d.번호4, d.번호5, d.번호6].map(n => n <= 22 ? 1 : 0));
    const predictedLowCount = Math.round(lowHighHistory.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0) / lowHighHistory.length);

    const getRange = num => num <= 9 ? '단대' : num <= 19 ? '10대' : num <= 29 ? '20대' : num <= 39 ? '30대' : '40대';
    const rangeHistory = latestData.map(d => [d.번호1, d.번호2, d.번호3, d.번호4, d.번호5, d.번호6].map(getRange));
    const predictedRangeDist = {
      단대: rangeHistory.reduce((sum, row) => sum + row.filter(r => r === '단대').length, 0) / rangeHistory.length,
      '10대': rangeHistory.reduce((sum, row) => sum + row.filter(r => r === '10대').length, 0) / rangeHistory.length,
      '20대': rangeHistory.reduce((sum, row) => sum + row.filter(r => r === '20대').length, 0) / rangeHistory.length,
      '30대': rangeHistory.reduce((sum, row) => sum + row.filter(r => r === '30대').length, 0) / rangeHistory.length,
      '40대': rangeHistory.reduce((sum, row) => sum + row.filter(r => r === '40대').length, 0) / rangeHistory.length,
    };

    const calculateMatch = numbers => {
      const oddCount = numbers.filter(n => n % 2 !== 0).length;
      const oddEvenMatch = numbers.reduce((sum, n, i) => sum + ((n % 2 ? '홀' : '짝') === predictedOddEven[i] ? 1 : 0), 0) / 6;
      const lowCount = numbers.filter(n => n <= 22).length;
      const lowHighMatch = Math.abs(lowCount - predictedLowCount) <= 1 ? 1 : 0;
      const combCounts = numbers.reduce((acc, num) => { acc[Math.min(4, numberCounts[num] || 0)] = (acc[Math.min(4, numberCounts[num] || 0)] || 0) + 1; return acc; }, {});
      const countMatch = Object.keys(predictedCountDist).reduce((sum, i) => sum + (Math.abs((combCounts[i] || 0) - predictedCountDist[i] * 6) <= 1 ? 1 : 0), 0) / 4;
      const actualRangeDist = numbers.reduce((acc, num) => { const r = getRange(num); acc[r] = (acc[r] || 0) + 1; return acc; }, { 단대: 0, '10대': 0, '20대': 0, '30대': 0, '40대': 0 });
      const rangeMatch = Object.keys(predictedRangeDist).reduce((sum, r) => sum + (Math.abs(actualRangeDist[r] - predictedRangeDist[r]) <= 1 ? 1 : 0), 0) / 5;
      const match = (oddEvenMatch * 0.25 + lowHighMatch * 0.25 + countMatch * 0.25 + rangeMatch * 0.25) * 100;
      return [match, `${oddCount} : ${6 - oddCount}`, `${lowCount} : ${6 - lowCount}`];
    };

    const predictions = [];
    const seen = new Set();
    for (let i = 0; i < 1000 && predictions.length < 100; i++) {
      const comb = validNumbers.sort(() => 0.5 - Math.random()).slice(0, 6).sort((a, b) => a - b);
      const combStr = comb.join(',');
      if (seen.has(combStr)) continue;
      const totalSum = comb.reduce((a, b) => a + b, 0);
      if (totalSum < 80 || totalSum > 170) continue;
      const consecutive = comb.reduce((count, n, i) => i > 0 && n - comb[i - 1] === 1 ? count + 1 : count, 0);
      if (consecutive > 1) continue;
      const gaps = comb.slice(1).map((n, i) => n - comb[i]);
      const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      if (avgGap < 5 || avgGap > 8) continue;
      const [match, oddEven, lowHigh] = calculateMatch(comb);
      if (match < 30) continue;
      seen.add(combStr);
      predictions.push([...comb, totalSum, oddEven, lowHigh, `${match.toFixed(2)}%`]);
    }
    return predictions;
  };

  return (
    <div className="overlay" style={{ position: 'fixed', top: '10%', left: '10%', width: '80%', height: '80%', background: '#fff', zIndex: 1000 }}>
      <button onClick={onClose}>닫기</button>
      <h3>역대 기록 분석</h3>
      <progress value={progress} max="100"></progress>
      <p>진행률: {progress.toFixed(2)}%</p>
      <table>
        <thead>
          <tr>
            <th>회차</th><th>번호1</th><th>번호2</th><th>번호3</th><th>번호4</th><th>번호5</th><th>번호6</th>
            <th>총합</th><th>홀짝 비율</th><th>저고 비율</th><th>연속 번호</th><th>패턴 일치도</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((row, idx) => (
            <tr key={idx}>
              <td>{row[0]}</td>
              {row.slice(1, 7).map((n, i) => <td key={i}>{n}</td>)}
              <td>{row[7]}</td><td>{row[8]}</td><td>{row[9]}</td>
              <td>{row.slice(1, 7).reduce((count, n, i) => i > 0 && n - row[i] === 1 ? count + 1 : count, 0)}</td>
              <td>{row[10]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HistoryAnalysis;
