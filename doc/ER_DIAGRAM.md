erDiagram
    sales_persons {
        int id PK "営業ID"
        string name "氏名"
        string department "所属部署"
        string position "役職（担当/主任/課長等）"
        string email "メールアドレス"
        boolean is_active "有効フラグ"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }

    customers {
        int id PK "顧客ID"
        string name "顧客名"
        string address "住所"
        string phone "電話番号"
        string contact_person "担当者名"
        boolean is_active "有効フラグ"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }

    daily_reports {
        int id PK "日報ID"
        int sales_person_id FK "営業ID"
        date report_date "報告日"
        text problem "課題・相談（Problem）"
        text plan "明日やること（Plan）"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }

    visit_records {
        int id PK "訪問記録ID"
        int daily_report_id FK "日報ID"
        int customer_id FK "顧客ID"
        text visit_content "訪問内容"
        int sort_order "表示順"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }

    comments {
        int id PK "コメントID"
        int daily_report_id FK "日報ID"
        int commenter_id FK "コメント投稿者（営業ID）"
        text body "コメント本文"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }

    sales_persons ||--o{ daily_reports : "作成する"
    daily_reports ||--o{ visit_records : "含む"
    customers ||--o{ visit_records : "訪問される"
    daily_reports ||--o{ comments : "コメントされる"
    sales_persons ||--o{ comments : "投稿する"
