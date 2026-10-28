---
title: Database Internals Book Notes
description: Chuỗi ghi chú chuyên sâu về kiến trúc bên trong của hệ quản trị cơ sở dữ liệu (Storage Engines & Distributed Data Systems) từ cuốn sách Database Internals của Alex Petrov.
startHere: database-internals-part1
nextRecommended: database-internals-chapter1
difficulty: Intermediate
prerequisites:
  - Nắm vững SQL cơ bản, cấu trúc dữ liệu (Tree, Hash Table, Linked List)
  - Hiểu khái niệm cơ bản về hệ điều hành (RAM, Disk I/O, Page Cache, Thread/Lock)
youWillUnderstand:
  - Kiến trúc nội tại của Storage Engine: B-Tree, B+Tree, Copy-on-Write B-Tree, Bw-Tree và LSM-Tree (RocksDB, Cassandra)
  - Cấu trúc Slotted Page, Binary Encoding, Buffer Pool (LRU/2Q/Clock), Write-Ahead Log (WAL) và thuật toán phục hồi ARIES
  - Cơ chế kiểm soát đồng thời (2PL, MVCC, Snapshot Isolation, SSI) và phân biệt Lock vs Latch
  - Nguyên lý hệ thống phân tán: FLP Impossibility, Phi-Accrual Failure Detector, SWIM Gossip, Split-Brain & Fencing Tokens
  - Mô hình nhất quán (Linearizability, Quorum R+W>N), Merkle Tree Anti-Entropy, Distributed Transactions (2PC, Spanner TrueTime, Calvin, Percolator) và thuật toán đồng thuận (Paxos, Multi-Paxos, Raft)
useItFor:
  - Hiểu bản chất bên dưới khi thiết kế schema, chọn primary key (UUIDv4 vs UUIDv7/Auto-increment) và tối ưu hóa I/O
  - Lựa chọn đúng loại Database / Storage Engine (B-Tree vs LSM-Tree, CP vs AP) cho bài toán thực tế
  - Nắm vững nền tảng cốt lõi về Database Internals và Distributed Systems cho vị trí Backend / Data / System Engineer
---

Series này tổng hợp các ghi chú, sơ đồ kiến trúc và ví dụ minh họa cụ thể khi đọc cuốn sách **Database Internals: A Deep Dive into How Distributed Data Systems Work** của tác giả **Alex Petrov** (O'Reilly).

### Cấu trúc của sách và Series

Cuốn sách chia làm 2 phần lớn (14 chương), đi từ cách một node lưu trữ từng byte trên đĩa cứng cho đến cách hàng trăm node phối hợp với nhau trong cụm phân tán:

- **Part I — Storage Engines (Chương 1 đến Chương 7)**: Giải phẫu cách database tổ chức file vật lý trên đĩa (`Slotted Page`), quản lý bộ nhớ đệm (`Buffer Pool`), đảm bảo tính toàn vẹn qua `WAL` / `ARIES`, và so sánh hai trường phái cấu trúc dữ liệu lớn: **B-Tree** (tối ưu đọc, cập nhật tại chỗ) và **LSM-Tree** (tối ưu ghi tuần tự, bất biến).
- **Part II — Distributed Systems (Chương 8 đến Chương 14)**: Giải quyết bài toán khi dữ liệu vượt quá khả năng của một máy đơn lẻ: phát hiện lỗi (`Failure Detection`), bầu chọn Leader (`Leader Election`), sao chép dữ liệu (`Replication & Quorum`), đồng bộ ngầm (`Anti-Entropy & Merkle Tree`), giao dịch phân tán (`2PC`, `Spanner`, `Calvin`) và thuật toán đồng thuận (`Paxos`, `Raft`).

---

### Danh sách bài viết trong Series

#### Phần I: Storage Engines
0. **[Part 1 - Tổng quan về Storage Engines](./database-internals-part1)**
1. **[Chapter 1 - Introduction and Overview: Phân loại DBMS, Row vs Column, Data & Index Files](./database-internals-chapter1)**
2. **[Chapter 2 - B-Tree Basics: Tại sao B+Tree thống trị Disk Storage, Fanout, Split & Merge](./database-internals-chapter2)**
3. **[Chapter 3 - File Formats: Binary Encoding, Slotted Pages, Cell Layout & Overflow Pages](./database-internals-chapter3)**
4. **[Chapter 4 - Implementing B-Trees: Indirection Vector, Breadcrumbs, Right-Only Appends & Compression](./database-internals-chapter4)**
5. **[Chapter 5 - Transaction Processing and Recovery: Buffer Pool, WAL (Steal/No-Force), ARIES & MVCC](./database-internals-chapter5)**
6. **[Chapter 6 - B-Tree Variants: Copy-on-Write (LMDB), Lazy B-Trees (WiredTiger), FD-Tree & Latch-Free Bw-Tree](./database-internals-chapter6)**
7. **[Chapter 7 - Log-Structured Storage: LSM-Tree, Memtable, SSTable, Compaction & Bloom Filters](./database-internals-chapter7)**

#### Phần II: Distributed Systems
8. **[Chapter 8 - Introduction to Distributed Systems: Two Generals, FLP Impossibility, Failure Models & Clocks](./database-internals-chapter8)**
9. **[Chapter 9 - Failure Detection: Heartbeats, Phi-Accrual Detector & SWIM Gossip Protocol](./database-internals-chapter9)**
10. **[Chapter 10 - Leader Election: Bully, Ring, Split-Brain & Fencing Tokens](./database-internals-chapter10)**
11. **[Chapter 11 - Replication and Consistency: CAP/PACELC, Linearizability, Quorum (R+W>N) & CRDTs](./database-internals-chapter11)**
12. **[Chapter 12 - Anti-Entropy and Dissemination: Read Repair, Hinted Handoff, Merkle Trees & Plumtree Gossip](./database-internals-chapter12)**
13. **[Chapter 13 - Distributed Transactions: 2PC, 3PC, Spanner TrueTime, Calvin & Percolator](./database-internals-chapter13)**
14. **[Chapter 14 - Consensus: Total Order Broadcast, Paxos, Multi-Paxos, Raft & ZAB](./database-internals-chapter14)**
