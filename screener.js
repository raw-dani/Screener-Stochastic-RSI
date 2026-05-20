require('dotenv').config();
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();
const { StochasticRSI, SMA } = require('technicalindicators');
const fs = require('fs');
const https = require('https');

// ==========================================
// CONFIGURATION / PENGATURAN USER
// ==========================================
const USE_TELEGRAM = true; 
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''; 
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

const USE_WHATSAPP = process.env.USE_WHATSAPP === 'true';
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
const TWILIO_WHATSAPP_TO = process.env.TWILIO_WHATSAPP_TO || '';

const JEDA_WAKTU_MS = 1500;

// Daftar Saham AS
const symbols = [
    // === MEGA CAP ===
	'NVDA',   
	'GOOGL',  
	'GOOG',   
	'AAPL',   
	'MSFT',   
	'AMZN',   
	'AVGO',   
	'META',   
	'TSLA',   
	'BRK.B',  
	'WMT',    
	'LLY',    
	'JPM',    
	'V',      
	'MA',     
	'XOM',    
	'JNJ',    
	'ORCL',  
	'COST',   
	'HD',     
	'CSCO',   
	'BAC',    
	'CVX',    
	'IBM',    

	// === BIG TECH & AI ===
	'AMD',
	'INTC',
	'QCOM',
	'TXN',
	'MU',
	'AMAT',
	'LRCX',
	'KLAC',
	'ASML',
	'TSM',
	'PANW',
	'CRWD',
	'FTNT',
	'PLTR',
	'SNOW',
	'MDB',
	'DDOG',
	'NET',
	'ZS',
	'OKTA',
	'SNPS',
	'MRVL',
	'ANET',
	'SMCI',

	// === CLOUD / SOFTWARE ===
	'CRM',
	'ADBE',
	'NOW',
	'INTU',
	'SHOP',
	'WDAY',
	'TEAM',
	'HUBS',
	'DOCU',
	'ZM',
	'TWLO',
	'PAYC',
	'SQ',

	// === INTERNET & SOCIAL ===
	'NFLX',
	'SPOT',
	'UBER',
	'LYFT',
	'PINS',
	'SNAP',
	'ROKU',
	'ETSY',

	// === FINTECH & CRYPTO ===
	'COIN',
	'HOOD',
	'PYPL',
	'SOFI',
	'AXP',
	'GS',
	'BLK',
	'SCHW',
	'BKR',

	// === CHINA ADR ===
	'BABA',
	'JD',
	'BIDU',
	'NTSE',
	'BILI',
	'IQ',
	'PDD',

	// === EV & FUTURE TECH ===
	'NIO',
	'LI',
	'XPEV',
	'RIVN',
	'LCID',

	// === TELECOM & MEDIA ===
	'TMUS',
	'VZ',
	'CMCSA',
	'DIS',

	// === HEALTHCARE ===
	'UNH',
	'ABBV',
	'MRK',
	'PFE',
	'AMGN',
	'ISRG',
	'GILD',
	'BIIB',
	'TMO',

	// === INDUSTRIAL & DEFENSE ===
	'HON',
	'CAT',
	'GE',
	'BA',
	'RTX',
	'LMT',
	'MMM',
	'NOC',
	'GD',
	'UPS',
	'UNP',

	// === CONSUMER ===
	'PG',
	'KO',
	'PEP',
	'MCD',
	'SBUX',
	'NKE',
	'KDP',
	'CPB',
	'WBA',
	'LOW',

	// === HIGH GROWTH / MOMENTUM ===
	'APP',
	'RUM',
	'FUBO',
	'DKNG',
	'PTON',
	'TTD',
	'FIVN',

	// === NETWORKING / CHIP SUPPORT ===
	'MPWR',
	'SWKS',
	'QRVO',
	'CRUS',
	'SYNA',
	'COMM',
	'INFN',
	'ADI',
	'AVNW',
	'FFIV',
];

// ==========================================
// FUNCTION UTAMA
// ==========================================

// FUNGSI TELEGRAM YANG SUDAH DIPERBAIKI
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

