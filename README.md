# Saham-RSI Stock Screener

Stock screener berbasis Node.js yang menggunakan indikator Stochastic RSI untuk mendeteksi sinyal beli pada saham US.

## Fitur

- **Multi-Timeframe**: Screening pada timeframe 1H dan 4H
- **Stochastic RSI**: Deteksi momentum dengan strategi "Kotak Hijau"
- **Telegram Notification**: Kirim notifikasi sinyal ke Telegram
- **Export CSV**: Hasil screening dapat diekspor ke file CSV
- **SMA 200 Filter**: Filter tren bullish/bearish berdasarkan harga vs SMA 200

## Persyaratan

- Node.js (v14+)
- npm/yarn

## Instalasi

```bash
npm install yahoo-finance2 technicalindicators
```

## Konfigurasi

Edit variabel di bagian konfigurasi:

```javascript
const USE_TELEGRAM = true;                    // Aktifkan notifikasi Telegram
const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN';  // Token bot Telegram
const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID';      // ID chat Telegram
const JEDA_WAKTU_MS = 1500;                   // Jeda antar request (ms)
```

## Strategi "Kotak Hijau"

Sinyal beli muncul ketika semua kondisi terpenuhi:

1. **Garis Biru di atas Garis Oranye**: %K > %D (bullish crossover)
2. **Momentum Naik**: %K saat ini > %K sebelumnya
3. **Area Oversold**: %K < 45 (belum di pucuk)
4. **Recovery**: %D > 10 (baru keluar dari oversold)

## Cara Pakai

```bash
node screener.js
```

## Output

- Console log hasil screening
- File CSV: `hasil_screening_1h.csv` dan `hasil_screening_4h.csv`
- Notifikasi Telegram (jika diaktifkan)

## Daftar Saham

Screener mencakup 141 saham US terbagi dalam kategori:
- Mega Cap
- Big Tech & AI
- Cloud/Software
- Internet & Social
- Fintech & Crypto
- China ADR
- EV & Future Tech
- Telecom & Media
- Healthcare
- Industrial & Defense
- Consumer
- High Growth/Momentum
- Networking/Chip Support