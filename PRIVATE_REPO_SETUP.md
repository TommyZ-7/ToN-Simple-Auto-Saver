# Terror Data プライベートリポジトリ設定手順

このドキュメントでは、`terror_data.rs`をプライベートリポジトリに移動し、GitHub Actionsでビルド時に取得する設定について説明します。

## 1. プライベートリポジトリの作成

1. GitHubで新しいプライベートリポジトリを作成します
   - リポジトリ名: `ton-terror-data`
   - Visibility: **Private**

2. `src-tauri/src/terror_data.rs`をプライベートリポジトリにコピーします：

   ```bash
   # プライベートリポジトリをクローン
   git clone https://github.com/<your-username>/ton-terror-data.git

   # terror_data.rsをコピー
   cp src-tauri/src/terror_data.rs ton-terror-data/

   # コミットしてプッシュ
   cd ton-terror-data
   git add terror_data.rs
   git commit -m "Add terror data"
   git push
   ```

## 2. Personal Access Token (PAT)の作成

1. GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 「Generate new token (classic)」をクリック
3. 以下の設定でトークンを生成：
   - Note: `Terror Data Access`
   - Expiration: 任意（推奨: 90 days以上、または"No expiration"）
   - Scopes: `repo` (フルアクセス) にチェック
4. 生成されたトークンをコピー

## 3. GitHub Secretsの設定

1. 公開リポジトリ（ToN-Simple-Auto-Saver）の Settings → Secrets and variables → Actions
2. 「New repository secret」をクリック
3. 以下のシークレットを追加：
   - Name: `TERROR_DATA_PAT`
   - Value: 手順2で生成したPATをペースト

## 4. 公開リポジトリからterror_data.rsを削除

プライベートリポジトリにデータを移動した後、公開リポジトリからは削除してください：

```bash
# 公開リポジトリで
git rm src-tauri/src/terror_data.rs
git commit -m "Remove terror data (moved to private repo)"
git push
```

**注意**: ローカル開発時は、手動で`terror_data.rs`を`src-tauri/src/`にコピーする必要があります。

## 5. ローカル開発環境のセットアップ

ローカルで開発する場合は、プライベートリポジトリから`terror_data.rs`を取得してください：

```bash
# プライベートリポジトリをクローン（別のディレクトリに）
git clone https://github.com/<your-username>/ton-terror-data.git ../ton-terror-data

# シンボリックリンクを作成（Windows PowerShell、管理者権限で実行）
New-Item -ItemType SymbolicLink -Path "src-tauri/src/terror_data.rs" -Target "../ton-terror-data/terror_data.rs"

# または、手動でコピー
Copy-Item "../ton-terror-data/terror_data.rs" "src-tauri/src/terror_data.rs"
```

## ビルド時の動作

GitHub Actionsでリリースビルドを実行すると：

1. 公開リポジトリをチェックアウト
2. `TERROR_DATA_PAT`を使用してプライベートリポジトリをチェックアウト
3. `terror_data.rs`を`src-tauri/src/`にコピー
4. 通常のビルドプロセスを実行

## セキュリティ対策

### 逆コンパイル対策

`Cargo.toml`に以下の設定が追加されています：

```toml
[profile.release]
opt-level = 3        # 最大最適化
lto = true           # Link Time Optimization
strip = true         # シンボル情報を削除
codegen-units = 1    # 単一コード生成単位（最適化向上）
panic = "abort"      # パニック時に即座に終了
```

### 文字列難読化

`obfstr`クレートを使用して文字列を難読化しています。`terror_data.rs`内のマクロ：

```rust
// テラー情報の作成（難読化あり）
terror!("Huggy", "40, 114, 255")

// アビリティの作成（難読化あり）
ability!("スタン", "無効")
```

これらのマクロは`obfstr!`を内部で使用し、コンパイル時に文字列を難読化します。

## トラブルシューティング

### GitHub Actionsでエラーが発生する場合

1. `TERROR_DATA_PAT`シークレットが正しく設定されているか確認
2. PATの有効期限が切れていないか確認
3. PATに`repo`スコープが含まれているか確認
4. プライベートリポジトリ名が`ton-terror-data`であることを確認

### ローカルビルドでエラーが発生する場合

1. `src-tauri/src/terror_data.rs`が存在することを確認
2. ファイルの内容が最新であることを確認
