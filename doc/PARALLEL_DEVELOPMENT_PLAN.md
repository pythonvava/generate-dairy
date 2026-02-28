# 並列開発計画 — Issue別エージェント割り当て & コンフリクト分析

## 改訂履歴

| 版数 | 日付 | 内容 |
|------|------|------|
| 1.0 | 2026-02-25 | 初版作成 |
| 1.1 | 2026-02-25 | 現状確認を更新、実装チェックリスト（セクション10）を追加 |
| 1.2 | 2026-02-26 | #1〜#4, #6 マージ済みのため完了済み Issue を削除・ドキュメント整理 |

---

## 1. 現状確認

マージ済み: **#1, #2, #3, #4, #6**（main に取り込み完了）

| 状態 | Issue | 内容 |
|------|-------|------|
| ⏳ 未着手 | #5 | [DB] 開発・テスト用シードデータの作成 |
| ⏳ 未着手 | #7〜#30 | その他全 Issue |

---

## 2. 依存関係マップ

```
#4(DB migration) ──→ #5(Seed)
[✅ マージ済]

#6(JWT middleware) ─┬──→ #7(Login API) ──→ #8(Logout/me API)
[✅ マージ済]        ├──→ #9(日報一覧 API)
                    │     └──→ #10(日報作成 API)
                    │           └──→ #11(日報詳細・更新・削除 API)
                    │                 └──→ #12(コメント投稿 API)
                    ├──→ #13(顧客マスタ CRUD API)
                    └──→ #14(営業マスタ CRUD API)

#15(APIクライアント) ──┬──→ #16(共通レイアウト) ──┐
[⏳ 未着手]            └──→ #17(ルーティング) ────┤
                                                   ├──→ #18(SCR-001 ログイン)
                                                   ├──→ #19(SCR-010 日報一覧)
                                                   ├──→ #20(SCR-011 日報作成・編集)
                                                   ├──→ #21(SCR-012 日報詳細)
                                                   ├──→ #22(SCR-020 顧客一覧)
                                                   ├──→ #23(SCR-021 顧客登録・編集)
                                                   ├──→ #24(SCR-030 営業一覧)
                                                   └──→ #25(SCR-031 営業登録・編集)

テスト (実装 Issue 完了後):
  #7,#8 完了後    ──→ #26(BE認証テスト)
  #9〜#12 完了後  ──→ #27(BE日報テスト)
  #13,#14 完了後  ──→ #28(BE顧客・営業テスト)
  #16,#18 完了後  ──→ #29(FE認証・共通テスト)
  #19〜#21 完了後 ──→ #30(FE日報テスト)
```

---

## 3. コンフリクト分析 — 同一ファイルへの書き込み

| ファイル | 競合する Issue |
|---------|--------------|
| `backend/src/controllers/auth.controller.ts` | #7 と #8 |
| `backend/src/controllers/daily-reports.controller.ts` | #9, #10, #11, #12 |
| `backend/src/routes/index.ts` | #7〜#14 全て（ルート登録時） |
| `frontend/src/App.tsx` | #17（ルーター設定） |
| `frontend/src/types/api.ts` | #15（型定義の追加） |

> **判定基準**: 同一ファイルへの書き込みが発生する Issue を同時並行させるとコンフリクトが発生する。

---

## 4. 並列開発計画

### Phase 1 — 基盤整備

| Issue | タイトル | 担当エージェント | 触るファイル |
|-------|---------|----------------|------------|
| #15 | [Frontend] APIクライアント設定 | `frontend-engineer` | `frontend/src/lib/api.ts`, `frontend/src/store/auth.ts`, `frontend/src/types/api.ts` |

---

### Phase 2 — バックエンド実装 & フロントエンド基盤

**トラック A〜D は依存 Issue（#4, #6）がマージ済みのため、Phase 1（#15）と並行して即座に着手可能。**
**トラック E は Phase 1（#15）完了後に着手。**
トラック同士は異なるファイルを触るためコンフリクトなし。

#### トラック A: 認証 API（backend-engineer #A）

