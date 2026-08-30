---
title: "JavaScript の基礎 —— このサイトのコードで読む"
description: "変数・関数・配列操作・非同期・DOM。Python 経験者向けに、実際に書いたコードを教材にして最短で読めるようにする。"
date: 2026-08-30
tags: ["basics"]
---

このサイトの JavaScript / TypeScript / `.astro` は、突き詰めると全部 JavaScript。
まずこれが読めれば、残りは「JavaScript + 何か」として理解できる。
Python に慣れている前提で、要点だけ拾っていく。

## JavaScript はどこで動くか

もともとは**ブラウザの中で Web ページに動きをつける**ための言語。
HTML が構造、CSS が見た目、JavaScript が振る舞い、という分担。

後から **Node.js** という「ブラウザの外で JavaScript を動かす実行環境」が
できて、ビルドツールや CLI やサーバーも書けるようになった。
`node script.js` は `python script.py` に相当する。

このサイトだと:

- ビルド時の処理(記事を読む、HTML を組み立てる)= Node.js で動く
- 検索ボックスの絞り込み = 閲覧者のブラウザで動く

同じ言語だが、動く場所が違う。

## 変数: `const` と `let`

```js
const siteName = '学習ログ';  // 再代入しない
let count = 0;                 // 再代入する
count = count + 1;
```

- `const` を基本にして、再代入が要るときだけ `let`。`var` は古いので使わない。
- 型は書かない(動的型付け)。`const x = 1` の後に `x = 'a'` も文法上は可能
  (`const` なので再代入自体は弾かれるが、型の縛りはない)。
- **ブロックスコープ**。`{ }` の中で宣言した変数はその外から見えない。
  Python の関数スコープとは違う。

## 値の種類

| 種類 | 例 | Python だと |
|---|---|---|
| 文字列 | `'hello'` `"hello"` | `str` |
| 数値 | `42` `3.14` | `int` / `float`(区別なし) |
| 真偽 | `true` `false` | `True` / `False` |
| 配列 | `[1, 2, 3]` | `list` |
| オブジェクト | `{ name: 'x', age: 3 }` | `dict`(ただしキーは文字列前提) |
| なし | `null` と `undefined` の**2種類** | `None` |

`null` は「意図的に空」、`undefined` は「まだ値がない / 存在しない」。
実務では両方を「無い」とまとめて扱うことが多い(後述の `??` `?.`)。

## 関数

書き方が2つある。

```js
// 関数宣言
function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

// アロー関数(無名関数を短く書く。コールバックで多用)
const formatDate = (date) => date.toISOString().slice(0, 10);
```

アロー関数は `引数 => 式` で、`式` の値がそのまま戻り値。
`x => x + 1` は Python の `lambda x: x + 1` に近いが、複数行も書ける。

