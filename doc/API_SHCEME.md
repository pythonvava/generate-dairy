# 営業日報システム API仕様書

## 改訂履歴

| 版数 | 日付 | 内容 |
|------|------|------|
| 1.0 | 2026-02-24 | 初版作成 |

---

## 共通仕様

### ベースURL

```
https://{host}/api/v1
```

### 認証方式

- Bearer Token（JWT）方式
- ログインAPI以外の全エンドポイントで `Authorization: Bearer {token}` ヘッダーが必須
- トークン有効期限: 24時間

### リクエスト共通

| ヘッダー | 値 | 必須 | 備考 |
|---------|-----|------|------|
| Content-Type | application/json | ○ | POST/PUT/PATCH時 |
| Authorization | Bearer {token} | ○ | ログインAPI以外 |

### レスポンス共通

**成功時**

```json
{
  "status": "success",
  "data": { ... }
}
```

**エラー時**

```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ",
    "details": [ ... ]
  }
}
```

### 共通エラーコード

| HTTPステータス | エラーコード | 説明 |
|---------------|-------------|------|
| 400 | VALIDATION_ERROR | バリデーションエラー |
| 401 | UNAUTHORIZED | 未認証（トークン無効・期限切れ） |
| 403 | FORBIDDEN | 権限不足 |
| 404 | NOT_FOUND | リソースが存在しない |
| 409 | CONFLICT | データ競合（重複等） |
| 500 | INTERNAL_ERROR | サーバー内部エラー |

### ページネーション

一覧系APIは以下のクエリパラメータでページネーションを制御する。

| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| page | integer | 1 | ページ番号 |
| per_page | integer | 20 | 1ページあたりの件数（最大100） |

レスポンスにはページネーション情報を含める。

```json
{
  "status": "success",
  "data": { "items": [ ... ] },
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_count": 58,
    "total_pages": 3
  }
}
```

---

## API一覧

| No. | メソッド | エンドポイント | 画面ID | 概要 |
|-----|---------|---------------|--------|------|
| 1 | POST | /auth/login | SCR-001 | ログイン |
| 2 | POST | /auth/logout | 共通 | ログアウト |
| 3 | GET | /auth/me | 共通 | ログインユーザー情報取得 |
| 4 | GET | /daily-reports | SCR-010 | 日報一覧取得 |
| 5 | POST | /daily-reports | SCR-011 | 日報作成 |
| 6 | GET | /daily-reports/{id} | SCR-012 | 日報詳細取得 |
| 7 | PUT | /daily-reports/{id} | SCR-011 | 日報更新 |
| 8 | DELETE | /daily-reports/{id} | SCR-011 | 日報削除 |
| 9 | POST | /daily-reports/{id}/comments | SCR-012 | コメント投稿 |
| 10 | GET | /customers | SCR-020 | 顧客一覧取得 |
| 11 | POST | /customers | SCR-021 | 顧客登録 |
| 12 | GET | /customers/{id} | SCR-021 | 顧客詳細取得 |
| 13 | PUT | /customers/{id} | SCR-021 | 顧客更新 |
| 14 | GET | /sales-persons | SCR-030 | 営業一覧取得 |
| 15 | POST | /sales-persons | SCR-031 | 営業登録 |
| 16 | GET | /sales-persons/{id} | SCR-031 | 営業詳細取得 |
| 17 | PUT | /sales-persons/{id} | SCR-031 | 営業更新 |

---

## 1. 認証API

---

### API-001: ログイン

ユーザー認証を行い、JWTトークンを発行する。

| 項目 | 内容 |
|------|------|
| エンドポイント | `POST /auth/login` |
| 認証 | 不要 |
| 対応画面 | SCR-001 |

**リクエストボディ**

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| email | string | ○ | メールアドレス |
| password | string | ○ | パスワード |

```json
{
  "email": "yamada@example.co.jp",
  "password": "password123"
}
```

