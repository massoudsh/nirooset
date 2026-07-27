# تحلیل استاتیک (Slither)

این پروژه [Slither](https://github.com/crytic/slither) را در CI (`.github/workflows/ci.yml`) اجرا می‌کند تا مشکلات احتمالی قراردادهای Solidity را گزارش دهد.

## اجرای محلی

۱. Slither (و وابستگی‌های آن، مثل solc-select) را نصب کنید:
   ```bash
   pip install slither-analyzer
   ```

۲. با Foundry بیلد بگیرید تا Slither بتواند از artifact‌ها استفاده کند:
   ```bash
   forge build
   ```

۳. Slither را اجرا کنید (از ریشهٔ ریپو):
   ```bash
   slither . --compile-force-framework foundry --filter-paths "lib|test"
   ```

گزینهٔ `--filter-paths "lib|test"` تحلیل را به قراردادهای `src/` محدود می‌کند و وابستگی‌ها و تست‌ها را کنار می‌گذارد.

## رفتار در CI

- جاب **slither** روی هر push/PR به شاخهٔ `main` اجرا می‌شود.
- با Foundry کامپایل می‌کند، Slither را نصب می‌کند و دستور بالا را اجرا می‌کند.
- این مرحله با `continue-on-error: true` تنظیم شده تا CI با یافته‌ها متوقف نشود؛ لاگ در اجرای workflow در دسترس است.
- پیش از مین‌نت، این موارد را در نظر بگیرید: رفع یا مستندسازی همهٔ یافته‌های high/medium، یا حذف `continue-on-error` و رفع مشکلات باقی‌مانده.

## سیاست

- **High/medium:** رفع کنید یا ریسک پذیرفته‌شده را مستند کنید (مثلاً در کامنت‌های کد یا SECURITY.md). بدون تأیید رها نکنید.
- **Low/informational:** رفعشان اختیاری است؛ می‌توان در ایشوها پیگیری کرد.
- قراردادهای جدید زیر `src/` را در محدودهٔ تحلیل قرار دهید؛ `test/` و `lib/` را فیلترشده نگه دارید.

## گزینهٔ اختیاری: Aderyn

[Aderyn](https://github.com/Cyfrin/aderyn) یک جایگزین است. برای استفاده در CI، جابی اضافه کنید که پس از `forge build`، دستور `aderyn .` (یا معادل آن) را اجرا کند. همان سیاست «رفع یا مستندسازی high/medium» اعمال می‌شود.
