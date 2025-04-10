import React from 'react';
import './HistoryResults.css'; // 스타일 파일 (필요 시 생성)

const HistoryResults = ({ results, onClose }) => {
  if (!results || results.length === 0) {
    return (
      <div className="history-results">
        <p>결과가 없습니다.</p>
        <button onClick={onClose}>닫기</button>
      </div>
    );
  }

  return (
    <div className="history-results">
      <h3>역대 결과</h3>
      <table>
        <thead>
          <tr>
            <th>번호</th>
            <th>회차</th>
            <th>당첨 번호</th>
            <th>AC값</th>
            <th>홀:짝 비율</th>
            <th>저:고 비율</th>
            <th>총합</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr key={result.round}>
              <td>{index + 1}</td> {/* 번호 열: 1부터 시작 */}
              <td>{result.round}</td>
              <td>{result.winningNumbers.join(', ')}</td>
              <td>{result.acValue}</td>
              <td>{result.oddEvenRatio}</td>
              <td>{result.lowHighRatio}</td>
              <td>{result.totalSum}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>총 결과 개수: {results.length}</p> {/* 총 개수 표시 */}
      <button onClick={onClose}>닫기</button>
    </div>
  );
};

export default HistoryResults;