---
title: "Chapter 7 - Better Living in Objectville: inheritance and polymorphism"
date: 2026-10-28
description: "Thiết kế cây kế thừa (Inheritance), quan hệ IS-A vs HAS-A, ghi đè phương thức (Override) và nguyên lý Đa hình (Polymorphism)."
order: 7
tags:
  - java
  - oop
  - inheritance
  - polymorphism
---

## Table of Contents
1. [Kế thừa (Inheritance): Tái sử dụng và Mở rộng code](#inheritance-concept)
2. [Quan hệ IS-A vs Quan hệ HAS-A](#is-a-vs-has-a)
3. [Ghi đè phương thức (Method Overriding)](#method-overriding)
4. [Sức mạnh tối thượng của OOP: Đa hình (Polymorphism)](#polymorphism-power)
5. [Tóm tắt ghi nhớ cốt lõi (Key Takeaways)](#key-takeaways)

---

## Kế thừa và Đa hình {#inheritance-concept}

Kế thừa (`extends`) giúp lớp con sử dụng lại các thuộc tính và phương thức của lớp cha:

```java
public class Animal {
    public void makeNoise() {
        System.out.println("Tiếng kêu động vật...");
    }
}

public class Dog extends Animal {
    @Override
    public void makeNoise() {
        System.out.println("Gâu! Gâu!");
    }
}
```

### Đa hình (Polymorphism):
```java
// Khai báo biến kiểu Animal, nhưng trỏ tới Object Dog:
Animal myPet = new Dog();
myPet.makeNoise(); // Tự động gọi makeNoise() của Dog
```

---

## Tóm tắt ghi nhớ cốt lõi (Key Takeaways) {#key-takeaways}

- Kế thừa dùng từ khóa `extends`.
- Luôn kiểm tra quan hệ bằng bài kiểm tra **IS-A** (Con chó là một Động vật).
- **Polymorphism** cho phép gọi phương thức linh hoạt dựa trên kiểu thực tế của Object trên Heap.
