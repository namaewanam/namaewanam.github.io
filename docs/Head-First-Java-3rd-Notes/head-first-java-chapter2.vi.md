---
title: "Chapter 2 - A Trip to Objectville: classes and objects"
date: 2026-10-28
description: "Tư duy lập trình hướng đối tượng (OOP), trạng thái (State) và hành vi (Behavior), phân biệt Class (bản thiết kế) và Object (thực thể), thực hành GuessGame."
order: 2
tags:
  - java
  - oop
  - classes-objects
---

## Table of Contents
1. [Chào mừng đến với Objectville: Tư duy hướng đối tượng](#welcome-to-objectville)
2. [Lập trình thủ tục vs Lập trình hướng đối tượng](#procedural-vs-oop)
3. [Class là bản thiết kế, Object là thực thể](#class-vs-object)
4. [Hai thành phần của một đối tượng: State & Behavior](#state-and-behavior)
5. [Tạo và sử dụng Object với toán tử `new`](#creating-first-object)
6. [Dự án thực hành: Xây dựng trò chơi GuessGame](#guess-game-project)
7. [Tóm tắt ghi nhớ cốt lõi (Key Takeaways)](#key-takeaways)

---

## Chào mừng đến với Objectville: Tư duy hướng đối tượng {#welcome-to-objectville}

**Object-Oriented Programming (OOP)** mô hình hóa phần mềm thành các **Đối tượng (Objects)** độc lập tương tác với nhau:
- **Class (Lớp)**: Là bản thiết kế (blueprint), định nghĩa đối tượng *biết gì* và *làm gì*.
- **Object (Đối tượng)**: Là thực thể sống cụ thể được tạo ra từ Class, nằm trên vùng nhớ Heap.

```java
public class Dog {
    // 1. Instance variables (State - Trạng thái)
    int size;
    String breed;
    String name;

    // 2. Methods (Behavior - Hành vi)
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

## Tạo và sử dụng Object với toán tử `new` {#creating-first-object}

```java
public class DogTestDrive {
    public static void main(String[] args) {
        // Cấp phát đối tượng Dog trên Heap Memory
        Dog d = new Dog();
        d.size = 40;
        d.name = "Bé Vàng";
        d.bark();
    }
}
```

---

## Dự án thực hành: Xây dựng trò chơi GuessGame {#guess-game-project}

### 1. Class `Player`:
```java
public class Player {
    int number = 0;

    public void guess() {
        java.util.Random rand = new java.util.Random();
        number = rand.nextInt(10);
        System.out.println("Tôi đoán số: " + number);
    }
}
```

### 2. Class `GuessGame`:
```java
public class GuessGame {
    Player p1;
    Player p2;
    Player p3;

    public void startGame() {
        p1 = new Player();
        p2 = new Player();
        p3 = new Player();

        java.util.Random rand = new java.util.Random();
        int targetNumber = rand.nextInt(10);
        System.out.println("Trọng tài: Tôi đang nghĩ số từ 0 đến 9...");

        while (true) {
            p1.guess();
            p2.guess();
            p3.guess();

            boolean p1isRight = (p1.number == targetNumber);
            boolean p2isRight = (p2.number == targetNumber);
            boolean p3isRight = (p3.number == targetNumber);

            if (p1isRight || p2isRight || p3isRight) {
                System.out.println("Đã có người chiến thắng!");
                break;
            }
        }
    }
}
```

---

## Tóm tắt ghi nhớ cốt lõi (Key Takeaways) {#key-takeaways}

- **Class** là bản vẽ thiết kế, **Object** là thực thể sống được cấp phát trong bộ nhớ Heap bằng `new`.
- Một đối tượng gồm 2 phần: **State** (instance variables) và **Behavior** (methods).
- Truy cập vào biến và gọi hàm của đối tượng thông qua toán tử dấu chấm `.`.