**レスポンス（200 OK）**

```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_at": "2026-02-25T10:00:00+09:00",
    "user": {
      "id": 1,
      "name": "山田太郎",
      "email": "yamada@example.co.jp",
      "department": "営業1課",
      "position": "主任",
      "role": "general"
    }
  }
}
```

**エラー（401 Unauthorized）**

```json
{
  "status": "error",
  "error": {
    "code": "UNAUTHORIZED",
    "message": "メールアドレスまたはパスワードが正しくありません"
  }
}
```

---

### API-002: ログアウト

現在のトークンを無効化する。

| 項目 | 内容 |
|------|------|
| エンドポイント | `POST /auth/logout` |
| 認証 | 必要 |
| 対応画面 | 共通ヘッダー |

**リクエストボディ**: なし

**レスポンス（200 OK）**

```json
{
  "status": "success",
  "data": {
    "message": "ログアウトしました"
  }
}
```

---

### API-003: ログインユーザー情報取得

現在ログイン中のユーザー情報を返す。画面初期表示時のヘッダー描画等に使用する。

| 項目 | 内容 |
|------|------|
| エンドポイント | `GET /auth/me` |
| 認証 | 必要 |
| 対応画面 | 共通ヘッダー |

**レスポンス（200 OK）**

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "山田太郎",
    "email": "yamada@example.co.jp",
    "department": "営業1課",
    "position": "主任",
    "role": "general"
  }
}
```

---

## 2. 日報API

---

### API-004: 日報一覧取得

条件に合致する日報の一覧を返す。

| 項目 | 内容 |
|------|------|
| エンドポイント | `GET /daily-reports` |
| 認証 | 必要 |
| 対応画面 | SCR-010 |
| 権限 | 一般: 自分の日報のみ / 上長: 全員の日報 |

**クエリパラメータ**

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| date_from | string (date) | - | 7日前 | 報告日の検索開始日（YYYY-MM-DD） |
| date_to | string (date) | - | 当日 | 報告日の検索終了日（YYYY-MM-DD） |
| sales_person_id | integer | - | - | 営業担当者IDで絞り込み |
| page | integer | - | 1 | ページ番号 |
| per_page | integer | - | 20 | 1ページあたり件数 |

**レスポンス（200 OK）**

```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": 101,
        "report_date": "2026-02-24",
        "sales_person": {
          "id": 1,
          "name": "山田太郎"
        },
        "visit_count": 3,
        "comment_count": 2,
        "created_at": "2026-02-24T17:30:00+09:00",
        "updated_at": "2026-02-24T18:00:00+09:00"
      }
    ]
  },
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_count": 45,
    "total_pages": 3
  }
}
```

---

### API-005: 日報作成

日報を新規作成する。訪問記録を含めて一括で保存する。

| 項目 | 内容 |
|------|------|
| エンドポイント | `POST /daily-reports` |
| 認証 | 必要 |
| 対応画面 | SCR-011 |
| 権限 | 全ユーザー（自分の日報のみ作成可） |

**リクエストボディ**

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| report_date | string (date) | ○ | 報告日（YYYY-MM-DD） |
| visits | array | ○ | 訪問記録の配列（1件以上） |
| visits[].customer_id | integer | ○ | 顧客ID |
| visits[].visit_content | string | ○ | 訪問内容（最大2000文字） |
| visits[].sort_order | integer | ○ | 表示順 |
| problem | string | - | 課題・相談（最大3000文字） |
| plan | string | - | 明日やること（最大3000文字） |

```json
{
  "report_date": "2026-02-24",
  "visits": [
    {
      "customer_id": 10,
      "visit_content": "新製品の提案を実施。次回見積もり提出予定。",
      "sort_order": 1
    },
    {
      "customer_id": 25,
      "visit_content": "クレーム対応のヒアリング。詳細は別途報告。",
      "sort_order": 2
    }
  ],
  "problem": "ABC社への見積もり金額について相談したい。",
  "plan": "ABC社向け見積書作成、XYZ社へ対応報告メール送付。"
}
```

**レスポンス（201 Created）**

```json
{
  "status": "success",
  "data": {
    "id": 101,
    "report_date": "2026-02-24",
    "sales_person": {
      "id": 1,
      "name": "山田太郎"
    },
    "visits": [
      {
        "id": 501,
        "customer": { "id": 10, "name": "株式会社ABC" },
        "visit_content": "新製品の提案を実施。次回見積もり提出予定。",
        "sort_order": 1
      },
      {
        "id": 502,
        "customer": { "id": 25, "name": "株式会社XYZ" },
        "visit_content": "クレーム対応のヒアリング。詳細は別途報告。",
        "sort_order": 2
      }
    ],
    "problem": "ABC社への見積もり金額について相談したい。",
    "plan": "ABC社向け見積書作成、XYZ社へ対応報告メール送付。",
    "comments": [],
    "created_at": "2026-02-24T17:30:00+09:00",
    "updated_at": "2026-02-24T17:30:00+09:00"
  }
}
```

**エラー（409 Conflict）**

```json
{
  "status": "error",
  "error": {
    "code": "CONFLICT",
    "message": "この日の日報は既に作成されています"
  }
}
```

**バリデーションエラー（400 Bad Request）**

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に誤りがあります",
    "details": [
      { "field": "report_date", "message": "未来日の日報は作成できません" },
      { "field": "visits[1].visit_content", "message": "訪問内容を入力してください" }
    ]
  }
}
```

