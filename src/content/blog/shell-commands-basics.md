---
title: "ターミナルのコマンド —— npm / git / gh の読み方"
description: "このプロジェクトで打ったコマンドを教材に、シェルの基本と3つの CLI ツールの役割を整理する。"
date: 2026-08-30
tags: ["basics", "git"]
---

このプロジェクトの作業は、ほとんどがターミナルでのコマンド入力。
出てくる CLI は主に3つ —— **npm**(ビルドと実行)、**git**(ローカルの履歴)、
**gh**(GitHub 操作)。それぞれの守備範囲を押さえると、
手順書のコマンドが「何をしているか」で読めるようになる。

## コマンドの形

```
コマンド名  サブコマンド  引数  --オプション
   npm         run        dev
   git       switch    feat/x    -c
```

- 半角スペースで区切る
- `-c` や `--squash` のように `-` で始まるものは**オプション(フラグ)**。
  短縮形(`-c`)と長い形(`--create`)があることが多い
- `&&` でつなぐと「前が成功したら次を実行」

```bash
npm run build && npm run preview   # ビルドが通ったらプレビュー
```

## npm —— ビルドとパッケージ管理

Node.js に付いてくるツール。Python でいう `pip` + `Makefile` のような役回り。

| コマンド | すること |
|---|---|
| `npm install`(略 `npm i`) | `package.json` の依存を `node_modules/` に入れる |
| `npm ci` | `package-lock.json` の通りに厳密に入れ直す(CI 向け・別記事参照) |
| `npm run <名前>` | `package.json` の `scripts` に定義したコマンドを実行 |
| `npm create astro@latest` | 雛形作成ツールを取ってきて実行(`@latest` は最新版の指定) |

このプロジェクトの `scripts` は `dev` / `build` / `preview` の3つ。
`npm run dev` → 中身の `astro dev` が動く、という対応。

`node_modules/` は依存ライブラリの実体が入る大きなフォルダ。
`package.json` + `package-lock.json` から復元できるので、履歴には含めない
(Python の `.venv/` を git 管理しないのと同じ)。

### 補足: PATH とバージョン管理ツール

`npm` や `node` は「PC のどこかにインストールされた実行ファイル」で、
シェルは `PATH` という環境変数に並んだフォルダを順に探して見つける。
Node のバージョン管理に **nvm**(Python の `pyenv` に相当)を使っていると、
状況によっては `PATH` を通す一手間が要ることがある。
「コマンドが見つからない」と言われたら、まず PATH を疑う。

## git —— 手元の変更履歴

ファイルの変更を「意味のあるまとまり」で記録していくツール。
GitHub がなくても単体で使える。

### 3つの場所

```
作業ツリー  →  ステージング  →  コミット(履歴)
(編集中)      git add        git commit
```

- **作業ツリー**: いま編集しているファイルそのもの
- **ステージング**: 「次のコミットに含める」と印を付けた変更の待機場所
- **コミット**: 確定した履歴の1点。1コミット = 意味のある1変更

### よく使うコマンド

| コマンド | すること |
|---|---|
| `git status` | いまの状態(変更・ステージ済み・ブランチ) |
| `git add <ファイル>` | 変更をステージングに載せる。`git add -A` で全部 |
| `git commit -m "メッセージ"` | ステージ済みの変更を履歴に刻む |
| `git switch -c <名前>` | ブランチ(履歴の枝)を作ってそこへ移動 |
| `git switch <名前>` | 既存のブランチへ移動。作業ツリーもその内容に入れ替わる |
| `git push` | ローカルのコミットを GitHub へ送る |
| `git pull` | GitHub の変更を手元へ取り込む |
| `git log --oneline` | 履歴を1行ずつ表示 |

コマンドを読む例:

```bash
git switch -c feat/search
#   └ ブランチ操作  └ create  └ ブランチ名
# 「feat/search という枝を新しく作って、そこに移動する」
```

ブランチと Pull Request の使い方は別記事「ブランチと Pull Request で
変更を1周させる」に詳しく書いた。

## gh —— GitHub をターミナルから

GitHub の Web 画面でやる操作(リポジトリ作成、PR、Actions の確認)を
コマンドでできる公式ツール。git とは別物で、使う前に一度ログインが要る。

| コマンド | すること |
|---|---|
| `gh repo create` | GitHub 上にリポジトリを作る |
| `gh pr create` | いまのブランチから Pull Request を作る |
| `gh pr merge <番号> --squash --delete-branch` | PR をマージ(squash)して枝を消す |
| `gh run list` / `gh run watch <id>` | GitHub Actions の実行を一覧 / 完了まで見守る |
| `gh api <パス>` | GitHub の API を直接叩く(Web の設定画面の代わり) |

コマンドを読む例:

```bash
gh pr merge 5 --squash --delete-branch
#  └ PR操作 └ merge └ 番号 └ 1コミットに畳む └ マージ後に枝を削除
```

このプロジェクトでは、ブランチ保護(`main` は CI 緑でないとマージ不可)や
GitHub Pages の有効化も `gh api` で設定した。Web 画面と同じことを
コマンドの記録として残せる。

## まとめ —— 3つの守備範囲

| ツール | 担当 | ひとことで |
|---|---|---|
| **npm** | ビルド・実行・依存 | 「動かす」 |
| **git** | 手元の変更履歴 | 「記録する」 |
| **gh** | GitHub 上の操作 | 「共有する・自動化する」 |

手順書のコマンドは、頭の CLI 名を見れば「いまローカルの話か、GitHub の話か」が
だいたい分かる。あとはサブコマンドとフラグを1つずつ読む。
