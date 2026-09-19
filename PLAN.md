# PLAN — astro-warmup(初心者向け)

Astro で「学習ログ」の静的サイトを数時間で作る。
目的はサイトを作ること自体ではなく、**Astro とローカル開発の流れ + Git / GitHub の流れに体で慣れること**。

> このプロジェクトは GitHub の動作検証も兼ねる。よって各ステップに
> **Git / GitHub の操作を意図的に混ぜる**(コミット・ブランチ・push・Pull Request・CI)。

---

## 進捗(現在地) — 2026-08-30 時点

**全 Step 完了。公開サイト: https://shato-dev.github.io/astro-warmup/ で稼働中。**

| Step | 状態 | メモ |
|---|---|---|
| 0 Git/GitHub セットアップ | ✅ 完了 | `gh` 導入済み(brew, v2.98)。`gh auth status` OK(`shato-dev`, SSH)。repo: https://github.com/shato-dev/astro-warmup (public) |
| 1 雛形作成 | ✅ 完了 | `npm create astro@latest`(minimal + TS strict)。雛形はカレント非空のため一度サブフォルダに作られ、中身を手で直下へ移動済み。`package.json` の name は `astro-warmup` |
| 2 content collection | ✅ 完了 | `src/content.config.ts`(glob loader + Zod スキーマ: title/description/date/tags/draft) |
| 3 記事 | ✅ 完了 | `src/content/blog/` に公開5本 + 下書き1本。タグ: astro(4) / diary(3) / git(1) |
| 4 BaseLayout + CSS | ✅ 完了 | `src/layouts/BaseLayout.astro` / `src/styles/global.css`。ヘッダーに「Step 6 でここに検索ボックス」コメントあり |
| 5 ページ3種 | ✅ 完了(PR #1 マージ済み) | `src/pages/index.astro` `posts/[slug].astro` `tags/[tag].astro` `tags/index.astro` + `src/components/PostCard.astro` + `src/lib/posts.ts`(getPublishedPosts / formatDate)。`feat/pages` ブランチ → PR #1 → merge commit で統合。ブランチは削除済み |
| 6 検索 | ✅ 完了(PR #2 squash マージ済み) | `src/pages/search.json.js`(GET エンドポイント → `dist/search.json`)+ `src/components/Search.astro`(ヘッダー検索ボックス、`<script>` で fetch + 部分一致)。fetch パスは `import.meta.env.BASE_URL` 経由(Step 9 のサブパス対策)。`.claude/launch.json` に `autoPort: true` 追加。詳細は KNOWLEDGE.md「Step 6」 |
| 7 ローカルビルド確認 | ✅ 完了 | `npm run build` OK(11 ページ + `/search.json`)。`npm run preview`(port 変更可)で 一覧→タグ一覧→タグ別→記事本文→検索 を目視確認済み |
| 8 GitHub Actions CI | ✅ 完了(PR #3 マージ済み) | `.github/workflows/ci.yml`(`npm ci` → `npm run build`、push/PR トリガー)。checkout / setup-node は `@v5`。**main のブランチ保護を `gh api` で設定済み**: required status check = `build`、`strict:false`、`enforce_admins:false`(管理者は直 push 可、PR マージ時は CI 緑が必須) |
| 9 GitHub Pages 公開 | ✅ 完了(PR #4 マージ済み) | `astro.config.mjs` に `site` + `base: '/astro-warmup'`。内部リンクは `src/lib/posts.ts` の `href()` 経由(Astro は自分の asset URL しか base を足さない)。`ci.yml` に `deploy` ジョブ(main のみ、upload-pages-artifact + deploy-pages)。Pages 有効化は `gh api -X POST .../pages -f build_type=workflow`。公開 URL: https://shato-dev.github.io/astro-warmup/ |

### 引き継ぎ用メモ(新チャットはまず読む)

- **作業ディレクトリ**: リポジトリのルート。ブランチ `main`、作業ツリーはクリーン。
- **Node は nvm 管理**。bash ツールの各コマンド冒頭で `source ~/.nvm/nvm.sh` が必要(非対話シェルは PATH を読まない)。Node `v24.20.0` / npm `11.19.0`。
- **`gh` は `/opt/homebrew/bin/gh`**。PATH に無いことがあるので `export PATH="/opt/homebrew/bin:$PATH"` を付ける。認証済み。
- **dev サーバー**: `.claude/launch.json` に `astro-dev`(port 4321)を定義済み。Browser プレビューツールの `preview_start({name:"astro-dev"})` で起動。**`content.config.ts` 追加後は dev サーバーの再起動が必要だった**(collection を認識しない)。
- **ビルド確認**: `npm run build` → 現在 21 ページ生成(公開記事13 + タグ5 + 一覧2 + search.json)。
- **履歴リセット済み(2026-08-30)**: コミットメタデータに個人メールが露出していたため、リポジトリを一度削除 → 全履歴を1コミットに畳んで公開し直した。git のメール設定はローカル・グローバルとも GitHub の noreply アドレスに変更済み。**過去の PR #1〜#6 とコミット履歴は残っていない**(成果物のみ保持)。
- **記事構成**: 学習ステップ対応の7本 + 概要「Astro 初心者が Claude Code で〜」+ 言語入門5本(タグ `basics`: JS/TS/Astro構文/YAML/シェル)+ 下書き1本。タグ: astro8 / diary5 / basics5 / git3 / ci3。
- **Markdown リンクの制約**: 記事本文中の `[x](/posts/y)` は `base` が付かず公開後 404。記事間参照は本文で「別記事『タイトル』」と書く。実ファイルは GitHub の公開 blob URL を貼る。
- **CI/CD**: `main` に push すると `.github/workflows/ci.yml` が build → deploy(Pages)。`gh run list --branch main` / `gh run watch <id> --exit-status` で監視。
- **ブランチ保護**: main は required status check = `build`。`enforce_admins:false` なので docs の直 push は可。解除は `gh api -X DELETE .../branches/main/protection`。
- **記事の差し替え履歴**: 初期記事にあった「Git と GitHub は別物」はユーザー既知の内容だったため `branch-and-pull-request.md`(タグ git/diary 維持)に差し替え済み(コミット `0fd7829`)。
- **ドキュメント役割分担**: `PLAN.md` = 計画と短い定義 / `KNOWLEDGE.md` = 理解のためのメモ(用語集 + セッション補足 + Step 5 のやさしい解説まで記載済み)。新しい概念が出たら KNOWLEDGE.md に追記していく。
- **ユーザーの前提**: Web フロント/JS/TS/モダンインフラは初学者。データ分析(Python/SQL/Bash)の実務経験あり。新概念は「何を解決するか」を一言添える。応答は日本語、コード内の識別子・コミットメッセージは英語。影響の大きい変更は着手前に方針を短く提示。
- **コミットメッセージ**: 英語・命令形。末尾に `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`。

---

## 0. 先に用語集

分からない単語が出たらここに戻る。カッコ内は Python / SQL / データ分析での対応物。

### 実行環境・ビルドまわり

| 用語 | ひとことで言うと |
|---|---|
| **Node.js** | JavaScript を PC 上(ブラウザ外)で動かす実行環境。(≒ Python 本体) |
| **npm** | Node のパッケージ管理コマンド。ライブラリを入れる・スクリプトを走らせる。(≒ pip + Makefile) |
| **nvm** | Node のバージョンを複数入れて切り替えるツール。(≒ pyenv) |
| **dev サーバー** | 開発中だけ自分のPCで動かす簡易 Web サーバー。`npm run dev` で起動、`localhost:4321` で作りかけのサイトが見える。保存すると自動反映。 |
| **localhost** | 「自分のPC自身」を指すアドレス。外部には出ない。 |
| **ビルド** | 元ファイル(Markdown, `.astro`, CSS)を、ブラウザが読める HTML/CSS/JS に変換する処理。`npm run build`。(≒ 前処理スクリプトを回して成果物を吐く) |
| **静的サイトジェネレーター (SSG)** | ビルド時に全ページの HTML を一気に作っておくツール。Astro がこれ。配信はただのファイル置き場で済む(速い・安い・壊れにくい)。 |
| **`dist/`** | ビルドが生成する完成品フォルダ。人は触らない。git 管理外。 |
| **`src/`** | 人間が書く元ファイルを入れるフォルダ。基本ここだけ編集する。 |

### データの形・画面の組み立て

| 用語 | ひとことで言うと |
|---|---|
| **frontmatter** | Markdown 冒頭の `---` で囲んだメタ情報(タイトル、日付、タグなど)。 |
| **型** | データの種類(文字列 / 数値 / 日付 / 真偽値 / 配列)。(= Python の str/int/bool/list) |
| **スキーマ** | データの形の定義。「どの項目が何型で必須か」。(= SQL の `CREATE TABLE`) |
| **content collection** | 記事群を「列と型が決まった表」として扱う Astro の仕組み。frontmatter をスキーマで縛れる。 |
| **コンポーネント** | 画面の部品。1ファイル = 1部品。他のページから呼び出して再利用する。 |
| **ルーティング** | どの URL でどのページを表示するかの対応。Astro では `src/pages/` のファイル名で決まる。 |

### Git / GitHub まわり

| 用語 | ひとことで言うと |
|---|---|
| **Git** | ローカル(自分のPC)でファイルの変更履歴を記録・管理するツール。(≒ 実験ノートのバージョン管理) |
| **リポジトリ (repo)** | Git が履歴を管理する 1 プロジェクトの単位。フォルダ + `.git/` の履歴。 |
| **コミット (commit)** | 「ここまでの変更をひとまとまりで履歴に刻む」操作。1 コミット = 意味のある 1 変更。 |
| **ブランチ (branch)** | 履歴の枝分かれ。`main` から枝を作り、そこで作業して後で合流させる。 |
| **GitHub** | リポジトリをネット上に置く場所 + 共同作業の機能(PR、レビュー、Actions など)。(≒ リモートの実験ノート共有 + レビュー環境) |
| **リモート / origin** | ローカル repo に紐づけた「本体はあっち」という向き先。`origin` は GitHub 上の repo を指す慣習名。 |
| **push / pull** | push = ローカルのコミットを GitHub に送る。pull = GitHub の変更を手元に取り込む。 |
| **gh** | GitHub をコマンドで操作する公式 CLI。repo 作成や PR 作成をターミナルから行える。 |
| **Pull Request (PR)** | 「このブランチの変更を `main` に取り込みたい」という提案。差分レビューと議論の場。個人開発でも変更単位の記録として有用。 |
| **GitHub Actions / CI** | push や PR のたびに GitHub のサーバー上で決めた処理(ビルド・テスト等)を自動実行する仕組み。CI = Continuous Integration。 |
| **GitHub Pages** | GitHub が無料で提供する静的サイトの配信場所。`https://<ユーザー名>.github.io/<repo>/` で公開される。本番の Cloudflare Workers とほぼ同じ役割。 |

---

## 1. ゴール(何ができれば完成か)

- [x] `npm run dev` でローカルにサイトが立ち、記事一覧が見える
- [x] 記事は Markdown ファイルとして `src/content/blog/` に置いてある
- [x] トップ = 記事一覧 / `/posts/xxx` = 記事本文 / `/tags/xxx` = そのタグの記事一覧
- [x] 画面上部の検索ボックスに文字を打つと、タイトル・本文の部分一致で記事が絞れる
- [x] `npm run build` がエラーなく通り、`dist/` に HTML が出る
- [x] GitHub に repo があり、各ステップがコミット履歴として残っている
- [x] 1 つの機能を「ブランチ → push → Pull Request → マージ」の流れで入れた経験がある(PR #1)
- [x] push すると GitHub Actions で自動ビルドが走る(CI)
- [x] GitHub Pages で公開 URL からサイトが見える(https://shato-dev.github.io/astro-warmup/)

スタイルは最小限(読める程度)。ローカルのテストコードは書かない。

---

## 2. 完成イメージ(画面)

```
┌───────────────────────────────────────────┐
│  学習ログ            [ 検索: ______ ]     │  ← 全ページ共通のヘッダー
├───────────────────────────────────────────┤
│  2026-08-20  はじめての Astro              │
│  #astro #diary                            │  ← 記事カード(クリックで本文へ)
│  Astro を触ってみた最初のメモ…             │
│                                           │
│  2026-08-18  content collection とは       │
│  #astro                                   │
│  ...                                      │
└───────────────────────────────────────────┘
```

---

## 3. 作業ステップ

各ステップに「**何をするか**」「**なぜ / 何を学ぶか**」「**Git/GitHub でやること**」を書く。
コミットメッセージは英語・命令形(例: `Add blog content collection schema`)。

### Step 0 — Git と GitHub のセットアップ

- **何をするか**:
  1. `gh`(GitHub CLI)を導入: `brew install gh`(無料・カード不要)→ `gh auth login` を1回実行。
  2. Step 1 でプロジェクト雛形を作った直後に `git init`(雛形作成コマンドが自動で済ませる場合あり)。
  3. `.gitignore` に `node_modules/` `dist/` `.astro/` が入っていることを確認。
  4. 最初のコミット。
  5. `gh repo create astro-warmup --public --source=. --remote=origin --push` で
     GitHub 上に repo を作成し、リモート登録と初回 push まで一括。
- **なぜ / 何を学ぶか**:
  - Git = ローカルの履歴、GitHub = ネット上の本体 + 共同作業機能、という役割分担を掴む。
  - `.gitignore` の意味(生成物や巨大な依存フォルダは履歴に入れない)。
  - GitHub への SSH 認証はこの環境では設定済み。
- **環境メモ**: git のユーザー設定・GitHub への SSH 認証は設定済み。

### Step 1 — プロジェクトの雛形を作る

- **何をするか**: `npm create astro@latest` を最小構成(空テンプレート + TypeScript)で実行。
- **できるもの**: `package.json` `astro.config.mjs` `src/pages/index.astro` など。
- **確認**: `npm run dev` → `http://localhost:4321` で「Astro」初期画面。
- **学ぶこと**: npm でのプロジェクト作成、dev サーバーの起動と自動リロード。
- **Git/GitHub**: Step 0 と合わせて、雛形一式を初回コミット → GitHub へ push。
- ここでいったん報告する。

### Step 2 — 記事の「表の形」を決める(content collection)

- **何をするか**: `src/content.config.ts` に記事1件の形をスキーマで書く。
  ```
  title: 文字列(必須)
  description: 文字列(必須) … 一覧に出す短い説明
  date: 日付(必須)
  tags: 文字列の配列(省略可、デフォルト空)
  draft: 真偽値(省略可、デフォルト false) … true の記事は表示しない
  ```
- **なぜ**: frontmatter をバラバラに書くと実行時に壊れる。先に列と型を決めると書き間違いが
  **ビルド時にエラーで**分かる。SQL のテーブル定義と同じ考え方。
- **本番との対応**: 将来 microCMS に置き換わる「記事データをどこから取るか」の層の縮小版。
- **Git/GitHub**: スキーマ定義を1コミット(`Add blog content collection schema`)→ push。

### Step 3 — 記事を数本書く

- **何をするか**: `src/content/blog/` に Markdown を 4〜5 本。ファイル名が URL の一部になる
  (`hello-astro.md` → `/posts/hello-astro`)。タグは 2〜3 種を使い回す。
- **題材**: Astro 学習で分かったこと(用語集の内容など)。
- **Git/GitHub**: 記事追加を1〜2コミット(`Add initial blog posts`)→ push。

### Step 4 — 全ページ共通の外枠を作る

- **何をするか**:
  - `src/layouts/BaseLayout.astro` … `<html>` 骨組み + ヘッダー(サイト名 + 検索ボックス)。
    本文が入る場所に `<slot />`(= 各ページの中身が差し込まれる目印。React の `children`)。
  - `src/styles/global.css` … 最小限の見た目。
- **学ぶこと**: 共通部分を1ファイルにまとめて使い回す(コンポーネントの基本)。
- **Git/GitHub**: レイアウト + スタイルを1コミット → push。

### Step 5 — 3種類のページを作る 【ここをブランチ + Pull Request で練習】

- **何をするか**:
  - `src/pages/index.astro`(トップ = 記事一覧): `getCollection('blog')` → `draft` 除外 →
    日付降順 → カード表示。
  - `src/pages/posts/[slug].astro`(記事本文): `[slug]` は「ここが可変」の意味。1ファイルで全記事を担当。
    `getStaticPaths()` で「**ビルド時にどの URL のページを作るか**」の一覧を返す。
    - **なぜ必要**: 静的サイトは事前に全ページを作る方式なので、作るべきページを自前で列挙する。
      Python にない発想。「ルーティング表をビルド時に手で作る」イメージ。
  - `src/pages/tags/[tag].astro`(タグ別一覧): 全記事からタグを集めて重複除去 → タグごとにページ。
  - `src/components/PostCard.astro`(記事カード部品): 一覧から呼び出して使い回す。
- **Git/GitHub(PR 練習の本番)**:
  1. `git switch -c feat/pages` でブランチを切る。
  2. 上記を実装しながら小さくコミット。
  3. `git push -u origin feat/pages`。
  4. `gh pr create --fill` で Pull Request を作成。
  5. GitHub 上で差分を眺めてセルフレビュー(何が変わったか自分の言葉で確認)。
  6. `gh pr merge --squash --delete-branch` でマージ、`git switch main && git pull` で手元も更新。
- **学ぶこと**: ブランチで作業を隔離 → PR で変更をまとめてレビュー → main に合流、という
  GitHub の中心的ワークフロー。個人開発でも「変更の単位」を残せる。

### Step 6 — クライアントサイド検索

- **方針**: ライブラリなし。ビルド時に全記事の検索用データ(JSON)を作り、ブラウザの素の JS で部分一致。
- **何をするか**:
  1. `src/pages/search.json.js` … 記事一覧を `[{ title, description, body, url, tags }]` の
     JSON で返すファイル。ビルドすると `dist/search.json`(サーバー不要の簡易 API)。
  2. `src/components/Search.astro` … `<input>` + 結果 `<ul>`。`<script>` 内で `search.json` を
     読み込み → 入力文字で `title` / `body` を小文字化して `includes()` で部分一致 → 結果表示。
     - **`.astro` の2領域の違い**(混乱ポイント): `---` の中 = ビルド時・PC 側 /
       `<script>` の中 = ブラウザ側。実行の場所も時間も別物(詳細は KNOWLEDGE.md)。
- **本番との対応**: 将来 Meilisearch に置き換わる「インデックスをどこで検索するか」の縮小版。
- **Git/GitHub**: 検索機能を1〜2コミット(`Add client-side search`)→ push。
  余力があればこれも別ブランチ + PR にして2回目の練習にしてよい。

### Step 7 — ローカルでビルド確認

- `npm run build` → `dist/` に HTML 一式、エラーなし。
- `npm run preview` → 本番相当の配信で表示確認。
- 一覧 → 記事 → タグ → 検索、を一通りクリックして目視。
- **Git/GitHub**: ここまでを push して main を最新化。

### Step 8 — GitHub Actions で自動ビルド(CI)

- **何をするか**: `.github/workflows/ci.yml` を作る。内容は「push / PR のたびに
  Node をセットアップ → `npm ci` → `npm run build` を実行」。
- **確認**: push 後、GitHub の «Actions» タブでワークフローが緑(成功)になる。
  `gh run watch` でターミナルからも進行を見られる。
- **なぜ / 何を学ぶか**: 「壊れた状態を push したらすぐ気づける」仕組み。
  ローカルで動く ≠ どこでも動く、を CI が担保する。YAML でジョブを書く感覚に触れる。
- **Git/GitHub**: これ自体を1つの PR にして「PR を出す → CI が回る → マージ」を体験するのが良い。

### Step 9 — GitHub Pages で公開(任意 / 説明を読んで判断)

> **GitHub Pages とは**: GitHub 無料の静的サイト配信場所。`main` に push → Actions が
> `npm run build` → 生成した `dist/` を Pages に配置 → 数十秒で
> `https://shato-dev.github.io/astro-warmup/` が更新される。
> 「push するだけで本番サイトが自動更新される」CI/CD の最小体験。パブリック repo なら無料・カード不要。
> 本番の Cloudflare Workers とほぼ同じ役割なので、ここで流れを掴むと本番設定がほぼ同じ絵に見える。

- **何をするか**:
  1. `astro.config.mjs` に `site: 'https://shato-dev.github.io'` と `base: '/astro-warmup'` を設定。
     - **なぜ**: 公開 URL がサブパス(`/astro-warmup/`)になるため、リンクや assets のパスを
       Astro に教える必要がある。ここは軽いハマりどころ = 学びポイント。
  2. Step 8 のワークフローに Pages へのデプロイジョブを足す(公式 `actions/deploy-pages` を使う)。
  3. GitHub の «Settings › Pages» で公開元を «GitHub Actions» に設定。
- **確認**: 公開 URL をブラウザで開いて、一覧・記事・タグ・検索が動く。
- **判断待ち**: CLAUDE.md ではデプロイはスコープ外。今回の「GitHub 動作検証」の依頼で
  やる方向に傾いているが、最終確認をとってから着手する。

---

## 4. 最終的なフォルダ構成(予定)

```
astro-warmup/
├─ .gitignore            … git 管理から外すもの(node_modules/ dist/ .astro/)
├─ .github/
│  └─ workflows/
│     └─ ci.yml          … GitHub Actions: push/PR で自動ビルド(+ 任意で Pages 公開)
├─ package.json          … プロジェクト設定・依存ライブラリ一覧
├─ astro.config.mjs      … Astro の設定(Pages 公開時は site / base を追記)
├─ tsconfig.json         … TypeScript の設定
├─ PLAN.md               … これ
├─ KNOWLEDGE.md          … 学んだこと・つまずきメモ
├─ src/                  ← 編集するのは基本ここだけ
│  ├─ content.config.ts  … 記事スキーマ(表の形の定義)
│  ├─ content/blog/      … 記事の Markdown 置き場
│  │  ├─ hello-astro.md
│  │  └─ ...
│  ├─ layouts/
│  │  └─ BaseLayout.astro … 全ページ共通の外枠
│  ├─ components/
│  │  ├─ PostCard.astro   … 記事カード部品
│  │  └─ Search.astro     … 検索ボックス部品
│  ├─ pages/             ← ファイル名 = URL
│  │  ├─ index.astro          → /
│  │  ├─ search.json.js       → /search.json(検索用データ)
│  │  ├─ posts/[slug].astro   → /posts/記事名
│  │  └─ tags/[tag].astro     → /tags/タグ名
│  └─ styles/
│     └─ global.css      … 最小限の見た目
├─ public/               … 画像など加工せず配信するファイル(今回はほぼ空)
└─ dist/                 … ビルド生成物(自動・触らない・git 管理外)
```

---

## 5. やらないこと(意図的に)

凝ったスタイリング / ローカルの自動テスト / 外部サービス連携 / Docker。
※「デプロイ」は CLAUDE.md ではスコープ外だが、今回は GitHub 動作検証のため
  Step 8(CI)を実施、Step 9(Pages 公開)は要確認の上で実施の可能性あり。
まず動く最小限を作る(過度な抽象化・将来の拡張の先取りをしない)。

---

## 6. 進め方

1. Step 0〜1 を実行 → gh 導入・repo 作成・dev サーバー起動を確認して報告(ここで一度止まる)。
2. Step 2〜4 を実装(各ステップでコミット + push)。
3. Step 5 をブランチ + Pull Request で実施(GitHub ワークフローの練習)。
4. Step 6〜7 を実装、ローカルビルドまで確認。
5. Step 8(CI)を PR 経由で追加。
6. Step 9(Pages 公開)は着手前に最終確認。
7. 新しい用語はその場で1〜2行の説明を添える。PLAN の用語集にも追記していく。
8. 学んだ内容・概念の掘り下げ・つまずいたポイントは、その都度 `KNOWLEDGE.md` に要点を追記
   (PLAN = 短い定義、KNOWLEDGE = 理解のためのメモ、と役割分担)。

---

## 7. 環境メモ(私の作業用・読み飛ばし可)

- Node は nvm 管理(`v24.20.0`)。非対話シェルでは PATH に無いため、コマンド前に
  `source ~/.nvm/nvm.sh` を実行している。通常のターミナル操作では不要。
- Astro のバージョンは `7.2.9`。
- git のユーザー設定は済み。GitHub への SSH 認証は成功済み。
- `gh` はインストール済み(`/opt/homebrew/bin/gh`, v2.98)。`gh auth status` OK。
  非対話シェルで PATH に無いことがあるので `export PATH="/opt/homebrew/bin:$PATH"` を付ける。
