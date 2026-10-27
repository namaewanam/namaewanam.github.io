---
title: "Chapter 12 - What, Not How: lambdas and streams"
date: 2026-10-28
description: "Cuộc cách mạng Lập trình hàm trong Java hiện đại, cú pháp biểu thức Lambda, Functional Interfaces và quy trình xử lý dữ liệu với Streams API."
order: 12
tags:
  - java
  - lambdas
  - streams-api
  - functional-programming
---

## Table of Contents
1. [Sự chuyển dịch tư duy: Lập trình hàm trong Java](#functional-mindset)
2. [Cú pháp biểu thức Lambda](#lambda-syntax)
3. [Giao diện hàm (Functional Interfaces)](#functional-interfaces)
4. [Dòng chảy dữ liệu: Streams API Pipeline](#streams-pipeline)
5. [Toán tử Intermediate vs Terminal](#intermediate-vs-terminal)
6. [Tóm tắt ghi nhớ cốt lõi (Key Takeaways)](#key-takeaways)

---

## Streams API Pipeline {#streams-pipeline}

Xử lý dữ liệu bằng cách mô tả kết quả mong muốn thay vì viết vòng lặp thủ công:

```java
List<String> rockSongTitles = songs.stream()
    .filter(song -> song.getGenre().equals("Rock")) // Intermediate operation (Lazy)
    .map(Song::getTitle)                            // Intermediate operation (Lazy)
    .collect(Collectors.toList());                  // Terminal operation (Eager)
```

---

## Biểu thức Lambda {#lambda-syntax}

```java
// Cú pháp: (parameters) -> expression
(a, b) -> a + b
```

---

## Tóm tắt ghi nhớ cốt lõi (Key Takeaways) {#key-takeaways}

- Lambda loại bỏ các anonymous inner classes rườm rà.
- Stream Pipeline gồm: Nguồn (Source) -> Thao tác trung gian (Intermediate) -> Thao tác kết thúc (Terminal).
- Thao tác trung gian chỉ thực sự chạy khi gặp thao tác kết thúc (**Lazy Evaluation**).
