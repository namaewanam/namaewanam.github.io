---
title: "Chapter 17 - Make a Connection: networking and threads"
date: 2026-10-28
description: "Kết nối mạng qua TCP/IP Socket, kiến trúc Client-Server, và làm quen với lập trình Đa luồng (Threads & Runnable)."
order: 17
tags:
  - java
  - networking
  - sockets
  - threads
  - multithreading
---

## Table of Contents
1. [Lập trình mạng với Socket và TCP/IP](#sockets-intro)
2. [Giao tiếp giữa Client và Server](#client-server)
3. [Nhu cầu của Đa luồng (Multithreading)](#why-threads)
4. [Tạo và Chạy Thread: `Thread` và `Runnable`](#runnable-thread)
5. [Tóm tắt ghi nhớ cốt lõi (Key Takeaways)](#key-takeaways)

---

## Kết nối mạng với Sockets {#sockets-intro}

```java
import java.net.Socket;
import java.io.*;

// Mở kết nối Socket tới Server qua IP và Port:
Socket chatSocket = new Socket("127.0.0.1", 5000);

PrintWriter writer = new PrintWriter(chatSocket.getOutputStream());
writer.println("Xin chào từ Java Client!");
writer.flush();
```

---

## Khởi tạo và Chạy Thread {#runnable-thread}

1. **`Runnable`**: Công việc cần làm (Job).
2. **`Thread`**: Người công nhân thực hiện công việc (Worker).

```java
Runnable task = () -> {
    System.out.println("Luồng phụ đang thực thi!");
};

Thread worker = new Thread(task);
worker.start(); // Gọi start() để JVM cấp phát luồng hệ thống mới!
```

---

## Tóm tắt ghi nhớ cốt lõi (Key Takeaways) {#key-takeaways}

- `Socket` thiết lập kênh truyền thông 2 chiều qua TCP/IP.
- `Thread` đại diện cho một luồng thực thi độc lập với call stack riêng.
- Luôn gọi `thread.start()`, không gọi trực tiếp `thread.run()`.
