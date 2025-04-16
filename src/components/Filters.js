import React, { useState } from 'react';
import './Filters.css';

function Filters({
  usedNumbers,
  setUsedNumbers,
  excludedNumbers,
  setExcludedNumbers,
  latestData,
  predictions,
  setFilteredPredictions,
  setRecommendedCombinations,
  setIsFiltered,
  onReset,
}) {
  const [firstNumber, setFirstNumber] = useState('');
  const [acValue, setAcValue] = useState('');
  const [oddCount, setOddCount] = useState('');
  const [evenCount, setEvenCount] = useState('');
  const [lowCount, setLowCount] = useState('');
  const [highCount, setHighCount] = useState('');
  const [totalRange, setTotalRange] = useState({ min: '', max: '' });
  const [ranges, setRanges] = useState(Array(6).fill(''));

  const rangeOptions = ['미지정', '단대', '10대', '20대', '30대', '40대'];

  const getRange = (num) => {
    if (num <= 9) return '단대';
    if (num <= 19) return '10대';
    if (num <= 29) return '20대';
    if (num <= 39) return '30대';
    return '40대';
  };

  const handleSearch = () => {
    if (!predictions || !setFilteredPredictions) {
      console.log('No predictions or setFilteredPredictions');
      return;
    }

    const filtered = predictions.filter(pred => {
      const numbers = pred.slice(0, 6); // 번호1~6
      const ac = pred[6]; // AC
      const totalSum = pred[7]; // 총합
      const oddEven = pred[8]; // 홀짝 비율
      const lowHigh = pred[9]; // 저고 비율
      const matchPercentage = parseFloat(pred[10]); // 패턴 일치도

      // 첫 번째 숫자
      if (firstNumber && parseInt(firstNumber) !== numbers[0]) {
        return false;
      }

      // AC값
      if (acValue && parseInt(acValue) !== ac) {
        return false;
      }

      // 홀짝 비율
      const [odd, even] = oddEven.split(':').map(Number);
      const oddInput = oddCount === '' ? null : parseInt(oddCount);
      const evenInput = evenCount === '' ? null : parseInt(evenCount);
      if (oddInput !== null && odd !== oddInput) return false;
      if (evenInput !== null && even !== evenInput) return false;

      // 저고 비율
      const [low, high] = lowHigh.split(':').map(Number);
      const lowInput = lowCount === '' ? null : parseInt(lowCount);
      const highInput = highCount === '' ? null : parseInt(highCount);
      if (lowInput !== null && low !== lowInput) return false;
      if (highInput !== null && high !== highInput) return false;

      // 총합 범위
      if (totalRange.min && totalSum < parseInt(totalRange.min)) return false;
      if (totalRange.max && totalSum > parseInt(totalRange.max)) return false;

      // 번호대
      for (let i = 0; i < ranges.length; i++) {
        if (ranges[i] && ranges[i] !== '미지정' && getRange(numbers[i]) !== ranges[i]) {
          return false;
        }
      }

      return true;
    });

    console.log('Filtered Predictions:', filtered);
    setFilteredPredictions(filtered);
    setRecommendedCombinations([]);
    setIsFiltered(filtered.length !== predictions.length);
  };

  const handleResetFilters = () => {
    setFirstNumber('');
    setAcValue('');
    setOddCount('');
    setEvenCount('');
    setLowCount('');
    setHighCount('');
    setTotalRange({ min: '', max: '' });
    setRanges(Array(6).fill(''));
    if (onReset) onReset();
    console.log('Filters reset');
  };

  return (
    <div className="filters">
      <h4>필터링 조건</h4>
      <div className="filter-row">
        <div className="filter-item">
          <label>첫 번째 숫자:</label>
          <input
            type="number"
            value={firstNumber}
            onChange={(e) => setFirstNumber(e.target.value)}
            min="1"
            max="45"
            placeholder="1~45"
            style={{ width: '80px' }}
          />
        </div>
        <div className="filter-item">
          <label>AC값:</label>
          <input
            type="number"
            value={acValue}
            onChange={(e) => setAcValue(e.target.value)}
            min="0"
            max="10"
            placeholder="0~10"
            style={{ width: '80px' }}
          />
        </div>
      </div>
      <div className="filter-row">
        <div className="filter-item">
          <label>홀짝 비율:</label>
          <input
            type="number"
            value={oddCount}
            onChange={(e) => setOddCount(e.target.value)}
            placeholder="홀"
            min="0"
            max="6"
            style={{ width: '60px' }}
          />
          <span>:</span>
          <input
            type="number"
            value={evenCount}
            onChange={(e) => setEvenCount(e.target.value)}
            placeholder="짝"
            min="0"
            max="6"
            style={{ width: '60px' }}
          />
        </div>
        <div className="filter-item">
          <label>저고 비율:</label>
          <input
            type="number"
            value={lowCount}
            onChange={(e) => setLowCount(e.target.value)}
            placeholder="저"
            min="0"
            max="6"
            style={{ width: '60px' }}
          />
          <span>:</span>
          <input
            type="number"
            value={highCount}
            onChange={(e) => setHighCount(e.target.value)}
            placeholder="고"
            min="0"
            max="6"
            style={{ width: '60px' }}
          />
        </div>
      </div>
      <div className="filter-row">
        <div className="filter-item">
          <label>총합 범위:</label>
          <input
            type="number"
            value={totalRange.min}
            onChange={(e) => setTotalRange({ ...totalRange, min: e.target.value })}
            placeholder="최소"
            style={{ width: '80px' }}
          />
          <span>~</span>
          <input
            type="number"
            value={totalRange.max}
            onChange={(e) => setTotalRange({ ...totalRange, max: e.target.value })}
            placeholder="최대"
            style={{ width: '80px' }}
          />
        </div>
      </div>
      <div className="filter-row">
        <div className="filter-item full-width">
          <label>번호대 선택:</label>
          <div className="ranges-container">
            {ranges.map((range, index) => (
              <select
                key={index}
                value={range}
                onChange={(e) => {
                  const newRanges = [...ranges];
                  newRanges[index] = e.target.value;
                  setRanges(newRanges);
                }}
                style={{ width: '80px' }}
              >
                {rangeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ))}
          </div>
        </div>
      </div>
      <div className="filter-row buttons">
        <button onClick={handleSearch}>검색</button>
        <button onClick={handleResetFilters}>초기화</button>
      </div>
    </div>
  );
}

export default Filters;