---

### API-006: 日報詳細取得

指定IDの日報を訪問記録・コメント含めて返す。

| 項目 | 内容 |
|------|------|
| エンドポイント | `GET /daily-reports/{id}` |
| 認証 | 必要 |
| 対応画面 | SCR-012, SCR-011（編集時） |
| 権限 | 一般: 自分の日報のみ / 上長: 全員の日報 |

**パスパラメータ**

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| id | integer | 日報ID |

**レスポンス（200 OK）**

```json
{
  "status": "success",
  "data": {
    "id": 101,
    "report_date": "2026-02-24",
    "sales_person": {
      "id": 1,
      "name": "山田太郎"
    },
    "visits": [
      {
        "id": 501,
        "customer": { "id": 10, "name": "株式会社ABC" },
        "visit_content": "新製品の提案を実施。次回見積もり提出予定。",
        "sort_order": 1
      },
      {
        "id": 502,
        "customer": { "id": 25, "name": "株式会社XYZ" },
        "visit_content": "クレーム対応のヒアリング。詳細は別途報告。",
        "sort_order": 2
      }
    ],
    "problem": "ABC社への見積もり金額について相談したい。",
    "plan": "ABC社向け見積書作成、XYZ社へ対応報告メール送付。",
    "comments": [
      {
        "id": 201,
        "commenter": { "id": 3, "name": "鈴木課長" },
        "body": "ABC社の見積もりは明日の朝会で一緒に確認しよう。",
        "created_at": "2026-02-24T18:30:00+09:00"
      },
      {
        "id": 202,
        "commenter": { "id": 1, "name": "山田太郎" },
        "body": "承知しました。資料準備しておきます。",
        "created_at": "2026-02-24T18:45:00+09:00"
      }
    ],
    "created_at": "2026-02-24T17:30:00+09:00",
    "updated_at": "2026-02-24T18:00:00+09:00"
  }
}
```

---

### API-007: 日報更新

既存の日報を更新する。訪問記録は洗い替え（全削除→全挿入）方式とする。

| 項目 | 内容 |
|------|------|
| エンドポイント | `PUT /daily-reports/{id}` |
| 認証 | 必要 |
| 対応画面 | SCR-011 |
| 権限 | 日報作成者本人のみ |

**パスパラメータ**

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| id | integer | 日報ID |

**リクエストボディ**

