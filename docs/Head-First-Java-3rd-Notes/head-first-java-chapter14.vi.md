---
title: "Chapter 14 - A Very Graphic Story: intro to GUI, event handling, and inner classes"
date: 2026-10-28
description: "Làm quen với giao diện đồ họa Swing, Lập trình hướng sự kiện (Event-driven Programming) và Lớp nội bộ (Inner Classes)."
order: 14
tags:
  - java
  - gui
  - swing
  - event-handling
  - inner-classes
---

## Table of Contents
1. [Khung cửa sổ đầu tiên với `JFrame`](#first-gui)
2. [Lập trình hướng sự kiện (Event-driven Programming)](#event-driven)
3. [Lớp nội bộ (Inner Classes) và Biểu thức Lambda](#inner-classes)
4. [Tóm tắt ghi nhớ cốt lõi (Key Takeaways)](#key-takeaways)

---

## Giao diện và Sự kiện {#first-gui}

Tạo khung cửa sổ bằng `javax.swing.JFrame` và lắng nghe sự kiện click chuột:

```java
import javax.swing.*;

public class SimpleGui {
    public static void main(String[] args) {
        JFrame frame = new JFrame();
        JButton button = new JButton("Bấm vào tôi!");

        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.getContentPane().add(button);

        // Lắng nghe sự kiện bằng Lambda:
        button.addActionListener(event -> button.setText("Đã bấm!"));

        frame.setSize(300, 300);
        frame.setVisible(true);
    }
}
```

---

## Tóm tắt ghi nhớ cốt lõi (Key Takeaways) {#key-takeaways}

- `JFrame` là khung chứa ngoài cùng của giao diện Swing.
- Mô hình sự kiện hoạt động theo cơ chế Observer: Nguồn phát sinh sự kiện (Event source) và Bộ lắng nghe (Listener).
