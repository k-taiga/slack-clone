# Slack Clone

React + TypeScript で作る Slack のクローンアプリ。

state 管理は Redux Toolkit、認証とデータ保存は Firebase（Authentication / Cloud Firestore）を使う。
Google アカウントでログインし、チャンネルを作って、チャンネルごとにメッセージをやり取りする。

## 現状（着手前に必ず確認）

下のディレクトリ構成は **これから作る設計** であり、まだ存在しない。

- ビルドは Create React App から Vite に移行済み（`vite.config.ts` / ルート直下の `index.html`）。CRA 固有ファイルは削除済み
- Tailwind CSS v4 は `@tailwindcss/vite` プラグインで設定済みで、クラスが効くことを確認済み
- `app/` `components/` `features/` `firebase/` `types/` はいずれも未作成
- `@reduxjs/toolkit` / `react-redux` / `firebase` は `package.json` に未追加

実装に入る前に依存を追加する。

```bash
npm install @reduxjs/toolkit react-redux firebase
```

## Tailwind CSS v4 の扱い

v3 時代の手順（`npx tailwindcss init`、`tailwind.config.js` の `content` 配列、`@import 'tailwindcss/base';` 等の 3 行インポート）は使わない。

- v4 は設定ファイルなしでテンプレートファイル（`src/**/*.tsx` 等）を自動検出する。`content` の指定自体が廃止されたため、`tailwind.config.js` が無いのは意図どおり。新設もしない
- Tailwind の読み込みは `src/index.css` 先頭の `@import "tailwindcss";` 1 行（設定済み）
- テーマ変更は `tailwind.config.js` ではなく `src/index.css` に `@theme { --color-brand: #...; }` の形で書く

## 技術スタック

| 分類 | 使用技術 |
|------|----------|
| UI | React 19 / TypeScript 5 |
| state 管理 | Redux Toolkit / React Redux |
| 認証 | Firebase Authentication（Google ログイン） |
| データ保存 | Cloud Firestore |
| ビルド | Vite 7 |
| スタイル | Tailwind CSS v4（`@tailwindcss/vite`） |

## ディレクトリ構成

```
src/
├─ app/                        # Redux設定
│  ├─ hooks.ts                 # Reduxのカスタムフック
│  └─ store.ts                 # Reduxストアの設定
│
├─ components/
│  ├─ ChatContainer/
│  │  ├─ ChannelAddModal.tsx   # チャンネルを追加するモーダル
│  │  ├─ ChannelCell.tsx       # チャンネル名の表示
│  │  ├─ ChannelList.tsx       # チャンネルリスト、チャンネルを追加ボタン
│  │  ├─ MessageArea.tsx       # メッセージリスト、メッセージのフォーム
│  │  └─ MessageTile.tsx       # メッセージ1つの表示
│  ├─ ChatContainer.tsx        # 右側部分の表示
│  ├─ Login.tsx                # Googleでログイン
│  └─ Sidebar.tsx              # サイドバーの表示
│
├─ features/                   # 機能ごとのReduxロジックとコンポーネント
│  ├─ auth/
│  │  ├─ auth.ts               # Firebase認証関連の関数（Googleログイン等）
│  │  └─ useAuthState.tsx      # 自動ログイン機能
│  ├─ channel/
│  │  ├─ channelAPI.ts         # チャンネルに関するAPI呼び出しの定義
│  │  └─ channelSlice.ts       # state管理に関するRedux Sliceの定義
│  ├─ message/
│  │  └─ messageAPI.ts         # メッセージに関するAPI呼び出しの定義
│  └─ user/
│     ├─ userAPI.ts            # ユーザー情報に関するAPI呼び出しの定義
│     └─ userSlice.ts          # state管理に関するRedux Sliceの定義
│
├─ firebase/                   # Firebase設定
│  └─ firebaseconfig.ts
│
├─ types/                      # TypeScriptの型定義
│  ├─ Channel.ts
│  ├─ Message.ts
│  └─ User.ts
│
├─ index.css                   # グローバルスタイルシート
├─ index.tsx                   # アプリケーションのエントリポイント
└─ App.tsx                     # アプリケーションのルートコンポーネント
```

ファイル 1 つずつの詳しい役割は [README.md](README.md) に書いてある。こちらには置き場所のルールだけを残す。

## 配置ルール

`components/` が見た目、`features/` が機能ごとのロジック（state と Firebase アクセス）という分担にする。

- コンポーネントから Firestore を直接触らない。データの読み書きは必ず `features/<機能>/<機能>API.ts` を経由する
- state と reducer は `features/<機能>/<機能>Slice.ts` に置き、`app/store.ts` に登録する
- `useSelector` / `useDispatch` を直接使わない。`app/hooks.ts` の `useAppSelector` / `useAppDispatch` を使う（`RootState` / `AppDispatch` の型が効くため）
- 画面をまたいで使う型は `types/` に置く。1 ファイル 1 型で、Firestore のドキュメント構造に対応させる
- Firebase のインスタンス（Firestore / Auth）は `firebase/firebaseconfig.ts` からのみ export し、各所で `initializeApp` を呼ばない
- `ChatContainer/` のように、親コンポーネントと同名のディレクトリにその子コンポーネントを入れる

## 規約

- Firebase の設定値はコードに直書きせず、`.env` の `VITE_FIREBASE_*` から読む（Vite では `VITE_` プレフィックスの変数だけがクライアントに公開される）。`.env` は `.gitignore` 済みなのでコミットしない
- API キー・シークレット等のクレデンシャルを README・コミットメッセージ・コード内コメントに書かない
- 設計を変えたら README のディレクトリ構成と説明も合わせて直す（README と実態を乖離させない）

## コマンド

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバーを起動（http://localhost:3000） |
| `npm run build` | 型チェック（`tsc --noEmit`）と `dist/` への本番ビルド |
| `npm run preview` | ビルド結果をローカルでプレビュー |