API-005（日報作成）と同一フォーマット。`report_date` は変更不可（送信しても無視）。

```json
{
  "report_date": "2026-02-24",
  "visits": [
    {
      "customer_id": 10,
      "visit_content": "新製品の提案を実施。見積もり金額は50万円で提示。",
      "sort_order": 1
    },
    {
      "customer_id": 25,
      "visit_content": "クレーム対応のヒアリング。原因は配送遅延。",
      "sort_order": 2
    },
    {
      "customer_id": 30,
      "visit_content": "新規開拓のご挨拶。次回アポイント取得済み。",
      "sort_order": 3
    }
  ],
  "problem": "ABC社への見積もり金額について相談したい。50万円で進めてよいか。",
  "plan": "ABC社向け見積書作成、XYZ社へ対応報告メール送付、DEF社訪問準備。"
}
```

**レスポンス（200 OK）**

API-006（日報詳細取得）と同一フォーマットで、更新後の日報を返す。

**エラー（403 Forbidden）**

```json
{
  "status": "error",
  "error": {
    "code": "FORBIDDEN",
    "message": "他のユーザーの日報は編集できません"
  }
}
```

---

### API-008: 日報削除

指定IDの日報を削除する。関連する訪問記録・コメントも同時に削除する。

| 項目 | 内容 |
|------|------|
| エンドポイント | `DELETE /daily-reports/{id}` |
| 認証 | 必要 |
| 対応画面 | SCR-011 |
| 権限 | 日報作成者本人のみ |

**パスパラメータ**

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| id | integer | 日報ID |

**レスポンス（200 OK）**

```json
{
  "status": "success",
  "data": {
    "message": "日報を削除しました"
  }
}
```

---

### API-009: コメント投稿

日報に対してコメントを投稿する。

| 項目 | 内容 |
|------|------|
| エンドポイント | `POST /daily-reports/{id}/comments` |
| 認証 | 必要 |
| 対応画面 | SCR-012 |
| 権限 | 日報閲覧権限を持つ全ユーザー |

**パスパラメータ**

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| id | integer | 日報ID |

**リクエストボディ**

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| body | string | ○ | コメント本文（最大1000文字） |

```json
{
  "body": "ABC社の見積もりは明日の朝会で一緒に確認しよう。"
}
```

**レスポンス（201 Created）**

```json
{
  "status": "success",
  "data": {
    "id": 201,
    "commenter": { "id": 3, "name": "鈴木課長" },
    "body": "ABC社の見積もりは明日の朝会で一緒に確認しよう。",
    "created_at": "2026-02-24T18:30:00+09:00"
  }
}
```

---

## 3. 顧客マスタAPI

---

### API-010: 顧客一覧取得

顧客マスタの一覧を返す。

| 項目 | 内容 |
|------|------|
| エンドポイント | `GET /customers` |
| 認証 | 必要 |
| 対応画面 | SCR-020, SCR-011（プルダウン用） |
| 権限 | 全ユーザー（一覧表示は上長のみだが、プルダウン取得は全員） |

**クエリパラメータ**

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| name | string | - | - | 顧客名で部分一致検索 |
| is_active | boolean | - | - | 有効フラグで絞り込み。プルダウン用途では `true` を指定 |
| page | integer | - | 1 | ページ番号 |
| per_page | integer | - | 20 | 1ページあたり件数 |

**レスポンス（200 OK）**

```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": 10,
        "name": "株式会社ABC",
        "address": "東京都千代田区丸の内1-1-1",
        "phone": "03-1234-5678",
        "contact_person": "田中一郎",
        "is_active": true,
        "created_at": "2025-04-01T09:00:00+09:00",
        "updated_at": "2026-01-15T14:00:00+09:00"
      }
    ]
  },
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_count": 35,
    "total_pages": 2
  }
}
```

---

### API-011: 顧客登録

顧客を新規登録する。