このサイトの [`src/lib/posts.ts`](https://github.com/shato-dev/astro-warmup/blob/main/src/lib/posts.ts) から
(`async` / `await` は後述):

```js
export async function getPublishedPosts() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
```

`({ data }) => !data.draft` と `(a, b) => ...` の2つがアロー関数。
どちらも「他の関数に処理を渡す」ために使っている。
1つ目は「下書きを除く」条件、2つ目は「日付の新しい順」の並べ替え規則。

## オブジェクトと分割代入

```js
const post = { title: 'はじめての Astro', date: '2026-08-25' };

// 取り出し(分割代入 / destructuring)
const { title, date } = post;        // title と date という変数ができる

// { x } は { x: x } の省略
const title = 'x';
const obj = { title };               // → { title: 'x' }

// スプレッド: 展開する
const tags = ['astro'];
const more = [...tags, 'diary'];      // ['astro', 'diary']
```

`const { data } = post` のような分割代入は、このサイトのコードの
あちこちに出てくる。「オブジェクトから必要な項目だけ名前で取り出す」だけ。

## 配列操作 —— ループより「変換」

Python のリスト内包表記に当たるものを、メソッドチェーンで書く。

| メソッド | すること | Python |
|---|---|---|
| `arr.map(f)` | 各要素を変換して新しい配列 | `[f(x) for x in arr]` |
| `arr.filter(f)` | 条件に合う要素だけ残す | `[x for x in arr if f(x)]` |
| `arr.sort(cmp)` | 並べ替え(**元の配列を書き換える**) | `sorted(arr, key=...)` |
| `arr.flatMap(f)` | 変換して1段平らにする | `sum((f(x) for x in arr), [])` |
| `arr.includes(v)` | 値が含まれるか(true/false) | `v in arr` |
| `arr.some(f)` / `arr.every(f)` | 1つでも / すべて条件を満たすか | `any(...)` / `all(...)` |

タグ集計([`tags/index.astro`](https://github.com/shato-dev/astro-warmup/blob/main/src/pages/tags/index.astro))の例:

```js
// 全記事のタグを集め、Set で重複を消す
const allTags = posts.flatMap((post) => post.data.tags);
const uniqueTags = [...new Set(allTags)];
```

`new Set([...])` は Python の `set()`。`[...set]` で配列に戻している。

## 文字列の埋め込み(テンプレートリテラル)

バッククォート `` ` `` で囲むと、中に `${式}` を埋め込める。Python の f-string。

```js
const slug = 'hello-astro';
const url = `/posts/${slug}`;   // '/posts/hello-astro'
```

## 「無い」に強くする 2 つの記号

```js
const tags = post.data.tags ?? [];   // 左が null/undefined なら右を使う
const name = user?.profile?.name;    // 途中が null/undefined なら undefined で止まる
```

- `a ?? b` … Python の `a if a is not None else b`
- `a?.b` … `a` が無ければそこで評価を止める(エラーにしない)

[`search.json.js`](https://github.com/shato-dev/astro-warmup/blob/main/src/pages/search.json.js) の `post.body ?? ''` は
「本文が無ければ空文字」。

## 非同期: `async` / `await`

時間のかかる処理(ファイル読み込み、ネットワーク)は「今すぐ答えが返らない」。
JavaScript はそれを **Promise**(「後で値が入る箱」)で表す。
`await` を付けると、その箱に値が入るまで待ってから次に進む。

```js
async function loadIndex() {
  const res = await fetch(searchJsonUrl);   // 取得を待つ
  const entries = await res.json();          // JSON への変換を待つ
  return entries;
}
```

`await` は `async` を付けた関数の中でしか使えない。
Python の `async def` / `await` とほぼ同じ考え方。
(Python の同期コードに慣れていると、ここが一番の「別物」ポイント。
ネットワークやファイルが絡む関数は `async` になる、と覚えておく。)

## モジュール: `import` / `export`

ファイルをまたいで関数や値を共有する仕組み。

```js
// posts.ts: 外に公開する
export function getPublishedPosts() { /* ... */ }

// index.astro: 使う側
import { getPublishedPosts } from '../lib/posts';
```

- `export` を付けたものだけ、他のファイルから `import` できる。
- パスはファイルの場所を相対で書く(`../lib/posts`)。
  Python のパッケージ名解決とは違い、**ファイルシステム上の位置**で指す。
- `package.json` の `"type": "module"` は「このプロジェクトは
  この新しい import/export 方式(ES Modules)を使う」という宣言。

## ブラウザ側だけの道具: DOM 操作

ページを開いた後に中身をいじるための API。[`Search.astro`](https://github.com/shato-dev/astro-warmup/blob/main/src/components/Search.astro) の `<script>` から:

```js
// 要素を取ってくる(CSS セレクタで指定)
const input = document.querySelector('#search-input');

// イベントに反応する(入力されるたびに関数を呼ぶ)
input.addEventListener('input', () => {
  const query = input.value.trim().toLowerCase();
  // ...
});

// 要素を作って中身を入れる
const li = document.createElement('li');
li.textContent = entry.title;   // .textContent なら文字列として安全に入る
```

`document` はブラウザが用意するグローバル変数で、ページ全体を指す。
Node.js 側には存在しない(ページが無いので)。

## まとめ: 検索スクリプトを通して読む

ここまでの部品で [`Search.astro`](https://github.com/shato-dev/astro-warmup/blob/main/src/components/Search.astro) の `<script>` はだいたい読める。

1. `document.querySelector` で入力欄と結果リストを取得(DOM)
2. `addEventListener('input', ...)` で入力を監視(イベント + アロー関数)
3. 初回だけ `await fetch(...)` で検索データを取得(非同期 + モジュール外の関数)
4. `entries.filter(entry => entry.title.toLowerCase().includes(query))`
   で絞り込み(配列操作 + 文字列)
5. `document.createElement` で結果の `<li>` を組み立てて表示(DOM)

「変換の連鎖 + 非同期 + DOM」。JavaScript のコードは多くがこの3つの
組み合わせでできている。