// FUNGSI WHATSAPP MENGGUNAKAN TWILIO API
function sendWhatsAppMessage(message) {
    return new Promise((resolve) => {
        if (!USE_WHATSAPP || !TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_TO) {
            resolve();
            return;
        }

        const formData = new URLSearchParams();
        formData.append('From', TWILIO_WHATSAPP_FROM);
        formData.append('To', `whatsapp:${TWILIO_WHATSAPP_TO}`);
        formData.append('Body', message);
        const encodedData = formData.toString();

        const options = {
            hostname: 'api.twilio.com',
            port: 443,
            path: `/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64'),
                'Content-Length': Buffer.byteLength(encodedData)
            }
        };

        const req = https.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => responseBody += chunk);
            res.on('end', () => {
                if (res.statusCode === 201 || res.statusCode === 200) {
                    console.log('💬 ✅ Pesan WhatsApp berhasil dikirim!');
                } else {
                    console.error(`💬 ❌ Gagal kirim WhatsApp (Error ${res.statusCode}): ${responseBody}`);
                }
                resolve();
            });
        });

        req.on('error', (error) => {
            console.error(`💬 ❌ [Network Error WhatsApp] ${error.message}`);
            resolve();
        });

        req.write(encodedData);
        req.end();
    });
}

function sendNotification(message) {
    const promises = [];
    if (USE_TELEGRAM && TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        promises.push(sendTelegramMessage(message));
    }
    if (USE_WHATSAPP && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_TO) {
        promises.push(sendWhatsAppMessage(message));
    }
    return Promise.all(promises);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function analyzeStock(symbol, timeframe = '1h') {
    try {
        const today = new Date();
        const startDate = new Date();
        const daysBack = timeframe === '1h' ? 60 : 240;
        startDate.setDate(today.getDate() - daysBack);

        const result = await yahooFinance.chart(symbol, {
            period1: startDate,
            period2: today,
            interval: '1h',
            includePrePost: true
        });

        if (!result.quotes || result.quotes.length === 0) return null;

        const validCandles = result.quotes.filter(candle => candle.close !== undefined && candle.close !== null);
        let closes = validCandles.map(candle => candle.close);
        
        if (timeframe === '4h') {
            closes = aggregateTo4H(validCandles);
        }

        const minCandles = timeframe === '1h' ? 220 : 100;
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
            csvContent += `${s.symbol},${s.close},${s.k},${s.d},${s.sma200},${trendLabel},${new Date().toLocaleString()}\n`;
        });
        
        fs.writeFileSync(csvFile, csvContent, 'utf8');
        console.log(`📊 Berhasil diekspor ke file: ${csvFile}`);

        const TELEGRAM_MAX_LEN = 4096;

        function formatSignalEntry(s) {
            const icon = s.isBullish ? "✅" : "⚠️";
            const trendWarning = s.isBullish ? "" : "\n  <i>⚠️ Info: Harga di bawah SMA 200</i>";
            return `${icon} <b>${s.symbol}</b> - Harga: $${s.close} \n  (Stoch %K: ${s.k} menembus %D: ${s.d})${trendWarning}`;
        }

        function buildHeader(total, tf) {
            return `🔔 <b>[${tf} STOCH-RSI BUY ALERT]</b> 🔔\n\nDitemukan <b>${total}</b> sinyal:\n\n`;
        }

        function buildFooter(startIdx, endIdx, total) {
            return `\n<i>Menampilkan ${startIdx + 1}–${Math.min(endIdx, total)} dari ${total} sinyal</i>`;
        }

        const total = buySignals.length;
        const headerText = buildHeader(total, label);
        const footerLen = 80;

        const entries = buySignals.map(formatSignalEntry).join('\n\n');

        const fullText = headerText + entries + buildFooter(0, total, total);

        if (fullText.length <= TELEGRAM_MAX_LEN) {
            await sendNotification(fullText);
        } else {
            console.log(`⚠️ Pesan terlalu panjang (${fullText.length} chars), membagi menjadi ${Math.ceil(entries.length / (TELEGRAM_MAX_LEN - headerText.length - footerLen))} pesan...`);
            let start = 0;
            let part = 1;
            while (start < entries.length) {
                const available = TELEGRAM_MAX_LEN - headerText.length - footerLen - 10;
                let end = start + available;
                if (end < entries.length) {
                    const lastNewline = entries.lastIndexOf('\n', end);
                    if (lastNewline > start) end = lastNewline + 1;
                }
                const chunk = entries.substring(start, end);
                const isLastPart = end >= entries.length;
                const partMsg = buildHeader(total, label) + chunk + (isLastPart ? buildFooter(start, entries.length, total) : '');
                await sendNotification(partMsg);
                start = end;
                part++;
                await sleep(300);
            }
        }
    }
    return buySignals;
}

async function startScreener() {
    await runScreener('1h', '1H');
    console.log('\n');
    await runScreener('4h', '4H');
}

startScreener();