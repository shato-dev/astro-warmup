---
title: "GitHub Actions で CI を回す"
description: "「手元で動く」と「どこでも動く」は別。push のたびにクリーンな環境でビルドを回して、壊れた変更を早期に止める。"
date: 2026-08-30
tags: ["git", "ci"]
---

## 何を解決するか

`npm run build` が自分の PC で通っても、それは
「今の自分の PC の状態で通る」でしかない。

- `package.json` に書き忘れた依存が、たまたまグローバルに入っていて動いていた
- 少し前に消したファイルを参照するコードが残っていて、キャッシュで気づけていない
- 自分の Node のバージョンでしか通らない書き方をしていた

こういうズレは、別のマシンで動かして初めて分かる。

**CI (Continuous Integration)** は、その「別のマシン」を毎回自動で用意する仕組み。
push や PR のたびに、GitHub が使い捨てのクリーンな環境で
チェック(ここではビルド)を走らせ、失敗したら赤い印を付けて知らせてくれる。

## ワークフローファイル

`.github/workflows/` に置いた YAML を、GitHub が自動で拾って実行する。
このサイトのものはこんな形。

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run build
```

| キー | 意味 |
|---|---|
| `on:` | いつ動かすか。`main` への push と、すべての PR |
| `jobs:` | 実行する仕事の集まり。ここでは `build` 一つ |
| `runs-on: ubuntu-latest` | GitHub が用意する使い捨ての Linux マシン |
| `steps:` | 上から順に実行する処理 |

## `uses` と `run`

ステップには2種類ある。

- **`run:`** … シェルコマンドをそのまま実行する。`npm ci` や `npm run build`。
- **`uses:`** … 誰かが作った再利用可能な処理(「アクション」)を呼ぶ。
  `actions/checkout` は repo をマシンに展開する定番、
  `actions/setup-node` は指定バージョンの Node を入れる。

`@v5` はアクションのバージョン指定。**アクション自体もバージョン管理されている**。
最初 `@v4` で書いたら「内部が古い Node で動いている」という非推奨警告が出て、
`@v5` に上げて消えた。依存を上げるのと同じ感覚。

`cache: npm` は npm のダウンロードキャッシュを次回の実行に使い回す設定。
2回目以降が速くなる。

## `npm ci` であって `npm install` ではない

CI では `npm install` ではなく `npm ci` を使う。

| | `npm install` | `npm ci` |
|---|---|---|
| 参照するもの | `package.json` | `package-lock.json` |
| ロックファイル | 条件次第で書き換わる | 絶対に書き換えない |
| 速度 | 普通 | 速い(まっさらから入れる前提の最適化) |

CI では「ロックファイルに固定されたバージョンを、そのまま再現する」ことが
大事なので `npm ci` が向いている。

## 進行の見かた

PR を作れば自動で走る。ターミナルからも追える。

```bash
gh run list --branch <ブランチ名>          # 実行の一覧
gh run watch <run-id> --exit-status        # 完了まで見守る(失敗なら非ゼロ終了)
```

ジョブが緑(成功)でも、警告(annotation)が付くことはある。
非推奨のお知らせなどはこれで出る。緑なら取り込んで問題はない。

## ブランチ保護と組み合わせる

CI があるだけでは「赤い PR でもマージしようと思えばできる」。
GitHub の**ブランチ保護 (branch protection)** で
「`build` が緑でないと `main` にマージできない」を強制できる。

```bash
gh api -X PUT repos/<owner>/<repo>/branches/main/protection --input rule.json
```

このサイトでは「`build` を必須チェックにする」だけの最小設定にした。
CI(壊れていたら気づける)+ ブランチ保護(気づいた上で止められる)で、
`main` が常に緑という状態を保てるようになる。
