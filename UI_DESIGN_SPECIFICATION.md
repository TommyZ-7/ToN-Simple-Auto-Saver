# Windows 11 Fluent Design - UI設計仕様書

> **目的**: このドキュメントは、別のプロジェクトでこのUIデザインを再現するためのAI向け設計仕様書です。

---

## 1. デザインコンセプト

### 1.1 スタイル概要
- **デザインシステム**: Windows 11 Fluent Design
- **テーマ**: ダークモード専用
- **全体的な印象**: モダン、クリーン、プロフェッショナル
- **アニメーション**: スムーズで控えめ、物理的な自然さを重視

### 1.2 技術スタック
```json
{
  "フレームワーク": "React 19+",
  "スタイリング": "Tailwind CSS v4",
  "アニメーション": "Framer Motion v12+",
  "アイコン": "Lucide React",
  "フォント": "Segoe UI Variable / Segoe UI / system-ui"
}
```

---

## 2. カラーシステム

### 2.1 CSS変数定義
```css
:root {
  --bg-mica: #1a1a1a;        /* メイン背景 */
  --bg-card: #2d2d2d;        /* カード背景 */
  --bg-sidebar: #202020;     /* サイドバー背景 */
  --accent: #0078d4;         /* アクセントカラー（Microsoft Blue） */
  --accent-hover: #1a86d9;   /* アクセントホバー */
  --text-primary: #ffffff;   /* プライマリテキスト */
  --text-secondary: #9ca3af; /* セカンダリテキスト（gray-400） */
  --text-muted: #6b7280;     /* ミュートテキスト（gray-500） */
  --border-subtle: rgba(255, 255, 255, 0.05);  /* 薄いボーダー */
  --border-medium: rgba(255, 255, 255, 0.10);  /* 中程度ボーダー */
}
```

### 2.2 プリセットカラーパレット（装飾用）
```javascript
const PRESET_COLORS = [
  "#22d3ee", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
];
```

### 2.3 状態カラー
| 状態 | 背景 | テキスト |
|------|------|----------|
| Danger | `bg-red-600` / `bg-red-500/20` | `text-red-400` / `text-red-500` |
| Warning | `bg-yellow-500/20` | `text-yellow-500` |
| Success | `border-green-500/50` | `text-green-500` |
| Info | `bg-blue-500/20` | `text-blue-500` |

---

## 3. タイポグラフィ

### 3.1 フォントファミリー
```css
font-family: "Segoe UI Variable", "Segoe UI", system-ui, -apple-system, sans-serif;
```

### 3.2 テキストスタイル
| 用途 | クラス | 例 |
|------|--------|-----|
| ページタイトル | `text-xl font-semibold text-white` | セクションヘッダー |
| モーダルタイトル | `text-lg font-semibold text-white` | モーダルヘッダー |
| 項目名 | `font-medium text-white` | リスト項目 |
| ラベル | `text-sm font-medium text-gray-300` | フォームラベル |
| 説明文 | `text-sm text-gray-400` | サブテキスト |
| ミュートテキスト | `text-xs text-gray-500` | メタ情報 |

---

## 4. スペーシングシステム

### 4.1 標準間隔
```
gap-1   = 0.25rem (4px)   - アイコン間の小さな隙間
gap-2   = 0.5rem  (8px)   - 緊密な要素間
gap-3   = 0.75rem (12px)  - 標準的な要素間
gap-4   = 1rem    (16px)  - セクション内
space-y-6 = 1.5rem (24px) - セクション間
p-4     = 1rem    (16px)  - コンテナのパディング
p-6     = 1.5rem  (24px)  - モーダルのパディング
p-8     = 2rem    (32px)  - ページコンテナ
```

---

## 5. コンポーネント仕様

### 5.1 ボタン (Button)

#### バリアント
```javascript
const variants = {
  primary: "bg-[#0078d4] hover:bg-[#1a86d9] text-white focus-visible:ring-[#0078d4]",
  secondary: "bg-white/10 hover:bg-white/15 text-white focus-visible:ring-white/30",
  ghost: "hover:bg-white/10 text-gray-300 focus-visible:ring-white/20",
  danger: "bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500",
};
```