| Issue | タイトル | 触るファイル |
|-------|---------|------------|
| #5 | [DB] シードデータ | `prisma/seed.ts` |
| #7 | [Backend] ログイン API | `backend/src/controllers/auth.controller.ts`, `backend/src/routes/auth.routes.ts` |
| #8 | [Backend] ログアウト・me API | `backend/src/controllers/auth.controller.ts`（#7 完了後に追記） |

> ⚠️ #7→#8 は同一ファイルへの追記なので **必ず順番に実施**。
> #5 は他と競合なし、単独で先行着手可。

#### トラック B: 日報 API（backend-engineer #B）

| Issue | タイトル | 触るファイル |
|-------|---------|------------|
| #9 | [Backend] 日報一覧取得 API | `backend/src/controllers/daily-reports.controller.ts`, `backend/src/routes/daily-reports.routes.ts` |
| #10 | [Backend] 日報作成 API | 同上 |
| #11 | [Backend] 日報詳細・更新・削除 API | 同上 |
| #12 | [Backend] コメント投稿 API | 同上 |

> ⚠️ #9→#10→#11→#12 は同一ファイルへの追記なので **必ず順番に実施**。

#### トラック C: 顧客マスタ API（backend-engineer #C）

| Issue | タイトル | 触るファイル |
|-------|---------|------------|
| #13 | [Backend] 顧客マスタ CRUD API | `backend/src/controllers/customers.controller.ts`, `backend/src/routes/customers.routes.ts` |

> ✅ トラック B・D と完全に並列実行可。

#### トラック D: 営業マスタ API（backend-engineer #D）

| Issue | タイトル | 触るファイル |
|-------|---------|------------|
| #14 | [Backend] 営業マスタ CRUD API | `backend/src/controllers/sales-persons.controller.ts`, `backend/src/routes/sales-persons.routes.ts` |

> ✅ トラック B・C と完全に並列実行可。

#### トラック E: フロントエンド基盤（frontend-engineer #E）

| Issue | タイトル | 触るファイル |
|-------|---------|------------|
| #16 | [Frontend] 共通レイアウト | `frontend/src/components/layout/AppLayout.tsx`, `Header.tsx`, `SideMenu.tsx` |
| #17 | [Frontend] ルーティング & 認証ガード | `frontend/src/App.tsx`（またはrouter.tsx） |

> ✅ #16 と #17 は異なるファイルなので **並列実行可**。
> ✅ バックエンドのトラック A〜D と並列実行可。

---

### Phase 3 — フロントエンド画面実装

Phase 2（トラック E）完了後、以下 **8 グループを並列実行**。
各グループは独立したページファイルを作成するためコンフリクトなし。

| グループ | Issue | タイトル | 担当エージェント | 触るファイル |
|---------|-------|---------|----------------|------------|
| FE-1 | #18 | [Frontend] SCR-001 ログイン画面 | `frontend-engineer` | `frontend/src/pages/login/LoginPage.tsx` |
| FE-2 | #19 | [Frontend] SCR-010 日報一覧 | `frontend-engineer` | `frontend/src/pages/daily-reports/DailyReportListPage.tsx` |
| FE-3 | #20 | [Frontend] SCR-011 日報作成・編集 | `frontend-engineer` | `frontend/src/pages/daily-reports/DailyReportFormPage.tsx` |
| FE-4 | #21 | [Frontend] SCR-012 日報詳細 | `frontend-engineer` | `frontend/src/pages/daily-reports/DailyReportDetailPage.tsx` |
| FE-5 | #22 | [Frontend] SCR-020 顧客一覧 | `frontend-engineer` | `frontend/src/pages/customers/CustomerListPage.tsx` |
| FE-6 | #23 | [Frontend] SCR-021 顧客登録・編集 | `frontend-engineer` | `frontend/src/pages/customers/CustomerFormPage.tsx` |
| FE-7 | #24 | [Frontend] SCR-030 営業一覧 | `frontend-engineer` | `frontend/src/pages/sales-persons/SalesPersonListPage.tsx` |
| FE-8 | #25 | [Frontend] SCR-031 営業登録・編集 | `frontend-engineer` | `frontend/src/pages/sales-persons/SalesPersonFormPage.tsx` |

