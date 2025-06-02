# 📱 Modern Todo App

> シンプルで美しい、モダンなTodoアプリケーション

<!-- スクリーンショットをここに配置 -->
![アプリスクリーンショット](./screenshots/app-preview.png)

*スクリーンショット: メイン画面、タスク追加、プロフィール画面*

## ✨ 特徴

### 🎨 **モダンなUI/UX**
- **視認性重視**: 目に優しいカラーパレットとクリーンなデザイン
- **統一されたデザインシステム**: 一貫性のあるユーザーインターフェース
- **レスポンシブ**: 様々な画面サイズに対応

### 📋 **充実したTodo機能**
- ✅ **タスク管理**: 作成、編集、削除、完了マーク
- 🎯 **優先度設定**: 高・中・低の3段階で重要度を管理
- 📅 **期限設定**: 日時指定でデッドラインを管理
- 🔍 **フィルタリング**: すべて・進行中・完了済みでタスクを絞り込み
- 📊 **統計表示**: 合計・進行中・完了・期限切れの件数を一目で確認

### 🔐 **セキュアな認証システム**
- 📧 **メール認証**: パスワード認証とメールリンク認証をサポート
- 🔒 **Firebase Authentication**: 安全で信頼性の高い認証基盤
- 👤 **ユーザープロフィール**: アカウント情報の確認と管理

### ☁️ **リアルタイム同期**
- 🔄 **Firestore連携**: データのリアルタイム同期
- 📱 **オフライン対応**: ネットワーク接続が不安定でも安心
- 🔥 **高速データベース**: Firebase Firestoreによる高性能データ管理

## 🛠 技術スタック

### **フロントエンド**
- **React Native** - クロスプラットフォームモバイル開発
- **Expo** - 開発効率化とデプロイメント
- **TypeScript** - 型安全性とコード品質向上
- **Expo Router** - ファイルベースルーティング

### **バックエンド & インフラ**
- **Firebase Authentication** - ユーザー認証管理
- **Firestore** - NoSQLリアルタイムデータベース
- **Firebase Storage** - ファイルストレージ（将来の拡張用）

### **UI/UX**
- **@expo/vector-icons** - 美しいアイコンライブラリ
- **React Native DateTimePicker** - 日時選択UI
- **カスタムコンポーネント** - 再利用可能なUIコンポーネント

### **開発ツール**
- **ESLint** - コード品質管理
- **Prettier** - コードフォーマット
- **TypeScript** - 静的型チェック

## 📂 プロジェクト構造

```
todo_app/
├── app/                    # Expo Routerによるページ構成
│   ├── (tabs)/            # タブナビゲーション
│   │   ├── index.tsx      # メイン画面（Todo一覧）
│   │   ├── explore.tsx    # プロフィール画面
│   │   └── _layout.tsx    # タブレイアウト設定
│   ├── auth.tsx           # 認証画面
│   └── _layout.tsx        # ルートレイアウト
├── components/            # 再利用可能なコンポーネント
│   ├── AddTodoForm.tsx    # タスク追加フォーム
│   └── TodoItem.tsx       # Todoアイテムコンポーネント
├── contexts/              # React Context
│   ├── AuthContext.tsx    # 認証状態管理
│   └── TodoContext.tsx    # Todo状態管理
├── lib/                   # ライブラリ設定
│   └── firebase.ts        # Firebase設定
├── types/                 # TypeScript型定義
│   └── todo.ts           # Todo関連の型
└── constants/             # 定数定義
    └── Colors.ts          # カラーパレット
```

## 🚀 セットアップ

### **前提条件**
- Node.js 18.0.0以上
- npm または yarn
- Expo CLI
- Firebase プロジェクト

### **1. リポジトリのクローン**
```bash
git clone <your-repository-url>
cd todo_app
```

### **2. 依存関係のインストール**
```bash
npm install
# または
yarn install
```

### **3. Firebase設定**

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. Authentication、Firestoreを有効化
3. プロジェクト設定から設定ファイルを取得
4. `lib/firebase.ts`に設定を追加:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### **4. アプリの起動**
```bash
npx expo start
```

## 🎯 主要機能の使い方

### **📝 タスクの作成**
1. ホーム画面右下の「+」ボタンをタップ
2. タイトル、説明、優先度、期限を設定
3. 「✓」ボタンで保存

### **✏️ タスクの編集**
1. タスクの編集ボタン（ペンアイコン）をタップ
2. 内容を編集して保存

### **🔄 タスクの完了**
- タスクの左側にあるチェックボックスをタップ

### **🗑️ タスクの削除**
- タスクの削除ボタン（ゴミ箱アイコン）をタップ

### **🔍 フィルタリング**
- ホーム画面上部のフィルターチップ（すべて・進行中・完了）をタップ

## 🔐 認証機能

### **サポートする認証方法**
- **メール＋パスワード**: 従来型の認証
- **メールリンク**: パスワードレス認証
- **パスワードリセット**: セキュアなパスワード再設定

### **プロフィール機能**
- アカウント情報の確認
- 認証状態の表示
- ログアウト機能

## 📱 対応プラットフォーム

- **iOS** 13.0以上
- **Android** API Level 21以上
- **Web** (Expo Web対応)

## 🎨 デザインシステム

### **カラーパレット**
- **プライマリ**: `#3B82F6` (ブルー)
- **成功**: `#059669` (グリーン)
- **警告**: `#D97706` (オレンジ)
- **エラー**: `#DC2626` (レッド)
- **背景**: `#F8FAFC` (ライトグレー)

### **タイポグラフィ**
- **大見出し**: 24px, Font Weight 700
- **中見出し**: 18px, Font Weight 600
- **本文**: 16px, Font Weight 400
- **小文字**: 14px, Font Weight 500

## 🚀 ビルドとデプロイ

### **開発ビルド**
```bash
npx expo build
```

### **プロダクションビルド**
```bash
npx expo build --release-channel production
```

### **EAS Build（推奨）**
```bash
npm install -g @expo/eas-cli
eas build --platform all
```

## 🧪 テスト

```bash
# 単体テスト
npm test

# E2Eテスト
npm run test:e2e
```

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## 🤝 コントリビューション

プルリクエストを歓迎します！大きな変更を行う場合は、まずIssueを作成して変更内容について議論してください。

### **開発の流れ**
1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 👥 作者

**あなたの名前** - [@your-twitter](https://twitter.com/your-twitter) - your.email@example.com

プロジェクトリンク: [https://github.com/yourusername/todo_app](https://github.com/yourusername/todo_app)

## 🙏 謝辞

- [Expo](https://expo.dev/) - 素晴らしい開発プラットフォーム
- [Firebase](https://firebase.google.com/) - 強力なバックエンドサービス
- [React Native](https://reactnative.dev/) - クロスプラットフォーム開発
- [Ionicons](https://ionic.io/ionicons) - 美しいアイコンライブラリ

---

<p align="center">
  Made with ❤️ using React Native & Firebase
</p>
