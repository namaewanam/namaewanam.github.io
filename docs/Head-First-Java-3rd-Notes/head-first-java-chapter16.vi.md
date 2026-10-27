---
title: "Chapter 16 - Saving Objects (and Text): serialization and file I/O"
date: 2026-10-28
description: "Lưu trữ trạng thái đối tượng, Tuần tự hóa (Serialization), từ khóa transient, và đọc ghi file hiện đại với NIO.2 (java.nio.file)."
order: 16
tags:
  - java
  - serialization
  - file-io
  - nio2
---

## Table of Contents
1. [Lưu trữ dữ liệu: Text File vs Object Serialization](#serialization-overview)
2. [Tuần tự hóa (Serialization): Đóng băng đối tượng](#serialization)
3. [Từ khóa `transient`: Bỏ qua dữ liệu nhạy cảm](#transient-keyword)
4. [Đọc và Ghi File hiện đại với NIO.2 (`java.nio.file`)](#modern-nio2)
5. [Tóm tắt ghi nhớ cốt lõi (Key Takeaways)](#key-takeaways)

---

## Tuần tự hóa đối tượng (Serialization) {#serialization}

Lưu nguyên vẹn trạng thái đối tượng xuống đĩa hoặc truyền qua mạng:

```java
import java.io.*;

public class GameCharacter implements Serializable {
    private int power;
    private String type;
    private transient String password; // Bỏ qua không lưu trường này
}
```

---

## Đọc và Ghi File hiện đại với NIO.2 (`java.nio.file`) {#modern-nio2}

```java
import java.nio.file.*;

Path path = Path.of("notes.txt");

// Ghi chuỗi ra file:
Files.writeString(path, "Hello Java NIO.2!");

// Đọc toàn bộ nội dung file:
String content = Files.readString(path);
```

---

## Tóm tắt ghi nhớ cốt lõi (Key Takeaways) {#key-takeaways}

- `implements Serializable` cho phép đối tượng được tuần tự hóa.
- `transient` bỏ qua không lưu biến nhạy cảm.
- NIO.2 (`Path` và `Files`) là cách tiếp cận hiện đại và tối ưu cho File I/O trong Java ngày nay.
