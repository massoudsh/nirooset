# استقرار

این سند نحوهٔ استقرار مجموعه قراردادهای نیروست و اتصال رابط کاربری را توضیح می‌دهد.

## ترتیب استقرار قراردادها

وابستگی‌ها (ابتدا استقرار داده شوند):

۱. **EnergyToken** – بدون وابستگی
۲. **PanelNFT** – بدون وابستگی
۳. **PanelRegistry** – بدون وابستگی
۴. **StakingVault** – نیاز به `IEnergyToken`
۵. **EnergyOracle** – بدون وابستگی
۶. **EnergyMarket** – نیاز به `IEnergyToken` (برای وثیقه: قفل در placeBid/placeAsk، transferLocked در تسویه)
۷. **SettlementEngine** – نیاز به `IEnergyToken`، `IEnergyMarket`
۸. **GovernanceDAO** – نیاز به `IEnergyToken`

اسکریپت Forge با نام `script/Deploy.s.sol` به این ترتیب استقرار می‌دهد و سپس:

- استقرار‌دهنده را به‌عنوان **minter** روی EnergyToken و PanelNFT تنظیم می‌کند
- **SettlementEngine** و **EnergyMarket** را به‌عنوان **locker** روی EnergyToken تنظیم می‌کند (وثیقهٔ بازار: قفل/بازکردن قفل/transferLocked در ثبت، لغو، تسویه)
- آدرس **PanelNFT** را روی PanelRegistry تنظیم می‌کند (`setPanelNFT`) تا فقط مالک فعلیِ NFT بتواند به‌عنوان مالک پنل ثبت شود
- استقرار‌دهنده را به‌عنوان **registrar** و **reporter** روی PanelRegistry تنظیم می‌کند
- استقرار‌دهنده را به‌عنوان **penalizer** روی StakingVault و SettlementEngine تنظیم می‌کند
- **EnergyOracle:** نهایی‌سازی دومرحله‌ایِ اختیاری: فراخوانی `energyOracle.setConfirmer(confirmerAddress)` تا `finalizeTimeSlot` ابتدا نیاز به `confirmTimeSlot(slot)` داشته باشد. به [ORACLE_TRUST_MODEL.md](ORACLE_TRUST_MODEL.md) نگاه کنید.

## اجرای اسکریپت استقرار

### محلی (Anvil)

```bash
anvil
# در ترمینال دیگر:
forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
```

از `PRIVATE_KEY` یا کلید پیش‌فرض Anvil استفاده کنید (اگر `PRIVATE_KEY` تنظیم نشده باشد، اسکریپت از پیش‌فرض Anvil استفاده می‌کند).

### تست‌نت (مثلاً Sepolia)

۱. `PRIVATE_KEY` را تنظیم کنید (یا از `--private-key` استفاده کنید).
۲. `RPC_URL` را تنظیم کنید (یا از `--rpc-url` استفاده کنید).

```bash
export PRIVATE_KEY=0x...
forge script script/Deploy.s.sol --rpc-url https://sepolia.infura.io/v3/YOUR_KEY --broadcast
```

اختیاری: تأیید روی Etherscan:

```bash
forge script script/Deploy.s.sol --rpc-url ... --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY
```

## متغیرهای محیطیِ رابط کاربری

پس از استقرار، این‌ها را در `ui/.env` تنظیم کنید (به `ui/.env.example` نگاه کنید):

| متغیر | توضیح |
|----------|-------------|
| `VITE_ENERGY_TOKEN_ADDRESS` | EnergyToken |
| `VITE_ENERGY_MARKET_ADDRESS` | EnergyMarket |
| `VITE_PANEL_NFT_ADDRESS` | PanelNFT |
| `VITE_PANEL_REGISTRY_ADDRESS` | PanelRegistry |
| `VITE_STAKING_VAULT_ADDRESS` | StakingVault |
| `VITE_ENERGY_ORACLE_ADDRESS` | EnergyOracle |
| `VITE_SETTLEMENT_ENGINE_ADDRESS` | SettlementEngine |
| `VITE_GOVERNANCE_DAO_ADDRESS` | GovernanceDAO |

