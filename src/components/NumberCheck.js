import React, { useMemo, useCallback } from 'react';

function NumberCheck({ usedNumbers, setUsedNumbers, excludedNumbers, setExcludedNumbers, latestData, onClose }) {
  // safeLatestData를 useMemo로 래핑
  const safeLatestData = useMemo(() => latestData || [], [latestData]);

  // 모든 번호 추출
  const allNumbers = useMemo(() => {
    return safeLatestData.flatMap(d => [d.번호1, d.번호2, d.번호3, d.번호4, d.번호5, d.번호6]);
  }, [safeLatestData]);

  // 숫자 빈도 계산
  const numberCounts = useMemo(() => {
    const counts = allNumbers.reduce((acc, num) => {
      acc[num] = (acc[num] || 0) + 1;
      return acc;
    }, {});
    console.log("Number Counts:", counts);
    return counts;
  }, [allNumbers]);

  // 사용된 숫자, 제외된 숫자, 미출현 숫자 계산
  const computedNumbers = useMemo(() => {
    const used = [];
    const excluded = [];
    const notAppeared = [];

    // 1~45 순회
    for (let num = 1; num <= 45; num++) {
      const count = numberCounts[num] || 0;
      if (count >= 1 && count <= 4) {
        used.push(num);
      } else {
        excluded.push(num);
      }
      if (count === 0) {
        notAppeared.push(num);
      }
    }

    // 정렬
    used.sort((a, b) => a - b);
    excluded.sort((a, b) => a - b);
    notAppeared.sort((a, b) => a - b);

    console.log("Used Numbers:", used);
    console.log("Excluded Numbers:", excluded);
    console.log("Not Appeared:", notAppeared);

    return { used, excluded, notAppeared };
  }, [numberCounts]);

  // 상태 업데이트 (변경 시에만)
  if (usedNumbers.join() !== computedNumbers.used.join()) {
    setUsedNumbers(computedNumbers.used);
  }
  if (excludedNumbers.join() !== computedNumbers.excluded.join()) {
    setExcludedNumbers(computedNumbers.excluded);
  }

  // 중복 횟수별 그룹
  const countGroups = useMemo(() => {
    const groups = {};
    for (let num = 1; num <= 45; num++) {
      const count = numberCounts[num] || 0;
      if (count > 0) {
        groups[count] = [...(groups[count] || []), num].sort((a, b) => a - b);
      }
    }
    return groups;
  }, [numberCounts]);

  // 닫기 핸들러
  const handleClose = useCallback(() => {
    console.log("Closing NumberCheck");
    onClose();
  }, [onClose]);

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
        left: '25%',
        width: '40%',
        height: '80%',
        background: '#fff',
        zIndex: 1000,
        padding: '20px',
        overflowY: 'auto',
        border: '2px solid #000',
      }}
    >
      <button style={{ position: 'absolute', top: '10px', right: '10px' }} onClick={handleClose}>
        닫기
      </button>
      <div>
        <h3>중복된 횟수 / 숫자들:</h3>
        {Object.keys(countGroups).length > 0 ? (
          Object.keys(countGroups)
            .sort((a, b) => b - a)
            .map(count => (
              <p key={count}>
                {count}회: {countGroups[count].join(', ')} 개수: {countGroups[count].length}개
              </p>
            ))
        ) : (
          <p>데이터 없음</p>
        )}
        <h3>미출현 숫자들:</h3>
        <p>
          {computedNumbers.notAppeared.length
            ? `${computedNumbers.notAppeared.join(', ')} 개수: ${computedNumbers.notAppeared.length}`
            : '없음'}
        </p>
        <h3>📌 사용된 숫자 ({computedNumbers.used.length}개):</h3>
        <div>
          {computedNumbers.used.length ? (
            ranges.map(range => {
              const nums = computedNumbers.used.filter(n => n >= range.start && n <= range.end);
              return (
                <p key={range.name}>
                  {range.name}: {nums.length ? nums.join(', ') : '없음'}
                </p>
              );
            })
          ) : (
            <p>없음</p>
          )}
        </div>
        <h3>❌ 제외된 숫자 ({computedNumbers.excluded.length}개):</h3>
        <p>{computedNumbers.excluded.length ? computedNumbers.excluded.join(', ') : '없음'}</p>
      </div>
    </div>
  );
}

export default NumberCheck;