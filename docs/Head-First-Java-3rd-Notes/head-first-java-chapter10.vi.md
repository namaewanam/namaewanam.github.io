---
title: "Chapter 10 - Numbers Matter: numbers and statics"
date: 2026-10-28
description: "Phương thức và biến static, hằng số final, lớp toán học Math, lớp bọc Wrapper Classes, cơ chế Autoboxing và định dạng số."
order: 10
tags:
  - java
  - static
  - final
  - wrappers
  - autoboxing
---

## Table of Contents
1. [Từ khóa `static`: Thuộc về Class, không thuộc về Instance](#static-keyword)
2. [Hằng số trong Java: `static final`](#constants-static-final)
3. [Lớp tiện ích `Math`](#math-class)
4. [Lớp bọc Wrapper Classes & Autoboxing](#wrapper-classes)
5. [Tóm tắt ghi nhớ cốt lõi (Key Takeaways)](#key-takeaways)

---

## Từ khóa `static` {#static-keyword}

- **Phương thức `static`**: Gọi qua tên lớp `ClassName.methodName()`, không cần tạo object.
- **Biến `static`**: Biến dùng chung duy nhất cho tất cả các đối tượng của lớp đó.

```java
public class Player {
    private static int playerCount = 0; // Biến dùng chung

    public Player() {
        playerCount++;
    }

    public static int getPlayerCount() {
        return playerCount;
    }
}
```

---

## Autoboxing & Unboxing {#wrapper-classes}

Tự động chuyển đổi giữa kiểu Primitive và Wrapper Class:

```java
ArrayList<Integer> scores = new ArrayList<>();
scores.add(100); // Autoboxing: int 100 -> Integer
int score = scores.get(0); // Unboxing: Integer -> int
```

---

## Tóm tắt ghi nhớ cốt lõi (Key Takeaways) {#key-takeaways}

- Phương thức static không thể truy cập trực tiếp vào biến non-static.
- `static final` dùng để định nghĩa hằng số bất biến.
- Autoboxing tự động chuyển đổi giữa primitive và wrapper class tương ứng.
