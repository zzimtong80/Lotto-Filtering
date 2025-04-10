/* eslint-disable no-restricted-globals */
self.onmessage = (e) => {
  const { data, startRound, endRound } = e.data;

  const combinations = (arr, k) => {
    const result = [];
    const f = (prefix, arr, k) => {
      if (k === 0) {
        result.push(prefix);
        return;
      }
      for (let i = 0; i < arr.length; i++) {
        f([...prefix, arr[i]], arr.slice(i + 1), k - 1);
      }
    };
    f([], arr, k);
    return result;
  };

  const getRange = (num) => {
    if (num <= 9) return '단대';
    if (num <= 19) return '10대';
    if (num <= 29) return '20대';
    if (num <= 39) return '30대';
    return '40대';
  };

  const calculateMatchPercentage = (comb, predictedOddEven, predictedLowCount, predictedCountDist, predictedRangeDist, numberCounts) => {
    const freqScore = comb.reduce((sum, num) => sum + (numberCounts[num] || 0), 0) / (24 * 6) * 100;
    const oddEvenMatch = comb.filter(n => n % 2 === 1).length === predictedOddEven.filter(o => o === '홀').length ? 33 : 0;
    const rangeMatch = comb.reduce((sum, num) => {
      const range = getRange(num);
      return sum + (predictedRangeDist[range] * 100 / 6);
    }, 0);
    return Math.min(100, Math.floor((freqScore + oddEvenMatch + rangeMatch) / 3));
  };

  const calculateAC = (numbers) => {
    const sortedNumbers = [...numbers].sort((a, b) => a - b);
    const differences = new Set();

    for (let i = 0; i < sortedNumbers.length - 1; i++) {
      for (let j = i + 1; j < sortedNumbers.length; j++) {
        const diff = sortedNumbers[j] - sortedNumbers[i];
        differences.add(diff);
      }
    }

    return Math.max(0, differences.size - 5);
  };

  const results = [];
  for (let round = startRound; round <= endRound; round++) {
    const pastData = data.filter(d => d.회차 < round).slice(0, 24);
    const allNumbers = pastData.flatMap(d => [d.번호1, d.번호2, d.번호3, d.번호4, d.번호5, d.번호6]);
    const numberCounts = allNumbers.reduce((acc, num) => { acc[num] = (acc[num] || 0) + 1; return acc; }, {});
    const validNumbers = Object.entries(numberCounts)
      .filter(([num, count]) => count >= 1 && count <= 4)
      .map(([num]) => parseInt(num));

    const winningRow = data.find(d => d.회차 === round);
    const winningNumbers = [winningRow.번호1, winningRow.번호2, winningRow.번호3, winningRow.번호4, winningRow.번호5, winningRow.번호6];
    const sortedWinning = winningNumbers.sort((a, b) => a - b);

    const countDistribution = {};
    for (let i = 1; i <= 45; i++) {
      if (validNumbers.includes(i)) {
        const count = Math.min(4, numberCounts[i] || 0);
        countDistribution[count] = (countDistribution[count] || 0) + 1;
      }
    }
    const predictedCountDist = {};
    for (let i = 1; i <= 4; i++) {
      predictedCountDist[i] = (countDistribution[i] || 0) / 24;
    }

    const oddEvenHistory = pastData.map(d => {
      const nums = [d.번호1, d.번호2, d.번호3, d.번호4, d.번호5, d.번호6];
      return nums.map(n => n % 2 === 1 ? 1 : 0);
    });
    const predictedOddEven = oddEvenHistory[0].map((_, i) =>
      oddEvenHistory.reduce((sum, row) => sum + row[i], 0) / oddEvenHistory.length > 0.5 ? '홀' : '짝'
    );

    const lowHighHistory = pastData.map(d => {
      const nums = [d.번호1, d.번호2, d.번호3, d.번호4, d.번호5, d.번호6];
      return nums.map(n => n <= 22 ? 1 : 0);
    });
    const predictedLowCount = Math.round(
      lowHighHistory.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0) / lowHighHistory.length
    );

    const rangeHistory = pastData.map(d => {
      const nums = [d.번호1, d.번호2, d.번호3, d.번호4, d.번호5, d.번호6];
      return nums.map(getRange);
    });
    const predictedRangeDist = {
      '단대': rangeHistory.reduce((sum, row) => sum + row.filter(r => r === '단대').length, 0) / 24,
      '10대': rangeHistory.reduce((sum, row) => sum + row.filter(r => r === '10대').length, 0) / 24,
      '20대': rangeHistory.reduce((sum, row) => sum + row.filter(r => r === '20대').length, 0) / 24,
      '30대': rangeHistory.reduce((sum, row) => sum + row.filter(r => r === '30대').length, 0) / 24,
      '40대': rangeHistory.reduce((sum, row) => sum + row.filter(r => r === '40대').length, 0) / 24,
    };

    const predictionsSet = new Set();
    const combList = combinations(validNumbers, 6);
    for (const comb of combList) {
      const sortedComb = comb.sort((a, b) => a - b);
      const totalSum = sortedComb.reduce((a, b) => a + b, 0);
      if (totalSum < 80 || totalSum > 170) continue;
      const consecutiveCount = sortedComb.reduce((count, num, i) => i > 0 && num - sortedComb[i - 1] === 1 ? count + 1 : count, 0);
      if (consecutiveCount > 1) continue;
      const gaps = sortedComb.slice(1).map((num, i) => num - sortedComb[i]);
      const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      if (avgGap < 5 || avgGap > 8) continue;
      const matchPercentage = calculateMatchPercentage(sortedComb, predictedOddEven, predictedLowCount, predictedCountDist, predictedRangeDist, numberCounts);
      if (matchPercentage >= 30) {
        predictionsSet.add(JSON.stringify([...sortedComb]));
      }
    }

    const predictions = Array.from(predictionsSet).map(JSON.parse);
    const winningStr = JSON.stringify(sortedWinning);
    if (predictions.some(pred => JSON.stringify(pred) === winningStr)) {
      const oddCount = sortedWinning.filter(n => n % 2 === 1).length;
      const lowCount = sortedWinning.filter(n => n <= 22).length;
      const totalSum = sortedWinning.reduce((a, b) => a + b, 0);
      const acValue = calculateAC(sortedWinning);
      results.push({
        round,
        winningNumbers: sortedWinning,
        acValue,
        oddEvenRatio: `${oddCount}:${6 - oddCount}`,
        lowHighRatio: `${lowCount}:${6 - lowCount}`,
        totalSum,
      });
    }
  }

  self.postMessage(results);
};