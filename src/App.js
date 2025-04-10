import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import NumberCheck from './components/NumberCheck';
import PredictionTable from './components/PredictionTable';
import RoundSelector from './components/RoundSelector';
import DuplicateTable from './components/DuplicateTable';
import HistoryResults from './components/HistoryResults';
import './styles.css';

function App() {
  const [data, setData] = useState([]);
  const [selectedRound, setSelectedRound] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [usedNumbers, setUsedNumbers] = useState([]);
  const [excludedNumbers, setExcludedNumbers] = useState([]);
  const [latestData, setLatestData] = useState([]);
  const [showNumberCheck, setShowNumberCheck] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [historyResults, setHistoryResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  // 분석 함수
  const analyzeNewRounds = useCallback(async (dataToAnalyze, startRound, endRound, existingResults) => {
    if (!dataToAnalyze.length) {
      console.log('No data to analyze.');
      setIsAnalyzing(false);
      return;
    }

    setIsAnalyzing(true);
    console.log('Starting analysis:', { startRound, endRound });

    return new Promise((resolve) => {
      const worker = new Worker(new URL('./workers/analyzeWorker.js', import.meta.url));
      worker.postMessage({ data: dataToAnalyze, startRound: startRound + 1, endRound });

      worker.onmessage = (e) => {
        const newResults = e.data;
        const updatedResults = [...existingResults, ...newResults];
        setHistoryResults(updatedResults);
        setIsAnalyzed(true);
        setIsAnalyzing(false);
        console.log('History results updated:', updatedResults);
        worker.terminate();
        resolve();
      };

      worker.onerror = (error) => {
        console.error('Worker error:', error);
        setIsAnalyzing(false);
        worker.terminate();
        resolve();
      };
    });
  }, []);

  // 초기 데이터 로드 (분석 제외)
  const loadInitialData = useCallback(async () => {
    console.log('Starting initial load...');
    let existingResults = [];
    let latestRound = 0;
    let dataToAnalyze = [];

    try {
      const historyResponse = await fetch('/history_results.json');
      console.log('Fetch status for history_results.json:', historyResponse.status);
      if (historyResponse.ok) {
        existingResults = await historyResponse.json();
        setHistoryResults(existingResults);
        setIsAnalyzed(true);
        console.log('Loaded existing history results:', existingResults);
      } else {
        console.log('history_results.json not found (status:', historyResponse.status, ')');
        existingResults = [];
      }
    } catch (error) {
      console.log('Error loading history_results.json:', error);
      existingResults = [];
    }

    try {
      const response = await axios.get('/data.json');
      dataToAnalyze = response.data;
      setData(dataToAnalyze);
      latestRound = Math.max(...dataToAnalyze.map(d => d.회차));
      setSelectedRound(latestRound + 1);
      console.log('Loaded data.json, latest round:', latestRound);
    } catch (error) {
      console.error('Data loading failed:', error);
      return;
    }

    console.log('Initial load complete:', { historyResultsLength: existingResults.length });
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 분석 버튼 핸들러
  const handleAnalyzeHistory = useCallback(async () => {
    const latestExistingRound = historyResults.length > 0 ? Math.max(...historyResults.map(r => r.round)) : 0;
    const latestRound = Math.max(...data.map(d => d.회차));
    if (latestExistingRound < latestRound || historyResults.length === 0) {
      await analyzeNewRounds(data, latestExistingRound, latestRound, historyResults);
    } else {
      console.log('History is up-to-date, no analysis needed.');
    }
    setShowHistory(true);
  }, [data, historyResults, analyzeNewRounds]);

  useEffect(() => {
    if (selectedRound && data.length > 0) {
      const filteredData = selectedRound > Math.max(...data.map(d => d.회차))
        ? data.slice(0, Math.min(24, data.length))
        : data.filter(d => d.회차 < selectedRound).slice(0, 24);
      setLatestData(filteredData);
    }
  }, [selectedRound, data]);

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

  const calculateMatchPercentage = useCallback((comb, predictedOddEven, predictedLowCount, predictedCountDist, predictedRangeDist, numberCounts) => {
    const freqScore = comb.reduce((sum, num) => sum + (numberCounts[num] || 0), 0) / (24 * 6) * 100;
    const oddEvenMatch = comb.filter(n => n % 2 === 1).length === predictedOddEven.filter(o => o === '홀').length ? 33 : 0;
    const rangeMatch = comb.reduce((sum, num) => {
      const range = getRange(num);
      return sum + (predictedRangeDist[range] * 100 / 6);
    }, 0);
    return Math.min(100, Math.floor((freqScore + oddEvenMatch + rangeMatch) / 3));
  }, []);

  const generatePredictions = useCallback(() => {
    if (!data.length || !latestData.length) {
      setPredictions([]);
      console.log('Latest data is empty');
      return;
    }

    const allNumbers = latestData.flatMap(d => [d.번호1, d.번호2, d.번호3, d.번호4, d.번호5, d.번호6]);
    const numberCounts = allNumbers.reduce((acc, num) => { acc[num] = (acc[num] || 0) + 1; return acc; }, {});
    const validNumbers = Object.entries(numberCounts)
      .filter(([num, count]) => count >= 1 && count <= 4 && !excludedNumbers.includes(parseInt(num)))
      .map(([num]) => parseInt(num));

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

    const oddEvenHistory = latestData.map(d => {
      const nums = [d.번호1, d.번호2, d.번호3, d.번호4, d.번호5, d.번호6];
      return nums.map(n => n % 2 === 1 ? 1 : 0);
    });
    const predictedOddEven = oddEvenHistory[0].map((_, i) =>
      oddEvenHistory.reduce((sum, row) => sum + row[i], 0) / oddEvenHistory.length > 0.5 ? '홀' : '짝'
    );

    const lowHighHistory = latestData.map(d => {
      const nums = [d.번호1, d.번호2, d.번호3, d.번호4, d.번호5, d.번호6];
      return nums.map(n => n <= 22 ? 1 : 0);
    });
    const predictedLowCount = Math.round(
      lowHighHistory.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0) / lowHighHistory.length
    );

    const rangeHistory = latestData.map(d => {
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
      const oddCount = sortedComb.filter(n => n % 2 === 1).length;
      const lowCount = sortedComb.filter(n => n <= 22).length;
      const matchPercentage = calculateMatchPercentage(sortedComb, predictedOddEven, predictedLowCount, predictedCountDist, predictedRangeDist, numberCounts);
      if (matchPercentage >= 30) {
        predictionsSet.add(JSON.stringify([...sortedComb, totalSum, `${oddCount}:${6 - oddCount}`, `${lowCount}:${6 - lowCount}`, `${matchPercentage}%`]));
      }
    }

    const newPredictions = Array.from(predictionsSet)
      .map(JSON.parse)
      .sort((a, b) => parseFloat(b[9]) - parseFloat(a[9]));
    setPredictions(newPredictions);
    setCurrentPage(0);
    console.log('Predictions generated:', newPredictions);
  }, [data, latestData, excludedNumbers, calculateMatchPercentage]);

  useEffect(() => {
    if (latestData.length > 0) {
      generatePredictions();
    }
  }, [latestData, excludedNumbers, generatePredictions]);

  const sortPredictions = useCallback((criteria, ascending = true) => {
    const sorted = [...predictions];
    switch (criteria) {
      case 'combination':
        sorted.sort((a, b) => {
          for (let i = 0; i < 6; i++) {
            if (a[i] !== b[i]) return ascending ? a[i] - b[i] : b[i] - a[i];
          }
          return 0;
        });
        break;
      case 'totalSum':
        sorted.sort((a, b) => ascending ? a[6] - b[6] : b[6] - a[6]);
        break;
      case 'matchPercentage':
        sorted.sort((a, b) => {
          const aMatch = parseFloat(a[9]);
          const bMatch = parseFloat(b[9]);
          return ascending ? aMatch - bMatch : bMatch - aMatch;
        });
        break;
      case 'random':
        for (let i = sorted.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
        }
        break;
      default:
        break;
    }
    setPredictions(sorted);
    setCurrentPage(0);
  }, [predictions]);

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

  const loadHistoryResults = () => {
    fetch('/history_results.json')
      .then(response => response.json())
      .then(data => {
        setHistoryResults(data);
        setIsAnalyzed(true);
        console.log('History results loaded:', data);
      })
      .catch(error => console.error('History load failed:', error));
  };

  useEffect(() => {
    if (showHistory && historyResults.length === 0) {
      loadHistoryResults();
    }
  }, [showHistory, historyResults.length]);

  return (
    <div className="app">
      <h3>로또 분석 프로그램</h3>
      <RoundSelector data={data} selectedRound={selectedRound} setSelectedRound={setSelectedRound} />
      <DuplicateTable latestData={latestData} type="duplicate" />
      <DuplicateTable latestData={latestData} type="oddEven" />
      <DuplicateTable latestData={latestData} type="range" />
      <button onClick={() => setShowHistory(true)} disabled={isAnalyzing}>
        역대 결과 보기
      </button>
      <button onClick={handleAnalyzeHistory} disabled={isAnalyzing}>
        {isAnalyzing ? '분석 중...' : '역대 결과 분석'}
      </button>
      <div className="prediction-section">
        <h3>📌 예측 번호</h3>
        <button onClick={() => setShowPrediction(true)}>필터링</button>
        <button onClick={() => setShowNumberCheck(true)}>숫자 확인</button>
        <PredictionTable
          predictions={predictions}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          includeRank={false}
          showFilters={true}
        />
      </div>
      {showNumberCheck && (
        <NumberCheck
          latestData={latestData}
          usedNumbers={usedNumbers}
          setUsedNumbers={setUsedNumbers}
          excludedNumbers={excludedNumbers}
          setExcludedNumbers={setExcludedNumbers}
          onClose={() => setShowNumberCheck(false)}
        />
      )}
      {showPrediction && (
        <PredictionTable
          predictions={predictions}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          includeRank={false}
          onClose={() => setShowPrediction(false)}
          showFilters={true}
          sortPredictions={sortPredictions}
          usedNumbers={usedNumbers}
          setUsedNumbers={setUsedNumbers}
          excludedNumbers={excludedNumbers}
          setExcludedNumbers={setExcludedNumbers}
          latestData={latestData}
        />
      )}
      {showHistory && (
        <HistoryResults results={historyResults} onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
}

export default App;