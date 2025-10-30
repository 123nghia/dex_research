# Aster Simple Mode vs Pro Mode – Tài liệu ngắn gọn kèm ví dụ

## 1) Hai công thức cốt lõi

- Simple Mode (giao dịch với ALP pool, batch 100–300ms)
  - Execution Price = Oracle Price ± Spread ± Impact
  - Spread = Oracle × spreadRate (vd 0.04% → 4 bps)
  - Impact = Oracle × (OrderSize / PoolLiquidity) × impactFactor

- Pro Mode (CLOB – sổ lệnh tập trung)
  - Khớp lệnh “đi từng mức” theo best price và FIFO:
  - Average Fill Price = Σ(levelPrice × filledAtLevel) / totalFilled

## 2) Quy trình rút gọn

- Simple Mode
  1) Gom lệnh trong 100–300ms (batch)
  2) Tính net demand, lấy Oracle, cộng Spread và Impact
  3) Fill 1 giá cho cả batch, phân bổ theo tỷ lệ

- Pro Mode (CLOB)
  1) Lệnh Market kiểm tra best ask (nếu mua) hoặc best bid (nếu bán)
  2) Khớp lần lượt qua các mức cho đến đủ size
  3) Phát Trade events, cập nhật Order Book/Positions/Fees

## 3) Ví dụ: Mua 100,000 USD BTC

- Giả định
  - Oracle BTC: 30,000 USD
  - spreadRate: 0.04% (→ $12)
  - PoolLiquidity: 10,000 BTC, impactFactor: 0.5
  - Sổ lệnh (asks):
    - 30,010 (1 BTC)
    - 30,015 (2 BTC)
    - 30,020 (5 BTC)
    - 30,025 (10 BTC)

### 3.1 Simple Mode
- Số lượng ước tính: qty ≈ 100,000 / 30,000 = 3.3333 BTC
- Impact ratio = (3.3333 / 10,000) × 0.5 = 0.0166665%  → Impact ≈ $5.00
- Execution Price (buy) = 30,000 + 12 + 5 = 30,017 USD
- Notional ≈ 3.3333 × 30,017 ≈ 100,056.67 USD

### 3.2 Pro Mode (CLOB)
- Market BUY 3.3333 BTC khớp:
  - 1.0 @ 30,010 = 30,010
  - 2.0 @ 30,015 = 60,030
  - 0.3333 @ 30,020 ≈ 10,006.67
- Tổng ≈ 100,046.67 → Giá TB ≈ 30,014.00 USD

→ So sánh (với giả định trên): Simple ≈ 30,017; Pro ≈ 30,014 (Pro tốt hơn khi sổ dày). Khi sổ mỏng, kết quả có thể ngược lại.

## 4) Khi nào dùng chế độ nào
- Simple: lệnh nhỏ–trung bình, cần chống MEV, thao tác nhanh gọn; chấp nhận spread/impact
- Pro: lệnh lớn/chiến lược; tận dụng depth và lệnh nâng cao (IOC/FOK/Stop/Hidden)