> ✅ FE-1〜FE-8 は完全に並列実行可（各ページが独立ファイル）。
> ✅ バックエンドのテスト実装（Phase 4）とも並列実行可。

---

### Phase 4 — テスト実装

各実装 Issue が完了した後、以下 **5 グループを並列実行**。

#### バックエンドテスト（qa-engineer #1）

| Issue | タイトル | 前提条件 | 触るファイル |
|-------|---------|---------|------------|
| #26 | [Test] BE認証 API テスト | #7, #8 完了後 | `backend/src/auth/__tests__/`, `backend/src/middleware/__tests__/` |
| #27 | [Test] BE日報 API テスト | #9〜#12 完了後 | `backend/src/daily-reports/__tests__/` |
| #28 | [Test] BE顧客・営業テスト | #13, #14 完了後 | `backend/src/customers/__tests__/`, `backend/src/sales-persons/__tests__/` |

> ✅ #26, #27, #28 は異なるディレクトリなので **並列実行可**。

#### フロントエンドテスト（qa-engineer #2）

| Issue | タイトル | 前提条件 | 触るファイル |
|-------|---------|---------|------------|
| #29 | [Test] FE認証・共通テスト | #16, #18 完了後 | `frontend/src/pages/login/__tests__/`, `frontend/src/components/layout/__tests__/` |
| #30 | [Test] FE日報テスト | #19〜#21 完了後 | `frontend/src/pages/daily-reports/__tests__/` |

> ✅ #29, #30 は異なるディレクトリなので **並列実行可**。
> ✅ バックエンドテスト（#26〜#28）とも並列実行可。

---

## 5. 並列実行マトリクス（Phase 2 時点）

凡例: ✅ 並列可 / ⚠️ 同一ファイルのため逐次実行 / ➡️ 依存関係（前者が先）