#### サイズ
```javascript
const sizes = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-2.5 text-base gap-2.5",
};
```

#### 共通スタイル
```
inline-flex items-center justify-center font-medium rounded-md 
transition-all duration-150 focus:outline-none 
focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a] 
disabled:opacity-50 disabled:pointer-events-none
```

---

### 5.2 入力フィールド (Input)

```css
/* 基本スタイル */
w-full px-3 py-2 
bg-white/5 
border border-white/10 
rounded-md 
text-white 
placeholder-gray-500 
focus:outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4] 
transition-colors

/* エラー時 */
border-red-500
```

---

### 5.3 セレクト (Select)

```css
w-full px-3 py-2 
bg-white/5 
border border-white/10 
rounded-md 
text-white 
focus:outline-none focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4] 
transition-colors 
appearance-none 
cursor-pointer
padding-right: 2.5rem /* 矢印アイコン用 */
```

**ドロップダウン矢印**: SVGをbackground-imageとして設定

---

### 5.4 トグルスイッチ (Toggle)

```javascript
// トラック
`relative w-11 h-6 rounded-full transition-colors 
${checked ? "bg-[#0078d4]" : "bg-white/20"}`

// ノブ
`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md`
// Framer Motion: left: checked ? 24 : 4
```

---

### 5.5 カード (Card)

```javascript
// 基本スタイル
"bg-white/5 rounded-lg border border-white/5"

// ホバー効果（Framer Motion）
whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.08)" }}

// リスト項目内カード
"flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-transparent 
 transition-colors hover:bg-white/8"
```

---

### 5.6 モーダル (Modal)

#### 背景オーバーレイ
```css
fixed inset-0 z-50 
bg-black/50 backdrop-blur-sm
```

#### モーダルコンテンツ
```javascript
// サイズクラス
const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-3xl",
  xl: "max-w-4xl",
};

// スタイル
"relative w-full bg-[#2d2d2d] rounded-lg shadow-2xl 
 border border-white/10 overflow-hidden"
```

#### ヘッダー
```css
flex items-center justify-between px-6 py-4 border-b border-white/10
```

#### ボディ
```css
max-h-[70vh] overflow-y-auto
```

---

### 5.7 サイドバー (Sidebar)

```javascript
// コンテナ
"flex flex-col h-full bg-[#202020] border-r border-white/5"

// 幅（アニメーション付き）
collapsed: 64px
expanded: 280px

// ナビゲーション項目
const navItemActive = "bg-white/10 text-white";
const navItemInactive = "text-gray-400 hover:text-white hover:bg-white/5";

// アクティブインジケータ
"absolute left-0 w-0.75 h-4 bg-[#0078d4] rounded-r-full"
```

---

### 5.8 タイトルバー (TitleBar)

```css
/* コンテナ */
flex items-center justify-between h-8 
bg-[#1a1a1a] border-b border-white/5 select-none

/* ウィンドウコントロールボタン */
flex items-center justify-center w-12 h-full 
text-gray-400 hover:text-white transition-colors

/* 閉じるボタンホバー */
hover:bg-red-600
```

---

## 6. アニメーション仕様

### 6.1 イージング関数
```javascript
// カスタムイージング（スムーズな感じ）
ease: [0.16, 1, 0.3, 1]

// スプリングアニメーション（アクティブインジケータ）
{ type: "spring", stiffness: 500, damping: 35 }
```

### 6.2 ページトランジション
```javascript
const pageVariants = {
  initial: { opacity: 0, x: 20, filter: "blur(4px)" },
  animate: { 
    opacity: 1, x: 0, filter: "blur(0px)",
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  },
  exit: { 
    opacity: 0, x: -20, filter: "blur(4px)",
    transition: { duration: 0.2 }
  },
};
```

### 6.3 モーダルアニメーション
```javascript
// オーバーレイ
{ opacity: 0 } → { opacity: 1 }, duration: 0.15

// コンテンツ
{ opacity: 0, scale: 0.95, y: 10 } → { opacity: 1, scale: 1, y: 0 }
duration: 0.2, ease: [0.16, 1, 0.3, 1]
```

