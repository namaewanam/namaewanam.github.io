---
title: "Chapter 18 - Dealing with Concurrency Issues: race conditions and immutable data"
date: 2026-10-28
description: "Cơn ác mộng Race Conditions khi nhiều luồng truy cập chung dữ liệu, giải pháp từ khóa synchronized, tính bất biến và java.util.concurrent hiện đại."
order: 18
tags:
  - java
  - concurrency
  - multithreading
  - synchronization
  - thread-safety
---

## Table of Contents
1. [Hiểm họa tương tranh: Race Conditions là gì?](#race-conditions)
2. [Khóa đối tượng: Từ khóa `synchronized`](#synchronized-keyword)
3. [Dữ liệu bất biến (Immutable Data)](#immutable-data)
4. [Đồng thời hiện đại trong Java: `java.util.concurrent`](#modern-concurrency)
5. [Tóm tắt ghi nhớ cốt lõi (Key Takeaways)](#key-takeaways)

---

## Hiểm họa Race Conditions {#race-conditions}

Race Condition xảy ra khi hai hay nhiều luồng cùng đọc và sửa đổi chung một biến trạng thái mà không có cơ chế đồng bộ hóa, dẫn đến dữ liệu cuối cùng bị sai lệch.

---

## Từ khóa `synchronized` {#synchronized-keyword}

Mỗi đối tượng trong Java đều sở hữu một Intrinsic Lock. `synchronized` đảm bảo chỉ duy nhất một luồng được phép truy cập khối lệnh quan trọng tại một thời điểm:

```java
public class BankAccount {
    private int balance = 100;

    public synchronized void makeWithdrawal(int amount) {
        if (balance >= amount) {
            balance -= amount;
        }
    }
}
```

---

## Dữ liệu bất biến & `java.util.concurrent` {#modern-concurrency}

- **Immutable Data**: Dữ liệu không thể thay đổi sau khi tạo (như Java `Record`, `String`) mặc nhiên an toàn luồng (**Thread-safe**) 100% mà không cần dùng đến khóa!
- **`java.util.concurrent`**: Cung cấp `AtomicInteger`, `ConcurrentHashMap`, và `ExecutorService` được tối ưu hóa hiệu năng cao.

---

## Tóm tắt ghi nhớ cốt lõi (Key Takeaways) {#key-takeaways}

- Race Condition xảy ra khi có dữ liệu dùng chung bị thay đổi (mutable shared state).
- `synchronized` bảo vệ vùng tranh chấp bằng intrinsic lock của đối tượng.
- Dữ liệu bất biến (Immutable Data) là giải pháp thanh lịch nhất để triệt tiêu lỗi tương tranh.
