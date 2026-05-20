# Saham-RSI Stock Screener

Stock screener berbasis Node.js yang menggunakan indikator Stochastic RSI untuk mendeteksi sinyal beli pada saham US.

## Fitur

- **Multi-Timeframe**: Screening pada timeframe 1H dan 4H
- **Stochastic RSI**: Deteksi momentum dengan strategi "Kotak Hijau"
- **Telegram Notification**: Kirim notifikasi sinyal ke Telegram
- **WhatsApp Notification**: Kirim notifikasi via Twilio WhatsApp API
- **Export CSV**: Hasil screening dapat diekspor ke file CSV
- **SMA 200 Filter**: Filter tren bullish/bearish berdasarkan harga vs SMA 200

## Persyaratan

- Node.js (v14+)
- npm/yarn
- Twilio account (untuk WhatsApp)

## Instalasi

```bash
npm install yahoo-finance2 technicalindicators
```

## Konfigurasi

Buat file `.env` dengan konfigurasi:

```bash
# Telegram (opsional)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# WhatsApp via Twilio (opsional)
USE_WHATSAPP=true
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_WHATSAPP_TO=6281234567890
```

Atau set langsung di environment variables.

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