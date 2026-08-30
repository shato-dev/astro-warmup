---
title: "ブランチと Pull Request で変更を1周させる"
description: "main に直接コミットせず、枝を作って PR にして戻す。1人開発でこれをやる意味と、マージ方式の違い。"
date: 2026-08-29
tags: ["git", "diary"]
---

一覧・記事・タグページを追加する作業を、`main` に直接ではなく
「ブランチ → Pull Request → マージ」の流れでやってみた。
1人でやっているので PR のレビュアーも自分だが、それでも得るものがあった。

## 用語

- **ブランチ (branch)**: 履歴の枝分かれ。`main` から枝を作り、
  そこで作業して、後で `main` に合流させる。
- **Pull Request (PR)**: 「この枝の変更を `main` に取り込みたい」という提案。
  GitHub 上で差分をまとめて見られる場所。

## 手順

```bash
git switch -c feat/pages       # main から枝を作ってそこに移動
# ...実装して、意味のある単位でコミット...
git push -u origin feat/pages  # 枝を GitHub に上げる
gh pr create --fill            # コミットメッセージから PR を作る
```

このあと GitHub の PR 画面「Files changed」で全変更を一度に見返し、
問題なければ「Merge」で `main` に取り込む。

```bash
gh pr merge --squash --delete-branch   # マージして枝を消す
git switch main && git pull            # 手元の main も最新化
```

## 1人開発でもやる意味

- **変更のまとまりが記録として残る**。「この機能を入れた PR」という単位で
  後から追える。コミットを1つずつ見るより粒度がちょうどいい。
- **取り込む前に立ち止まれる**。差分一覧をまとめて眺めるだけで、
  デバッグ用の `console.log` の消し忘れや、関係ないファイルの巻き込みに気づく。
- **`main` を常に動く状態に保てる**。壊れるかもしれない実験は枝の中で完結する。
- **CI と組み合わさる**。PR を作ると自動でビルドが走り、
  通らなければマージできない(別記事「GitHub Actions で CI を回す」)。
  「壊れた状態が `main` に入る」経路をふさげる。

## マージ方式の違い

PR を `main` に取り込むとき、3つのやり方がある。

| 方式 | `main` に残るもの |
|---|---|
| Merge commit | 枝のコミットが全部 + 合流を示すコミット1つ |
| Squash and merge | 枝のコミットを1つに畳んで載せる |
| Rebase and merge | 枝のコミットを、枝分かれなしで平らに並べ直す |

途中の試行錯誤コミット(「wip」「typo 修正」など)を `main` に残したくない
小さめの PR は、Squash が履歴がきれいになりやすい。
実際、この後の PR は Squash で取り込んでいて、
枝の中の複数コミットが `main` では1つになっている。

## 覚えたコマンド

- `git switch -c <名前>` … 枝を作って移動(旧 `git checkout -b`)
- `git switch <名前>` … 既存の枝へ移動。
  **作業ツリーのファイルもその枝の内容に入れ替わる**
- `git branch -d <名前>` … マージ済みの枝を削除(`-D` は未マージでも強制)
- `git push -u origin <名前>` … 枝を初めて push。`-u` で以後 `git push` だけで済む