پس از تغییر `.env`، رابط کاربری را دوباره اجرا کنید (`npm run dev`).

## پس از استقرار: اولین حراج (بازار انرژی)

برای دیدن دادهٔ زنده در نمای **بازار انرژی**:

۱. یک حراج برای یک بازهٔ زمانی شروع کنید (فقط مالک):
   ```bash
   cast send <ENERGY_MARKET_ADDRESS> "startAuction(uint256,uint256)" 1000 3600 --rpc-url $RPC --private-key $PK
   ```
۲. یک پیشنهاد خرید و یک پیشنهاد فروش ثبت کنید (هر حسابی با توکن):
   ```bash
   cast send <ENERGY_MARKET_ADDRESS> "placeBid(uint256,uint256,uint256)" 1000 100 50 --rpc-url $RPC --private-key $PK
   cast send <ENERGY_MARKET_ADDRESS> "placeAsk(uint256,uint256,uint256)" 1000 90 40 --rpc-url $RPC --private-key $PK
   ```
۳. حراج را تسویه کنید (مالک):
   ```bash
   cast send <ENERGY_MARKET_ADDRESS> "clearAuction(uint256)" 1000 --rpc-url $RPC --private-key $PK
   ```

سپس بازار انرژی در رابط کاربری را باز کنید، بازهٔ زمانی را روی **۱۰۰۰** تنظیم کنید و از Refresh برای دیدن بهترین پیشنهاد خرید/فروش و قیمت تسویه استفاده کنید.

## انتشار تست‌نت در ۳ مرحله

۱. **استقرار** (نیاز به ETH Sepolia: [فاست](https://sepoliafaucet.com/)):
   ```bash
   export PRIVATE_KEY=0x...
   forge script script/Deploy.s.sol --rpc-url https://ethereum-sepolia-rpc.publicnode.com --broadcast
   ```
۲. **کپی** آدرس‌های ثبت‌شده در `ui/.env` (کلیدها از جدول بالا) در صورتی که هنوز تنظیم نشده‌اند. اگر استقرار با خطای «insufficient funds» شکست خورد، ETH Sepolia بگیرید و دوباره اجرا کنید؛ آدرس‌ها قطعی (deterministic) هستند. رابط کاربری را دوباره اجرا کنید.
۳. **اشتراک‌گذاری** آدرس اپلیکیشن + «به Sepolia (۱۱۱۵۵۱۱۱) تغییر دهید و ETH تستی را از [فاست] بگیرید.»

برای چک‌لیست کامل تست‌نت [RELEASE_READINESS.md](RELEASE_READINESS.md) را ببینید.

## تست‌نت و مین‌نت

- **تست‌نت**: برای استقرار تست‌نت، چک‌لیست و بتای جمعی [TESTNET.md](TESTNET.md) را ببینید.
- **مین‌نت**: پیش از استقرار و راه‌اندازی مین‌نت [MAINNET_CHECKLIST.md](MAINNET_CHECKLIST.md) را ببینید.

## استفادهٔ برنامه‌نویسی (سبک SDK)

قراردادها از اینترفیس‌های `src/interfaces/` پیروی می‌کنند. می‌توانید از موارد زیر استفاده کنید:

- **ethers.js** یا **viem** با ABIهای `out/` (مثلاً `out/EnergyToken.sol/EnergyToken.json`) و آدرس‌های مستقرشده.
- **cast** برای فراخوانی‌های یک‌باره:
  ```bash
  cast call <ENERGY_TOKEN_ADDRESS> "balanceOf(address)(uint256)" <ACCOUNT> --rpc-url $RPC
  ```

یک SDK سبک (مثلاً یک پکیج Node که آدرس‌ها + ABIها و متدهای رایج را در بر می‌گیرد) بعداً می‌تواند اضافه شود؛ [NEW_ISSUES.md](NEW_ISSUES.md) (NEW-10) را ببینید.
