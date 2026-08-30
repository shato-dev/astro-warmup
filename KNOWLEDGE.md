# KNOWLEDGE — astro-warmup で学んだこと

学習中に出てきた用語・概念のメモ。PLAN.md の用語集をベースに、
セッションで補足した内容を足していく。新しい語が出たらここに追記する。

---

## 1. 用語集(PLAN.md から)

カッコ内は Python / SQL / データ分析での対応物。

### 実行環境まわり

| 用語 | ひとことで言うと |
|---|---|
| **Node.js** | JavaScript を PC 上(ブラウザ外)で動かす実行環境。(≒ Python 本体) |
| **npm** | Node のパッケージ管理コマンド。ライブラリを入れる・スクリプトを走らせる。(≒ pip + Makefile) |
| **nvm** | Node のバージョンを複数入れて切り替えるツール。(≒ pyenv) |
| **dev サーバー** | 開発中だけ自分の PC で動かす簡易 Web サーバー。`npm run dev` で起動、ブラウザで `localhost:4321` を開くと作りかけのサイトが見える。保存すると自動反映。 |
| **localhost** | 「自分の PC 自身」を指すアドレス。外部には出ない。 |

### ビルドと配信

| 用語 | ひとことで言うと |
|---|---|
| **ビルド** | 元ファイル(Markdown, `.astro`, CSS)を、ブラウザが読める HTML/CSS/JS に変換する処理。`npm run build`。(≒ 前処理スクリプトを回して成果物を吐く) |
| **静的サイトジェネレーター (SSG)** | ビルド時に全ページの HTML を一気に作っておくツール。Astro がこれ。配信はただのファイル置き場で済む(速い・安い・壊れにくい)。 |
| **`dist/`** | ビルドが生成する完成品フォルダ。人は触らない。git 管理外。 |
| **`src/`** | 人間が書く元ファイルを入れるフォルダ。基本ここだけ編集する。 |

### データの形

| 用語 | ひとことで言うと |
|---|---|
| **frontmatter** | Markdown 冒頭の `---` で囲んだメタ情報(タイトル、日付、タグなど)。 |
| **型** | データの種類(文字列 / 数値 / 日付 / 真偽値 / 配列)。(= Python の str/int/bool/list) |
| **スキーマ** | データの形の定義。「どの項目が何型で必須か」。(= SQL の `CREATE TABLE`) |
| **content collection** | 記事群を「列と型が決まった表」として扱う Astro の仕組み。frontmatter をスキーマで縛れる。 |

### 画面の組み立て

| 用語 | ひとことで言うと |
|---|---|
| **コンポーネント** | 画面の部品。1 ファイル = 1 部品。他のページから呼び出して再利用する。 |
| **ルーティング** | どの URL でどのページを表示するかの対応。Astro では `src/pages/` のファイル名で決まる。 |

### 言語・ランタイムの基礎

| 用語 | ひとことで言うと |
|---|---|
| **JavaScript (JS)** | もともとブラウザ内で Web ページに動きをつけるための言語。HTML=構造 / CSS=見た目 / JS=振る舞い。文法は Python に近い(動的型付け・インタプリタ)。`const`/`let` で変数宣言、`x => x+1` アロー関数を多用、null 相当が `null` と `undefined` の 2 種。ブラウザで動く唯一の言語なのでフロントでは必須。 |
| **Node.js** | その JavaScript エンジン(Chrome の V8)をブラウザから取り出して単体で動くようにした実行環境。ファイル読み書き・CLI ツール・サーバー・ビルド処理ができる。(≒ Python 本体、`node script.js` ≒ `python script.py`) |
| **TypeScript (TS)** | JS に型注釈を足した拡張版。`let title: string` のように書け、書き間違いを実行前にエラーで検出。最終的に普通の JS に変換(トランスパイル)されて動く。Step 1 でこれを選ぶ。(≒ Python の型ヒント) |
| **npm パッケージ / ライブラリ** | npm レジストリで配布される再利用可能なコード。プロジェクト直下の `node_modules/` に入る(グローバルには入れないのが定石)。`package.json` = 何を入れるか / `package-lock.json` = 正確なバージョン。`node_modules/` は巨大・git 管理外で、`package.json` があれば `npm install` で再現できる。 |

