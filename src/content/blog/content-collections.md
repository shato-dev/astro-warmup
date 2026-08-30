---
title: "content collection とスキーマ"
description: "記事群を『型のついた表』として扱う仕組み。frontmatter をスキーマで縛ると、書き間違いがビルド時に分かる。"
date: 2026-08-26
tags: ["astro"]
---

## 何を解決するものか

記事は Markdown ファイルで、冒頭の frontmatter にタイトルや日付を書く。

```markdown
---
title: "はじめての Astro"
date: 2026-08-25
tags: ["astro", "diary"]
---

本文...
```

これを自由記述のまま増やしていくと、じわじわ壊れる。

- ある記事は `date: 2026-08-25`、別の記事は `date: "Aug 25, 2026"`
- `tags` を書き忘れた記事があって、一覧ページでタグを回すところで落ちる
- `title` を `titel` とタイプミスして、そのページだけ見出しが空になる

厄介なのは、**どれもビルドは通ってしまい、実際にページを開いて初めて気づく**こと。

content collection は、記事群を
**「`title` は文字列、`date` は日付、`tags` は文字列の配列」という、
列と型の決まった表**として扱う Astro の仕組み。
SQL でいう `CREATE TABLE` を先に書いておくのと同じ発想。

## スキーマの書き方

`src/content.config.ts` に、記事1件の形を書く。

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

### `z` は何者か

`z` は **Zod** というバリデーションライブラリ。
「この値は文字列であるべき」「これは日付の配列」といったルールを
コードで組み立てて、実際のデータがそれに合うか検査してくれる。
Astro が frontmatter の検査に Zod を採用しているので、そのまま使う。

Python でいうと `pydantic` に近い。「型ヒントを書いたら、実行時に本当に
その型か確かめてくれる」もの。

### 1行ずつ

| 書き方 | 意味 |
|---|---|
| `z.string()` | 文字列。必須(なければエラー) |
| `z.coerce.date()` | 日付。`coerce` = 「`"2026-08-25"` という文字列を `Date` に変換してから検査」 |
| `z.array(z.string())` | 文字列の配列 |
| `.default([])` | 書かれていなければ空配列にする(= 省略可) |
| `.default(false)` | 同上。`draft` を書かなければ「下書きではない」 |

このスキーマに合わない frontmatter を書くと、**ビルドがそこで止まって
「どのファイルのどの項目が変か」を教えてくれる**。これがやりたかったこと。

## loader —— 記事をどこから読むか

```ts
loader: glob({ pattern: '**/*.md', base: './src/content/blog' })
```

`glob` は「このフォルダの `.md` を全部、記事として読む」という指定。
ファイル名(`hello-astro.md`)がそのまま記事の ID になり、URL の一部
(`/posts/hello-astro`)にも使われる。

ここが**データの供給元を差し替えられる層**になっている。
いまはローカルの Markdown だが、`loader` を別のものに変えれば
外部の CMS から記事を取ってくる形にもできる。この学習プロジェクトを
やっている目的の一つが、その差し替えの練習。

## 記事を使う側

ページからは `getCollection` で表として取り出す。

```ts
import { getCollection } from 'astro:content';

// 下書きを除いて、新しい順に
const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
```

`data` の中身はスキーマ通りだと保証されている。
`post.data.date` は `Date` オブジェクトなので `.getTime()` で比較できるし、
エディタも `data.` の後に `title` `date` `tags` を補完してくれる
(スキーマから型が自動生成されるため)。

## 下書きの扱い

`draft: true` の記事は、一覧・タグページを作るときに上のフィルタで弾く。
ファイルとしては存在するので、書きかけを手元に置いておける。
公開の切り替えが frontmatter 1行で済む。
