---
title: "Chapter 11 - Data Structures: collections and generics"
date: 2026-10-28
description: "Cấu trúc dữ liệu trong Java, Collections Framework (List, Set, Map), Tham số hóa kiểu dữ liệu Generics, sắp xếp với Comparable và Comparator."
order: 11
tags:
  - java
  - collections
  - generics
  - data-structures
---

## Table of Contents
1. [Bức tranh tổng quan Java Collections Framework](#collections-overview)
2. [Tham số kiểu Generics `<T>`](#generics-intro)
3. [Bộ ba: `List`, `Set`, và `Map`](#list-set-map)
4. [Sắp xếp đối tượng: `Comparable` vs `Comparator`](#sorting-objects)
5. [Hợp đồng giữa `equals()` và `hashCode()`](#equals-hashcode)
6. [Tóm tắt ghi nhớ cốt lõi (Key Takeaways)](#key-takeaways)

---

## Collections Framework {#collections-overview}

- **`List`** (`ArrayList`): Có thứ tự, cho phép phần tử trùng lặp.
- **`Set`** (`HashSet`, `TreeSet`): Không trùng lặp, đảm bảo tính duy nhất.
- **`Map`** (`HashMap`): Lưu trữ theo cặp Khóa - Giá trị (`Key -> Value`).

---

## `Comparable` vs `Comparator` {#sorting-objects}

- **`Comparable`**: Triển khai `compareTo()` bên trong class cho thứ tự sắp xếp tự nhiên (Natural ordering).
- **`Comparator`**: Định nghĩa tiêu chí sắp xếp tùy chỉnh bên ngoài bằng Lambda:

```java
songList.sort((s1, s2) -> Integer.compare(s1.getBpm(), s2.getBpm()));
```

---

## Tóm tắt ghi nhớ cốt lõi (Key Takeaways) {#key-takeaways}

- `List` giữ thứ tự, `Set` giữ tính duy nhất, `Map` quản lý cặp key-value.
- Luôn override đồng thời cả `equals()` và `hashCode()` cho các data class.
