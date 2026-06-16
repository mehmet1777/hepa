# HEPA Filtre Hesaplayıcı

HEPA filtre rulolarının kalan kilosunu ve metresini hesaplayan Next.js web uygulaması.

## Özellikler

- 📸 Etiket fotoğrafı yükleme
- 🔍 OCR ile otomatik veri okuma (Tesseract.js)
- 📏 Çap girişi ile kalan hesaplama
- 📊 Görsel sonuç gösterimi
- 📱 Mobil uyumlu tasarım
- ⚡ Vercel'de ücretsiz deploy

## Kullanılan Teknolojiler

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Tesseract.js

## Kurulum

```bash
npm install
```

## Geliştirme

```bash
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

## Vercel'e Deploy

1. Projeyi GitHub'a yükleyin
2. [Vercel](https://vercel.com)'e giriş yapın
3. "New Project" tıklayın
4. GitHub reponuzu seçin
5. Deploy edin

## Hesaplama Formülleri

```
ratio = (diameter / 75)²
remainingKg = netWeight × ratio
remainingLength = length × ratio
```

## Örnek Kullanım

1. Etiket fotoğrafını yükleyin
2. OCR otomatik olarak Grade, Net Weight ve Length bilgilerini okur
3. Mevcut rulo çapını girin (cm)
4. "Hesapla" butonuna basın
5. Kalan kilogram ve metre sonuçlarını görün

## Lisans

MIT