| | トラックA(#5,#7,#8) | トラックB(#9-12) | トラックC(#13) | トラックD(#14) | トラックE(#16,#17) |
|---|---|---|---|---|---|
| **トラックA** | ⚠️ 内部逐次 | ✅ | ✅ | ✅ | ✅ |
| **トラックB** | ✅ | ⚠️ 内部逐次 | ✅ | ✅ | ✅ |
| **トラックC** | ✅ | ✅ | — | ✅ | ✅ |
| **トラックD** | ✅ | ✅ | ✅ | — | ✅ |
| **トラックE** | ✅ | ✅ | ✅ | ✅ | ✅ 一部並列 |

---

## 6. 推奨エージェント割り当て一覧

| Issue | タイトル | 推奨エージェント | Phase | 並列グループ |
|-------|---------|----------------|-------|------------|
| #5 | [DB] シードデータ | `backend-engineer` | 2 | トラックA |
| #7 | [Backend] ログイン API | `backend-engineer` | 2 | トラックA |
| #8 | [Backend] ログアウト・me API | `backend-engineer` | 2 | トラックA（#7後） |
| #9 | [Backend] 日報一覧取得 API | `backend-engineer` | 2 | トラックB |
| #10 | [Backend] 日報作成 API | `backend-engineer` | 2 | トラックB（#9後） |
| #11 | [Backend] 日報詳細・更新・削除 API | `backend-engineer` | 2 | トラックB（#10後） |
| #12 | [Backend] コメント投稿 API | `backend-engineer` | 2 | トラックB（#11後） |
| #13 | [Backend] 顧客マスタ CRUD API | `backend-engineer` | 2 | トラックC |
| #14 | [Backend] 営業マスタ CRUD API | `backend-engineer` | 2 | トラックD |
| #15 | [Frontend] APIクライアント設定 | `frontend-engineer` | 1 | Phase1 |
| #16 | [Frontend] 共通レイアウト | `frontend-engineer` | 2 | トラックE |
| #17 | [Frontend] ルーティング & 認証ガード | `frontend-engineer` | 2 | トラックE（#16と並列可） |
| #18 | [Frontend] SCR-001 ログイン画面 | `frontend-engineer` | 3 | FE-1 |
| #19 | [Frontend] SCR-010 日報一覧 | `frontend-engineer` | 3 | FE-2 |
| #20 | [Frontend] SCR-011 日報作成・編集 | `frontend-engineer` | 3 | FE-3 |
| #21 | [Frontend] SCR-012 日報詳細 | `frontend-engineer` | 3 | FE-4 |
| #22 | [Frontend] SCR-020 顧客一覧 | `frontend-engineer` | 3 | FE-5 |
| #23 | [Frontend] SCR-021 顧客登録・編集 | `frontend-engineer` | 3 | FE-6 |
| #24 | [Frontend] SCR-030 営業一覧 | `frontend-engineer` | 3 | FE-7 |
| #25 | [Frontend] SCR-031 営業登録・編集 | `frontend-engineer` | 3 | FE-8 |
| #26 | [Test] BE認証 API テスト | `qa-engineer` | 4 | TEST-BE-1 |
| #27 | [Test] BE日報 API テスト | `qa-engineer` | 4 | TEST-BE-2 |
| #28 | [Test] BE顧客・営業テスト | `qa-engineer` | 4 | TEST-BE-3 |
| #29 | [Test] FE認証・共通テスト | `qa-engineer` | 4 | TEST-FE-1 |
| #30 | [Test] FE日報テスト | `qa-engineer` | 4 | TEST-FE-2 |

---

## 7. 最大並列数の推定

| Phase | 最大並列エージェント数 | 並列グループ |
|-------|---------------------|------------|
| Phase 1 | 1 | #15 |
| Phase 2 | 5 | トラックA / B / C / D / E（A〜Dは即着手可） |
| Phase 3 | 8 | FE-1〜FE-8（バックエンドテストと同時ならさらに増加） |
| Phase 4 | 5 | TEST-BE-1,2,3 / TEST-FE-1,2 |

---

## 8. git worktree 運用方針

並列開発時は CLAUDE.md 記載のルールに従い `.claude/worktrees/` 以下で worktree を作成する。

```bash
# 例: トラックB（日報API）の worktree 作成
git worktree add .claude/worktrees/backend-daily-reports -b feature/issue-9-12-daily-reports-api main

# 例: トラックC（顧客API）の worktree 作成
git worktree add .claude/worktrees/backend-customers -b feature/issue-13-customers-api main

# 例: フロントエンド日報一覧の worktree 作成
git worktree add .claude/worktrees/frontend-daily-list -b feature/issue-19-daily-report-list main
```

### 推奨 branch 命名規則

| トラック | ブランチ名 |
|---------|----------|
| BE 認証 | `feature/issue-7-8-auth-api` |
| BE 日報 | `feature/issue-9-12-daily-reports-api` |
| BE 顧客 | `feature/issue-13-customers-api` |
| BE 営業 | `feature/issue-14-sales-persons-api` |
| FE 基盤 | `feature/issue-15-17-frontend-foundation` |
| FE ページ（Issue単位） | `feature/issue-{番号}-{画面ID}` |
| テスト | `feature/issue-{番号}-{対象}-tests` |

---

## 10. 実装チェックリスト

凡例: ✅ 完了（PR マージ済）/ 🔄 実装中（PR オープン）/ ⏳ 未着手

### Phase 1 — 基盤整備

| 状態 | Issue | タイトル | PR |
|------|-------|---------|-----|
| ⏳ | #15 | [Frontend] APIクライアント設定（axios + Zustand） | — |

### Phase 2 — バックエンド実装 & フロントエンド基盤

#### 認証 API（トラック A）

| 状態 | Issue | タイトル | PR |
|------|-------|---------|-----|
| 🔄 | #5 | [DB] 開発・テスト用シードデータの作成 | #38 |
| ⏳ | #7 | [Backend] ログイン API (POST /auth/login) | — |
| ⏳ | #8 | [Backend] ログアウト・ユーザー情報取得 API | — |

#### 日報 API（トラック B）

| 状態 | Issue | タイトル | PR |
|------|-------|---------|-----|
| ⏳ | #9 | [Backend] 日報一覧取得 API | — |
| ⏳ | #10 | [Backend] 日報作成 API | — |
| ⏳ | #11 | [Backend] 日報詳細・更新・削除 API | — |
| ⏳ | #12 | [Backend] コメント投稿 API | — |

#### 顧客・営業マスタ API（トラック C / D）

| 状態 | Issue | タイトル | PR |
|------|-------|---------|-----|
| ⏳ | #13 | [Backend] 顧客マスタ CRUD API | — |
| ⏳ | #14 | [Backend] 営業マスタ CRUD API | — |

#### フロントエンド基盤（トラック E）

| 状態 | Issue | タイトル | PR |
|------|-------|---------|-----|
| ⏳ | #16 | [Frontend] 共通レイアウト（ヘッダー・サイドメニュー） | — |
| ⏳ | #17 | [Frontend] ルーティング & 認証ガード | — |

### Phase 3 — フロントエンド画面実装

| 状態 | Issue | タイトル | PR |
|------|-------|---------|-----|
| ⏳ | #18 | [Frontend] SCR-001: ログイン画面 | — |
| ⏳ | #19 | [Frontend] SCR-010: 日報一覧画面 | — |
| ⏳ | #20 | [Frontend] SCR-011: 日報作成・編集画面 | — |
| ⏳ | #21 | [Frontend] SCR-012: 日報詳細・コメント画面 | — |
| ⏳ | #22 | [Frontend] SCR-020: 顧客マスタ一覧画面 | — |
| ⏳ | #23 | [Frontend] SCR-021: 顧客マスタ登録・編集画面 | — |
| ⏳ | #24 | [Frontend] SCR-030: 営業マスタ一覧画面 | — |
| ⏳ | #25 | [Frontend] SCR-031: 営業マスタ登録・編集画面 | — |

### Phase 4 — テスト実装

| 状態 | Issue | タイトル | PR |
|------|-------|---------|-----|
| ⏳ | #26 | [Test] バックエンド: 認証 API テスト（AU-001〜022） | — |
| ⏳ | #27 | [Test] バックエンド: 日報 API テスト（DL/DC/DD） | — |
| ⏳ | #28 | [Test] バックエンド: 顧客・営業マスタ API テスト | — |
| ⏳ | #29 | [Test] フロントエンド: 認証・共通コンポーネントテスト | — |
| ⏳ | #30 | [Test] フロントエンド: 日報フォーム・一覧・詳細テスト | — |

### 進捗サマリー

| Phase | 完了 | 実装中 | 未着手 | 合計 |
|-------|------|--------|--------|------|
| 完了済み（#1〜#4, #6） | 5 | — | — | 5 |
| Phase 1（#15） | 0 | 0 | 1 | 1 |
| Phase 2（#5, #7〜#14, #16〜#17） | 0 | 1 | 10 | 11 |
| Phase 3（#18〜#25） | 0 | 0 | 8 | 8 |
| Phase 4（#26〜#30） | 0 | 0 | 5 | 5 |
| **合計** | **5** | **1** | **24** | **30** |

---

## 9. コンフリクト回避ルール

1. **同一 controller ファイルへの追記は同一エージェントが担当する**
   例: `auth.controller.ts` は #7 と #8 を同じエージェントが順番に実施。

2. **routes/index.ts の書き込みはマージ時に慎重に統合する**
   各トラックが独自 routes ファイル（`auth.routes.ts`, `daily-reports.routes.ts` 等）を作成し、`routes/index.ts` への登録は PR マージ時にまとめて行う。

3. **Phase 3 のフロントエンドページは独立ファイルを作成する**
   各ページコンポーネントは独立ファイルとして作成し、`App.tsx` への route 追加は #17 の worktree で一括管理する。

4. **テストファイルは実装と別 branch で作成する**
   実装 Issue の PR がマージされた後に、テスト Issue の branch を切る。

5. **worktree のベースブランチは必ず main にする**
   feature ブランチを起点にすると PR に無関係なコミットが混入する。依存 Issue の PR が main にマージされてから新しい worktree を作成すること。