**3 者の関係**: Node.js(土台) → npm(パッケージ管理) → Astro(npm で入れるライブラリ/ツール)。
Astro 自体も JS 製で、`npm run build` すると Node.js が Astro のコードを実行して HTML を吐く。

**Astro の入手タイミング**: Step 1 の `npm create astro@latest` の中で、
雛形 CLI の取得 → 最後に走る `npm install` で Astro 本体+依存を `node_modules/` にダウンロード。
Node.js / npm 自体は事前に nvm 経由で導入済み(環境メモ参照)。

---

## 2. セッションで補足した内容

### Web サーバーとは

**「URL でリクエストが来たら、対応するファイル(や生成結果)を返すプログラム」**。

ブラウザとサーバーは別々のプログラムで、`http` というプロトコル(約束事)で会話している。
やりとりの流れ:

1. ブラウザが「この URL をください」とリクエストを送る
2. その住所で待ち受けている Web サーバーが受け取る
3. サーバーが対応する HTML を探す or その場で作る
4. 中身をレスポンスとして返す
5. ブラウザが受け取った HTML を描画する

データ分析での対応物: `request(URL, パラメータ) → response(HTML や JSON)` という関数。
API を叩いてレスポンスをもらう往復の「返す側」。

**静的 vs 動的**

| 種類 | サーバーが返すもの | 例 |
|---|---|---|
| 静的 | 事前に用意された HTML ファイルをそのまま返すだけ | 今回の Astro サイト |
| 動的 | リクエストごとに HTML をその場で組み立てて返す | ログイン後のマイページなど |

`npm run dev` の dev サーバーも Web サーバーの一種。開発補助つき(保存で自動リロード等)の特別版。
本番の Astro サイトは「HTML ファイルを置いてあるだけの場所」で動くので複雑な Web サーバーは不要
= PLAN 用語集の「配信はただのファイル置き場で済む」の意味。

### 「配信はただのファイル置き場で済む」の中身

- **動的サイト**: リクエストごとにサーバー上でプログラム実行 + DB 問い合わせ → HTML をその場で生成。
  サーバーが常時稼働している必要あり。
- **静的サイト(今回)**: ビルド時に全 HTML を作り終えている(`dist/` が完成品)。
  配信時のサーバーの仕事は「URL に対応するファイルを読んでそのまま返す」だけ。
- そのため配信先が「ファイルを保管して返すだけ」の場所で足りる:
  オブジェクトストレージ(S3 / R2、データ分析の GCS と同じ)、
  静的ホスティング(Netlify / Cloudflare Pages / GitHub Pages、無料枠あり)、CDN。
- 嬉しさ(用語集の「速い・安い・壊れにくい」):
  - 速い = リクエスト時に計算しない + CDN で近くから配れる
  - 安い = 常時稼働サーバー代・DB 代がゼロ
  - 壊れにくい = 動いてるプログラムが無い = 落ちる/攻撃される対象が無い
- 今回のコマンド対応: `dev` = 開発補助(高機能) / `build` = `dist/` に完成品を吐く /
  `preview` = `dist/` をただ返すだけの簡易サーバー(本番に近い)。
  PLAN のスコープ外「デプロイ」= `dist/` をファイル置き場に置く最後の一歩を省く、という意味。

### `.astro` の 2 つの JS 領域(最初の混乱ポイント)

1 つの `.astro` に、動く場所も時間も別物の JS が同居している。

| | フロントマター `---` の中 | クライアント `<script>` の中 |
|---|---|---|
| いつ動く | ビルド時に 1 回だけ | 閲覧者がページを開くたび毎回 |
| どこで動く | 自分の PC(Node.js) | 閲覧者のブラウザ |
| できること | ファイル/DB/API アクセス、`getCollection()` など何でも | ブラウザ内のことだけ(クリック処理、`fetch()` 等) |
| 秘密情報 | 置いて OK(外に出ない) | 置くと閲覧者に丸見え、NG |
| 完成品への残り方 | 消える(HTML を組み立てたら役目終了 ≒ 前処理スクリプト) | バンドルされて `dist/` に同梱・配布される |

- `---` の `const posts` を `<script>` の中でそのまま使うことは**できない**(別ファイル同士くらい離れている)。
  値を渡すには埋め込み専用の書き方が要る。
