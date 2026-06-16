'use client';

interface DiameterInputProps {
  value: string;
  onChange: (value: string) => void;
  onCalculate: () => void;
  disabled?: boolean;
}

export function DiameterInput({ value, onChange, onCalculate, disabled }: DiameterInputProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="diameter" className="block text-base font-bold text-slate-200 mb-2">
          Mevcut Rulo Çapı (cm)
        </label>
        <input
          id="diameter"
          type="number"
          step="0.1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Örn: 56"
          className="w-full px-4 py-4 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-900 disabled:cursor-not-allowed bg-slate-800 text-white text-lg"
        />
        <p className="text-sm text-slate-400 mt-2">Tam dolu rulo çapı: 75 cm</p>
      </div>

      <button
        type="button"
        onClick={onCalculate}
        disabled={disabled || !value}
        className="w-full px-6 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors active:bg-blue-400 touch-manipulation"
      >
        Hesapla
      </button>
    </div>
  );
}
