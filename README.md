# Slack Clone

React + TypeScript で作る Slack のクローンアプリです。

Google アカウントでログインし、チャンネルを作って、チャンネルごとにメッセージをやり取りできます。
state 管理は Redux Toolkit、認証とデータの保存は Firebase（Authentication / Firestore）を使います。

## 主な機能

- Google アカウントでのログイン、リロードしても維持される自動ログイン
- チャンネルの一覧表示と追加
- チャンネルごとのメッセージ投稿と表示

## 技術スタック

| 分類 | 使用技術 |
|------|----------|
| UI | React 19 / TypeScript |
| state 管理 | Redux Toolkit |
| 認証 | Firebase Authentication（Google ログイン） |
| データ保存 | Cloud Firestore |
| ビルド | Create React App（react-scripts） |

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

`components/` は「見た目」、`features/` は「機能ごとのロジック（state と Firebase アクセス）」という役割分担にしています。
コンポーネントから Firestore を直接触らず、必ず `features/` 配下の API 関数と slice を経由させることで、画面とデータ処理を切り離しています。

## 各ディレクトリ・ファイルの説明

### `app/` — Redux の設定

| ファイル | 説明 |
|----------|------|
| `store.ts` | 各 slice の reducer をまとめてストアを作ります。合わせて `RootState` と `AppDispatch` の型も定義します |
| `hooks.ts` | 上の型を当てた `useAppSelector` / `useAppDispatch` を定義します。コンポーネント側では素の `useSelector` / `useDispatch` ではなくこちらを使い、型が効く状態にします |

### `components/` — 画面のコンポーネント

| ファイル | 説明 |
|----------|------|
| `Login.tsx` | 未ログイン時に表示する画面です。Google ログインのボタンを置きます |
| `Sidebar.tsx` | 左側のサイドバーです。ワークスペース名やユーザー情報を表示します |
| `ChatContainer.tsx` | 右側の本体部分です。チャンネル一覧とメッセージエリアをまとめます |

`ChatContainer/` は `ChatContainer.tsx` の中身を細かく分けたものです。

| ファイル | 説明 |
|----------|------|
| `ChannelList.tsx` | チャンネルの一覧と「チャンネルを追加」ボタンを表示します |
| `ChannelCell.tsx` | チャンネル一覧の 1 行分です。チャンネル名を表示し、クリックで選択中のチャンネルを切り替えます |
| `ChannelAddModal.tsx` | チャンネル追加用のモーダルです。名前を入力して新しいチャンネルを作ります |
| `MessageArea.tsx` | 選択中チャンネルのメッセージ一覧と、投稿フォームを表示します |
| `MessageTile.tsx` | メッセージ 1 件分の表示です。投稿者名・本文・投稿時刻を並べます |

### `features/` — 機能ごとの Redux ロジックと Firebase アクセス

機能単位でディレクトリを切り、その機能で使う state（`〜Slice.ts`）と Firebase へのアクセス（`〜API.ts`）を同じ場所に置きます。

| ファイル | 説明 |
|----------|------|
| `auth/auth.ts` | Firebase Authentication を呼び出す関数です。Google ログイン・ログアウトなどを定義します |
| `auth/useAuthState.tsx` | ログイン状態を監視するカスタムフックです。リロードしてもログインが続く（自動ログイン）ようにします |
| `channel/channelAPI.ts` | Firestore のチャンネルコレクションに対する取得・追加処理です |
| `channel/channelSlice.ts` | チャンネル関連の state と reducer です。選択中のチャンネルなどを保持します |
| `message/messageAPI.ts` | Firestore のメッセージに対する取得・送信処理です |
| `user/userAPI.ts` | ユーザー情報の取得・保存処理です |
| `user/userSlice.ts` | ログイン中のユーザー情報を保持する state と reducer です |

### `firebase/` — Firebase の設定

| ファイル | 説明 |
|----------|------|
| `firebaseconfig.ts` | Firebase を初期化し、Firestore と Authentication のインスタンスを export します。API キーなどの設定値は `.env` から読み込みます |

### `types/` — 型定義

アプリ全体で共有する型を置きます。Firestore のドキュメント構造に対応させます。

| ファイル | 説明 |
|----------|------|
| `Channel.ts` | チャンネルの型（ID・チャンネル名など） |
| `Message.ts` | メッセージの型（本文・投稿者・投稿日時など） |
| `User.ts` | ユーザーの型（UID・表示名・アイコン画像など） |

### ルート直下のファイル

| ファイル | 説明 |
|----------|------|
| `index.tsx` | アプリのエントリポイントです。`Provider` で Redux ストアを渡して `App` を描画します |
| `App.tsx` | ルートコンポーネントです。ログイン状態を見て、`Login` を出すかチャット画面を出すかを切り替えます |
| `index.css` | 全体に効かせるグローバルスタイルです |

## セットアップ

```bash
npm install
npm start
```

`http://localhost:3000` で開きます。

Firebase の設定値はリポジトリに含めず、プロジェクト直下の `.env` に置きます。

```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
```

## npm scripts

| コマンド | 説明 |
|----------|------|
| `npm start` | 開発サーバーを起動します |
| `npm test` | テストを watch モードで実行します |
| `npm run build` | `build/` に本番用のビルドを出力します |
