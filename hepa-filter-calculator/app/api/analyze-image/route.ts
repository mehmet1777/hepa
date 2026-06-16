import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Başarılı key index'ini hatırla (memory'de tut)
let lastSuccessfulKeyIndex = 0;

export async function POST(request: NextRequest) {
  try {
    console.log('=== API Route Called ===');
    
    const { image } = await request.json();

    if (!image) {
      console.error('No image provided');
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Çoklu API key desteği
    const apiKeys = [
      process.env.GEMINI_API_KEY_1,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
      process.env.GEMINI_API_KEY_4,
      process.env.GEMINI_API_KEY_5,
      process.env.GEMINI_API_KEY_6,
      process.env.GEMINI_API_KEY_7,
      process.env.GEMINI_API_KEY_8,
      process.env.GEMINI_API_KEY_9,
      process.env.GEMINI_API_KEY_10,
    ].filter(Boolean); // Boş olanları filtrele

    if (apiKeys.length === 0) {
      console.error('No API keys found');
      return NextResponse.json({ 
        error: 'API key bulunamadı. .env.local dosyasını kontrol edin.'
      }, { status: 500 });
    }

    console.log(`Toplam ${apiKeys.length} API key bulundu`);
    console.log(`Son başarılı key: ${lastSuccessfulKeyIndex + 1}`);

    // Base64 görüntüyü hazırla
    const base64Data = image.split(',')[1];
    const mimeType = image.split(';')[0].split(':')[1] || 'image/png';
    
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };

    const prompt = `Bu HEPA filtre etiketi görüntüsünden şu bilgileri çıkar:
1. Width (Genişlik) - mm cinsinden sayı olarak
2. Net Weight (Net Ağırlık) - kg cinsinden sayı olarak  
3. Length (Uzunluk) - metre cinsinden sayı olarak

Etikette tabloda şu bilgiler var:
- "Width" satırında genişlik değeri (örn: 896.0 mm veya 896 mm)
- "Net Weight" satırında net ağırlık (örn: 59.9 kg)
- "Length" satırında uzunluk (örn: 880 m)

SADECE bu JSON formatında cevap ver (başka hiçbir açıklama veya metin ekleme):
{
  "width": 896,
  "netWeight": 59.9,
  "length": 880
}`;

    // Tüm API keyleri dene (son başarılı key'den başla)
    let lastError = null;
    
    // Döngüyü son başarılı key'den başlat
    for (let attempt = 0; attempt < apiKeys.length; attempt++) {
      const i = (lastSuccessfulKeyIndex + attempt) % apiKeys.length;
      
      try {
        const apiKey = apiKeys[i];
        if (!apiKey) continue; // undefined ise atla
        
        console.log(`Deneniyor: API Key ${i + 1}/${apiKeys.length}`);
        
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const result = await model.generateContent([prompt, imagePart]);
        const response = result.response;
        const text = response.text();

        console.log(`✅ API Key ${i + 1} başarılı!`);
        
        // Başarılı key'i hatırla
        lastSuccessfulKeyIndex = i;
        console.log(`Başarılı key kaydedildi: ${i + 1}`);
        
        console.log('Gemini Response text:', text);

        // JSON PARSE İYİLEŞTİRME: ```json bloklarını temizle
        const cleaned = text
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();

        console.log('Cleaned response:', cleaned);

        // JSON'u çıkar
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[0]);
          console.log('Parsed data:', data);
          return NextResponse.json(data);
        } else {
          console.error('Could not parse JSON from response');
          return NextResponse.json({ 
            error: 'JSON parse edilemedi', 
            rawResponse: text 
          }, { status: 500 });
        }
        
      } catch (error: any) {
        console.log(`❌ API Key ${i + 1} hata: ${error.message}`);
        
        // 403, 429 veya quota hatası mı kontrol et (status code ile)
        const isQuotaError = 
          error.status === 403 ||
          error.status === 429 ||
          error.message?.includes('403') || 
          error.message?.includes('429') ||
          error.message?.includes('quota') ||
          error.message?.includes('Too Many Requests') ||
          error.message?.includes('RESOURCE_EXHAUSTED') ||
          error.message?.includes('denied access');
        
        if (isQuotaError) {
          console.log(`⚠️ API Key ${i + 1} limiti doldu veya erişim engellendi, sonrakine geçiliyor...`);
          lastError = error;
          continue; // Sonraki key'i dene
        } else {
          // Başka bir hata, dur
          throw error;
        }
      }
    }

    // Tüm keyler tükendi
    console.error('Tüm API keylerin limiti doldu');
    return NextResponse.json(
      { 
        error: 'Günlük analiz limiti doldu. Lütfen yarın tekrar deneyin.',
        details: lastError?.message 
      },
      { status: 429 }
    );
    
  } catch (error: any) {
    console.error('=== FULL ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    return NextResponse.json(
      { error: `Görüntü analiz edilemedi: ${error.message}` },
      { status: 500 }
    );
  }
}
