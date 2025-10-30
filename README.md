# Báo cáo: Aster Order Book & Matching Engine (Simple vs Pro)

Phiên bản: 1.0  
Phạm vi: Tổng quan kỹ thuật không dính code, có số liệu demo tái lập.

---

## 1) Tóm tắt
- Aster hỗ trợ 2 cơ chế khớp lệnh:
  - Simple Mode (ALP pool, batch 100–300ms): ẩn lệnh, chống MEV, giá = Oracle ± Spread ± Impact.
  - Pro Mode (CLOB): sổ lệnh tập trung, price–time priority, đi qua nhiều mức → VWAP.
- Demo cho lệnh BUY 100,000 USD BTC cho thấy tùy chiều sâu sổ lệnh, Pro có thể rẻ hơn Simple vài USD/BTC; khi sổ mỏng/biến động, Simple cho giá ổn định hơn (theo oracle).

---

## 2) Công thức & Quy trình

### 2.1 Simple Mode (ALP)
- Công thức giá:  
  `Execution = Oracle ± Spread ± Impact`
  - `Spread = Oracle × spreadRate(bps)`
  - `Impact = Oracle × (OrderSize / PoolLiquidity) × impactFactor`
- Quy trình: gom lệnh (100–300ms) → tính net demand → định giá theo công thức → fill 1 phát với ALP → phân bổ theo tỷ lệ → cập nhật vị thế/fee/PnL.

### 2.2 Pro Mode (CLOB)
- Cơ chế: sổ Bids/Asks theo từng mức giá; mỗi mức là hàng đợi FIFO.  
- Market BUY: khớp từ best ask trở lên, có thể đi 1..n mức;  
  `VWAP = Σ(price_level × filled_qty) / total_qty`.
- Quy tắc: price–time priority; TIF (GTC/IOC/FOK), Post‑only, Reduce‑only; Hidden/Iceberg giữ timestamp thật.

---

## 3) Thiết lập demo (tái lập)
- Tập tin: `demo_simple_vs_pro.js` (CLI) và `demo_simple_vs_pro.html` (UI tương tác).
- Tham số mặc định:
  - Oracle = 30,000 USD
  - SpreadRate = 4 bps (0.04% → $12)
  - Pool Liquidity = 10,000 BTC, ImpactFactor = 0.5
  - Order Value = 100,000 USD (≈ 3.3333 BTC)
  - Orderbook (asks): 30010:1, 30015:2, 30020:5, 30025:10

Chạy nhanh (CLI):
```bash
node demo_simple_vs_pro.js
```
Xem UI: mở `demo_simple_vs_pro.html` trong trình duyệt, thay tham số và preset.

---

## 4) Kết quả mẫu (mặc định)
- Qty ≈ 3.3333 BTC
- Simple Mode:
  - Spread = $12; Impact ≈ $5.00 → Execution ≈ $30,017.00
  - Notional ≈ $100,056.67
- Pro Mode (CLOB):
  - Fills: 1@30010, 2@30015, 0.3333@30020 → Avg ≈ $30,014.00
  - Notional ≈ $100,046.67
- So sánh: Simple đắt hơn ≈ $3.00/BTC (≈ 0.01%) trong thiết lập này.

Lưu ý: Khi order book mỏng, Pro có thể đắt hơn do slippage; Simple giữ ổn định quanh oracle nhưng chịu spread/impact.

---

## 5) Ưu/nhược & khuyến nghị
- Simple Mode
  - Ưu: ẩn ý định, chống MEV, UX nhanh gọn; giá dựa oracle; phù hợp lệnh nhỏ–trung bình.
  - Nhược: spread/impact; không tận dụng depth; không có lệnh nâng cao.
- Pro Mode
  - Ưu: kiểm soát bằng lệnh Market/Limit/IOC/FOK/Stop/Hidden/Iceberg; tận dụng chiều sâu; phù hợp lệnh lớn/chiến lược.
  - Nhược: lộ lệnh; có thể bị MEV; chịu slippage khi book mỏng.

Khuyến nghị:  
- Lệnh ≤ 100k USD, muốn đơn giản/anti‑MEV → Simple.  
- Lệnh lớn hoặc cần chiến lược/điều kiện → Pro; cân nhắc chia nhỏ, post‑only, hoặc hidden/iceberg.

---

## 6) Cách đọc kết quả trong HTML
- Simple: hiển thị từng bước Oracle → Spread → Impact → Execution → Notional.  
- Pro: hiển thị các mức giá đã ăn (fills) → giá TB → Notional.  
- Dòng "Chênh lệch" cho biết Simple đắt/rẻ hơn Pro bao nhiêu theo tham số nhập.

---

## 7) Gợi ý mở rộng
- Thêm phí maker/taker, funding, phí network.
- Cho phép nhập cả bids để mô phỏng SELL và so sánh 2 chiều.
- Biểu đồ depth và heatmap slippage theo size.

---

© Aster – Tài liệu nội bộ dùng cho trao đổi kỹ thuật và demo.  
Liên hệ: cập nhật/điều chỉnh theo yêu cầu team sản phẩm.
