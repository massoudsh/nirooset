# @nirooset/sdk

کتابخانهٔ کلاینت جاوااسکریپت/تایپ‌اسکریپت برای پروتکل نیروست.

## نصب

```bash
npm install @nirooset/sdk ethers
```

## شروع سریع

```ts
import { createSDKFromBrowser } from '@nirooset/sdk';

const sdk = await createSDKFromBrowser(window.ethereum, {
  energyToken:  '0x...',
  energyMarket: '0x...',
  panelNFT:     '0x...',
  panelRegistry:'0x...',
  energyOracle: '0x...',
});

// دریافت دفتر سفارش زنده
const book = await sdk.getOrderBook(NiroosetSDK.currentTimeSlot());
console.log('Bids:', book.bids);
console.log('Asks:', book.asks);

// ثبت یک پیشنهاد خرید (نیاز به signer)
await sdk.placeBid(NiroosetSDK.currentTimeSlot(), ethers.parseEther('0.012'), 10n);

// ضرب توکن انرژی (فقط مالک)
await sdk.mint('0xYourAddress', ethers.parseEther('1000'));
```

## فقط‌خواندنی (بدون کیف پول)

```ts
import { createSDKFromRPC } from '@nirooset/sdk';

const sdk = createSDKFromRPC('https://sepolia.infura.io/v3/YOUR_KEY', addresses);
const auction = await sdk.getAuction(NiroosetSDK.currentTimeSlot());
```

## رابط برنامه‌نویسی (API)

| متد | توضیح |
|---|---|
| `getOrderBook(slot)` | دریافت پیشنهادهای خرید و فروش برای یک بازهٔ زمانی |
| `getAuction(slot)` | دریافت وضعیت حراج (قیمت تسویه، وضعیت) |
| `getBestBid(slot)` | بالاترین قیمت و مقدار پیشنهاد خرید |
| `getBestAsk(slot)` | پایین‌ترین قیمت و مقدار پیشنهاد فروش |
| `placeBid(slot, price, qty)` | ثبت سفارش خرید |
| `placeAsk(slot, price, qty)` | ثبت سفارش فروش |
| `cancelOrder(orderId)` | لغو یک سفارش فعال |
| `clearAuction(slot)` | تسویهٔ حراج (فقط مالک) |
| `mint(to, amount)` | ضرب توکن انرژی (فقط مالک) |
| `getBalance(account)` | موجودی قابل‌استفادهٔ توکن |
| `getLockedBalance(account)` | موجودی قفل‌شدهٔ توکن |
| `registerPanel(tokenId, owner, capacity)` | ثبت یک پنل |
| `getPanelRecord(tokenId)` | رکورد رجیستری پنل |
| `getRegisteredPanels()` | همهٔ شناسه‌های پنل‌های ثبت‌شده |
| `mintPanel(to, tokenId, capacity)` | ضرب یک PanelNFT |
| `getPanelOwner(tokenId)` | مالک یک NFT پنل |
| `getTimeSlotData(slot)` | داده‌های اوراکل برای یک بازهٔ زمانی |
| `getTotalProduction(slot)` | مجموع وات-ساعت تولیدشده در یک بازهٔ زمانی |
| `NiroosetSDK.currentTimeSlot()` | بازهٔ زمانی ساعتی فعلی (استاتیک) |
| `NiroosetSDK.timeSlotFor(date)` | بازهٔ زمانی برای یک تاریخ مشخص (استاتیک) |
