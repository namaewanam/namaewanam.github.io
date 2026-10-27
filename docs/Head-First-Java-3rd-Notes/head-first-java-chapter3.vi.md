---
title: "Chapter 3 - Know Your Variables: primitives and references"
date: 2026-10-28
description: "Phân biệt sâu sắc 8 kiểu dữ liệu nguyên thủy (Primitive) và kiểu tham chiếu (Reference) trên Stack & Heap, mảng trong Java."
order: 3
tags:
  - java
  - variables
  - primitives
  - references
  - memory-model
---

## Table of Contents
1. [Bản chất của một biến: Primitive vs Reference](#variable-nature)
2. [8 kiểu dữ liệu nguyên thủy (Primitives)](#primitives)
3. [Biến tham chiếu đối tượng & Ẩn dụ chiếc Remote](#object-references)
4. [Mô hình bộ nhớ: Stack vs Heap](#stack-vs-heap)
5. [Mảng (Arrays) trong Java luôn là Đối tượng](#arrays)
6. [Tóm tắt ghi nhớ cốt lõi (Key Takeaways)](#key-takeaways)

---

## 8 kiểu dữ liệu nguyên thủy (Primitives) {#primitives}

Java định nghĩa đúng 8 kiểu dữ liệu nguyên thủy với kích thước cố định trên mọi nền tảng:

| Kiểu | Kích thước | Khoảng giá trị lưu trữ | Ví dụ |
| :--- | :--- | :--- | :--- |
| `boolean` | 1 bit | `true` hoặc `false` | `boolean isReady = true;` |
| `char` | 16-bit (2 bytes) | Ký tự Unicode (`0` đến `65,535`) | `char grade = 'A';` |
| `byte` | 8-bit (1 byte) | `-128` đến `127` | `byte b = 100;` |
| `short` | 16-bit (2 bytes) | `-32,768` đến `32,767` | `short s = 25000;` |
| `int` | 32-bit (4 bytes) | Khoảng `-2 tỉ` đến `+2 tỉ` | `int count = 1000000;` |
| `long` | 64-bit (8 bytes) | Số nguyên cực lớn (thêm hậu tố `L`) | `long debt = 31000000000L;` |
| `float` | 32-bit (4 bytes) | Số thực dấu phẩy động (hậu tố `f`) | `float price = 19.99f;` |
| `double` | 64-bit (8 bytes) | Số thực độ chính xác kép (mặc định) | `double pi = 3.14159265;` |

---

## Biến tham chiếu đối tượng & Ẩn dụ chiếc Remote {#object-references}

```java
Dog myDog = new Dog();
```
1. `Dog myDog`: Tạo biến tham chiếu (remote control) trên **Stack**.
2. `new Dog()`: Tạo đối tượng thực tế trên **Heap**.
3. `=`: Đặt địa chỉ của đối tượng vào remote `myDog`.

---

## Mảng (Arrays) trong Java luôn là Đối tượng {#arrays}

Mảng trong Java luôn được cấp phát trên Heap, kể cả mảng chứa primitives:

```java
// Mảng đối tượng chứa các remote control:
Dog[] pets = new Dog[3];
pets[0] = new Dog();
pets[0].name = "Fido";
```

---

## Tóm tắt ghi nhớ cốt lõi (Key Takeaways) {#key-takeaways}

- Biến có 2 loại: **Primitive** (chứa giá trị thực tế) và **Reference** (chứa remote điều khiển trỏ vào đối tượng).
- Biến cục bộ sống trên **Stack**, Object luôn nằm trên **Heap**.
- **Garbage Collector (GC)** tự động thu gom các đối tượng vô thừa nhận (không còn remote nào trỏ tới) trên Heap.
