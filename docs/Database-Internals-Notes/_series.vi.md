---
title: Database Internals Book Notes
description: Note series for the Database Internals book.
startHere: database-internals-part1
nextRecommended: database-internals-chapter1
difficulty: Beginner.
prerequisites:
  - Hiểu cơ bản về database
youWillUnderstand:
  - Database được thiết kế như thế nào
useItFor:
  - Review lại kiến thức về database
---

Series này là các ghi chú của mình khi đọc cuốn sách **Database Internals** của tác giả **Alex Petrov**. Mình sẽ cố gắng tóm tắt những kiến thức quan trọng nhất trong từng chương, đồng thời thêm một số ví dụ minh họa để dễ hình dung hơn.

Lời khuyên: 

1. Nếu bạn chưa đọc cuốn sách này, hãy đọc nó trước khi đọc series này. Series này chỉ là các ghi chú tóm tắt, không thể thay thế cho việc đọc sách.
2. Hệ thống kiến thức kèm thực hành.

Có thể đọc theo flow của series, bắt đầu từ chương 1 đến chương cuối cùng. Mỗi chương sẽ có một bài viết riêng.
- Part 1 (từ chương 1 đến chương 7) nói về Storage Engines về cách tổ chức dữ liệu trong database
- Part 2 (từ chương 8 đến chương 14) sẽ nói về database vận hành như thế nào tỏng hệ thống phân tán (distributed systems)
