# 貓步漫遊 Catwalk

記錄城市裡每一次與貓咪的相遇 🐾

---

## 部署步驟

### 1. 上傳到 GitHub

把這個資料夾推到你的 GitHub repo。

### 2. 在 Vercel 建立新專案

1. 登入 [vercel.com](https://vercel.com)
2. 點「Add New Project」→ 選你的 GitHub repo
3. Framework 選 **Next.js**
4. 進入「Environment Variables」填入以下變數：

```
NOTION_API_KEY
NOTION_USERS_DB_ID
NOTION_REPORTS_DB_ID
NOTION_DEX_DB_ID

R2_BUCKET
R2_PUBLIC_BASE_URL
R2_ENDPOINT
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
```

5. 點「Deploy」

---

## 本機開發

```bash
# 1. 安裝套件
npm install

# 2. 複製環境變數範本
cp .env.local.example .env.local
# 然後填入你的實際 API key

# 3. 啟動開發伺服器
npm run dev
# 打開 http://localhost:3000
```

---

## 頁面結構

```
登入頁 (LoginScreen)
  ↓ 輸入暱稱 + Email
地圖頁 (MapScreen)          ← 主頁
  ├── 圖鑑頁 (DexScreen)
  ├── 個人頁 (ProfileScreen)
  └── 拍貓咪 FAB
        ↓
相機頁 (CameraScreen)
  ↓ 拍照
花色姿勢 (CatSelectScreen)   1/4
  ↓
環境標注 (EnvironmentScreen)  2/4
  ↓
確認送出 (ConfirmReportScreen) 3/4
  ↓
回報結算 (ResultScreen)      4/4
```

---

## 更新單一頁面 UI

每個頁面都是獨立的 `.tsx` 檔案，位於：

```
src/screens/
├── LoginScreen.tsx      ← 登入頁（待你提供新 UI）
├── MapScreen.tsx        ← 地圖頁
├── CameraScreen.tsx     ← 相機頁
├── CatSelectScreen.tsx  ← 花色姿勢選擇
├── EnvironmentScreen.tsx ← 環境標注
├── ConfirmReportScreen.tsx ← 確認送出
├── ResultScreen.tsx     ← 回報結算
├── DexScreen.tsx        ← 圖鑑頁
└── ProfileScreen.tsx    ← 個人頁
```

要更新某個頁面的 UI，只需替換對應檔案的 JSX 內容。邏輯函數（`useApp()` 的呼叫）保持不變。

---

## 更換地圖風格

打開 `src/screens/MapScreen.tsx`，找到：

```typescript
// 地圖風格替換點
const MAP_STYLE_URL = 'https://tiles.stadiamaps.com/styles/alidade_bright.json';
```

換成其他風格 URL 即可，例如：
- `https://tiles.stadiamaps.com/styles/alidade_smooth.json`
- `https://tiles.stadiamaps.com/styles/stamen_watercolor.json`
- `https://tiles.stadiamaps.com/styles/osm_bright.json`

---

## Notion 資料庫設定

需要三個 Notion Database，欄位設定如下：

### Users
| 欄位 | 類型 |
|------|------|
| nickname | Title |
| email | Email |
| total_xp | Number |
| gps_permission | Checkbox |
| created_at | Created time |

### Reports
| 欄位 | 類型 |
|------|------|
| report_id | Title |
| user_nickname | Text |
| photo | URL |
| latitude | Number |
| longitude | Number |
| color_key | Text |
| pose | Select（basking / curled_sleep / walking / grooming / alert_standing / sitting / eating） |
| environment | Select（alley / parking / park / mountain / temple / arcade / market / wall / shop / station） |
| cat_count | Select（one / two_three / four_plus） |
| weather | Select（sunny / cloudy / overcast / rainy / other） |
| temperature | Number |
| xp_earned | Number |
| submitted_at | Created time |

### DexUnlocks
| 欄位 | 類型 |
|------|------|
| unlock_id | Title |
| user_nickname | Text |
| color_key | Text |
| pose | Select（同上） |
| unlocked_at | Date |
