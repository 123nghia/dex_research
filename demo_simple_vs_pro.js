// Demo Simple Mode vs Pro Mode for buying $100,000 BTC
// Run: node demo_simple_vs_pro.js

const CONFIG = {
  oraclePrice: 30000,
  spreadRate: 0.0004, // 0.04%
  poolLiquidityBTC: 10000,
  impactFactor: 0.5,
  orderValueUSD: 100000,
  // Pro/CLOB demo orderbook (asks)
  asks: [
    { price: 30010, size: 1 },
    { price: 30015, size: 2 },
    { price: 30020, size: 5 },
    { price: 30025, size: 10 }
  ]
};

function toUSD(n) { return `$${n.toFixed(2)}`; }

// Simple Mode calculations
function simpleModeExecPrice(qtyBTC, cfg) {
  const spread = cfg.oraclePrice * cfg.spreadRate;
  const impactRatio = (qtyBTC / cfg.poolLiquidityBTC) * cfg.impactFactor;
  const impact = cfg.oraclePrice * impactRatio;
  return cfg.oraclePrice + spread + impact;
}

// Pro Mode (CLOB) average fill price for market buy qty
function proModeAvgPrice(qtyBTC, asks) {
  let remaining = qtyBTC;
  let totalCost = 0;
  for (const level of asks) {
    const fill = Math.min(remaining, level.size);
    if (fill > 0) {
      totalCost += fill * level.price;
      remaining -= fill;
    }
    if (remaining <= 0) break;
  }
  if (remaining > 1e-12) throw new Error('Orderbook không đủ thanh khoản cho ví dụ');
  return totalCost / qtyBTC;
}

function main() {
  const cfg = CONFIG;
  const qtyBTC = cfg.orderValueUSD / cfg.oraclePrice; // 100k / 30k = 3.3333 BTC

  // Simple
  const pxSimple = simpleModeExecPrice(qtyBTC, cfg);
  const notionalSimple = qtyBTC * pxSimple;

  // Pro
  const pxPro = proModeAvgPrice(qtyBTC, cfg.asks);
  const notionalPro = qtyBTC * pxPro;

  console.log('════════ Aster Demo: Simple vs Pro ════════');
  console.log(`Order: BUY $${cfg.orderValueUSD.toLocaleString()} BTC (≈ ${qtyBTC.toFixed(4)} BTC)`);
  console.log('\nSimple Mode');
  console.log(`  Oracle: ${toUSD(cfg.oraclePrice)} | Spread: ${(cfg.spreadRate*100).toFixed(2)}%`);
  const impactUSD = cfg.oraclePrice * (qtyBTC / cfg.poolLiquidityBTC) * cfg.impactFactor;
  console.log(`  Impact: ${toUSD(impactUSD)} (size/liquidity)`);
  console.log(`  Execution Price: ${toUSD(pxSimple)}`);
  console.log(`  Notional: ${toUSD(notionalSimple)}`);

  console.log('\nPro Mode (CLOB)');
  console.log('  Asks used:', cfg.asks.map(a => `${a.size}@${a.price}`).join(', '));
  console.log(`  Average Fill Price: ${toUSD(pxPro)}`);
  console.log(`  Notional: ${toUSD(notionalPro)}`);

  const diff = pxSimple - pxPro;
  const diffPct = (diff / pxPro) * 100;
  console.log('\nSo sánh');
  console.log(`  Simple đắt hơn: ${toUSD(diff)} (${diffPct.toFixed(3)}%)`);
}

main();
