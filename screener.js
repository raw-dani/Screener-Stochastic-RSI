require('dotenv').config();
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();
const { StochasticRSI, SMA } = require('technicalindicators');
const fs = require('fs');
const https = require('https');

const RUN_INTERVAL = 30 * 60 * 1000; // 30 minutes

// ==========================================
// CONFIGURATION / PENGATURAN USER
// ==========================================
const JEDA_WAKTU_MS = 1500;

const USE_TELEGRAM = true;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

// Daftar Saham AS
const symbols = [
    // === TOP MEGA CAP S&P 500 ===
    'NVDA',
    'AAPL',
    'MSFT',
    'AMZN',
    'GOOGL',
    'GOOG',
    'AVGO',
    'TSLA',
    'META',
    'WMT',
    'BRK.B',
    'LLY',
    'MU',
    'JPM',
    'AMD',
    'XOM',
    'V',
    'ORCL',
    'INTC',
    'JNJ',
    'CSCO',
    'COST',
    'MA',
    'CAT',
    'CVX',
    'ABBV',
    'NFLX',
    'UNH',
    'LRCX',
    'BAC',
    'KO',
    'HD',
    'MRK',
    'CRM',
    'PG',
    'PM',
    'GE',
    'IBM',
    'WFC',
    'MS',
    'GS',
    'TMO',
    'ISRG',
    'LIN',
    'PEP',
    'ADBE',
    'PLTR',
    'PANW',
    'CRWD',

    // === SEMICONDUCTOR & AI ===
    'QCOM',
    'TXN',
    'AMAT',
    'KLAC',
    'ASML',
    'TSM',
    'MRVL',
    'ANET',
    'SNPS',
    'CDNS',
    'ADI',
    'MPWR',
    'NXPI',
    'MCHP',
    'ON',
    'SWKS',
    'QRVO',
    'CRUS',
    'SMCI',

    // === CLOUD / SOFTWARE ===
    'NOW',
    'INTU',
    'SHOP',
    'WDAY',
    'TEAM',
    'HUBS',
    'MDB',
    'DDOG',
    'NET',
    'ZS',
    'OKTA',
    'DOCU',
    'ZM',
    'TWLO',
    'SQ',
    'PAYC',
    'SNOW',

    // === INTERNET / MEDIA ===
    'UBER',
    'SPOT',
    'DASH',
    'ETSY',
    'ROKU',
    'PINS',
    'SNAP',

    // === FINANCIAL / FINTECH ===
    'AXP',
    'BLK',
    'SCHW',
    'C',
    'BAC',
    'USB',
    'PNC',
    'SOFI',
    'HOOD',
    'COIN',
    'PYPL',

    // === HEALTHCARE & BIOTECH ===
    'AMGN',
    'GILD',
    'BIIB',
    'PFE',
    'MDT',
    'VRTX',
    'REGN',
    'CI',
    'HUM',
    'CVS',

    // === INDUSTRIAL & DEFENSE ===
    'HON',
    'RTX',
    'LMT',
    'NOC',
    'GD',
    'BA',
    'DE',
    'ETN',
    'UPS',
    'UNP',
    'MMM',

    // === CONSUMER ===
    'MCD',
    'SBUX',
    'NKE',
    'LOW',
    'TGT',
    'BKNG',
    'DIS',
    'CMCSA',
    'TMUS',
    'VZ',

    // === ENERGY ===
    'SLB',
    'COP',
    'EOG',
    'PSX',
    'MPC',
    'OXY',

    // === HIGH GROWTH / MOMENTUM ===
    'APP',
    'DKNG',
    'TTD',
    'FIVN',

    // === CHINA ADR (NON S&P500 OPTIONAL) ===
    'BABA',
    'JD',
    'BIDU',
    'PDD',
    'BILI',
    'IQ',

    // === EV / FUTURE TECH (NON S&P500 OPTIONAL) ===
    'RIVN',
    'LCID',
    'NIO',
    'LI',
    'XPEV'
];

// ==========================================
// FUNCTION UTAMA
// ==========================================

function sendTelegramMessage(message) {
    return new Promise((resolve) => {
        if (!USE_TELEGRAM || !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            resolve();
            return;
        }
        
        const data = JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        });

        const options = {
            hostname: 'api.telegram.org',
            port: 443,
            path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => responseBody += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('📱 ✅ Pesan Telegram berhasil dikirim ke HP Anda!');
                } else {
                    console.error(`📱 ❌ Gagal kirim Telegram (Error ${res.statusCode}): ${responseBody}`);
                }
                resolve();
            });
        });

        req.on('error', (error) => {
            console.error(`📱 ❌ [Network Error Telegram] ${error.message}`);
            resolve();
        });

        req.write(data);
        req.end();
    });
}

