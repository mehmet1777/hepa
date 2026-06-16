'use client';

import { FilterData } from './FilterCalculator';

interface ResultsCardProps {
  results: {
    remainingWeight: number;
    remainingLength: number;
  };
  originalData: FilterData;
  diameter: number;
  onReset: () => void;
}

export function ResultsCard({ results, originalData, diameter, onReset }: ResultsCardProps) {
  const ratio = Math.pow(diameter / 75, 2);
  const percentage = Math.round(ratio * 100);

  return (
    <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-6 space-y-4 border border-slate-600">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-blue-400">✨ Sonuç</h3>
        <button
          type="button"
          onClick={onReset}
          className="py-1.5 px-3 text-sm bg-purple-600 text-white hover:bg-purple-500 rounded-lg active:bg-purple-700 touch-manipulation font-medium transition-colors"
        >
          🔄 Yeni
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-900 p-4 rounded-lg shadow-xl border border-slate-600">
          <p className="text-sm text-slate-400 mb-1">Kalan Ağırlık</p>
          <p className="text-4xl font-bold text-blue-400">{results.remainingWeight} kg</p>
          <p className="text-xs text-slate-500 mt-1">
            Orijinal: {originalData.netWeight} kg
          </p>
        </div>

        <div className="bg-slate-900 p-4 rounded-lg shadow-xl border border-slate-600">
          <p className="text-sm text-slate-400 mb-1">Kalan Uzunluk</p>
          <p className="text-4xl font-bold text-blue-400">{results.remainingLength} m</p>
          <p className="text-xs text-slate-500 mt-1">
            Orijinal: {originalData.length} m
          </p>
        </div>
      </div>

      <div className="bg-slate-900 p-4 rounded-lg border border-slate-600">
        <div className="flex items-center justify-between mb-2">
          <span className="text-base text-slate-300">Kalan Oran</span>
          <span className="text-2xl font-bold text-white">{percentage}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-4">
          <div
            className="bg-blue-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="text-sm text-slate-400 space-y-1 pt-2 border-t border-slate-600">
        <p>• Mevcut çap: {diameter} cm</p>
        <p>• Tam dolu çap: 75 cm</p>
        <p>• Hesaplama oranı: ({diameter} / 75)² = {ratio.toFixed(4)}</p>
      </div>
    </div>
  );
}
