---
title: "GitHub Pages に自動デプロイする"
description: "push するだけで公開サイトが更新される、を最小構成で。サブパス公開の落とし穴と、その直し方。"
date: 2026-08-30
tags: ["astro", "ci", "diary"]
---

ビルドした `dist/` を「ファイル置き場」に置けば静的サイトは公開できる。
その置き場に **GitHub Pages**(公開リポジトリなら無料)を使い、
置く作業を GitHub Actions に任せた。
結果、`main` に push → ビルド → 公開までが自動で回る。
本番で使う予定のホスティングも役割は同じなので、ここで流れを掴んでおく。

## 全体像

```
git push (main)
   └─ GitHub Actions
        ├─ build:  npm ci → npm run build     (dist/ を作る)
        └─ deploy: dist/ を GitHub Pages に公開  (main のときだけ)
```

PR の段階では build だけ走り、deploy は動かない。
`main` に入ったものだけが公開される。

## 落とし穴: 公開 URL がサブパスになる

GitHub Pages はサイトを `https://<ユーザー名>.github.io/<リポジトリ名>/` に置く。
ドメインの直下(`/`)ではなく、一段深い `/<リポジトリ名>/` が起点になる。

Astro にこれを教えるのが `astro.config.mjs` の設定。

```js
export default defineConfig({
  site: 'https://<ユーザー名>.github.io', // 絶対 URL を作るときの土台
  base: '/<リポジトリ名>',                // サイトの起点となるサブパス
});
```

ここで一度ハマった。**`base` を設定すると、Astro は自分が生成する URL
(CSS・JS・画像の読み込みパスなど)には自動で `base` を足す。
でも、自分が手で書いた `<a href="/tags">` のようなリンクは直してくれない。**
その結果、内部リンクが軒並み `/tags`(ドメイン直下、存在しない)を指してしまう。

## 直し方: 小さいヘルパーを1つ通す

内部リンクを組み立てる関数を作り、全リンクをそこに通した。

```ts
// import.meta.env.BASE_URL は "/" (開発時) か "/<リポジトリ名>" (公開時)
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function href(path: string) {
  const rel = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${rel}`;
}
```

使う側:

```astro
<a href={href('/tags')}>タグ一覧</a>
<a href={href(`/posts/${slug}`)}>{title}</a>
```

- `import.meta.env.BASE_URL` はビルド時に実際の値へ置き換わる環境変数。
- このプロジェクトの環境では **末尾にスラッシュが付かなかった**
  (`/astro-warmup`)。最初それを知らずに `` `${BASE_URL}tags` `` と書き、
  `/astro-warmuptags` という繋がった文字列ができて気づいた。
  スラッシュは自前で管理する形にした。
- 検索用の `search.json` を作る側でも、記事 URL を `href()` に通す必要があった。
  検索結果のリンク先として使われるため。

## デプロイのジョブ

```yaml
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```

| 要素 | 役割 |
|---|---|
| `needs: build` | build が終わってから動く。その成果物(`dist/`)を受け取る |
| `if: ... == 'refs/heads/main'` | PR では動かさない |
| `permissions:` | このジョブにだけ「Pages に書き込む」権限を与える。<br>ファイル全体の既定は「読み取りだけ」に絞っておく |

権限を必要なジョブだけに与えるのは、事故や悪用の影響範囲を狭めるため。

## Pages を有効にする

リポジトリ側で「公開元は GitHub Actions」と設定して初めて、
deploy ジョブが成功する。GitHub の設定画面でもできるし、コマンドでもできる。

```bash
gh api -X POST repos/<owner>/<repo>/pages -f build_type=workflow
```

## できたもの

これで `main` に push するたび、数十秒後に公開サイトが更新される。
「ローカルで確認 → PR で CI が守る → `main` に入ったら自動で本番反映」
という、小さいながら一通りの CI/CD が回るようになった。
