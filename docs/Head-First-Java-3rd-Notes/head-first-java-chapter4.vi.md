---
title: "Chapter 4 - How Objects Behave: methods use instance variables"
date: 2026-10-28
description: "Trạng thái ảnh hưởng đến hành vi, truyền tham số theo giá trị (Pass-by-value), nguyên tắc đóng gói dữ liệu (Encapsulation) với Getters và Setters."
order: 4
tags:
  - java
  - oop
  - encapsulation
  - methods
---

## Table of Contents
1. [State quyết định Behavior: Dữ liệu điều khiển hành động](#state-affects-behavior)
2. [Tham số phương thức và Giá trị trả về](#parameters-and-return-types)
3. [Cơ chế truyền tham số: Java là Pass-by-Value 100%](#pass-by-value)
4. [Nguyên tắc cốt lõi: Đóng gói dữ liệu (Encapsulation)](#encapsulation)
5. [Tạo Getters và Setters chuẩn chỉnh](#getters-and-setters)
6. [Tóm tắt ghi nhớ cốt lõi (Key Takeaways)](#key-takeaways)

---

## State quyết định Behavior: Dữ liệu điều khiển hành động {#state-affects-behavior}

Trong OOP, **trạng thái (State - instance variables)** của một đối tượng sẽ trực tiếp quyết định **hành vi (Behavior - methods)** của nó:

```java
class Dog {
    int size;
    String name;

    void bark() {
        if (size > 60) {
            System.out.println("Gâu! Gâu! Gâu!");
        } else if (size > 14) {
            System.out.println("Ẳng! Ẳng!");
        } else {
            System.out.println("Yip! Yip!");
        }
    }
}
```

---

## Cơ chế truyền tham số: Java là Pass-by-Value 100% {#pass-by-value}

> [!IMPORTANT]
> **Java LUÔN LUÔN truyền tham số theo giá trị (Pass-by-value)**.
> Khi truyền biến vào hàm, Java copy giá trị của biến đó (hoặc copy giá trị của chiếc remote tham chiếu).

---

## Nguyên tắc cốt lõi: Đóng gói dữ liệu (Encapsulation) {#encapsulation}

1. Đặt các instance variables ở chế độ `private`.
2. Cung cấp các phương thức `public` Getter và Setter để kiểm soát việc đọc và ghi dữ liệu:

```java
public class GoodDog {
    private int size; // Ẩn giấu dữ liệu

    public int getSize() {
        return size;
    }

    public void setSize(int s) {
        if (s > 0) {
            size = s;
        } else {
            System.out.println("Kích thước phải lớn hơn 0!");
        }
    }
}
```

---

## Tóm tắt ghi nhớ cốt lõi (Key Takeaways) {#key-takeaways}

- State ảnh hưởng trực tiếp đến Behavior.
- Java là ngôn ngữ truyền tham số theo giá trị (**Pass-by-value**).
- Luôn giữ instance variables là `private` và bảo vệ dữ liệu bằng **Encapsulation**.
