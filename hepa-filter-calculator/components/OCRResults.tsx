'use client';

import { FilterData } from './FilterCalculator';

interface OCRResultsProps {
  data: FilterData;
}

export function OCRResults({ data }: OCRResultsProps) {
  return (
    <div className="bg-slate-700 border border-slate-600 rounded-lg p-4 space-y-2">
      <h3 className="font-bold text-lg text-white mb-3">Okunan Bilgiler</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-800 p-3 rounded-lg border border-slate-600">
          <p className="text-sm text-slate-400 mb-1">Genişlik</p>
          <p className="font-bold text-xl text-white">{data.width} mm</p>
        </div>
        
        <div className="bg-slate-800 p-3 rounded-lg border border-slate-600">
          <p className="text-sm text-slate-400 mb-1">Net Ağırlık</p>
          <p className="font-bold text-xl text-white">{data.netWeight} kg</p>
        </div>
        
        <div className="bg-slate-800 p-3 rounded-lg border border-slate-600">
          <p className="text-sm text-slate-400 mb-1">Uzunluk</p>
          <p className="font-bold text-xl text-white">{data.length} m</p>
        </div>
      </div>
    </div>
  );
}
