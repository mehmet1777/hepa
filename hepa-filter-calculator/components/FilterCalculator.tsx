'use client';

import { useState, useRef, useEffect } from 'react';
import { ImageUpload } from './ImageUpload';
import { ManualInput } from './ManualInput';
import { OCRResults } from './OCRResults';
import { DiameterInput } from './DiameterInput';
import { ResultsCard } from './ResultsCard';

export interface FilterData {
  width: number;  // mm cinsinden
  netWeight: number;  // kg
  length: number;  // metre
}

export function FilterCalculator() {
  const [filterData, setFilterData] = useState<FilterData | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [diameter, setDiameter] = useState<string>('');
  const [hasPreview, setHasPreview] = useState(false);
  const [results, setResults] = useState<{
    remainingWeight: number;
    remainingLength: number;
  } | null>(null);
  
  // Sonuç kartı için ref
  const resultsRef = useRef<HTMLDivElement>(null);

  // Sonuç gösterildiğinde otomatik scroll
  useEffect(() => {
    if (results && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, [results]);

  const handleCalculate = () => {
    if (!filterData || !diameter) return;

    const dia = parseFloat(diameter);
    if (isNaN(dia) || dia <= 0) return;

    const ratio = Math.pow(dia / 75, 2);
    const remainingWeight = filterData.netWeight * ratio;
    const remainingLength = filterData.length * ratio;

    setResults({
      remainingWeight: Math.round(remainingWeight),
      remainingLength: Math.round(remainingLength),
    });
  };

  const handleReset = () => {
    setFilterData(null);
    setDiameter('');
    setResults(null);
    setShowManualInput(false);
    setHasPreview(false);
  };

  const handleDataExtracted = (data: FilterData) => {
    setFilterData(data);
    setShowManualInput(false);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6 space-y-6">
      {!filterData && !showManualInput && (
        <>
          <ImageUpload 
            onDataExtracted={handleDataExtracted} 
            onPreviewChange={setHasPreview}
          />
          
          {!hasPreview && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-slate-800 px-2 text-slate-400">veya</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowManualInput(true)}
                className="w-full px-6 py-4 bg-slate-700 text-white font-bold text-lg rounded-lg hover:bg-slate-600 transition-colors active:bg-slate-500 touch-manipulation border border-slate-600"
              >
                📝 Manuel Veri Gir
              </button>
            </>
          )}
        </>
      )}

      {!filterData && showManualInput && (
        <>
          <ManualInput onDataSubmit={handleDataExtracted} />
          <button
            type="button"
            onClick={() => setShowManualInput(false)}
            className="w-full py-3 text-base text-slate-300 hover:text-white underline active:text-slate-100 touch-manipulation font-semibold"
          >
            ← Fotoğraf Yüklemeye Dön
          </button>
        </>
      )}
      
      {filterData && (
        <>
          <OCRResults data={filterData} />
          
          <DiameterInput
            value={diameter}
            onChange={setDiameter}
            onCalculate={handleCalculate}
            disabled={!filterData}
          />

          {results && (
            <div ref={resultsRef}>
              <ResultsCard
                results={results}
                originalData={filterData}
                diameter={parseFloat(diameter)}
                onReset={handleReset}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
