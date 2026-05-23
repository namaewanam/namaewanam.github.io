---
title: "Mermaid Diagram Test"
date: "2026-05-23"
description: "Test page for Mermaid diagrams — sequence, flowchart, ER, and more."
tags: [mermaid, test, architecture]
difficulty: intermediate
---

Trang này dùng để test Mermaid diagram rendering. Tất cả diagrams được render client-side, lazy-loaded.

## Sequence Diagram — Payment Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant GW as API Gateway
    participant MPGS as MPGS Service
    participant DB as PostgreSQL
    participant Kafka

    C->>GW: POST /payments
    GW->>MPGS: forward + JWT validation
    MPGS->>DB: INSERT payment_request
    MPGS->>Kafka: publish PaymentInitiated
    MPGS-->>GW: 202 Accepted + txnId
    GW-->>C: 202 Accepted

    Note over Kafka: async processing
    Kafka->>MPGS: consume PaymentInitiated
    MPGS->>DB: UPDATE status = PROCESSING
```

## Flowchart — Request Lifecycle

```mermaid
flowchart TD
    A([Client Request]) --> B{Auth valid?}
    B -- No --> C[401 Unauthorized]
    B -- Yes --> D{Rate limit?}
    D -- Exceeded --> E[429 Too Many Requests]
    D -- OK --> F[Process Request]
    F --> G{DB write OK?}
    G -- No --> H[500 + retry signal]
    G -- Yes --> I[Publish to Kafka]
    I --> J([202 Accepted])
```

## ER Diagram — Payment Schema

```mermaid
erDiagram
    PAYMENT_REQUEST {
        uuid id PK
        string txn_id UK
        string status
        decimal amount
        string currency
        timestamp created_at
        timestamp updated_at
    }

    PAYMENT_EVENT {
        uuid id PK
        uuid payment_id FK
        string event_type
        jsonb payload
        timestamp occurred_at
    }

    PAYMENT_REQUEST ||--o{ PAYMENT_EVENT : "has many"
```

## State Diagram — Payment Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> PROCESSING : Kafka consumed
    PROCESSING --> SUCCESS : Gateway OK
    PROCESSING --> FAILED : Timeout / Error
    PROCESSING --> REQUIRES_ACTION : 3DS challenge
    REQUIRES_ACTION --> SUCCESS : User confirms
    REQUIRES_ACTION --> FAILED : User cancels
    SUCCESS --> [*]
    FAILED --> [*]
```

## Gitgraph — Feature Branch Strategy

```mermaid
gitGraph
    commit id: "init"
    branch feature/payment-v2
    checkout feature/payment-v2
    commit id: "add MPGS adapter"
    commit id: "add retry logic"
    checkout main
    branch hotfix/timeout
    commit id: "fix 30s timeout"
    checkout main
    merge hotfix/timeout
    merge feature/payment-v2
    commit id: "release v1.2"
```
