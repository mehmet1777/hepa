'use client';

import { useState, useRef } from 'react';
import { FilterData } from './FilterCalculator';

interface ImageUploadProps {
  onDataExtracted: (data: FilterData) => void;
  onPreviewChange: (hasPreview: boolean) => void;
}

export function ImageUpload({ onDataExtracted, onPreviewChange }: ImageUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({ width: '', netWeight: '', length: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    console.log('📸 File seçildi:', file.name, file.size, 'bytes');
    
    setIsProcessing(true);
    
    try {
      // Görüntüyü base64'e çevir
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64Image = await base64Promise;
      setPreview(base64Image);
      onPreviewChange(true); // Parent'a bildir

      // Gemini API'ye gönder
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
      }

      const data = await response.json();

      if (data.width && data.netWeight && data.length) {
        setShowEditForm(true);
        setFormData({
          width: data.width.toString(),
          netWeight: data.netWeight.toString(),
          length: data.length.toString(),
        });
      } else {
        setShowEditForm(true);
        setFormData({ width: '', netWeight: '', length: '' });
      }
    } catch (error: any) {
      console.error('❌ Analiz hatası:', error);
      
      // Kullanıcı dostu Türkçe hata mesajı
      let userMessage = 'Etiket okunamadı';
      
      if (error.message.includes('pattern') || error.message.includes('parse') || error.message.includes('JSON')) {
        userMessage = 'Fotoğraf net değil. Lütfen daha yakın ve dik açıyla çekin';
      } else if (error.message.includes('limit') || error.message.includes('quota') || error.message.includes('429')) {
        userMessage = 'Günlük analiz limiti doldu';
      } else if (error.message.includes('API key') || error.message.includes('bulunamadı')) {
        userMessage = 'Servis geçici olarak kullanılamıyor';
      }
      
      alert(`⚠️ ${userMessage}\n\nManuel giriş yapabilirsiniz.`);
      setShowEditForm(true);
      setFormData({ width: '', netWeight: '', length: '' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const w = parseFloat(formData.width);
    const weight = parseFloat(formData.netWeight);
    const len = parseFloat(formData.length);

    if (!isNaN(w) && !isNaN(weight) && !isNaN(len) && w > 0 && weight > 0 && len > 0) {
      onDataExtracted({ width: w, netWeight: weight, length: len });
      setShowEditForm(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* File Input - Görünür Input */}
      {!preview && (
        <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors bg-slate-700">
          <div className="mb-4 text-slate-200">
            <p className="font-bold text-lg leading-tight mb-2">📸 Etiket Fotoğrafı Çek veya Yükle</p>
            <p className="text-sm text-slate-400 leading-relaxed">Genişlik, ağırlık ve uzunluk otomatik okunacak</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              console.log('📸 onChange tetiklendi');
              const file = e.target.files?.[0];
              console.log('📁 File:', file);
              if (file) handleFileSelect(file);
            }}
            onClick={(e) => {
              console.log('🖱️ onClick tetiklendi');
              // Tıklamadan sonra kontrol için timeout
              setTimeout(() => {
                const input = e.target as HTMLInputElement;
                const file = input.files?.[0];
                console.log('⏰ Timeout sonrası file:', file);
                if (file && !preview) {
                  console.log('✅ File bulundu, işleniyor...');
                  handleFileSelect(file);
                }
              }, 500);
            }}
            disabled={isProcessing}
            className="block w-full text-sm text-slate-400
              file:mr-3 file:py-3 file:px-6
              file:rounded-lg file:border-0
              file:text-base file:font-semibold
              file:bg-purple-600 file:text-white
              hover:file:bg-purple-500
              active:file:bg-purple-700
              file:cursor-pointer
              cursor-pointer
              file:transition-colors"
          />
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="border-2 border-slate-600 rounded-lg p-4 bg-slate-700">
          <img src={preview} alt="Yüklenen etiket" className="max-h-64 mx-auto rounded-lg" />
          {!showEditForm && (
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                onPreviewChange(false); // Parent'a bildir
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="mt-4 w-full px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-500 active:bg-slate-400 touch-manipulation font-bold text-lg"
            >
              Yeni Fotoğraf Yükle
            </button>
          )}
        </div>
      )}

      {/* Loading */}
      {isProcessing && (
        <div className="flex items-center justify-center space-x-2 text-white bg-blue-900 p-4 rounded-lg">
          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="font-bold text-lg">🤖 Analiz ediliyor...</span>
        </div>
      )}

      {/* Edit Form */}
      {showEditForm && (
        <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
          <div className="flex items-start space-x-2 mb-4">
            <div className="flex-1">
              <p className="text-base font-bold text-blue-400 mb-3">
                {formData.width || formData.netWeight || formData.length 
                  ? '✨ AI okudu! Kontrol edin:' 
                  : '📝 Manuel giriş:'}
              </p>
              <form onSubmit={handleEditSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-bold text-slate-200 mb-1">Genişlik (mm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.width}
                    onChange={(e) => setFormData({...formData, width: e.target.value})}
                    placeholder="896"
                    className="w-full px-3 py-3 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-800 text-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-200 mb-1">Net Ağırlık (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.netWeight}
                      onChange={(e) => setFormData({...formData, netWeight: e.target.value})}
                      placeholder="59.9"
                      className="w-full px-3 py-3 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-800 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-200 mb-1">Uzunluk (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.length}
                      onChange={(e) => setFormData({...formData, length: e.target.value})}
                      placeholder="880"
                      className="w-full px-3 py-3 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-800 text-white"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-500 active:bg-blue-400 touch-manipulation"
                >
                  ✓ Devam Et
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
