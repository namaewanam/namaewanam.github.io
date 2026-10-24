---
title: Chapter 1 - Introduction And Review
date: 2026-10-21
description: Giới thiệu và review lại kiến thức cơ bản về kiến trúc database.
order: 2
---

## Table of Contents
1. [Kiến trúc cơ bản của DBMS](#dbms-architecture)
2. [Memory vs Disk Based DBMS](#memories-vs-disk-based-dbms)
3. [Column vs Row Oriented DBMS](#column-vs-row-oriented-dbms)
4. [Data Files và Index Files](#data-files-and-index-files)
5. [Buffering, Immutability, and Ordering](#buffering-immutability-and-ordering)

---

Phần này sẽ tập trung vào các định nghĩa cơ bản, high-level trong database như: database tổ chức theo **dòng** hay **cột**, **clustered**, **nonclustered indexes**, **index-organized tables**, lưu trữ theo key-value, document, graph, etc.

Các dạng database phổ biến hiện nay:

- **Theo use case**:
    - **Online Transaction Processing (OLTP)**: được thiết kế cho các ứng dụng **hướng transaction**, có thể xử lý lượng **lớn** yêu cầu và **transaction** **real-time**. Các query thường được định, cố định nghĩa trước và diễn ra **nhanh chóng**. Ví dụ: PostgreSQL, MySQL, MariaDB, Oracle Database, Microsoft SQL Server, MongoDB, Redis, Cassandra, etc.
    - **Online Analytical Processing (OLAP)**: được thiết kế cho các ứng dụng **phân tích dữ liệu**, thường xử lý lượng **lớn** dữ liệu và thực hiện các **truy vấn phức tạp** về lịch sử, thống kê. Các query thường được xây dựng động và có thể **mất nhiều thời gian** để thực hiện. Ví dụ: Amazon Redshift, Google BigQuery, Snowflake, Apache Hive, Apache Druid, ClickHouse, etc.
    - **Hybrid Transactional/Analytical Processing (HTAP)**: **kết hợp** cả hai loại trên, cho phép xử lý transaction và phân tích dữ liệu trong cùng một hệ thống. Ví dụ: TiDB, MemSQL (SingleStore), YugabyteDB, CockroachDB, etc.

- **Theo cách lưu trữ**:
    - **Disk-based DBMS**: dữ liệu được lưu trữ trên ổ đĩa, có thể là HDD hoặc SSD. Các hệ thống này thường có khả năng lưu trữ lớn và chi phí thấp hơn so với memory-based DBMS. Ví dụ: MySQL, PostgreSQL, Oracle Database, Microsoft SQL Server, MongoDB, Cassandra, etc.
    - **Memory-based DBMS**: dữ liệu được lưu trữ chủ yếu trong bộ nhớ RAM, giúp truy cập dữ liệu nhanh hơn nhiều so với disk-based DBMS. Tuy nhiên, chi phí cao hơn và dung lượng lưu trữ hạn chế hơn. Ví dụ: Redis, Memcached, etc.

- **Theo cách tổ chức**:
    - **Row-oriented DBMS**: dữ liệu được lưu trữ theo từng dòng, phù hợp cho các ứng dụng OLTP. Ví dụ: MySQL, PostgreSQL, Oracle Database, Microsoft SQL Server, etc.
    - **Column-oriented DBMS**: dữ liệu được lưu trữ theo từng cột, phù hợp cho các ứng dụng OLAP. Ví dụ: Amazon Redshift, Google BigQuery, Snowflake, Apache Hive, Apache Druid, ClickHouse, etc.

## Kiến trúc cơ bản của DBMS {#dbms-architecture}

![Kiến trúc cơ bản của DBMS](./images/dbms-architecture.png "Kiến trúc cơ bản của DBMS")
*Hình 1.1: Kiến trúc tổng quan các tầng của một DBMS (Transport, Query Processor, Execution Engine, Storage Engine)*

Life cycle của một query trong DBMS: Client request -> Transport subsystem -> Query processor -> Execution Engine -> Storage engine -> Execution engine -> Transport subsystem -> Client response

## Memory vs Disk Based DBMS {#memories-vs-disk-based-dbms}