### 6.4 マイクロインタラクション
```javascript
// ボタンホバー
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}

// サイドバー展開
animate={{ width: isCollapsed ? 64 : 280 }}
transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}

// 回転（展開アイコン）
animate={{ rotate: isExpanded ? 90 : 0 }}
transition={{ duration: 0.15 }}
```

---

## 7. スクロールバーカスタマイズ

```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}
```

---

## 8. フォーカス・アクセシビリティ

```css
/* フォーカスリング */
*:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* テキスト選択 */
::selection {
  background-color: var(--accent);
  color: white;
}

/* UI要素のテキスト選択無効化 */
button, [role="button"], nav, aside {
  user-select: none;
}
```

---

## 9. レイアウトパターン

### 9.1 メインレイアウト構造
```jsx
<div className="flex flex-col h-full bg-[#1a1a1a]">
  <TitleBar />                           {/* 高さ: 32px */}
  <div className="flex flex-1 overflow-hidden">
    <Sidebar />                          {/* 幅: 64-280px */}
    <PageContainer>                      {/* flex-1 */}
      <div className="p-8 max-w-5xl mx-auto">
        {/* ページコンテンツ */}
      </div>
    </PageContainer>
  </div>
</div>
```

### 9.2 セクションレイアウト
```jsx
<div className="space-y-6">
  <SectionHeader 
    title="タイトル"
    description="説明文"
    action={<Button>アクション</Button>}
  />
  {/* コンテンツ */}
</div>
```

### 9.3 リストアイテムレイアウト
```jsx
<div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
  <div className="shrink-0 w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg">
    {/* アイコン */}
  </div>
  <div className="flex-1 min-w-0">
    <h3 className="font-medium text-white truncate">タイトル</h3>
    <p className="text-sm text-gray-400">サブテキスト</p>
  </div>
  <div className="flex items-center gap-1">
    {/* アクションボタン */}
  </div>
</div>
```

---

## 10. ドラッグ＆ドロップ

```javascript
// Framer Motion Reorder使用
import { Reorder } from "framer-motion";

// グリップハンドル
"cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300"

// リストグループ
<Reorder.Group axis="y" values={items} onReorder={handleReorder}>
  {items.map(item => (
    <Reorder.Item key={item.id} value={item}>
      {/* 内容 */}
    </Reorder.Item>
  ))}
</Reorder.Group>
```

---

## 11. 空状態 (Empty State)

```jsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="mb-4 text-gray-500">{/* アイコン w-16 h-16 */}</div>
  <h3 className="text-lg font-medium text-white mb-2">タイトル</h3>
  <p className="text-sm text-gray-400 mb-6 max-w-sm">説明文</p>
  {/* アクションボタン */}
</div>
```

---

## 12. 確認ダイアログ

```jsx
<div className="p-6">
  <div className="flex items-start gap-4">
    {/* アイコン */}
    <div className={`p-3 rounded-full ${iconColors[variant]}`}>
      <AlertTriangle className="w-6 h-6" />
    </div>
    {/* コンテンツ */}
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-gray-400">{message}</p>
    </div>
  </div>
  {/* アクション */}
  <div className="flex justify-end gap-3 mt-6">
    <Button variant="ghost">キャンセル</Button>
    <Button variant="danger">確認</Button>
  </div>
</div>
```

---

## 13. 実装チェックリスト

### 必須の依存関係
```bash
bun install tailwindcss @tailwindcss/vite framer-motion lucide-react
```

### ベースCSSの設定
1. `@import "tailwindcss";` をインポート
2. CSS変数とグローバルスタイルを設定
3. スクロールバーのカスタマイズを追加
4. フォーカスリングとセレクションスタイルを設定

### コンポーネント作成順序
1. Button, Input, Select, Toggle（基本フォーム要素）
2. Card, Modal, ConfirmDialog（コンテナ）
3. SectionHeader, EmptyState（レイアウト補助）
4. Sidebar, TitleBar, PageContainer（レイアウト）
5. ページ固有のコンポーネント

