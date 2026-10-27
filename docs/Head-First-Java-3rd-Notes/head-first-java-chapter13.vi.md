---
title: "Chapter 13 - Risky Behavior: exception handling"
date: 2026-10-28
description: "Cơ chế phòng thủ lỗi trong Java, khối lệnh try-catch-finally, phân biệt Checked vs Unchecked Exception, và cú pháp try-with-resources."
order: 13
tags:
  - java
  - exception-handling
  - try-catch
  - errors
---

## Table of Contents
1. [Tại sao cần xử lý ngoại lệ?](#why-exceptions)
2. [Cú pháp phòng thủ: `try`, `catch`, `finally`](#try-catch-finally)
3. [Phân biệt Checked Exception vs Unchecked Exception](#checked-vs-unchecked)
4. [Tự động đóng tài nguyên: `try-with-resources`](#try-with-resources)
5. [Tóm tắt ghi nhớ cốt lõi (Key Takeaways)](#key-takeaways)

---

## Khối lệnh phòng thủ: `try-catch-finally` {#try-catch-finally}

```java
try {
    doRiskyThing();
} catch (SpecificException ex) {
    System.out.println("Đã bắt ngoại lệ: " + ex.getMessage());
} finally {
    // LUÔN LUÔN CHẠY để dọn dẹp tài nguyên
    cleanUp();
}
```

---

## Checked vs Unchecked Exception {#checked-vs-unchecked}

- **Checked Exception** (`IOException`, `SQLException`): Bắt buộc phải được xử lý bằng `try-catch` hoặc khai báo bằng `throws`.
- **Unchecked Exception** (`RuntimeException`, `NullPointerException`): Lỗi logic lập trình, không bắt buộc khai báo trước.

---

## `try-with-resources` {#try-with-resources}

```java
try (BufferedReader br = new BufferedReader(new FileReader("data.txt"))) {
    return br.readLine();
} catch (IOException e) {
    e.printStackTrace();
}
```

---

## Tóm tắt ghi nhớ cốt lõi (Key Takeaways) {#key-takeaways}

- Khối `finally` luôn chạy dù có xảy ra lỗi hay không.
- Checked Exception bắt buộc xử lý tại thời điểm biên dịch.
- Dùng `try-with-resources` cho các đối tượng `AutoCloseable` để tránh rò rỉ bộ nhớ.