| 項目 | 内容 |
|------|------|
| エンドポイント | `POST /customers` |
| 認証 | 必要 |
| 対応画面 | SCR-021 |
| 権限 | 上長のみ |

**リクエストボディ**

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| name | string | ○ | 顧客名（最大100文字） |
| address | string | - | 住所（最大200文字） |
| phone | string | - | 電話番号 |
| contact_person | string | - | 担当者名（最大50文字） |
| is_active | boolean | - | 有効フラグ（デフォルト: true） |

```json
{
  "name": "株式会社DEF",
  "address": "大阪府大阪市北区梅田2-2-2",
  "phone": "06-5555-1234",
  "contact_person": "佐々木四郎",
  "is_active": true
}
```

**レスポンス（201 Created）**

```json
{
  "status": "success",
  "data": {
    "id": 36,
    "name": "株式会社DEF",
    "address": "大阪府大阪市北区梅田2-2-2",
    "phone": "06-5555-1234",
    "contact_person": "佐々木四郎",
    "is_active": true,
    "created_at": "2026-02-24T10:00:00+09:00",
    "updated_at": "2026-02-24T10:00:00+09:00"
  }
}
```

---

### API-012: 顧客詳細取得

指定IDの顧客情報を返す。

| 項目 | 内容 |
|------|------|
| エンドポイント | `GET /customers/{id}` |
| 認証 | 必要 |
| 対応画面 | SCR-021（編集時の初期表示） |
| 権限 | 上長のみ |

**パスパラメータ**

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| id | integer | 顧客ID |

**レスポンス（200 OK）**

```json
{
  "status": "success",
  "data": {
    "id": 10,
    "name": "株式会社ABC",
    "address": "東京都千代田区丸の内1-1-1",
    "phone": "03-1234-5678",
    "contact_person": "田中一郎",
    "is_active": true,
    "created_at": "2025-04-01T09:00:00+09:00",
    "updated_at": "2026-01-15T14:00:00+09:00"
  }
}
```

---

### API-013: 顧客更新

指定IDの顧客情報を更新する。

| 項目 | 内容 |
|------|------|
| エンドポイント | `PUT /customers/{id}` |
| 認証 | 必要 |
| 対応画面 | SCR-021 |
| 権限 | 上長のみ |

**パスパラメータ**

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| id | integer | 顧客ID |

**リクエストボディ**

API-011（顧客登録）と同一フォーマット。

**レスポンス（200 OK）**

API-012（顧客詳細取得）と同一フォーマットで、更新後の顧客情報を返す。

---

## 4. 営業マスタAPI

---

### API-014: 営業一覧取得

営業担当者マスタの一覧を返す。

| 項目 | 内容 |
|------|------|
| エンドポイント | `GET /sales-persons` |
| 認証 | 必要 |
| 対応画面 | SCR-030, SCR-010（プルダウン用） |
| 権限 | 全ユーザー（一覧画面は上長のみだが、プルダウン取得は全員） |

**クエリパラメータ**

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| name | string | - | - | 氏名で部分一致検索 |
| department | string | - | - | 部署で絞り込み |
| is_active | boolean | - | - | 有効フラグで絞り込み |
| page | integer | - | 1 | ページ番号 |
| per_page | integer | - | 20 | 1ページあたり件数 |

**レスポンス（200 OK）**

```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "山田太郎",
        "department": "営業1課",
        "position": "主任",
        "email": "yamada@example.co.jp",
        "is_active": true,
        "created_at": "2025-04-01T09:00:00+09:00",
        "updated_at": "2026-02-01T10:00:00+09:00"
      }
    ]
  },
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_count": 12,
    "total_pages": 1
  }
}
```

---

### API-015: 営業登録

営業担当者を新規登録する。

| 項目 | 内容 |
|------|------|
| エンドポイント | `POST /sales-persons` |
| 認証 | 必要 |
| 対応画面 | SCR-031 |
| 権限 | 上長のみ |

