---
title: "YAML と設定ファイル —— JSON との違いと ci.yml の読み方"
description: "設定ファイルは『コードではなくデータ』。JSON と YAML は同じ構造を別の見た目で書いているだけ。"
date: 2026-08-30
tags: ["basics", "ci"]
---

このプロジェクトには「実行されるコード」とは別に、**設定ファイル**が何種類かある。

| ファイル | 形式 | 役割 |
|---|---|---|
| `package.json` | JSON | 依存ライブラリ・npm スクリプト |
| `tsconfig.json` | JSON | TypeScript の設定 |
| `.claude/launch.json` | JSON | 開発サーバーの起動設定 |
| `.github/workflows/ci.yml` | YAML | GitHub Actions のワークフロー |
| `dist/search.json`(生成物) | JSON | 検索用データ |

共通するのは、**どれも「処理の手順」ではなく「構造を持ったデータ」**だという点。
関数も if も for も無い。何かの値を入れ子で並べているだけで、
それを読むのは別のプログラム(npm、TypeScript、GitHub)。

## データの基本構造(JSON も YAML も同じ)

3種類の組み合わせでできている。

- **スカラー**: 文字列・数値・真偽値・null といった単一の値
- **マップ(オブジェクト)**: 名前と値のペアの集まり。Python の `dict`
- **リスト(配列)**: 値を順に並べたもの。Python の `list`

JSON と YAML は、この同じ構造を**別の記法**で書いているだけ。

## JSON

```json
{
  "name": "astro-warmup",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build"
  },
  "dependencies": {
    "astro": "^7.2.9"
  }
}
```

ルール:

- マップは `{ }`、リストは `[ ]`、キーと文字列は必ずダブルクォート
- 要素の区切りは `,`。**末尾のカンマは禁止**
- **コメントは書けない**
- 空白・改行は自由(見やすさのためだけ)

`package.json` の読み方:

- `"scripts"` … `npm run dev` と打つと `"dev"` の値 `astro dev` が実行される。
  自分でキーを増やせば `npm run <名前>` が増える
- `"dependencies"` … 必要なライブラリと、その許容バージョン。
  `^7.2.9` は「7.2.9 以上 8.0.0 未満」の意味
- `"type": "module"` … このプロジェクトは ES Modules(`import`/`export`)を使う宣言

`tsconfig.json` も同じ形式で、`"extends"` で既製の設定を引き継いでいる。

## YAML

JSON と同じ構造を、**かっこの代わりにインデント**で表す。

```yaml
name: astro-warmup
type: module
scripts:
  dev: astro dev
  build: astro build
dependencies:
  astro: ^7.2.9
```

上の JSON とまったく同じ意味。ルール:

- `キー: 値` でマップの1ペア。**コロンの後にスペースが要る**
- 入れ子は**インデント(半角スペース)**で表す。**タブは使用不可**
- `- ` で始まる行がリストの要素
- 文字列は基本クォート不要。コメントは `#` から行末まで
- インライン記法も使える: `[main]` はリスト、`{a: 1}` はマップ

インデントのズレがそのまま構造のバグになる。YAML で一番ハマるのはここ。

## `ci.yml` を構造として読む

[`.github/workflows/ci.yml`](https://github.com/shato-dev/astro-warmup/blob/main/.github/workflows/ci.yml) を、
「これはマップ」「これはリスト」と意識しながら読むと分かりやすい。

```yaml
name: CI                      # 文字列

on:                           # マップ
  push:                       #   マップ
    branches: [main]          #     リスト(要素1つ)
  pull_request:               #   値なし(null)= 「全 PR で」

permissions:                  # マップ
  contents: read

jobs:                         # マップ(ジョブ名 → ジョブ定義)
  build:                      #   マップ
    runs-on: ubuntu-latest    #     文字列
    steps:                    #     リスト(各要素がマップ)
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:                 #       マップ
          node-version: 24
          cache: npm
      - run: npm ci           #       マップ(キー1つ)
      - run: npm run build
```

`steps:` の下は「マップのリスト」。`- ` が付いた行で新しい要素が始まり、
その中に `uses:` や `with:` がぶら下がる。

## YAML はただの入れ物。意味は読む側が決める

`on` `jobs` `steps` `uses` `run` といったキーに意味があるのは、
**GitHub Actions がそう決めているから**。YAML 自体は「マップとリストの入れ物」を
提供しているだけで、`jobs` を特別扱いするのは GitHub 側。

だから YAML を書くときは実質2つを同時にやっている。

1. YAML の文法(インデント、`-`、`key: value`)
2. その YAML を読むツールが期待する**キーの構造**(Actions のワークフロー形式)

2 は公式ドキュメントを見ながら埋めることになる。丸暗記するものではない。

## `${{ ... }}` —— Actions 独自の式

```yaml
if: github.ref == 'refs/heads/main'
url: ${{ steps.deployment.outputs.page_url }}
```

`${{ }}` の中は GitHub Actions が用意する変数や式。
「今の実行が main へのものか?」「前のステップが出した URL」などを参照する。
これは YAML ではなく Actions の機能。

## 生成される JSON: `search.json`

設定ではないが、形式は同じ。検索用エンドポイントが吐くのは
「記事1件 = マップ」を並べたリスト。

```json
[
  { "title": "...", "url": "/astro-warmup/posts/...", "tags": ["astro"] },
  { "title": "...", "url": "/astro-warmup/posts/...", "tags": ["basics"] }
]
```

ブラウザ側の JavaScript が `fetch` で受け取り、`JSON.parse` 相当で
オブジェクトの配列に戻して使う。**JSON は「プログラム間でデータを渡す共通形式」**
としても使われる、という例。

## まとめ

- 設定ファイルは「手順」ではなく「構造を持ったデータ」。読むのは別のプログラム
- JSON = かっことクォートで構造を書く。コメント不可、末尾カンマ不可
- YAML = 同じ構造をインデントで書く。タブ不可、`key:` の後にスペース、`#` でコメント
- `ci.yml` は「YAML の文法」+「Actions が期待するキー構造」の2層
