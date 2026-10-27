---
title: "Chapter 15 - Work on Your Swing: using swing"
date: 2026-10-28
description: "Quản lý bố cục giao diện trong Java với Layout Managers: BorderLayout, FlowLayout, BoxLayout và các thành phần giao diện Swing phổ biến."
order: 15
tags:
  - java
  - swing
  - layout-managers
  - gui
---

## Table of Contents
1. [Khái niệm Layout Managers: Ai quyết định vị trí thành phần?](#layout-managers)
2. [Bộ ba Layout Managers kinh điển](#the-big-three)
   - [BorderLayout (Bắc, Nam, Đông, Tây, Trung tâm)](#border-layout)
   - [FlowLayout (Dòng chảy linh hoạt)](#flow-layout)
   - [BoxLayout (Cột hoặc hàng thẳng đứng)](#box-layout)
3. [Tóm tắt ghi nhớ cốt lõi (Key Takeaways)](#key-takeaways)

---

## Bộ ba Layout Managers kinh điển {#the-big-three}

- **`BorderLayout`** (Mặc định của `JFrame`): Chia thành 5 vùng (`NORTH`, `SOUTH`, `EAST`, `WEST`, `CENTER`).
- **`FlowLayout`** (Mặc định của `JPanel`): Sắp xếp các thành phần từ trái qua phải, hết dòng thì tự xuống dòng.
- **`BoxLayout`**: Sắp xếp các thành phần theo hàng ngang hoặc cột dọc cố định.

```java
frame.getContentPane().add(BorderLayout.NORTH, label);
frame.getContentPane().add(BorderLayout.CENTER, textArea);
frame.getContentPane().add(BorderLayout.SOUTH, button);
```

---

## Tóm tắt ghi nhớ cốt lõi (Key Takeaways) {#key-takeaways}

- Layout Manager kiểm soát kích thước và vị trí của các component trên giao diện.
- `BorderLayout` chia 5 vùng, `FlowLayout` chảy theo dòng, `BoxLayout` xếp theo hàng hoặc cột.
