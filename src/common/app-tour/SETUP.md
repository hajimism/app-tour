# app-tour セットアップチェックリスト

`src/common/app-tour` をコピーしたあと、ホストプロジェクト側で以下を確認する。

## npm 依存

```bash
npm install @onboardjs/core @onboardjs/react lucide-react
```

## 利用パターン

### A. デフォルト UI（shadcn 前提）

`GuideProvider` + `useTour` を使う。パスエイリアスと shadcn コンポーネントが必要（下記参照）。

### B. Headless のみ（ホスト UI 完全カスタム）

shadcn 未導入でも、`TourProvider` + `useStepGuide` + `OnboardingProvider` を組み合わせて自前 UI を構築できる。

```tsx
import {
  TourProvider,
  useTour,
  useStepGuide,
  type TourStep,
} from "@/common/app-tour";
```

`useStepGuide` が返す `viewState`（ハイライト要素、ツールチップ spec、ナビゲーション状態）を元に、オーバーレイ・ツールチップを自前実装する。`GuideProvider` の [`renderTooltip`](./README.md#カスタムツールチップ) はデフォルト UI を差し替える中間案。

## パスエイリアス（デフォルト UI 利用時）

`@` がプロジェクトルート（または `src/`）を指すこと。デフォルト UI が以下を import する:

| import パス | 用途 |
|-------------|------|
| `@/common/ui/button` | ツールチップ・エラーバナーのボタン |
| `@/common/ui/popover` | デフォルトツールチップ |
| `@/common/lib/cn` | shadcn `cn()` |

上記パスが合わない場合は **パターン B** か `renderTooltip` で UI を差し替える。

## ホスト側に必要な shadcn コンポーネント（デフォルト UI 利用時）

- `button`
- `popover`（`@base-ui/react/popover` ベース。`popover-arrow.css` も必要）

## CSS 変数（`:root` / `.dark`）

```css
--app-tour-overlay-color: oklch(0.17 0 0 / 0.55);
--app-tour-pointer-color: oklch(0.2 0.012 285);
--app-tour-pointer-pulse-color: var(--primary);
```

Tailwind v4 利用時は `@theme inline` に `--color-app-tour-*` マッピング（本リポジトリ `src/index.css` 参照）。

## コピー対象

`app-tour/` ディレクトリ全体（`core/`, `headless/`, `ui/`, `*.test.ts`, `README.md`, `SETUP.md`）。

`app-tour.css` は `GuideProvider` 経由で1回だけ import される。

## 動作確認

```bash
npx vitest run src/common/app-tour
```

## 最小コード

```tsx
import { GuideProvider, useTour, type TourStep } from "@/common/app-tour";

const steps: TourStep[] = [
  {
    id: "hero",
    operation: { tooltip: { title: "Hello" } },
    nextStep: null,
  },
];

// root
<GuideProvider steps={steps}><App /></GuideProvider>

// 任意の子コンポーネント
const { startTour } = useTour();
```

ターゲット要素に `data-app-tour="hero"` を付与する。
