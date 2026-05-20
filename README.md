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
npm install whatsapp-web.js
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

## Panduan WhatsApp Setup

Ada 2 opsi WhatsApp notification:

### Opsi 1: WhatsApp Web (Gratis, Perlu Scan QR)
1. Set `USE_WHATSAPP=true` di file `.env`
2. Jalankan screener: `node screener.js`
3. Pada pertama kali, akan muncul QR Code di console
4. Buka WhatsApp di HP Anda → Settings → Linked Devices → Link a Device
5. Scan QR Code yang muncul di console
6. Setelah terhubung, session akan tersimpan di folder `.wwebjs_auth`

**Catatan:**
- Hanya mendukung WhatsApp **personal** (bukan Business)
- Jika gagal, coba hapus folder `.wwebjs_auth` dan ulangi

### Opsi 2: CallMeBot API (Gratis, Tanpa Scan QR)
Jika WhatsApp Web tidak berhasil, gunakan CallMeBot:
1. Kirim pesan "join Glory Mango" ke +34 623 636 975 via WhatsApp
2. Anda akan menerima API Key via WhatsApp
3. Set di `.env`:
   ```bash
   USE_CALLMEBOT=true
   CALLMEBOT_API_KEY=your_api_key_dari_whatsapp
   WHATSAPP_TARGET=6281234567890
   ```

**Catatan:**
- Batas 50 pesan/hari
- Tidak perlu scan QR Code
- Cocok untuk penggunaan pribadi

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