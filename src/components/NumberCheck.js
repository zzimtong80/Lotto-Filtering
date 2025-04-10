import React, { useEffect, useMemo } from 'react';

function NumberCheck({ usedNumbers, setUsedNumbers, excludedNumbers, setExcludedNumbers, latestData, onClose }) {
  const safeLatestData = latestData || [];
  const allNumbers = safeLatestData.flatMap(d => [d.번호1, d.번호2, d.번호3, d.번호4, d.번호5, d.번호6]);
  const numberCounts = useMemo(() => {
    const counts = allNumbers.reduce((acc, num) => {
      acc[num] = (acc[num] || 0) + 1;
      return acc;
    }, {});
    console.log("Number Counts:", counts);
    return counts;
  }, [allNumbers]);

  useEffect(() => {
    const used = [];
    const excluded = [];
    const notAppeared = Array.from({ length: 45 }, (_, i) => i + 1).filter(num => !numberCounts[num]);
    for (let num = 1; num <= 45; num++) {
      const count = numberCounts[num] || 0;
      if (count >= 1 && count <= 4) used.push(num);
      else excluded.push(num);
    }
    notAppeared.forEach(num => {
      if (!excluded.includes(num)) excluded.push(num);
      if (used.includes(num)) used.splice(used.indexOf(num), 1);
    });
    setUsedNumbers(used.sort((a, b) => a - b));
    setExcludedNumbers(excluded.sort((a, b) => a - b));
    console.log("Used Numbers:", used);
    console.log("Excluded Numbers:", excluded);
    console.log("Not Appeared:", notAppeared);
  }, [numberCounts, setUsedNumbers, setExcludedNumbers]);

  const countGroups = {};
  for (let num = 1; num <= 45; num++) {
    const count = numberCounts[num] || 0;
    if (count > 0) countGroups[count] = [...(countGroups[count] || []), num];
  }
  const notAppeared = Array.from({ length: 45 }, (_, i) => i + 1).filter(num => !numberCounts[num]);

  const ranges = [
    { name: '단번대 (1~9)', start: 1, end: 9 },
    { name: '10번대 (10~19)', start: 10, end: 19 },
    { name: '20번대 (20~29)', start: 20, end: 29 },
    { name: '30번대 (30~39)', start: 30, end: 39 },
    { name: '40번대 (40~45)', start: 40, end: 45 },
  ];

  return (
    <div
      className="overlay"
      style={{
        position: 'fixed',
        top: '10%',
        left: '25%', // 중앙 정렬 (80% → 40%로 줄이면 25%로 이동)
        width: '40%', // 기존 80%에서 반으로 줄임
        height: '80%',
        background: '#fff',
        zIndex: 1000,
        padding: '20px',
        overflowY: 'auto',
        border: '2px solid #000', // 테두리 추가
      }}
    >
      <button style={{ position: 'absolute', top: '10px', right: '10px' }} onClick={onClose}>
        닫기
      </button>
      <div>
        <h3>중복된 횟수 / 숫자들:</h3>
        {Object.keys(countGroups).length > 0 ? (
          Object.keys(countGroups)
            .sort((a, b) => b - a)
            .map(count => (
              <p key={count}>
                {count}회: {countGroups[count].sort((a, b) => a - b).join(', ')} 개수: {countGroups[count].length}개
              </p>
            ))
        ) : (
          <p>데이터 없음</p>
        )}
        <h3>미출현 숫자들:</h3>
        <p>{notAppeared.length ? `${notAppeared.join(', ')} 개수: ${notAppeared.length}` : '없음'}</p>
        <h3>📌 사용된 숫자 ({usedNumbers.length}개):</h3>
        <div>
          {usedNumbers.length ? (
            ranges.map(range => {
              const nums = usedNumbers.filter(n => n >= range.start && n <= range.end);
              return <p key={range.name}>{range.name}: {nums.length ? nums.join(', ') : '없음'}</p>;
            })
          ) : (
            <p>없음</p>
          )}
        </div>
        <h3>❌ 제외된 숫자 ({excludedNumbers.length}개):</h3>
        <p>{excludedNumbers.length ? excludedNumbers.join(', ') : '없음'}</p>
      </div>
    </div>
  );
}

export default NumberCheck;