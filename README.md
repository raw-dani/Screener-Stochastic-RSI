# Saham-RSI Stock Screener

Stock screener berbasis Node.js yang menggunakan indikator Stochastic RSI untuk mendeteksi sinyal beli pada saham US.

## Fitur

- **Multi-Timeframe**: Screening pada timeframe 1H dan 4H
- **Stochastic RSI**: Deteksi momentum dengan strategi "Kotak Hijau"
- **Telegram Notification**: Kirim notifikasi sinyal ke Telegram
- **WhatsApp Notification**: Kirim notifikasi via WhatsApp Web (gratis)
- **Export CSV**: Hasil screening dapat diekspor ke file CSV
- **SMA 200 Filter**: Filter tren bullish/bearish berdasarkan harga vs SMA 200

## Persyaratan

- Node.js (v14+)
- npm/yarn
- Chrome/Chromium (untuk WhatsApp Web)

## Instalasi

```bash
npm install yahoo-finance2 technicalindicators
```

## Konfigurasi

Buat file `.env` dengan konfigurasi:

```bash
# Telegram (opsional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# WhatsApp Web (gratis)
USE_WHATSAPP=false
WHATSAPP_TARGET=6281234567890  # nomor WhatsApp tanpa + dan 0
```

**Catatan WhatsApp**: Pada pertama kali dijalankan, akan muncul QR Code yang harus discan menggunakan WhatsApp Anda. Setelah terhubung, session akan tersimpan otomatis.

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