import React, { useState, useEffect } from 'react';
import Filters from './Filters';

function PredictionTable({
  predictions,
  currentPage,
  setCurrentPage,
  includeRank,
  onClose,
  showFilters,
  sortPredictions,
  usedNumbers,
  setUsedNumbers,
  excludedNumbers,
  setExcludedNumbers,
  latestData,
}) {
  const [filteredPredictions, setFilteredPredictions] = useState(predictions);
  const [recommendedCombinations, setRecommendedCombinations] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [pageInput, setPageInput] = useState(''); // 페이지 입력값 상태 추가
  const itemsPerPage = 10;

  useEffect(() => {
    if (!isFiltered) {
      setFilteredPredictions(predictions);
    }
  }, [predictions, isFiltered]);

  const handleRecommend = () => {
    const source = filteredPredictions.length > 0 ? filteredPredictions : predictions;
    if (source.length === 0) return;

    const shuffled = [...source];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const selected = shuffled.slice(0, Math.min(10, shuffled.length));
    setRecommendedCombinations(selected);
    setCurrentPage(0);
  };

  const handleReset = () => {
    setFilteredPredictions(predictions);
    setRecommendedCombinations([]);
    setIsFiltered(false);
    setCurrentPage(0);
  };

  const handleSort = (criteria, ascending) => {
    sortPredictions(criteria, ascending);
    if (recommendedCombinations.length > 0) {
      const sortedRecommended = [...recommendedCombinations];
      switch (criteria) {
        case 'combination':
          sortedRecommended.sort((a, b) => {
            for (let i = 0; i < 6; i++) {
              if (a[i] !== b[i]) return ascending ? a[i] - b[i] : b[i] - a[i];
            }
            return 0;
          });
          break;
        case 'totalSum':
          sortedRecommended.sort((a, b) => ascending ? a[6] - b[6] : b[6] - a[6]);
          break;
        case 'matchPercentage':
          sortedRecommended.sort((a, b) => {
            const aMatch = parseFloat(a[9]);
            const bMatch = parseFloat(b[9]);
            return ascending ? aMatch - bMatch : bMatch - aMatch;
          });
          break;
        case 'random':
          for (let i = sortedRecommended.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sortedRecommended[i], sortedRecommended[j]] = [sortedRecommended[j], sortedRecommended[i]];
          }
          break;
        default:
          break;
      }
      setRecommendedCombinations(sortedRecommended);
    } else if (isFiltered) {
      const sortedFiltered = [...filteredPredictions];
      switch (criteria) {
        case 'combination':
          sortedFiltered.sort((a, b) => {
            for (let i = 0; i < 6; i++) {
              if (a[i] !== b[i]) return ascending ? a[i] - b[i] : b[i] - a[i];
            }
            return 0;
          });
          break;
        case 'totalSum':
          sortedFiltered.sort((a, b) => ascending ? a[6] - b[6] : b[6] - a[6]);
          break;
        case 'matchPercentage':
          sortedFiltered.sort((a, b) => {
            const aMatch = parseFloat(a[9]);
            const bMatch = parseFloat(b[9]);
            return ascending ? aMatch - bMatch : bMatch - aMatch;
          });
          break;
        case 'random':
          for (let i = sortedFiltered.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sortedFiltered[i], sortedFiltered[j]] = [sortedFiltered[j], sortedFiltered[i]];
          }
          break;
        default:
          break;
      }
      setFilteredPredictions(sortedFiltered);
    }
    setCurrentPage(0);
  };

  const displayedPredictions = recommendedCombinations.length > 0 ? recommendedCombinations : filteredPredictions;
  const totalItems = displayedPredictions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const currentItems = displayedPredictions.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageInput = (e) => {
    if (e.key === 'Enter') {
      const pageNum = parseInt(pageInput) - 1; // 사용자 입력은 1부터 시작, 내부는 0부터
      if (!isNaN(pageNum) && pageNum >= 0 && pageNum < totalPages) {
        setCurrentPage(pageNum);
      }
      setPageInput(''); // 입력 후 초기화
    }
  };

  return (
    <div
      className="prediction-table"
      style={
        onClose
          ? {
              position: 'fixed',
              top: '10%',
              left: '10%',
              width: '80%',
              height: '80%',
              background: '#fff',
              zIndex: 1000,
              padding: '20px',
              overflowY: 'auto',
              border: '2px solid #000',
            }
          : {}
      }
    >
      {onClose && (
        <button style={{ position: 'absolute', top: '10px', right: '10px' }} onClick={onClose}>
          닫기
        </button>
      )}
      {showFilters && onClose && (
        <div className="filter-section" style={{ marginBottom: '20px' }}>
          <div className="sort-buttons" style={{ marginBottom: '20px' }}>
            <button onClick={() => handleSort('combination', true)}>조합순 ↑</button>
            <button onClick={() => handleSort('combination', false)}>조합순 ↓</button>
            <button onClick={() => handleSort('totalSum', true)}>총합순 ↑</button>
            <button onClick={() => handleSort('totalSum', false)}>총합순 ↓</button>
            <button onClick={() => handleSort('matchPercentage', true)}>일치도순 ↑</button>
            <button onClick={() => handleSort('matchPercentage', false)}>일치도순 ↓</button>
            <button onClick={() => handleSort('random')}>랜덤순</button>
            <button onClick={handleRecommend} style={{ marginLeft: '10px', padding: '5px 10px' }}>
              조합 추천
            </button>
          </div>
          <Filters
            usedNumbers={usedNumbers}
            setUsedNumbers={setUsedNumbers}
            excludedNumbers={excludedNumbers}
            setExcludedNumbers={setExcludedNumbers}
            latestData={latestData}
            predictions={predictions}
            setFilteredPredictions={setFilteredPredictions}
            setRecommendedCombinations={setRecommendedCombinations}
            setIsFiltered={setIsFiltered}
            onReset={handleReset}
          />
        </div>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {includeRank && <th>순위</th>}
            <th>번호1</th>
            <th>번호2</th>
            <th>번호3</th>
            <th>번호4</th>
            <th>번호5</th>
            <th>번호6</th>
            <th>총합</th>
            <th>홀짝 비율</th>
            <th>저고 비율</th>
            <th>패턴 일치도</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((pred, index) => (
              <tr key={index}>
                {includeRank && <td>{startIndex + index + 1}</td>}
                <td>{pred[0]}</td>
                <td>{pred[1]}</td>
                <td>{pred[2]}</td>
                <td>{pred[3]}</td>
                <td>{pred[4]}</td>
                <td>{pred[5]}</td>
                <td>{pred[6]}</td>
                <td>{pred[7]}</td>
                <td>{pred[8]}</td>
                <td>{pred[9]}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={includeRank ? 11 : 10}>데이터 없음</td>
            </tr>
          )}
        </tbody>
      </table>
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>
          이전
        </button>
        <span> 페이지 {currentPage + 1} / {totalPages} (총 {totalItems}개) </span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1}>
          다음
        </button>
        <div style={{ marginTop: '10px' }}>
          <input
            type="number"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onKeyPress={handlePageInput}
            placeholder="페이지 번호"
            style={{ width: '80px', padding: '5px', textAlign: 'center' }}
            min="1"
            max={totalPages}
          />
        </div>
      </div>
    </div>
  );
}

export default PredictionTable;