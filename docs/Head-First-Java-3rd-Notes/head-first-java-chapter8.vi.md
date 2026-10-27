---
title: "Chapter 8 - Serious Polymorphism: interfaces and abstract classes"
date: 2026-10-28
description: "Khi nào dùng Abstract Class vs Interface, giải quyết vấn đề Đa kế thừa (Diamond Problem), Lớp tổ tiên Object và Default Methods."
order: 8
tags:
  - java
  - oop
  - interfaces
  - abstract-classes
  - polymorphism
---

## Table of Contents
1. [Lớp trừu tượng (Abstract Class): Bản thiết kế dở dang](#abstract-classes)
2. [Lớp tổ tiên của vạn vật: `java.lang.Object`](#object-class)
3. [Giao diện (Interface): Hợp đồng hành vi](#interfaces)
4. [So sánh: Abstract Class vs Interface](#abstract-vs-interface)
5. [Tóm tắt ghi nhớ cốt lõi (Key Takeaways)](#key-takeaways)

---

## Abstract Class vs Interface {#abstract-classes}

- **Abstract Class**: Dùng từ khóa `abstract`, không thể khởi tạo bằng `new`. Dùng khi các lớp có quan hệ họ hàng mật thiết (IS-A) và cần chia sẻ code.
- **Interface**: Dùng từ khóa `interface`, đại diện cho hợp đồng năng lực (CAN-DO). Một lớp có thể `implements` nhiều interface.

```java
public interface Pet {
    void play();
}

public class Dog extends Animal implements Pet {
    @Override
    public void play() {
        System.out.println("Chó đuổi bắt bóng.");
    }
}
```

---

## Tóm tắt ghi nhớ cốt lõi (Key Takeaways) {#key-takeaways}

- Lớp `abstract` không thể khởi tạo trực tiếp.
- Interface giải quyết bài toán đa kế thừa một cách an toàn trong Java.
- Mọi class trong Java đều là con cháu của `java.lang.Object`.
