# شروع کار

این راهنما شما را از کلون کردن پروژه تا اجرای رابط کاربری با قراردادهای مستقرشده روی یک زنجیرهٔ محلی می‌برد.

## پیش‌نیازها

- **Foundry**: [نصب Foundry](https://book.getfoundry.sh/getting-started/installation) (`forge`، `cast`، `anvil`)
- **Node.js** نسخهٔ ۱۸ به بالا (برای رابط کاربری وب)
- **Solidity** ^0.8.20 (از طریق Foundry)

## ۱. کلون و بیلد

```bash
git clone https://github.com/massoudsh/niroset-protocol.git
cd niroset-protocol
forge build
```

## ۲. اجرای تست‌ها

```bash
forge test
```

اختیاری: اجرا با پوشش (پوشش خطیِ ≥۹۵٪ انتظار می‌رود):

```bash
forge coverage --report summary
```

## ۳. راه‌اندازی یک زنجیرهٔ محلی و استقرار

در یک ترمینال، Anvil را اجرا کنید:

```bash
anvil
```

در ترمینال دیگر، کل مجموعهٔ قرارداد را مستقر کنید:

```bash
forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
```

اسکریپت آدرس‌های مستقرشده را چاپ می‌کند. آن‌ها را در `ui/.env` کپی کنید (به [استقرار](DEPLOYMENT.md) نگاه کنید).

`ui/.env` را با آدرس‌های چاپ‌شده توسط اسکریپت بسازید (کلیدها از `ui/.env.example`). نمونه برای یک Anvil **تازه** و استقرار اول:

```
VITE_ENERGY_TOKEN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_ENERGY_MARKET_ADDRESS=0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
VITE_PANEL_NFT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VITE_PANEL_REGISTRY_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
VITE_STAKING_VAULT_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
VITE_ENERGY_ORACLE_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
VITE_SETTLEMENT_ENGINE_ADDRESS=0x0165878A594ca255338adfa4d48449f69242Eb8F
VITE_GOVERNANCE_DAO_ADDRESS=0xa513E6E4b8f2a923D98304ec87F64353C4D5C853
```

اگر دوباره استقرار دهید یا از استقرار‌دهندهٔ متفاوتی استفاده کنید، آدرس‌ها تغییر می‌کنند؛ همیشه از آدرس‌های خروجی اسکریپت خودتان استفاده کنید.

## ۴. اجرای رابط کاربری وب

```bash
cd ui
npm install
npm run dev
```

آدرس http://localhost:5173 (یا آدرسی که Vite چاپ می‌کند) را باز کنید. MetaMask (یا کیف پول دیگری) را به شبکهٔ Anvil وصل کنید (مثلاً http://127.0.0.1:8545، شناسهٔ زنجیرهٔ ۳۱۳۳۷) و از اولین حساب Anvil استفاده کنید. می‌توانید توکن ضرب کنید و از نماهای کیف پول انرژی و بازار انرژی روی قراردادهای مستقرشده استفاده کنید.

## ۵. ضرب توکن (اختیاری)

استقرار‌دهنده به‌عنوان minter تنظیم شده است. با استفاده از `cast` (با کلید پیش‌فرض Anvil):

```bash
cast send <ENERGY_TOKEN_ADDRESS> "mint(address,uint256)" <YOUR_ADDRESS> 1000000000000000000000 --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

سپس در رابط کاربری، **کیف پول انرژی** را برای دیدن موجودی و **بازار انرژی** را برای دیدن دفتر سفارش زنده (پس از شروع یک حراج و ثبت سفارش‌ها؛ به [استقرار](DEPLOYMENT.md) نگاه کنید) باز کنید.

## گام‌های بعدی

- [استقرار](DEPLOYMENT.md) – جزئیات تست‌نت، متغیرهای محیطی و استقرار
- [معماری](architecture.md) – طراحی سیستم و قراردادها
- [ROADMAP](../ROADMAP.md) – فازها و ایشوها