function sendNotification(message) {
    if (USE_TELEGRAM && TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        return sendTelegramMessage(message);
    }
    return Promise.resolve();
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function analyzeStock(symbol, timeframe = '1h') {
    try {
        const today = new Date();
        const startDate = new Date();
        // 2H butuh lebih banyak data historis karena periode yang lebih panjang
        const daysBackMap = { '1h': 60, '2h': 120, '4h': 240 };
        const intervalMap  = { '1h': '1h',  '2h': '1h',  '4h': '1h' }; // Yahoo Finance tidak punya endpoint 2H natif, agregasi manual
        const daysBack = daysBackMap[timeframe] || 60;
        startDate.setDate(today.getDate() - daysBack);

        const result = await yahooFinance.chart(symbol, {
            period1: startDate,
            period2: today,
            interval: intervalMap[timeframe] || '1h',
            includePrePost: false
        });

        if (!result.quotes || result.quotes.length === 0) return null;

        const validCandles = result.quotes.filter(
            candle => candle.close !== undefined && candle.close !== null
        );
        let closes = validCandles.map(candle => candle.close);
        
        // Agregasi menjadi timeframe yang diinginkan
        if (timeframe === '2h') {
            closes = aggregateTo2H(validCandles);
        } else if (timeframe === '4h') {
            closes = aggregateTo4H(validCandles);
        }

        // 2H butuh lebih sedikit minimum candle dari 4H, lebih banyak dari 1H
        const minCandles = timeframe === '1h' ? 220 : timeframe === '2h' ? 150 : 100;
        if (closes.length < minCandles) {
            return null;
        }

        const sma200Values = SMA.calculate({ period: 200, values: closes });
        const currentSMA200 = sma200Values[sma200Values.length - 1];
        const lastClosePrice = closes[closes.length - 1];

        const isBullish = lastClosePrice >= currentSMA200;

        const inputStochRSI = {
            values: closes,
            rsiPeriod: 14,
            stochasticPeriod: 14,
            kPeriod: 3,
            dPeriod: 3,
        };

        const stochRsiData = StochasticRSI.calculate(inputStochRSI);
        if (stochRsiData.length < 2) return null;

        const current = stochRsiData[stochRsiData.length - 1];
        const previous = stochRsiData[stochRsiData.length - 2];

        const isBlueAboveOrange = current.k > current.d;
        const isPointingUp = current.k > previous.k;
        const isStillInLowerHalf = current.k < 45; 
        const isFromOversold = current.d > 10;

        if (isBlueAboveOrange && isPointingUp && isStillInLowerHalf && isFromOversold) {
            return {
                status: 'SIGNAL_BUY',
                close: lastClosePrice.toFixed(2),
                sma200: currentSMA200.toFixed(2),
                k: current.k.toFixed(2),
                d: current.d.toFixed(2),
                isBullish: isBullish,
                timeframe: timeframe
            };
        }

    } catch (error) {
        if (!error.message.includes("No data found")) {
            console.error(`\n❌ Error saat memproses ${symbol}: ${error.message}`);
        }
    }
    return null;
}

// Agregasi 2 candle 1H menjadi 1 candle 2H
function aggregateTo2H(candles) {
    const aggregated = [];
    for (let i = 0; i < candles.length; i += 2) {
        const chunk = candles.slice(i, i + 2);
        if (chunk.length === 2) {
            const open  = chunk[0].open;
            const high  = Math.max(...chunk.map(c => c.high));
            const low   = Math.min(...chunk.map(c => c.low));
            const close = chunk[1].close;
            aggregated.push({ ...chunk[1], open, high, low, close });
        }
    }
    return aggregated.map(c => c.close);
}

// Agregasi 4 candle 1H menjadi 1 candle 4H
function aggregateTo4H(candles) {
    const aggregated = [];
    for (let i = 0; i < candles.length; i += 4) {
        const chunk = candles.slice(i, i + 4);
        if (chunk.length === 4) {
            const open = chunk[0].open;
            const high = Math.max(...chunk.map(c => c.high));
            const low = Math.min(...chunk.map(c => c.low));
            const close = chunk[3].close;
            aggregated.push({ ...chunk[3], open, high, low, close });
        }
    }
    return aggregated.map(c => c.close);
}

async function runScreener(timeframe, label) {
    console.log(`==================================================`);
    console.log(`🚀 MEMULAI US STOCK SCREENER (TF: ${label})`);
    console.log(`==================================================\n`);

    const buySignals = [];

    for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i];
        process.stdout.write(`[${i + 1}/${symbols.length}] Memeriksa ${symbol.padEnd(6)} ... `);

        const analysis = await analyzeStock(symbol, timeframe);

        if (analysis && analysis.status === 'SIGNAL_BUY') {
            if (analysis.isBullish) {
                console.log(`✅ [SETUP KOTAK HIJAU!] Close: $${analysis.close} | %K: ${analysis.k} (Tren Naik/Bullish)`);
            } else {
                console.log(`⚠️ [SETUP KOTAK HIJAU!] Close: $${analysis.close} | %K: ${analysis.k} (Info: < SMA 200)`);
            }
            buySignals.push({ symbol, ...analysis });
        } else {
            console.log(`❌ Tidak ada momentum.`);
        }

        await sleep(JEDA_WAKTU_MS);
    }

    console.log('\n=========================================');
    console.log(`🏁 SCREENING ${label} SELESAI!`);
    console.log(`Ditemukan ${buySignals.length} saham yang siap untuk dianalisa lebih lanjut.`);
    console.log('=========================================');

    if (buySignals.length > 0) {
        const csvFile = `hasil_screening_${label.toLowerCase().replace(' ', '_')}.csv`;
        let csvContent = `Symbol,Close Price,Stoch_K,Stoch_D,SMA_200_${label},Trend,Timestamp\n`;
        buySignals.forEach(s => {
            const trendLabel = s.isBullish ? 'Bullish' : 'Bearish (< SMA 200)';
            const now = new Date();
            const timestamp = now.toLocaleDateString('id-ID') + ' ' + now.toLocaleTimeString('id-ID');
            csvContent += `${s.symbol},${s.close},${s.k},${s.d},${s.sma200},"${trendLabel}","${timestamp}"\n`;
        });
        
        fs.writeFileSync(csvFile, csvContent, 'utf8');
        console.log(`📊 Berhasil diekspor ke file: ${csvFile}`);

        // ===== NOTIFIKASI TELEGRAM (hanya 2H dan 4H, format simple HTML) =====
        if (label === '1H') return; // 1H tidak dikirim notifikasi

        const TELEGRAM_MAX_LEN = 4096;

        // Format 1 baris: ✅ <b>SYMBOL</b>  $Harga  %K:%k  %D:%d
        const lines = buySignals.map(s => {
            const icon  = s.isBullish ? '✅' : '⚠️';
            const bold  = s.isBullish
                ? `<b style="color:#22c55e">${s.symbol}</b>`
                : `<b style="color:#eab308">${s.symbol}</b>`;
            return `${icon} ${bold}  $${s.close}  %K:${s.k}  %D:${s.d}`;
        });

        const header = `[${label}] Sinyal Beli — ${buySignals.length} saham\n`;
        const body   = lines.join('\n');
        const msg    = header + body;

        // Kirim utuh jika ≤ 4096, jika lebih bagi per bagian
        if (msg.length <= TELEGRAM_MAX_LEN) {
            await sendNotification(msg);
        } else {
            console.log(`⚠️ Pesan ${msg.length} chars melebihi batas, dibagi menjadi beberapa pesan...`);
            let start = 0;
            while (start < lines.length) {
                const partLines = [];
                let len = header.length;
                for (let i = start; i < lines.length; i++) {
                    const lineLen = lines[i].length + 1;
                    if (len + lineLen > TELEGRAM_MAX_LEN - 20) break;
                    partLines.push(lines[i]);
                    len += lineLen;
                }
                await sendNotification(
                    `[${label}] Sinyal Beli (${start + 1}–${start + partLines.length} dari ${lines.length})\n` +
                    partLines.join('\n')
                );
                start += partLines.length;
                await sleep(300);
            }
        }
    }
    return buySignals;
}

async function startScreener() {
    await runScreener('1h', '1H');
    console.log('\n');
    await runScreener('2h', '2H');
    console.log('\n');
    await runScreener('4h', '4H');
}

startScreener();