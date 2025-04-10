import React from 'react';

function DuplicateTable({ latestData, type }) {
  const getRange = num => num <= 9 ? '단대' : num <= 19 ? '10대' : num <= 29 ? '20대' : num <= 39 ? '30대' : '40대';

  const data = latestData.slice(0, 20).map(row => {
    const numbers = [row.번호1, row.번호2, row.번호3, row.번호4, row.번호5, row.번호6];
    if (type === 'duplicate') {
      const pastData = latestData.filter(d => d.회차 < row.회차).slice(0, 24);
      const counts = pastData.flatMap(d => [d.번호1, d.번호2, d.번호3, d.번호4, d.번호5, d.번호6]).reduce((acc, n) => { acc[n] = (acc[n] || 0) + 1; return acc; }, {});
      return [row.회차, ...numbers.map(n => `${n}(${counts[n] || 0})`), `${numbers.filter(n => n <= 22).length} : ${6 - numbers.filter(n => n <= 22).length}`];
    } else if (type === 'oddEven') {
      const oddEven = numbers.map(n => n % 2 ? '홀' : '짝');
      return [row.회차, ...oddEven, `${oddEven.filter(o => o === '홀').length} : ${6 - oddEven.filter(o => o === '홀').length}`];
    } else if (type === 'range') {
      return [row.회차, ...numbers.map(getRange)];
    }
    return [];
  });

  const headers = type === 'duplicate'
    ? ["회차", "번호1(출현횟수)", "번호2(출현횟수)", "번호3(출현횟수)", "번호4(출현횟수)", "번호5(출현횟수)", "번호6(출현횟수)", "저고 비율"]
    : type === 'oddEven'
    ? ["회차", "번호1", "번호2", "번호3", "번호4", "번호5", "번호6", "홀짝 비율"]
    : ["회차", "번호1(범위)", "번호2(범위)", "번호3(범위)", "번호4(범위)", "번호5(범위)", "번호6(범위)"];

  return (
    <div>
      <h3>{type === 'duplicate' ? '📌 최근 20회차 중복 출현 횟수' : type === 'oddEven' ? '📌 홀짝 비율' : '📌 숫자 범위 변환'}</h3>
      <table>
        <thead>
          <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>{row.map((cell, i) => <td key={i}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DuplicateTable;
