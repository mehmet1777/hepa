'use client';

import { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { FilterData } from './FilterCalculator';

interface ImageUploadProps {
  onDataExtracted: (data: FilterData) => void;
}

export function ImageUpload({ onDataExtracted }: ImageUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({ width: '', netWeight: '', length: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractDataFromText = (text: string): FilterData | null => {
    console.log('🔍 Metin analizi başlıyor...');
    console.log('Ham metin:', text);
    
    let width = 0;
    let netWeight = 0;
    let length = 0;

    // Tüm sayıları çıkar
    const allNumbers = text.match(/\d+\.?\d*/g)?.map(n => parseFloat(n)) || [];
    console.log('Bulunan tüm sayılar:', allNumbers);

    // PATTERN MATCHING - sadece sayı aralıklarına göre
    
    // 1. Net Weight: 50-70 arası EN KÜÇÜK sayı (Net < Gross)
    const weightCandidates = allNumbers.filter(n => n >= 50 && n <= 70).sort((a, b) => a - b);
    if (weightCandidates.length > 0) {
      netWeight = weightCandidates[0]; // En küçüğü al
      console.log('✅ Net Weight bulundu:', netWeight);
    }

    // 2. Width: 890-900 arası (genelde 896)
    const widthCandidates = allNumbers.filter(n => n >= 890 && n <= 900);
    if (widthCandidates.length > 0) {
      width = widthCandidates[0];
      console.log('✅ Width bulundu:', width);
    } else {
      // Alternatif: 800-950 arası
      const altWidthCandidates = allNumbers.filter(n => n >= 800 && n <= 950);
      if (altWidthCandidates.length > 0) {
        width = altWidthCandidates[0];
        console.log('✅ Width bulundu (geniş aralık):', width);
      }
    }

    // 3. Length: 850-900 arası ama width'ten FARKLI
    const lengthCandidates = allNumbers.filter(n => n >= 850 && n <= 900 && n !== width);
    if (lengthCandidates.length > 0) {
      length = lengthCandidates[0];
      console.log('✅ Length bulundu:', length);
    } else {
      // Alternatif: 700-1000 arası, width'ten farklı
      const altLengthCandidates = allNumbers.filter(n => n >= 700 && n <= 1000 && n !== width);
      if (altLengthCandidates.length > 0) {
        // En büyüğü al (genelde length width'ten büyük değilse eşit)
        length = Math.max(...altLengthCandidates);
        console.log('✅ Length bulundu (geniş aralık):', length);
      }
    }

    // 4. Eğer length hala bulunamadıysa ve çok sayı varsa
    if (!length && allNumbers.length > 10) {
      // 788, 880, 900 gibi 3 haneli sayılardan width olmayan en büyüğü
      const bigNumbers = allNumbers.filter(n => n >= 700 && n <= 1000 && n !== width);
      if (bigNumbers.length > 0) {
        length = Math.max(...bigNumbers);
        console.log('⚠️ Length tahmin edildi (büyük sayılar):', length);
      }
    }

    console.log('📊 Final Sonuç:', { width, netWeight, length });

    if (width && netWeight && length) {
      return { width, netWeight, length };
    }

    console.log('❌ Yeterli veri bulunamadı');
    return null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    // Önizleme oluştur
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => console.log(m),
        tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT,
      });

      setOcrText(text);
      console.log('=== OCR HAM METİN ===');
      console.log(text);
      console.log('=== OCR HAM METİN BİTTİ ===');

      const extractedData = extractDataFromText(text);
      
      if (extractedData) {
        // OCR başarılı - direkt kullan
        console.log('✅ OCR Başarılı:', extractedData);
        onDataExtracted(extractedData);
      } else {
        // OCR başarısız - düzenleme formu göster
        console.log('❌ OCR Başarısız - Manuel giriş gerekli');
        setShowEditForm(true);
        
        // Yine de tahmin yapmayı dene - sizin etiket formatınıza özel
        const numbers = text.match(/\d+\.?\d*/g);
        if (numbers && numbers.length >= 3) {
          const nums = numbers.map(n => parseFloat(n)).filter(n => n > 0);
          console.log('Bulunan sayılar:', nums);
          
          // Etiketinize özel tahminler:
          // Width: 890-900 arası (896)
          // Net Weight: 50-65 arası (59.9)
          // Length: 850-900 arası ama width'ten farklı (880)
          
          const widthGuess = nums.find(n => n >= 890 && n <= 900);
          const weightGuess = nums.find(n => n >= 50 && n <= 65);
          const lengthGuess = nums.find(n => n >= 850 && n <= 900 && n !== widthGuess);
          
          console.log('Tahminler:', { widthGuess, weightGuess, lengthGuess });
          
          setFormData({
            width: widthGuess ? widthGuess.toString() : '',
            netWeight: weightGuess ? weightGuess.toString() : '',
            length: lengthGuess ? lengthGuess.toString() : '',
          });
        } else {
          setFormData({ width: '', netWeight: '', length: '' });
        }
      }
    } catch (error) {
      console.error('OCR Hatası:', error);
      alert('Fotoğraf işlenirken bir hata oluştu. Manuel veri girişi yapabilirsiniz.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
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
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isProcessing}
        />
        
        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Yüklenen etiket"
              className="max-h-64 mx-auto rounded-lg"
            />
            {!showEditForm && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:bg-slate-400 transition-colors"
              >
                Yeni Fotoğraf Yükle
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full"
          >
            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 text-slate-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-slate-600">
                <span className="font-semibold">Etiket fotoğrafı yükleyin</span>
                <p className="text-sm mt-1">veya tıklayarak seçin</p>
              </div>
            </div>
          </button>
        )}
      </div>

      {isProcessing && (
        <div className="flex items-center justify-center space-x-2 text-slate-600">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Etiket okunuyor...</span>
        </div>
      )}

      {showEditForm && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-2 mb-4">
            <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800 mb-2">
                Otomatik okuma başarısız. Lütfen değerleri manuel girin:
              </p>
              <form onSubmit={handleEditSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Genişlik (mm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.width}
                    onChange={(e) => setFormData({...formData, width: e.target.value})}
                    placeholder="896"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Net Ağırlık (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.netWeight}
                      onChange={(e) => setFormData({...formData, netWeight: e.target.value})}
                      placeholder="59.9"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Uzunluk (m)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.length}
                      onChange={(e) => setFormData({...formData, length: e.target.value})}
                      placeholder="880"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Devam Et
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
