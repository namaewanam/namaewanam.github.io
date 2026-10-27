---
title: "Chapter 5 - Extra-Strength Methods: writing a program"
date: 2026-10-28
description: "Quy trình thiết kế chương trình hoàn chỉnh, vòng lặp for nâng cao (for-each), ép kiểu số học và xây dựng game chìm tàu Sink a Dot Com."
order: 5
tags:
  - java
  - for-each
  - battleship-game
  - flow-control
---

## Table of Contents
1. [Quy trình phát triển một Class chuyên nghiệp](#class-development-process)
2. [Thiết kế game: Simple Startup Game (Bắn tàu)](#startup-game)
3. [Vòng lặp `for` truyền thống vs `for-each` nâng cao](#for-each-loop)
4. [Ép kiểu số học (Type Casting)](#casting-primitives)
5. [Tóm tắt ghi nhớ cốt lõi (Key Takeaways)](#key-takeaways)

---

## Quy trình phát triển một Class chuyên nghiệp {#class-development-process}

Head First Java giới thiệu quy trình 3 bước để xây dựng một class:
1. **Prep Code (Mã chuẩn bị / Pseudocode)**: Mô tả logic thuật toán bằng ngôn ngữ tự nhiên.
2. **Test Code (Mã kiểm thử)**: Viết đoạn code kiểm tra hành vi trước khi viết code thực tế.
3. **Real Code (Mã thực tế)**: Triển khai code Java hoàn chỉnh.

---

## Vòng lặp `for-each` nâng cao {#for-each-loop}

Duyệt qua các phần tử của mảng hoặc collection ngắn gọn và an toàn:

```java
String[] names = {"Alice", "Bob", "Charlie"};

for (String name : names) {
    System.out.println(name);
}
```

---

## Tóm tắt ghi nhớ cốt lõi (Key Takeaways) {#key-takeaways}

- Tiếp cận việc viết code thông qua Prep Code -> Test Code -> Real Code.
- Sử dụng vòng lặp `for-each` cho việc duyệt mảng và collections.
- Chuyển đổi giữa `String` và `int` bằng `Integer.parseInt(str)`.
