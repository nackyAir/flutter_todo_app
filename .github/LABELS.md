# 🏷️ GitHub Labels Guide

このドキュメントでは、React Native Todoアプリプロジェクトで使用するGitHubラベルについて説明します。

## 📋 ラベル管理の自動化

ラベルは GitHub Actions により自動で管理されています。

### ラベルの更新方法

1. `.github/labels.yml` ファイルを編集
2. `master` ブランチにプッシュまたは手動でワークフローを実行
3. ラベルが自動的に同期されます

### 手動実行

```bash
# GitHub Actions ページから "Setup GitHub Labels" ワークフローを手動実行
```

## 🎯 ラベルカテゴリ別ガイド

### 🏷️ **Type Labels** - 作業の種類
| ラベル | 用途 | 例 |
|--------|------|-----|
| `feature` | 新機能の追加 | 新しいTodo機能の実装 |
| `bug` | バグ修正 | アプリクラッシュの修正 |
| `enhancement` | 既存機能の改善 | UIの使いやすさ向上 |
| `documentation` | ドキュメント更新 | READMEの更新 |
| `refactor` | コードリファクタリング | コンポーネントの整理 |
| `test` | テスト関連 | ユニットテストの追加 |

### 🎯 **Priority Labels** - 優先度
| ラベル | 用途 | SLA |
|--------|------|-----|
| `priority: critical` | 緊急対応が必要 | 24時間以内 |
| `priority: high` | 高優先度 | 1週間以内 |
| `priority: medium` | 中優先度 | 2週間以内 |
| `priority: low` | 低優先度 | 適時対応 |

### 📱 **Platform Labels** - プラットフォーム
| ラベル | 用途 |
|--------|------|
| `platform: ios` | iOS特有の問題・機能 |
| `platform: android` | Android特有の問題・機能 |
| `platform: web` | Web版関連 |
| `platform: all` | 全プラットフォーム共通 |

### 🛠️ **Technology Labels** - 技術スタック
| ラベル | 用途 |
|--------|------|
| `react-native` | React Native核心機能 |
| `expo` | Expo関連の設定・機能 |
| `firebase` | Firebase統合 |
| `typescript` | TypeScript型定義 |
| `ui/ux` | ユーザーインターフェース |
| `navigation` | 画面遷移・ナビゲーション |

### 🎨 **Component Labels** - コンポーネント
| ラベル | 用途 |
|--------|------|
| `component: todo-item` | TodoItemコンポーネント |
| `component: add-form` | 追加フォーム |
| `component: stats` | 統計カード |
| `component: auth` | 認証画面 |

### 🔧 **Status Labels** - ステータス
| ラベル | 意味 |
|--------|------|
| `status: in-progress` | 現在作業中 |
| `status: ready-for-review` | レビュー依頼 |
| `status: needs-testing` | テストが必要 |
| `status: blocked` | 他の作業待ち |
| `status: on-hold` | 一時保留 |

## 🚀 使用例とベストプラクティス

### 典型的なラベル組み合わせ

#### 新機能開発
```
feature + priority: medium + platform: all + react-native + status: in-progress
```

#### バグ修正
```
bug + priority: high + platform: ios + component: todo-item + status: ready-for-review
```

#### UI改善
```
enhancement + ui/ux + component: stats + priority: low + status: needs-testing
```

### Issue作成時のラベリングガイド

1. **必須ラベル**
   - Type (feature/bug/enhancement)
   - Priority (critical/high/medium/low)

2. **推奨ラベル**
   - Platform (該当する場合)
   - Component (特定コンポーネントの場合)
   - Technology (特定技術の場合)

3. **状況に応じて**
   - Status (作業状況)
   - Special labels (breaking-change等)

### Pull Request作成時のラベリングガイド

1. **必須ラベル**
   - Type (feature/bug/enhancement)
   - `status: ready-for-review`

2. **該当する場合**
   - `breaking-change`
   - Release labels
   - Platform labels

## 🔄 ラベル更新のワークフロー

### 新しいラベルの追加

1. `.github/labels.yml` に新しいラベル定義を追加
2. 適切な色とdescriptionを設定
3. プルリクエストでレビューを受ける
4. マージ後、自動的にラベルが作成される

### 既存ラベルの変更

1. `.github/labels.yml` の該当ラベルを修正
2. 色やdescriptionの変更が可能
3. ラベル名の変更は慎重に（既存Issueに影響）

### ラベルの削除

1. `.github/labels.yml` から該当行を削除
2. `skip-delete: false` のため自動削除される
3. 既存Issue/PRへの影響を事前確認

## 📊 ラベル活用の分析

### レポート作成

```bash
# 優先度別Issue数
gh issue list --label "priority: high" --state all

# コンポーネント別バグ数
gh issue list --label "bug,component: todo-item" --state all

# プラットフォーム別Issue
gh issue list --label "platform: ios" --state all
```

### 自動化可能な分析

- 優先度別の対応時間分析
- コンポーネント別のバグ発生率
- プラットフォーム別の問題傾向
- 機能別の開発工数追跡

このラベルシステムにより、効率的なプロジェクト管理と品質向上を実現できます。 