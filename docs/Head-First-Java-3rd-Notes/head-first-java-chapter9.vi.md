---
title: "Chapter 9 - Life and Death of an Object: constructors and garbage collection"
date: 2026-10-28
description: "Vòng đời đối tượng, Ngăn xếp Stack vs Vùng nhớ Heap, Hàm khởi tạo (Constructor), gọi chuỗi super() và cơ chế dọn rác Garbage Collection."
order: 9
tags:
  - java
  - jvm
  - constructors
  - stack-heap
  - garbage-collection
---

## Table of Contents
1. [Ngăn xếp Stack và Vùng nhớ Heap](#stack-vs-heap)
2. [Hàm khởi tạo (Constructors)](#constructors)
3. [Chuỗi khởi tạo lớp cha: `super()`](#constructor-chaining)
4. [Cơ chế Garbage Collection (Dọn rác)](#garbage-collection)
5. [Tóm tắt ghi nhớ cốt lõi (Key Takeaways)](#key-takeaways)

---

## Vòng đời đối tượng và Constructors {#constructors}

Constructor chạy ngay khi toán tử `new` được gọi, có tên trùng với Class và không có kiểu trả về:

```java
public class Duck {
    private int size;

    // Constructor mặc định:
    public Duck() {
        size = 10;
    }

    // Constructor nạp chồng (Overloaded):
    public Duck(int customSize) {
        size = customSize;
    }
}
```

---

## Chuỗi khởi tạo `super()` {#constructor-chaining}

Mỗi constructor luôn bắt đầu bằng việc gọi constructor của lớp cha `super()`. Nếu không tự viết, JVM sẽ tự động chèn `super();` không tham số vào dòng đầu tiên.

---

## Tóm tắt ghi nhớ cốt lõi (Key Takeaways) {#key-takeaways}

- Biến cục bộ nằm trên **Stack**, Object nằm trên **Heap**.
- `super()` luôn chạy trước khi thân hàm constructor lớp con thực thi.
- Garbage Collector tự động thu hồi bộ nhớ của các đối tượng không còn tham chiếu sống.
