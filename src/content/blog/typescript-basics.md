---
title: "TypeScript の基礎 —— このサイトのコードで読む"
description: "JavaScript に型注釈を足した言語。何のためにあるのか、どこまで書けば十分か、実際のコードで確認する。"
date: 2026-08-30
tags: ["basics", "astro"]
---

TypeScript(TS)は **JavaScript に「型」の情報を足しただけ**の言語。
文法の 9 割は JavaScript そのもので、そこに `: string` のような
注釈が乗る。別記事「JavaScript の基礎」を先に押さえてから読むとよい。

## 何を解決するのか

JavaScript は型を書かないので、こういうミスが実行するまで分からない。

```js
function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

formatDate('2026-08-25');  // 文字列には .toISOString() が無い → 実行時にエラー
```

TypeScript なら「`date` は `Date` 型」と宣言でき、
`formatDate('...')` と書いた**その場で**エディタが赤線を出す。

```ts
function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
```

考え方は content collection のスキーマと同じ。
「データの形を先に決めて、ズレたら早い段階で気づく」を、
記事データではなくコード全体に対してやる。

Python の型ヒント(`def f(x: int) -> str:`)に近いが、
**チェックが開発の標準工程に組み込まれている**のが違い。
`mypy` を必ず通す運用、というイメージ。

## 最終的には JavaScript に戻る

型注釈は**ビルド時に消される**。ブラウザや Node.js が動かすのは
型情報を取り除いた普通の JavaScript。
つまり TypeScript は「実行される言語」ではなく「書くとき・チェックするときの言語」。

このサイトでは Astro(内部で Vite というツールを使う)がビルド時に
`.ts` と `.astro` から型を落として JavaScript にしている。

## 基本の注釈

```ts
let title: string = 'x';       // 文字列
let count: number = 0;         // 数値
let done: boolean = false;     // 真偽
let tags: string[] = [];       // 文字列の配列
let note: string | undefined;  // 文字列 または undefined(ユニオン型)
```

`A | B` は「A か B のどちらか」。`null` や `undefined` を含めたいときによく使う。

## ほとんどの場合、型は書かなくてよい(型推論)

```ts
const name = '学習ログ';   // 右辺が文字列なので name は string と推論される
```

代入する値から型が決まるので、変数にいちいち注釈は付けない。
関数の**引数**と、外に公開する関数の**戻り値**くらいに絞るのが実務の感覚。

このサイトの `getPublishedPosts()` にも戻り値の型は書いていない。
`getCollection('blog')` が返す型から自動的に決まり、それを使う
`index.astro` 側でも `post.data.title` がちゃんと文字列として扱われる。

## `interface` —— オブジェクトの形に名前をつける

[`PostCard.astro`](https://github.com/shato-dev/astro-warmup/blob/main/src/components/PostCard.astro) から:

```ts
interface Props {
  slug: string;
  title: string;
  description: string;
  date: Date;
  tags: string[];
}

const { slug, title, description, date, tags } = Astro.props;
```

`interface Props { ... }` は「この部品はこういう項目を受け取る」という宣言。
`Props` は Astro が特別扱いする名前で、これを書いておくと
`<PostCard title={...} />` を呼ぶ側で項目の過不足や型違いを検出できる。

`type` でもほぼ同じことが書ける。[`Search.astro`](https://github.com/shato-dev/astro-warmup/blob/main/src/components/Search.astro) の `<script>` では:

```ts
type Entry = {
  title: string;
  description: string;
  body: string;
  url: string;
  tags: string[];
};
```

`search.json` から読み込む1件分の形を `Entry` と名付けている。

## ジェネリクス —— 「中身の型」を渡す

`<>` で型を部品に渡す書き方。最初は記号が多く見えるが、
「箱の中身が何型か」を指定しているだけ。

```ts
// この querySelector が返すのは「input 要素」だと指定
const input = document.querySelector<HTMLInputElement>('#search-input');

// キーが文字列・値が数値の Map
const tagCounts = new Map<string, number>();
```

`Map<string, number>` は Python でいう「`dict[str, int]` のつもり」。
`HTMLInputElement` を指定すると、`input.value` が文字列として扱えるようになる
(指定しないと「要素かもしれないし null かもしれない」で止まる)。

## `!` —— 「ここは絶対 null じゃない」と手動で保証する

```ts
const input = document.querySelector<HTMLInputElement>('#search-input')!;
```

`querySelector` は「見つからなければ `null`」を返す型になっている。
末尾の `!` は「このセレクタは必ずヒットすると分かっているので `null` チェックは省く」
という開発者の言い切り。**保証を人間が肩代わりする**ので、
外したときは自分の責任。乱用しない。

## strict モード

[`tsconfig.json`](https://github.com/shato-dev/astro-warmup/blob/main/tsconfig.json):

```json
{ "extends": "astro/tsconfigs/strict" }
```

Astro が用意した厳しめの設定を引き継いでいる。
「`null` かもしれない値をそのまま使う」「型が曖昧なまま放置」を
エラー扱いにする。最初は怒られる回数が増えるが、
その分だけ実行前にバグが減る。学習用途なら strict で始めてよかった。

## まとめ

- TypeScript = JavaScript + 型注釈。実行前に形の食い違いを見つける
- 書くのは主に「関数の引数」「公開関数の戻り値」「受け取るデータの形(`interface` / `type`)」。あとは推論に任せる
- `<>` は中身の型指定、`!` は null 保証の肩代わり、`|` は「どちらか」
- 型はビルドで消え、動くのは普通の JavaScript

content collection がデータを守り、TypeScript がコードを守る。
どちらも「早い段階で気づく」ための同じ発想の道具。