- Step 6 の検索がこの構造そのもの:
  `---`(ビルド時)で `search.json` を用意 → `<script>`(ブラウザ)で入力文字に応じて `filter()`。

### Git / GitHub のセットアップで分かったこと(Step 0)

- **Git と GitHub は別物**: Git = 手元で履歴を刻むツール。GitHub = その履歴を置くネット上の場所 +
  共同作業機能(PR、Actions など)。GitHub なしでも Git は使える。
- **認証が 2 種類ある**:
  - **SSH 認証**(git の push/pull 用): 公開鍵をアカウントに登録しておくと、
    `git@github.com:...` 形式のリモートに鍵で認証できる。`ssh -T git@github.com` で確認可能。
  - **`gh` の API トークン**(`gh repo create` などコマンド操作用): `gh auth login` で取得。
    SSH が通っていても gh のトークンは別に要る。
  - 公開鍵(`.pub`)は他人に渡す前提のもの。秘密鍵は手元だけ、絶対に渡さない。
- **`.gitignore`**: 生成物(`dist/`)・型の自動生成(`.astro/`)・依存の実体(`node_modules/`)は
  履歴に入れない。`node_modules/` は `package.json` + `package-lock.json` から復元できるので不要。
  (Python の `.venv/` を git 管理しないのと同じ発想)
- **`gh repo create <名前> --public --source=. --remote=origin --push`**:
  「GitHub にリポジトリ作成 + 手元のリモート登録(origin) + 初回 push」を一発で行う。
- **雛形作成の注意**: `npm create astro@latest .` はカレントが空でないと別フォルダに作る。
  中身を手で直下へ移動して対応した。

### Step 5: ページとコンポーネントの作り方(やさしい版)

#### まず全体像:ビルドのとき何が起きているか

`npm run build` すると、Astro が次をやる。

1. `src/content/blog/` の Markdown を全部読む(記事データ)
2. `src/pages/` のファイルを1つずつ見て、HTML を作る
3. できた HTML を `dist/` に置く

**`src/pages/` のファイル名 = URL** というルールがある。

| ファイル | できる URL |
|---|---|
| `src/pages/index.astro` | `/` |
| `src/pages/tags/index.astro` | `/tags` |
| `src/pages/posts/[slug].astro` | `/posts/なにか`(複数) |

`[slug]` のように `[ ]` が付くと「ここは可変。中身はプログラムで決める」の意味。

#### 部品(コンポーネント)= クッキーの抜き型

`PostCard.astro` は「記事カード1枚」の抜き型。

- 抜き型そのものは形だけ。**データ(生地)を渡して初めて中身のあるカードになる**。
- 同じ抜き型に別のデータを渡せば、別の記事のカードが何枚でもできる。
- データの渡し方 = **props**。関数の引数と同じ。

```astro
---
// PostCard.astro の上部:受け取る引数の形を宣言
interface Props {
  title: string;
  slug: string;
  // ...
}
const { title, slug } = Astro.props;  // 渡された値を取り出す
---
<h2><a href={`/posts/${slug}`}>{title}</a></h2>
```

- `interface Props { ... }` … `Props` は Astro が特別扱いする名前。「この部品はこういう値を受け取る」の宣言。
- `Astro.props` … 実際に渡ってきた値の入れ物。
- テンプレートの `{ title }` … 波かっこの中は JS の式。変数の値がそこに入る。
- `` `/posts/${slug}` `` … バッククォートは Python の f-string と同じ。`${slug}` が値に置き換わる。

呼ぶ側(`index.astro`):

```astro
<PostCard title={post.data.title} slug={post.id} />
```

これで `title` と `slug` が PostCard の `Astro.props` に届く。

#### レイアウト = 額縁

`BaseLayout.astro` は全ページ共通の外枠(ヘッダー・フッター)。中身だけ差し替える額縁。

```astro
<BaseLayout title="記事一覧">
  <h1>学習ログ</h1>   <!-- ここが BaseLayout の <slot /> の位置に入る -->
</BaseLayout>
```

`<slot />` = 「各ページの中身がここに入る」という穴。

#### `getStaticPaths()` = 「作るページの住所録」

静的サイトは**ビルドのときに全ページを作りきる**。だから `[slug].astro` は
「どの URL のページを作ればいい?」を Astro に教える必要がある。それが `getStaticPaths()`。

