'use client';

import { useState } from 'react';

export default function TestPage() {
  const [clicks, setClicks] = useState(0);
  const [lastEvent, setLastEvent] = useState('');

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setClicks(prev => prev + 1);
    setLastEvent(`Click: ${new Date().toLocaleTimeString()}`);
  };

  const handleTouch = (e: React.TouchEvent) => {
    setLastEvent(`Touch: ${new Date().toLocaleTimeString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">Mobil Test Sayfası</h1>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-lg font-semibold">Tıklama Sayısı: {clicks}</p>
          <p className="text-sm text-slate-600 mt-2">Son Olay: {lastEvent || 'Henüz yok'}</p>
        </div>

        <button
          type="button"
          onClick={handleClick}
          onTouchStart={handleTouch}
          className="w-full px-6 py-4 bg-blue-600 text-white font-bold rounded-lg active:bg-blue-800 text-lg"
          style={{ 
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          BU BUTONA DOKUN
        </button>

        <button
          type="button"
          onClick={() => alert('Alert çalışıyor!')}
          className="w-full px-6 py-4 bg-green-600 text-white font-bold rounded-lg active:bg-green-800 text-lg"
          style={{ 
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          ALERT TEST
        </button>

        <div className="text-xs text-slate-500 mt-4">
          <p>User Agent: {typeof window !== 'undefined' ? navigator.userAgent.substring(0, 50) : 'Loading...'}</p>
          <p>Screen: {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Loading...'}</p>
        </div>
      </div>
    </div>
  );
}
