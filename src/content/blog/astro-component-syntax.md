---
title: "Astro コンポーネントの文法 —— `.astro` ファイルの読み方"
description: "フロントマターとテンプレート、props、slot、getStaticPaths、scoped style。実ファイルを上から順に読む。"
date: 2026-08-30
tags: ["basics", "astro"]
---

`.astro` は Astro 専用のファイル形式。1ファイル = 1つの「コンポーネント」
(画面の部品、またはページ1枚)。中身は **JavaScript / TypeScript と
HTML を合体させたもの**で、慣れれば普通に読める。
別記事「JavaScript の基礎」「TypeScript の基礎」を先に見ておくと楽。

## ファイルは上下2部構成

```astro
---
// ① フロントマター: ビルド時に動く JS/TS。データの下ごしらえ。
const title = '記事一覧';
const posts = await getCollection('blog');
---

<!-- ② テンプレート: 出力される HTML。① で作った値を差し込める。 -->
<h1>{title}</h1>
<p>全 {posts.length} 記事</p>
```

- `---` で挟まれた部分がフロントマター。**閲覧者には届かない**
  (HTML を組み立てたら消える)。
- その下がテンプレート。ほぼ HTML だが、`{ }` で JS の式を埋め込める。
- 「いつ・どこで動くか」の詳しい話は別記事「`.astro` の2つの JS 領域」に書いた。

## テンプレートの `{ }`

波かっこの中は JavaScript の**式**(値になるもの)。

```astro
<h1>{post.data.title}</h1>                        <!-- 変数の値 -->
<a href={`/posts/${slug}`}>リンク</a>             <!-- テンプレートリテラル -->
<time datetime={formatDate(date)}>{formatDate(date)}</time>  <!-- 関数呼び出し -->
```

### 繰り返し: 配列を `.map()` して要素の配列にする

[`index.astro`](https://github.com/shato-dev/astro-warmup/blob/main/src/pages/index.astro) から:

```astro
{posts.map((post) => (
  <PostCard
    slug={post.id}
    title={post.data.title}
    date={post.data.date}
    tags={post.data.tags}
  />
))}
```

`posts.map(...)` が「`<PostCard>` の配列」を返し、それがそのまま並んで描画される。
Python でループして HTML 文字列を継ぎ足すのに近いが、文字列ではなく
「要素そのもの」を作る。

### 条件表示: `&&` と三項演算子

```astro
{description && <meta name="description" content={description} />}
{post.data.draft && <p class="draft-note">(下書きです)</p>}
```

`A && B` は「A が真なら B」。左が偽なら何も描画されない。
これは JavaScript の短絡評価をそのまま使ったイディオム。

## 属性の書き方

```astro
<a href={href('/')}>ホーム</a>       <!-- { } で値を渡す -->
<ul hidden>...</ul>                   <!-- 真偽属性はそのまま書く -->
<div class="post-card">...</div>      <!-- ふつうの文字列はクォート -->
```

## コンポーネントを部品として使う

他の `.astro` を `import` して、HTML タグのように置く。

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import PostCard from '../components/PostCard.astro';
---

<BaseLayout title="記事一覧">
  <h1>学習ログ</h1>
</BaseLayout>
```

タグ名はインポート時の名前。大文字始まりだと「コンポーネント」、
小文字だと「ふつうの HTML タグ」として扱われる。

## props —— 部品にデータを渡す

関数の引数と同じ。渡す側は属性、受け取る側は `Astro.props`。

[`PostCard.astro`](https://github.com/shato-dev/astro-warmup/blob/main/src/components/PostCard.astro):

```astro
---
interface Props {
  title: string;
  slug: string;
  tags: string[];
}
const { title, slug, tags } = Astro.props;   // 分割代入で取り出す
---
<h2><a href={href(`/posts/${slug}`)}>{title}</a></h2>
```

`interface Props` を書いておくと、呼ぶ側で項目の渡し忘れや型違いを
TypeScript が検出してくれる(別記事「TypeScript の基礎」参照)。

## `<slot />` —— 中身を差し込む穴

[`BaseLayout.astro`](https://github.com/shato-dev/astro-warmup/blob/main/src/layouts/BaseLayout.astro) は全ページ共通の外枠(ヘッダー・フッター)。
「本文をここに入れて」という場所に `<slot />` を置く。

```astro
<body>
  <header>...</header>
  <main>
    <slot />          <!-- 各ページの中身がここに入る -->
  </main>
  <footer>...</footer>
</body>
```

呼ぶ側:

```astro
<BaseLayout title="記事一覧">
  <h1>学習ログ</h1>     <!-- これが <slot /> の位置に入る -->
</BaseLayout>
```

React を知っていれば `children` と同じ。

## ページと URL: ファイル置き場ルーティング

`src/pages/` の中のファイル配置が、そのまま URL になる。

| ファイル | URL |
|---|---|
| `src/pages/index.astro` | `/` |
| `src/pages/tags/index.astro` | `/tags` |
| `src/pages/posts/[slug].astro` | `/posts/なにか`(複数) |

`[slug]` のように角かっこが付くと「ここは可変」。

## `getStaticPaths()` —— 作るページを列挙する

静的サイトは**ビルド時に全ページを作りきる**。だから `[slug].astro` は
「どの URL のページを作るのか」を自分で返す必要がある。

[`posts/[slug].astro`](https://github.com/shato-dev/astro-warmup/blob/main/src/pages/posts/%5Bslug%5D.astro):

```astro
---
export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.id },   // URL の [slug] に入る文字
    props: { post },             // そのページに渡すデータ
  }));
}
const { post } = Astro.props;
---
```

記事が 10 本なら 10 個の `{ params, props }` を返し、10 個の URL が生成される。
`params` が住所、`props` が中身。タグページ(`tags/[tag].astro`)も同じ形。

## `<style>` はそのファイル限定(scoped)

```astro
<style>
  .post-card { border-bottom: 1px solid var(--border); }
</style>
```

`.astro` に書いた `<style>` は**そのコンポーネントの要素にしか効かない**。
Astro がクラス名を自動で細工して、他のファイルの `.post-card` と衝突しないようにする。

例外的に外へ効かせたいときは `:global(...)` で囲む。
記事本文は Markdown から生成されるので、その `<h2>` や `<pre>` を整えるのに
[`posts/[slug].astro`](https://github.com/shato-dev/astro-warmup/blob/main/src/pages/posts/%5Bslug%5D.astro) で `:global()` を使っている。

```astro
<style>
  .post-body :global(pre) { padding: 1rem; overflow-x: auto; }
</style>
```

## `astro:content` からの import

記事データを扱う関数は `astro:content` という特別なモジュールから来る。

```astro
import { getCollection, render } from 'astro:content';

const posts = await getCollection('blog');       // 記事一覧を取得
const { Content } = await render(post);           // Markdown 本文を描画用に変換
```

`<Content />` とテンプレートに置くと、その記事の本文 HTML が展開される。

## まとめ: `PostCard.astro` を通して読む

小さいので全体を追える。

1. フロントマターで `interface Props` を宣言し、`Astro.props` を分割代入で受け取る
2. テンプレートで `{title}` などを差し込み、`tags.map(...)` でタグを並べる
3. `<style>` でこの部品だけの見た目を定義

「① 下ごしらえ → ② 差し込み → ③ その部品限定のスタイル」。
`.astro` ファイルはどれもこの3層で読める。