```astro
---
export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.id },   // URL の [slug] 部分に入る文字
    props:  { post },            // そのページに渡すデータ
  }));
}
const { post } = Astro.props;    // ↑ で渡した post を受け取る
---
```

- 記事が5本なら、この関数は5個の `{ params, props }` を返す → 5つの URL が生成される。
- `params` = 住所(URL のどこに何を入れるか)。`props` = そのページで使う中身。
- タグページ(`tags/[tag].astro`)も同じ仕組み。「全記事からタグを集めて重複を消し、タグの数だけページを作る」。

#### `src/lib/posts.ts` = 道具箱

「下書きを除いて日付順に並べる」処理を、一覧・タグページ・(あとで)検索で使い回す。
同じコードを3回書かないよう、1つの関数 `getPublishedPosts()` にまとめて `export`(公開)しておく。
`.astro` ではなく素の TypeScript ファイル。ロジックだけならこれで十分。

#### この Step で出た JS/TS の小道具

| 書き方 | 意味 | Python だと |
|---|---|---|
| `posts.map(p => ...)` | 配列の各要素を変換して新しい配列 | リスト内包表記 |
| `posts.filter(p => ...)` | 条件に合う要素だけ残す | `filter` / 内包表記の `if` |
| `new Set([...])` | 重複を除く | `set()` |
| `arr.flatMap(...)` | 変換したあと1段平らにする | `sum(lists, [])` 的な |
| `a ?? b` | a が null/undefined なら b | `a if a is not None else b` |
| `{ post }` | `{ post: post }` の省略 | （なし) |
| `const { x, y } = obj` | オブジェクトから x, y を取り出す | `x, y = d["x"], d["y"]` |

#### 依存関係の地図

```
posts.ts(道具箱)
  ├─ index.astro ─────┐
  ├─ tags/[tag].astro ├─→ PostCard.astro(表示部品)
  └─ tags/index.astro ┘
  └─ posts/[slug].astro → render() で本文表示(部品は使わない)

全ページ → BaseLayout.astro(額縁)
```

---

### Step 6: クライアントサイド検索

#### 何を解決しているか

静的サイトには「リクエストを受けて処理を返すサーバー」がない。なので
「キーワードで記事を絞る」計算をどこかで動かす必要がある。答えは2段構え:

1. **ビルド時**(PC)= 全記事を検索用の JSON ファイルに書き出しておく
2. **閲覧時**(ブラウザ)= その JSON を読み込んで、入力文字で `filter()`

本番の Meilisearch は 2 を専用の検索エンジンに置き換えた版。仕組みの骨格は同じ
(インデックスを用意 → それを検索)。

#### エンドポイント(`src/pages/search.json.js`)

- `src/pages/` に置くファイルは普通 HTML ページになるが、**`.json.js` で終わると
  「ファイルを返すルート」**になる。`GET()` 関数が返した `Response` の中身が
  そのまま `dist/search.json` になる。サーバー不要の「静的な API」。
- 中身は `getPublishedPosts()` を `.map()` して
  `[{ title, description, body, url, tags }]` の配列にし、`JSON.stringify` して返すだけ。