**リクエストボディ**

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| name | string | ○ | 氏名（最大50文字） |
| department | string | ○ | 部署 |
| position | string | ○ | 役職 |
| email | string | ○ | メールアドレス（ログインID） |
| password | string | ○ | パスワード（8文字以上） |
| is_active | boolean | - | 有効フラグ（デフォルト: true） |

```json
{
  "name": "田中五郎",
  "department": "営業2課",
  "position": "担当",
  "email": "tanaka@example.co.jp",
  "password": "securePass123",
  "is_active": true
}
```

**レスポンス（201 Created）**

```json
{
  "status": "success",
  "data": {
    "id": 13,
    "name": "田中五郎",
    "department": "営業2課",
    "position": "担当",
    "email": "tanaka@example.co.jp",
    "is_active": true,
    "created_at": "2026-02-24T10:00:00+09:00",
    "updated_at": "2026-02-24T10:00:00+09:00"
  }
}
```

**エラー（409 Conflict）**

```json
{
  "status": "error",
  "error": {
    "code": "CONFLICT",
    "message": "このメールアドレスは既に登録されています"
  }
}
```

---

### API-016: 営業詳細取得

指定IDの営業担当者情報を返す。

| 項目 | 内容 |
|------|------|
| エンドポイント | `GET /sales-persons/{id}` |
| 認証 | 必要 |
| 対応画面 | SCR-031（編集時の初期表示） |
| 権限 | 上長のみ |

**パスパラメータ**

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| id | integer | 営業ID |

**レスポンス（200 OK）**

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "山田太郎",
    "department": "営業1課",
    "position": "主任",
    "email": "yamada@example.co.jp",
    "is_active": true,
    "created_at": "2025-04-01T09:00:00+09:00",
    "updated_at": "2026-02-01T10:00:00+09:00"
  }
}
```

---

### API-017: 営業更新

指定IDの営業担当者情報を更新する。

| 項目 | 内容 |
|------|------|
| エンドポイント | `PUT /sales-persons/{id}` |
| 認証 | 必要 |
| 対応画面 | SCR-031 |
| 権限 | 上長のみ |

**パスパラメータ**

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| id | integer | 営業ID |

**リクエストボディ**

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| name | string | ○ | 氏名（最大50文字） |
| department | string | ○ | 部署 |
| position | string | ○ | 役職 |
| email | string | ○ | メールアドレス |
| password | string | - | パスワード（空欄時は変更なし） |
| is_active | boolean | - | 有効フラグ |

**レスポンス（200 OK）**

API-016（営業詳細取得）と同一フォーマットで、更新後の情報を返す。

---

## 付録: API × 画面 対応マトリクス

| API | SCR-001 | SCR-010 | SCR-011 | SCR-012 | SCR-020 | SCR-021 | SCR-030 | SCR-031 |
|-----|---------|---------|---------|---------|---------|---------|---------|---------|
| API-001 ログイン | ○ | | | | | | | |
| API-002 ログアウト | | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| API-003 ユーザー情報 | | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| API-004 日報一覧 | | ○ | | | | | | |
| API-005 日報作成 | | | ○ | | | | | |
| API-006 日報詳細 | | | ○ | ○ | | | | |
| API-007 日報更新 | | | ○ | | | | | |
| API-008 日報削除 | | | ○ | | | | | |
| API-009 コメント投稿 | | | | ○ | | | | |
| API-010 顧客一覧 | | | ○ | | ○ | | | |
| API-011 顧客登録 | | | | | | ○ | | |
| API-012 顧客詳細 | | | | | | ○ | | |
| API-013 顧客更新 | | | | | | ○ | | |
| API-014 営業一覧 | | ○ | | | | | ○ | |
| API-015 営業登録 | | | | | | | | ○ |
| API-016 営業詳細 | | | | | | | | ○ |
| API-017 営業更新 | | | | | | | | ○ |
