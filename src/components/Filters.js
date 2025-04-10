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

  const calculateAC = (numbers) => {
    const diffs = new Set();
    for (let i = 0; i < numbers.length - 1; i++) {
      for (let j = i + 1; j < numbers.length; j++) {
        diffs.add(Math.abs(numbers[i] - numbers[j]));
      }
    }
    return Math.min(10, Math.max(0, diffs.size - 5));
  };

  const handleSearch = () => {
    if (!predictions || !setFilteredPredictions) return;

    const filtered = predictions.filter(pred => {
      const [n1, n2, n3, n4, n5, n6, totalSum, oddEven, lowHigh] = pred;
      const numbers = [n1, n2, n3, n4, n5, n6];

      // 첫 번째 숫자 필터링
      if (firstNumber && parseInt(firstNumber) !== n1) return false;

      // AC값 필터링
      if (acValue) {
        const ac = calculateAC(numbers);
        if (parseInt(acValue) !== ac) return false;
      }

      // 홀짝 비율 필터링
      const [odd, even] = oddEven.split(':').map(Number); // "3:3" -> [3, 3]
      const oddInput = oddCount === '' ? null : parseInt(oddCount);
      const evenInput = evenCount === '' ? null : parseInt(evenCount);
      if (oddInput !== null && odd !== oddInput) return false;
      if (evenInput !== null && even !== evenInput) return false;

      // 저고 비율 필터링
      const [low, high] = lowHigh.split(':').map(Number); // "3:3" -> [3, 3]
      const lowInput = lowCount === '' ? null : parseInt(lowCount);
      const highInput = highCount === '' ? null : parseInt(highCount);
      if (lowInput !== null && low !== lowInput) return false;
      if (highInput !== null && high !== highInput) return false;

      // 총합 범위 필터링
      if (totalRange.min && totalSum < parseInt(totalRange.min)) return false;
      if (totalRange.max && totalSum > parseInt(totalRange.max)) return false;

      // 번호대 필터링
      for (let i = 0; i < ranges.length; i++) {
        if (ranges[i] && ranges[i] !== '미지정' && getRange(numbers[i]) !== ranges[i]) {
          return false;
        }
      }

      return true;
    });

    setFilteredPredictions(filtered);
    setRecommendedCombinations([]);
    setIsFiltered(true);
    console.log('Filtered Predictions:', filtered); // 디버깅용
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
    console.log('Filters reset, predictions restored:', predictions);
  };

  return (
    <div className="filters">
      <div className="filter-row">
        <div className="filter-item">
          <label>첫 번째 숫자: </label>
          <input
            type="number"
            value={firstNumber}
            onChange={(e) => setFirstNumber(e.target.value)}
            min="1"
            max="45"
          />
        </div>
        <div className="filter-item">
          <label>AC값: </label>
          <input
            type="number"
            value={acValue}
            onChange={(e) => setAcValue(e.target.value)}
            min="0"
            max="10"
          />
        </div>
        <div className="filter-item">
          <label>홀짝 비율: </label>
          <input
            type="number"
            value={oddCount}
            onChange={(e) => setOddCount(e.target.value)}
            placeholder="홀"
            min="0"
            max="6"
          />
          <span> : </span>
          <input
            type="number"
            value={evenCount}
            onChange={(e) => setEvenCount(e.target.value)}
            placeholder="짝"
            min="0"
            max="6"
          />
        </div>
        <div className="filter-item low-high-total">
          <div className="sub-item">
            <label>저고 비율: </label>
            <input
              type="number"
              value={lowCount}
              onChange={(e) => setLowCount(e.target.value)}
              placeholder="저"
              min="0"
              max="6"
            />
            <span> : </span>
            <input
              type="number"
              value={highCount}
              onChange={(e) => setHighCount(e.target.value)}
              placeholder="고"
              min="0"
              max="6"
            />
          </div>
          <div className="sub-item">
            <label>총합 범위: </label>
            <input
              type="number"
              value={totalRange.min}
              onChange={(e) => setTotalRange({ ...totalRange, min: e.target.value })}
              placeholder="최소"
            />
            <span> ~ </span>
            <input
              type="number"
              value={totalRange.max}
              onChange={(e) => setTotalRange({ ...totalRange, max: e.target.value })}
              placeholder="최대"
            />
          </div>
        </div>
      </div>
      <div className="filter-row">
        <div className="filter-item full-width">
          <label>번호대 선택: </label>
          {ranges.map((range, index) => (
            <select
              key={index}
              value={range}
              onChange={(e) => {
                const newRanges = [...ranges];
                newRanges[index] = e.target.value;
                setRanges(newRanges);
              }}
            >
              {rangeOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ))}
        </div>
      </div>
      <div className="filter-row">
        <button onClick={handleSearch}>검색</button>
        <button onClick={handleResetFilters}>초기화</button>
      </div>
    </div>
  );
}

export default Filters;