- **`post.body`** … content collection の各記事が持つ「生 Markdown 文字列」。
  記号(`#`, `` ``` ``)も含むが、部分一致検索には十分。

#### コンポーネント(`src/components/Search.astro`)

- フロントマター `---` は空。**処理はすべて `<script>`(ブラウザ側)**。
  §2「`.astro` の2つの JS 領域」の実例そのもの。
- 流れ: `input` イベント → 初回だけ `fetch('/search.json')` でインデックス取得 →
  入力文字を小文字化 → `title` / `body` を `includes()` で部分一致 → 結果を描画。
- **`fetch` の URL は `import.meta.env.BASE_URL` から組む**。dev では `/`、
  GitHub Pages 公開時(Step 9)は `/astro-warmup/` になる値。ハードコードすると
  Step 9 で 404 になるので先に対策。
- **結果の描画に `innerHTML` を使わない**。`document.createElement` で要素を作り、
  文字は `textContent` で入れる。データを HTML 文字列に連結する癖をつけると
  XSS(悪意ある文字列がスクリプトとして実行される)の入り口になる。
  今回は自分の書いた記事タイトルなので実害はないが、基本の作法として。
  - `el.replaceChildren(...nodes)` … 中身を全部入れ替える(古い結果を消して新しい結果に)。

#### ヘッダーへの設置

`BaseLayout.astro` で `import Search from '../components/Search.astro'` して
ヘッダー内に `<Search />` を1行置くだけ。全ページ共通の外枠なので全ページに出る。

#### つまずき: dev サーバーは1フォルダ1つまで

Astro の `astro dev` はロックを取るので、同じフォルダで2つ目を起動しようとすると
`Another astro dev server is already running` で落ちる。別セッションが dev を
動かしている間の確認は、`npm run build` してから
`npm run preview -- --port <別ポート>`(`dist/` をそのまま返す本番相当サーバー)で行った。
`.claude/launch.json` に `"autoPort": true` を足して、ポート衝突時に別ポートを使えるようにした。

### Step 8: GitHub Actions で CI

#### 何を解決するか

「手元で `npm run build` は通る」だけでは、他のマシン・クリーンな環境で動く保証がない
(依存の入れ忘れ、環境依存のコードなど)。**CI = push / PR のたびに GitHub の
サーバーがクリーンな環境でビルドを走らせ、失敗したらチェックを赤くして知らせる**仕組み。

#### `.github/workflows/ci.yml` の構造

`.github/workflows/` に置いた YAML が「ワークフロー」1つ。GitHub が自動で拾う。

| キー | 意味 |
|---|---|
| `on:` | いつ動かすか。`push`(main への)/ `pull_request`(全 PR) |
| `jobs:` | 実行する仕事の集まり。今回は `build` 1つ |
| `runs-on: ubuntu-latest` | GitHub が用意する使い捨ての Linux マシンで実行 |
| `steps:` | 上から順に実行するコマンド列 |

ステップの中身:

- **`uses: actions/checkout@v5`** … 既製の「アクション」(再利用可能な処理)を呼ぶ。
  これは repo をマシンに clone する定番。`@v5` はバージョン指定。
  **アクション自体もバージョン管理されている**(古い `@v4` は内部が Node 20 で動いていて
  GitHub 側の非推奨警告が出た → `@v5` に上げて解消)。
- **`uses: actions/setup-node@v5` + `with: node-version: 24`** … 指定バージョンの Node を入れる。
  `cache: npm` は npm のダウンロードキャッシュを次回に使い回して高速化。
- **`run: npm ci`** … `npm install` ではなく `npm ci`。
  `package-lock.json` の通りに厳密に入れる(ロックファイルを書き換えない・速い)。CI 向き。
- **`run: npm run build`** … これが本題のチェック。ビルドが失敗すればジョブが失敗 = 赤。

#### 動かし方・確認

- PR を作ると `pull_request` トリガーで自動起動。
- ターミナルから: `gh run list --branch <ブランチ>` で一覧、
  `gh run watch <run-id> --exit-status` で完了まで追う。
- 警告(annotation)はジョブが緑でも出ることがある。今回の Node 20 非推奨警告が例。

#### YAML の最小知識

インデント(スペース)で階層を表す。`key: value` と、`- ` で始まるリスト項目。
Python の辞書 + リストをインデントで書いている感覚。タブは使えない。

#### ブランチ保護(branch protection)

「main には CI が緑の変更しか入れない」というルールを GitHub 側に設定する機能。
`gh api -X PUT repos/<owner>/<repo>/branches/main/protection --input <json>` で入れた。

| 設定した項目 | 意味 |
|---|---|
| `required_status_checks.contexts: ["build"]` | `build` ジョブが緑でないと PR をマージできない。`build` は ci.yml の `jobs:` のキー名 |
| `strict: false` | 「main が進んでいたら PR を最新化してから」を**求めない**(1人開発では毎回の rebase が手間なので off) |
| `enforce_admins: false` | 管理者(= 自分)は直 push でルールをすり抜けられる。PR 経由のマージ時にはチェックが効く |

- required status check の名前は「ジョブ名」。`gh api repos/<owner>/<repo>/commits/main/check-runs`
  で実際のチェック名を確認してから設定した。
- 解除は `gh api -X DELETE .../branches/main/protection`。

### Step 9: GitHub Pages で公開

#### 何を解決するか

ビルド成果物(`dist/`)を置く「ファイル置き場」を GitHub が無料で提供し、URL で公開する。
`main` に push → Actions がビルド → 自動でデプロイ、という「push するだけで本番更新」
(CI/CD)の最小体験。本番の Cloudflare Pages とほぼ同じ役割。

#### `site` と `base`(軽いハマりどころ)

公開 URL が `https://shato-dev.github.io/astro-warmup/` とサブパスになる。

```js
// astro.config.mjs
export default defineConfig({
  site: 'https://shato-dev.github.io', // 絶対 URL の材料(sitemap 等)
  base: '/astro-warmup',              // サブパス。末尾スラッシュなし
});
```

- **Astro が自動で `base` を足すのは「Astro 自身が生成する URL」だけ**
  (CSS / JS / 画像のパスなど)。**自分で書いた `<a href="/tags">` は直してくれない**。
- そこで `src/lib/posts.ts` に `href()` ヘルパーを作り、内部リンクを全部通した:
  ```ts
  const BASE = import.meta.env.BASE_URL.replace(/\/$/, ''); // "" (dev) / "/astro-warmup" (Pages)
  export function href(path: string) {
    const rel = path.startsWith('/') ? path : `/${path}`;
    return `${BASE}${rel}`;
  }
  ```
- **`import.meta.env.BASE_URL` は末尾スラッシュ「なし」**(`/astro-warmup`)だった。
  最初 `` `${BASE_URL}tags` `` と書いて `/astro-warmuptags` になった。スラッシュを
  自分で管理する形に直した。dev では `BASE_URL === "/"` なので strip すると `""`。
- 検索の `search.json` を返すエンドポイントも、記事 URL に `href()` を通す必要があった
  (クライアント script が `a.href = entry.url` で使うため)。
- **記事本文(Markdown)の中に書いた `[x](/posts/y)` も base が付かない**。
  `href()` は `.astro` 側のヘルパーなので Markdown には効かない。この Astro の
  Markdown 処理系(Sätteri)は rehype/remark プラグインを使うのに
  `@astrojs/markdown-remark` の追加インストールが要る。学習プロジェクトでは
  そこまでせず、記事間の相互リンクは「別記事『タイトル』」と本文で言及する形にした。

#### デプロイを Actions に足す

`ci.yml` に `deploy` ジョブを追加。ポイント:

| 要素 | 役割 |
|---|---|
| `actions/upload-pages-artifact@v3` | `dist/` を Pages 用アーティファクトとして固める |
| `actions/deploy-pages@v4` | そのアーティファクトを Pages に公開 |
| `if: github.ref == 'refs/heads/main'` | PR では動かさない(ビルドチェックだけ) |
| `permissions: pages: write / id-token: write` | デプロイジョブだけ強い権限。トップは `contents: read` に絞る |
| `concurrency: group: pages` | デプロイの追い越しを防ぐ |
| `environment: github-pages` | Pages 用の環境。デプロイ URL がここに出る |

#### Pages の有効化(`gh api`)

Web UI(Settings › Pages)の代わりに API で:

```bash
gh api -X POST repos/<owner>/<repo>/pages -f build_type=workflow
```

`build_type=workflow` = 「公開元は GitHub Actions」。これを設定して初めて
`deploy-pages` が成功する(未設定だと 404 で落ちる)。

---

## 3. Python との違いメモ

- **モジュール解決**: import は `src/pages/` のファイル配置がそのまま URL になるなど、
  ファイルの「場所」に意味がある(あとで追記)。
- **ビルドという工程がある**: Python はソースをそのまま実行するが、
  JS/Astro は実行前に「ブラウザ用に変換」するステップが挟まる。

---

## 4. まだ理解が浅い / あとで戻る

- `getStaticPaths()` … Step 5 で一度整理した(§2「ページとコンポーネントの作り方」)。
  複数パラメータや paginate はまだ未経験。
- `<style>` のスコープと `:global()` の使い分け(記事本文の見た目調整で `:global` を使った)
- クライアント `<script>` へのデータ渡し … Step 6 は「JSON を fetch する」方式で回避した。
  `---` の変数を `<script>` に直接渡す `define:vars` などの書き方はまだ未経験
