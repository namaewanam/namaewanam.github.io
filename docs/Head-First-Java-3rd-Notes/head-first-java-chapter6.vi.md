---
title: "Chapter 6 - Using the Java Library: get to know the Java API"
date: 2026-10-28
description: "Khám phá thư viện chuẩn Java API, so sánh mảng cố định với danh sách động ArrayList, quản lý Packages và lệnh import."
order: 6
tags:
  - java
  - arraylist
  - packages
  - java-api
---

## Table of Contents
1. [Vấn đề của mảng cố định và giải pháp: `ArrayList<T>`](#arraylist-intro)
2. [So sánh chi tiết: Array vs `ArrayList`](#array-vs-arraylist)
3. [Khám phá thư viện chuẩn Java API](#java-api)
4. [Tổ chức mã nguồn: Packages và Lệnh `import`](#packages-and-import)
5. [Tóm tắt ghi nhớ cốt lõi (Key Takeaways)](#key-takeaways)

---

## Danh sách động: `ArrayList<T>` {#arraylist-intro}

`java.util.ArrayList` là danh sách có khả năng tự động co giãn kích thước:

```java
import java.util.ArrayList;

ArrayList<String> myList = new ArrayList<>();
myList.add("Apple");
myList.add("Banana");

int size = myList.size();          // 2
boolean hasApple = myList.contains("Apple"); // true
String fruit = myList.get(0);      // "Apple"
myList.remove("Apple");
```

---

## Tóm tắt ghi nhớ cốt lõi (Key Takeaways) {#key-takeaways}

- `ArrayList` nằm trong package `java.util`, tự động quản lý kích thước bộ nhớ.
- `package java.lang` (chứa `String`, `System`, `Math`...) luôn được JVM tự động import ngầm vào mọi file.
