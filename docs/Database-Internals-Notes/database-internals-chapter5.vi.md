---
title: "Chapter 5 - Transaction Processing and Recovery"
date: 2026-10-28
description: "Quản lý bộ nhớ đệm Buffer Pool, các thuật toán thay thế trang (LRU, 2Q, CLOCK), khôi phục sự cố với WAL & ARIES, kiểm soát đồng thời (2PL, MVCC, SSI) và phân biệt Lock vs Latch."
order: 6
tags: ["database-internals", "transactions", "mvcc", "wal", "aries", "locks"]
---

## Table of Contents
1. [Quản lý Buffer Pool và Page Cache](#buffer-management)
2. [Các thuật toán thay thế trang (Cache Eviction Policies)](#cache-eviction-policies)
3. [Khôi phục sự cố (Recovery) và Write-Ahead Log (WAL)](#wal-and-recovery)
4. [Thuật toán khôi phục ARIES (3 giai đoạn)](#aries-recovery)
5. [Kiểm soát đồng thời (Concurrency Control), MVCC và các dị thường](#concurrency-control)
6. [Phân biệt Lock vs Latch và kỹ thuật Latch Crabbing](#lock-vs-latch)
7. [Tóm tắt & Ghi nhớ cốt lõi (Key Takeaways)](#key-takeaways)

---

Để đảm bảo bộ tính chất **ACID** (`Atomicity`, `Consistency`, `Isolation`, `Durability`) trong khi vẫn đạt thông lượng hàng chục nghìn giao dịch mỗi giây, Storage Engine không thể ghi trực tiếp mọi thay đổi xuống các Page dữ liệu ngẫu nhiên trên đĩa ngay tại thời điểm `COMMIT`. Chương 5 giải quyết ba bài toán trụ cột của một hệ quản trị cơ sở dữ liệu thực thụ:
1. Quản lý bộ nhớ đệm **Buffer Pool** trong RAM như thế nào để một câu truy vấn quét toàn bộ bảng không đuổi sạch các trang chỉ mục nóng ra khỏi bộ nhớ?
2. Làm thế nào để khôi phục trạng thái chính xác tuyệt đối sau sự cố mất điện thông qua **Write-Ahead Log (WAL)** và thuật toán **ARIES** (`Analysis -> Redo -> Undo`)?
3. Làm thế nào để điều phối hàng nghìn luồng đọc/ghi đồng thời thông qua **MVCC**, **SSI**, **Locks** và **Latch Crabbing**?

---

## Quản lý Buffer Pool và Page Cache {#buffer-management}

### Bài toán thực tế & Mental Model

Tại sao các hệ quản trị cơ sở dữ liệu như PostgreSQL, MySQL InnoDB hay Oracle không phó mặc việc quản lý bộ nhớ đệm cho hệ điều hành thông qua `OS Page Cache` và lời gọi hệ thống `mmap()`, mà phải tự cấp phát và quản lý một vùng bộ nhớ RAM riêng gọi là **Buffer Pool**?

Nếu giao toàn quyền cho hệ điều hành (`mmap`):
1. **Vi phạm quy tắc an toàn của Write-Ahead Log (WAL)**: Hệ điều hành có thể tự ý đẩy (flush) một trang bộ nhớ bị sửa đổi xuống đĩa bất cứ lúc nào khi thiếu RAM, **ngay cả trước khi bản ghi nhật ký WAL của trang đó kịp được ghi xuống đĩa**! Nếu mất điện đúng lúc đó, cơ sở dữ liệu không có thông tin Undo trong WAL để hoàn tác trang bẩn và sẽ bị hỏng dữ liệu vĩnh viễn.
2. **Hiện tượng nhân đôi bộ nhớ (`Double Buffering`) và mất kiểm soát Eviction**: Hệ điều hành không hiểu ngữ nghĩa truy vấn SQL (không biết trang nào là Root của B-Tree cần giữ chặt, trang nào chỉ là dữ liệu quét thoáng qua 1 lần). Do đó các DBMS như InnoDB hay Oracle thường mở tệp với cờ `O_DIRECT` để bỏ qua hoàn toàn `OS Page Cache` và tự quản lý `100%` bộ nhớ thông qua **Buffer Pool Manager**.

**Mental Model — "Bàn làm việc có chốt ghim an toàn":**
Hãy hình dung Buffer Pool là một chiếc bàn làm việc có số lượng ô cố định (`Frames`). Muốn đọc hay sửa một trang sách (`Page`) nằm dưới kho đĩa cứng, luồng thực thi (`Worker Thread`) phải nhờ thủ thư (`Buffer Manager`) lấy trang đó đặt lên một ô trên bàn và **cắm một chiếc ghim (`Pin`)** vào trang đó để không ai được phép dẹp nó đi trong lúc luồng đang thao tác.

### Các cơ chế cốt lõi trong Buffer Manager

```text
+-----------------------------------------------------------------------+
| Buffer Pool Frame Descriptor (Metadata cho mỗi khung trang trong RAM) |
| - page_id (4-8B)    : Định danh Page đang nạp trong khung (ví dụ P10) |
| - pin_count (4B)    : Số luồng đang đọc/ghi trang này (Pin > 0: Cấm đuổi)|
| - is_dirty (1 bit)  : Trang đã bị sửa trong RAM nhưng chưa ghi đĩa?   |
| - usage_count / LRU : Biến đếm tần suất hoặc con trỏ danh sách Eviction|
| - rw_latch          : Khóa nội bộ bảo vệ nội dung vật lý của Frame    |
+-----------------------------------------------------------------------+
```

- **Pinning / Unpinning (`pin_count` / `ref_count`)**: Khi một luồng cần đọc hoặc sửa một Page trong Buffer Pool, nó tăng biến đếm tham chiếu `pin_count` của khung nhớ đó (**Pin**). Bất kỳ Page nào có `pin_count > 0` đều bị khóa chặt tại chỗ trong RAM và **tuyệt đối không được phép bị trục xuất (`evict`)** ra khỏi bộ nhớ đệm. Khi thao tác hoàn tất, luồng giảm `pin_count` (**Unpin**). Chỉ những trang có `pin_count == 0` mới là ứng viên cho thuật toán thay thế trang.
- **Dirty Page**: Một Page đã bị sửa đổi trong RAM nhưng nội dung mới chưa được đồng bộ xuống tệp dữ liệu trên đĩa sẽ được gắn cờ `is_dirty = true`.
- **Flush vs Force**:
  - **Flush**: Hành động ghi các Dirty Page từ Buffer Pool xuống đĩa để thu hồi khung nhớ hoặc tạo điểm kiểm tra (**Checkpoint**), thường do tiến trình nền (`Checkpointer` / `Page Cleaner`) thực hiện bất đồng bộ.
  - **Force**: Hành động bắt buộc phải đẩy đồng bộ toàn bộ các Dirty Page của một giao dịch xuống tệp dữ liệu trên đĩa ngay tại thời điểm giao dịch đó gọi `COMMIT`.

---

## Các thuật toán thay thế trang (Cache Eviction Policies) {#cache-eviction-policies}

### Bài toán thực tế & Mental Model

Khi toàn bộ các khung nhớ trong Buffer Pool đã đầy và một câu truy vấn cần nạp thêm một Page mới từ đĩa lên, Buffer Manager phải chọn một trang hiện có (đang có `pin_count == 0`) để trục xuất khỏi RAM.

![Minh họa hoạt động của thuật toán thay thế trang LRU (Least Recently Used) trong bộ nhớ đệm](./images/lru-cache-eviction.png)

Thuật toán phổ biến trong sách giáo khoa là **Pure LRU (Least Recently Used)**: duy trì một danh sách liên kết đôi, mỗi khi một trang được chạm tới thì đưa nó lên đầu danh sách (`MRU - Most Recently Used`) và khi thiếu chỗ thì đuổi trang ở cuối danh sách (`LRU`). Tuy nhiên, áp dụng Pure LRU vào cơ sở dữ liệu sẽ gây ra **thảm họa ô nhiễm bộ nhớ đệm (`Sequential Scan Cache Pollution`)**:

**Mental Model — "Đoàn khách du lịch vãng lai đuổi sạch khách quen VIP":**
Hãy tưởng tượng một quán cà phê có `4` chiếc ghế (`Buffer Pool = 4 frames`). Có `2` vị khách VIP (`Page H1`, `Page H2` — chính là các nút `Root` và `Internal` của B-Tree) ngày nào cũng vào uống hàng trăm lần. Đột nhiên có một đoàn khách du lịch vãng lai gồm `4` người (`Page S1, S2, S3, S4` từ một câu truy vấn báo cáo chạy `SELECT * FROM logs` quét tuần tự qua bảng) ghé vào đúng `1` lần rồi đi mãi mãi.
- Với **Pure LRU**: Ai mới bước vào cửa đều được xếp lên ghế đầu! Kết quả là `4` người khách vãng lai `S1..S4` lần lượt đẩy cả `H1` và `H2` ra khỏi quán! Ngay giây tiếp theo khi khách VIP `H1`, `H2` quay lại, quán phải tốn công đi đón lại từ đầu (đọc đĩa).
- Với **Midpoint Insertion (InnoDB)** hoặc **Clock-Sweep (PostgreSQL)**: Quán chia làm **Phòng VIP (`Young`)** và **Ghế chờ ngoài hiên (`Old`)**. Khách mới bước vào lần đầu (`S1..S4`) chỉ được ngồi ở ghế chờ ngoài hiên rồi tự thay phiên nhau rời đi; chỉ ai quay lại từ **lần thứ `2` trở lên** mới được bước vào Phòng VIP!

### Ví dụ chạy tay (Dry Run): Đối chiếu Pure LRU vs InnoDB Midpoint vs PostgreSQL Clock-Sweep

Giả sử **Buffer Pool có đúng `4` khung nhớ (`4 Frames`)**.
- Hai trang chỉ mục nóng **`H1`**, **`H2`** được truy cập lặp đi lặp lại.
- Xen vào giữa là một câu truy vấn chạy `Seq Scan` đọc lướt qua `4` trang dữ liệu **`S1`, `S2`, `S3`, `S4`** (mỗi trang chỉ đọc đúng `1` lần).
- Chuỗi truy cập trang theo thời gian:
  $$H_1 \to H_2 \to H_1 \to H_2 \to S_1 \to S_2 \to S_3 \to S_4 \to H_1 \to H_2$$

Hãy theo dõi trạng thái RAM của `3` thuật toán qua từng bước:

#### 1. Pure LRU (Đưa mọi trang mới lên đầu danh sách `MRU -> LRU`)
- **Sau chuỗi khởi động `H1 -> H2 -> H1 -> H2`**: Hai trang nóng nằm ở đầu danh sách: `[H2, H1, trống, trống]`.
- **Khi `Seq Scan` quét qua `S1 -> S2 -> S3 -> S4`**:
  - Đọc `S1`: `[S1, H2, H1, trống]`
  - Đọc `S2`: `[S2, S1, H2, H1]` *(Đầy 4 khung)*
  - Đọc `S3`: Trục xuất `H1` ở cuối! RAM còn: `[S3, S2, S1, H2]`
  - Đọc `S4`: Trục xuất nốt `H2` ở cuối! RAM còn: **`[S4, S3, S2, S1]`**
- **Khi truy cập lại `H1 -> H2`**: Cả `H1` và `H2` đều đã bị đuổi khỏi RAM! Xảy ra **`2` lần Cache Miss liên tiếp** — bộ nhớ đệm bị ô nhiễm `100%` bởi các trang chỉ đọc một lần!

#### 2. InnoDB Midpoint Insertion / 2Q (`Young Sublist = 2 frames` | `Old Sublist = 2 frames`)
Quy tắc: Trang mới nạp từ đĩa lần đầu **không được vào đầu `Young`** mà chỉ được chèn vào điểm giữa (**Midpoint** — đầu vùng `Old`). Chỉ khi một trang đang nằm sẵn trong cache mà được truy cập lặp lại đủ lâu thì mới được thăng hạng lên vùng `Young`:
- **Sau chuỗi khởi động `H1 -> H2 -> H1 -> H2`**: Vì `H1` và `H2` được truy cập lặp lại lần thứ `2`, cả hai được thăng hạng lên vùng `Young`:
  - `Young (VIP) = [H2, H1]` | `Old (Vãng lai) = [trống, trống]`.
- **Khi `Seq Scan` quét qua `S1 -> S2 -> S3 -> S4`** (mọi trang mới đều chèn vào đầu vùng `Old` và đẩy đuôi vùng `Old` ra ngoài):
  - Đọc `S1`: `Young = [H2, H1]` | `Old = [S1, trống]`
  - Đọc `S2`: `Young = [H2, H1]` | `Old = [S2, S1]`
  - Đọc `S3`: Đuổi `S1` ở cuối vùng `Old`! `Young = [H2, H1]` | `Old = [S3, S2]`
  - Đọc `S4`: Đuổi `S2` ở cuối vùng `Old`! **`Young = [H2, H1]` | `Old = [S4, S3]`**
- **Khi truy cập lại `H1 -> H2`**: Cả `H1` và `H2` vẫn nằm nguyên vẹn trong vùng `Young`! Đạt **`100% Cache Hit`** cho các trang nóng!

#### 3. PostgreSQL Clock-Sweep (`4` khung xếp vòng tròn `F0..F3` kèm biến đếm `usage_count`)
Quy tắc: Mỗi lần đọc trúng trang chỉ cần cộng `usage_count += 1` (tối đa là `5`) bằng lệnh nguyên tử mà không cần sửa danh sách liên kết. Khi cần trục xuất, kim đồng hồ (`clock_hand`) quét qua từng khung: nếu `usage_count > 0` thì giảm đi `1` và đi tiếp; nếu gặp khung có `usage_count == 0` thì thay thế trang đó!
- **Sau `H1 -> H2 -> H1 -> H2`**:
  - `F0: H1 (usage = 2)`, `F1: H2 (usage = 2)`, `F2: trống`, `F3: trống`.
- **Đọc `S1`, `S2`** vào `F2`, `F3` (trang mới từ `Seq Scan` sử dụng Ring Buffer hoặc khởi tạo `usage = 1`):
  - `F0: H1(2)`, `F1: H2(2)`, `F2: S1(1)`, `F3: S2(1)`. Kim đồng hồ đang ở `F0`.
- **Đọc `S3`** (Cần tìm 1 khung có `usage == 0`):
  - Kim quét vòng 1 qua `F0..F3`, giảm mỗi khung đi `1`: `F0: H1(1)`, `F1: H2(1)`, `F2: S1(0)`, `F3: S2(0)`.
  - Kim quét tiếp: qua `F0: H1(1 -> 0)`, qua `F1: H2(1 -> 0)`, đến **`F2: S1` thấy `usage == 0` $\implies$ Trục xuất `S1` để nạp `S3(1)`!**
- Nhờ có `usage_count` tích lũy cao hơn từ các lần đọc trước, các trang nóng `H1`, `H2` sống sót qua đợt quét của kim đồng hồ mà không cần bất kỳ khóa Mutex trung tâm nào trên danh sách liên kết!

### Bảng tổng hợp các thuật toán Eviction trong DBMS thực tế

| Thuật toán | Cơ chế hoạt động cốt lõi | Khả năng chống Cache Pollution | Đồng bộ hóa đa luồng | Hệ thống sử dụng |
| :--- | :--- | :--- | :--- | :--- |
| **Pure LRU** | Danh sách liên kết đôi đơn lẻ; mỗi lần chạm đều đẩy trang lên đầu `MRU`. | **Kém**: Bị `Full Table Scan` cuốn trôi toàn bộ trang nóng. | **Nghẽn cổ chai**: Mọi luồng đọc đều phải khóa Mutex để sửa con trỏ danh sách. | Ít dùng nguyên bản trong DBMS hiện đại. |
| **2Q / Midpoint Insertion** | Chia danh sách thành vùng `Young` (`5/8`) và vùng `Old` (`3/8`); trang mới nạp vào điểm giữa **Midpoint** và phải đợi đủ `innodb_old_blocks_time` (mặc định `1000ms`) mới được lên `Young`. | **Rất tốt**: Các trang quét tuần tự chỉ đi qua vùng `Old` rồi bị đuổi ngay. | Cần khóa trên cấu trúc danh sách (được giảm thiểu bằng nhiều Buffer Pool Instances). | **MySQL InnoDB**, **Oracle Database** (Touch-Count Midpoint). |
| **LRU-K (`LRU-2`)** | Lưu lịch sử thời điểm của `K` lần truy cập gần nhất; trục xuất trang có khoảng thời gian kể từ lần truy cập thứ `K` trước đó xa nhất (**Backward K-distance**). | **Rất tốt**: Trang chỉ mới đọc `1` lần có `2-distance = ∞` nên bị ưu tiên trục xuất trước tiên. | Phức tạp hơn do phải cập nhật cấu trúc hàng đợi ưu tiên. | **Microsoft SQL Server**, các hệ thống phân tích. |
| **Clock-Sweep (Second-Chance)** | Xếp các khung thành vòng tròn với kim đồng hồ `clock_hand` và biến đếm `usage_count` (`0..5`). Kết hợp thêm ** Buffer Ring (`256 KB`)** riêng cho các lệnh `Seq Scan` lớn để tự ghi đè lên chính nó. | **Xuất sắc**: Vừa bảo vệ trang có `usage_count` cao, vừa nhốt `Seq Scan` trong Ring Buffer nhỏ. | **Lock-free khi đọc trúng (`Cache Hit`)**: Chỉ dùng lệnh nguyên tử `atomic_fetch_add` trên `usage_count`. | **PostgreSQL** (`src/backend/storage/buffer/freelist.c`). |

---

## Khôi phục sự cố (Recovery) và Write-Ahead Log (WAL) {#wal-and-recovery}

### Bài toán thực tế & Mental Model

Khi một giao dịch thực hiện sửa đổi dữ liệu trên `5` trang B-Tree nằm rải rác trên đĩa và gọi `COMMIT`, hệ thống đứng trước một mâu thuẫn gay gắt giữa **Hiệu năng (Performance)** và **Độ bền vững/Nguyên tử (Durability & Atomicity)**:
1. Nếu bắt buộc phải ghi đè cả `5` trang dữ liệu (`5 x 16 KB = 80 KB`) xuống `5` vị trí ngẫu nhiên trên đĩa trước khi báo `COMMIT` thành công: tốc độ giao dịch sẽ bị trói chặt vào tốc độ `Random Write I/O` chậm chạp của ổ cứng. Hơn nữa, nếu mới ghi xong `3` trang thì sập nguồn, `2` trang còn lại bị mất sẽ để lại cơ sở dữ liệu trong trạng thái vỡ vụn!
2. Ngược lại, nếu giữ các trang sửa đổi trong RAM để ghi xuống đĩa sau, làm sao đảm bảo khi mất điện dữ liệu đã `COMMIT` không bị bay mất?

**Mental Model — "Sổ nhật ký giao dịch ghi nối tiếp (Write-Ahead Log)":**
Thay vì chạy đi sửa ngay `5` cuốn sổ cái lớn nằm ở `5` kho khác nhau mỗi khi có giao dịch, kế toán trưởng chỉ cần **ghi nối tiếp một dòng chữ ngắn gọn vào cuối cuốn sổ nhật ký đặt ngay trước mặt (`WAL File` — Sequential Append)** và đóng dấu `COMMIT`. Cuốn sổ nhật ký này được đồng bộ xuống đĩa cực nhanh vì đầu đọc/ghi chỉ đi thẳng một mạch. Sau đó, vào lúc rảnh rỗi, nhân viên mới đem nội dung từ sổ nhật ký đi cập nhật dần vào các cuốn sổ cái ở kho (`Buffer Pool Flush`). Nếu mất điện bất ngờ, khi mở cửa lại chỉ cần đọc lại cuốn sổ nhật ký để làm nốt việc đã chốt (`Redo`) và gạch bỏ việc đang viết dở (`Undo`)!

### 1. Ma trận chính sách STEAL / NO-STEAL và FORCE / NO-FORCE

Theo phân loại kinh điển của *Haerder & Reuter (1983)*, mọi cơ chế quản lý bộ nhớ đệm và khôi phục sự cố đều được định hình bởi hai quyết định thiết kế độc lập:

| Chính sách | Định nghĩa kỹ thuật | Tác động đến Hiệu năng RAM & I/O | Yêu cầu khi Khôi phục (Recovery) |
| :--- | :--- | :--- | :--- |
| **`NO-STEAL`** | **Cấm** Buffer Pool đẩy một Dirty Page chứa thay đổi của giao dịch **chưa `COMMIT`** xuống đĩa. | **Kém (Giới hạn RAM)**: Nếu một giao dịch chạy `UPDATE` `10 GB` dữ liệu trên máy có `4 GB` RAM, Buffer Pool không được phép đẩy trang bẩn xuống đĩa nên sẽ bị treo cứng vì hết bộ nhớ (`Out of Memory`)! | **Không cần `UNDO`** trên đĩa vì dữ liệu chưa commit chưa bao giờ chạm xuống đĩa. |
| **`STEAL`** | **Cho phép** Buffer Pool lấy khung nhớ của Dirty Page chưa `COMMIT` đẩy xuống đĩa bất cứ lúc nào khi thiếu RAM. | **Tối ưu RAM**: Giao dịch có thể sửa đổi lượng dữ liệu lớn tùy ý vượt xa dung lượng RAM. | **Bắt buộc phải có `UNDO`**: Vì đĩa cứng có thể chứa dữ liệu của giao dịch chưa xong, khi sập nguồn phải hoàn tác (`Undo`) các thay đổi đó về giá trị cũ (**Before-Image**). |
| **`FORCE`** | Khi giao dịch gọi `COMMIT`, **bắt buộc** phải đẩy (`fsync`) toàn bộ các Dirty Page của giao dịch đó xuống đĩa ngay lập tức. | **Rất chậm (`Random Write I/O`)**: Mỗi lần `COMMIT` gây ra hàng loạt thao tác ghi trang ngẫu nhiên xuống đĩa; trang nóng bị ghi đi ghi lại hàng nghìn lần. | **Không cần `REDO`** vì mọi giao dịch đã commit chắc chắn `100%` đã nằm yên trên các trang dữ liệu ở đĩa. |
| **`NO-FORCE`** | Khi gọi `COMMIT`, **chỉ cần `fsync` bản ghi WAL tuần tự**, còn các Dirty Page được phép nằm lại trong RAM và đẩy xuống đĩa muộn hơn ở chế độ nền. | **Cực nhanh (`Sequential Write I/O`)**: Biến mọi thao tác `COMMIT` thành ghi tuần tự vài chục byte vào cuối tệp WAL; gộp nhiều lần sửa trên cùng một trang thành `1` lần ghi đĩa duy nhất. | **Bắt buộc phải có `REDO`**: Vì trang dữ liệu của giao dịch đã commit có thể vẫn đang nằm trong RAM lúc mất điện, khi khởi động lại phải tái tạo (**After-Image**) từ tệp WAL. |

> [!IMPORTANT]
> **Lựa chọn chuẩn mực của các DBMS hiện đại (`STEAL` + `NO-FORCE`):**
> Hầu hết các hệ quản trị cơ sở dữ liệu công nghiệp (PostgreSQL, MySQL InnoDB, Oracle, SQL Server, Db2) đều chọn tổ hợp **`STEAL + NO-FORCE`** để đạt hiệu năng runtime cao nhất, và sử dụng thuật toán **ARIES** kết hợp **Write-Ahead Log (WAL)** để đảm nhận cả hai nhiệm vụ **`UNDO`** (cho `STEAL`) lẫn **`REDO`** (cho `NO-FORCE`).

### 2. Quy tắc vàng của Write-Ahead Log (WAL Protocol)

Mỗi bản ghi nhật ký trong tệp WAL được gắn một địa chỉ byte tăng dần đơn điệu gọi là **LSN (`Log Sequence Number`)**. Đồng thời, ở phần Header của mỗi Page dữ liệu (trên đĩa cũng như trong RAM) đều lưu một trường **`pageLSN`** ghi nhận `LSN` của bản ghi WAL mới nhất đã sửa đổi trang đó. Hệ thống theo dõi biến toàn cục **`flushedLSN`** là vị trí `LSN` cao nhất trong tệp WAL đã được đồng bộ (`fsync`) an toàn xuống đĩa cứng.

Giao thức **Write-Ahead Logging** bắt buộc tuân thủ nghiêm ngặt `2` bất biến:
1. **Quy tắc bảo vệ `UNDO` (Write-Ahead Rule trước khi Flush Dirty Page)**:
   Trước khi một Dirty Page $P$ trong Buffer Pool được phép ghi xuống đĩa (do `STEAL` hoặc `Checkpoint`), bản ghi WAL sửa đổi trang đó bắt buộc phải nằm trên đĩa trước:
   $$\text{flushedLSN} \ge P.\text{pageLSN}$$
   *(Nếu chưa thỏa mãn, Buffer Manager phải chờ tiến trình Log Writer đẩy tệp WAL xuống đĩa tới mốc $P.\text{pageLSN}$ trước rồi mới được ghi trang $P$).*
2. **Quy tắc bảo vệ `REDO` (Commit Rule trước khi trả kết quả cho Client)**:
   Một giao dịch $T$ chỉ được phép thông báo `COMMIT` thành công cho ứng dụng sau khi bản ghi `COMMIT` của $T$ (cùng toàn bộ các bản ghi WAL trước đó của $T$) đã được `fsync` xuống đĩa:
   $$\text{flushedLSN} \ge T.\text{commitLSN}$$

---

## Thuật toán khôi phục ARIES (3 giai đoạn) {#aries-recovery}

### Bài toán thực tế & Mental Model

Khi máy chủ sử dụng chính sách **`STEAL + NO-FORCE`** bị rút dây nguồn đột ngột, tệp dữ liệu trên đĩa rơi vào trạng thái "nửa nạc nửa mỡ":
- Có những giao dịch **đã `COMMIT`** thành công với người dùng, nhưng các trang dữ liệu của chúng vẫn còn nằm trong RAM lúc mất điện nên **chưa có trên đĩa** (thiếu dữ liệu $\implies$ cần `Redo`).
- Ngược lại, có những giao dịch **đang chạy dở dang (`Uncommitted`)** lúc mất điện, nhưng một vài Dirty Page của chúng đã bị Buffer Pool đẩy xuống đĩa từ trước do thiếu RAM (thừa dữ liệu rác $\implies$ cần `Undo`).
- Khó khăn hơn nữa: nếu đang trong quá trình khôi phục (`Undo`) mà máy chủ lại mất điện lần thứ hai thì sao?

Thuật toán **ARIES (*Algorithms for Recovery and Isolation Exploiting Semantics*, do C. Mohan và cộng sự tại IBM phát minh năm 1992)** giải quyết trọn vẹn bài toán này bằng ba nguyên lý thiết kế thiên tài:
1. **Write-Ahead Logging với `pageLSN`**: Dùng `pageLSN` trên mỗi trang làm "dấu mốc thời gian" để biết chính xác bản ghi WAL nào đã có trên trang đĩa và bản ghi nào chưa.
2. **Repeating History during Redo (Tái hiện toàn bộ lịch sử trong pha Redo)**: Thay vì chỉ Redo các giao dịch đã commit, ARIES **Redo lại TẤT CẢ mọi bản ghi trong WAL** (kể cả của các giao dịch chưa commit!) để đưa toàn bộ cơ sở dữ liệu về **đúng trạng thái bộ nhớ RAM ngay tại tích tắc trước khi mất điện**. Chỉ sau khi đã dựng lại nguyên trạng hiện trường lúc sập nguồn, hệ thống mới bắt đầu hoàn tác (`Undo`) các giao dịch dở dang!
3. **Logging Changes during Undo with `CLR` (`Compensation Log Record`)**: Khi hoàn tác (`Undo`) một bước của giao dịch bị hủy, ARIES không xóa bản ghi WAL cũ mà **ghi thêm một bản ghi nhật ký mới gọi là `CLR`** có chứa con trỏ **`UndoNextLSN`** chỉ thẳng tới bước cần Undo tiếp theo. Nhờ vậy, nếu sập nguồn lần 2 giữa chừng, hệ thống không bao giờ phải Undo lại những bước đã Undo xong!

```mermaid
flowchart LR
    subgraph WALTimeline["Trục thời gian tệp WAL trên đĩa khi khởi động lại sau sự cố"]
        direction LR
        RecLSN["Smallest recLSN (LSN=10)<br/>(Điểm bắt đầu quét Redo)"] --> Checkpoint["Fuzzy Checkpoint (LSN=30)<br/>(Điểm bắt đầu quét Analysis)"]
        Checkpoint --> Crash["Thời điểm Crash (LSN=70)<br/>(Cuối tệp WAL)"]
    end

    Analysis["<b>1. Analysis Phase</b><br/>Quét xuôi từ Checkpoint đến Crash<br/>Xác định giao dịch sống (ATT) & trang bẩn (DPT)"]
    Redo["<b>2. Redo Phase (Repeating History)</b><br/>Quét xuôi từ Smallest recLSN đến Crash<br/>Tái tạo lại toàn bộ lịch sử (kể cả giao dịch sẽ Rollback!)"]
    Undo["<b>3. Undo Phase</b><br/>Quét ngược theo chuỗi prevLSN<br/>Hoàn tác các giao dịch Loser & ghi bản ghi CLR"]

    Analysis --> Redo --> Undo
```

### Cấu trúc các bảng trạng thái của ARIES

Trong quá trình chạy bình thường (và được ghi vào **Fuzzy Checkpoint**) cũng như trong quá trình khôi phục, ARIES duy trì một cấu trúc bản ghi WAL liên kết ngược theo từng giao dịch (`prevLSN`) và hai bảng trạng thái trung tâm trong bộ nhớ:

1. **Cấu trúc mỗi bản ghi WAL**:
   - `LSN`: Địa chỉ thứ tự của bản ghi nhật ký hiện tại.
   - `TransID`: Mã giao dịch thực hiện (`T1`, `T2`...).
   - `prevLSN`: **`LSN` của bản ghi WAL liền trước thuộc cùng giao dịch `TransID`** (tạo thành một danh sách liên kết đơn đi ngược về đầu giao dịch để phục vụ pha `Undo`).
   - `PageID`: Trang dữ liệu bị sửa đổi (đối với bản ghi `UPDATE`).
   - `Undo / Redo Info`: Giá trị cũ (`Before-Image`) và giá trị mới (`After-Image`).
2. **ATT (`Active Transaction Table` — Bảng giao dịch đang hoạt động)**:
   - Lưu các giao dịch chưa kết thúc (`Status = Running / Uncommitted`), kèm theo trường **`lastLSN`** (`LSN` mới nhất mà giao dịch đó vừa ghi vào WAL). Khi kết thúc pha Analysis, mọi giao dịch còn nằm trong `ATT` đều là **Loser Transactions** cần phải hoàn tác trong pha Undo.
3. **DPT (`Dirty Page Table` — Bảng trang bẩn)**:
   - Lưu danh sách các `PageID` đang bị bẩn trong Buffer Pool kèm theo trường cực kỳ quan trọng là **`recLSN` (`Recovery LSN`)**: đây là **`LSN` của bản ghi WAL đầu tiên làm bẩn trang đó kể từ lần cuối cùng trang được Flush sạch xuống đĩa**. Nói cách khác, mọi thay đổi trước `recLSN` chắc chắn đã nằm trên đĩa; chỉ những thay đổi từ `recLSN` trở đi mới có nguy cơ chưa được ghi xuống tệp dữ liệu!

---

### Ví dụ chạy tay toàn diện 3 pha của ARIES (`Analysis -> Redo -> Undo`)

Hãy theo dõi một kịch bản sự cố thực tế với các con số cụ thể từ đầu đến cuối.
Giả sử cơ sở dữ liệu có `2` trang dữ liệu **`Page P1`** và **`Page P2`**, cùng `2` giao dịch **`T1`** và **`T2`**:
- Ban đầu trên đĩa cứng:
  - `Page P1` có `A = 100`, `pageLSN = 0`.
  - `Page P2` có `B = 200`, `pageLSN = 0`.
- Dưới đây là bảng nhật ký **WAL trên đĩa** từ `LSN = 10` đến `LSN = 70` trước khi máy chủ bị **MẤT ĐIỆN ĐỘT NGỘT (`CRASH`)** ngay sau `LSN = 70`:

| `LSN` | `prevLSN` | `TransID` | Loại bản ghi & Thao tác | `PageID` | Diễn giải trạng thái vật lý (RAM vs Disk) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`10`** | `0` | **`T1`** | `UPDATE P1: A = 100 -> 150` | **`P1`** | `T1` sửa `P1` trong RAM (`P1` bẩn từ `LSN = 10`, chưa xuống đĩa). |
| **`20`** | `0` | **`T2`** | `UPDATE P2: B = 200 -> 250` | **`P2`** | `T2` sửa `P2` trong RAM (`P2` bẩn từ `LSN = 20`). |
| **`30`** | — | — | **`CHECKPOINT`** | — | Ghi Fuzzy Checkpoint: lúc này cả `T1`, `T2` đang chạy; `P1 (recLSN=10)` và `P2 (recLSN=20)` đều đang bẩn. |
| *(Giữa 30 & 40)* | — | *(OS/BG)* | *(Background Flush `Page P2` xuống đĩa!)* | **`P2`** | Tiến trình nền đẩy **`P2` xuống đĩa** (chính sách `STEAL`!). Trên đĩa lúc này **`P2.pageLSN = 20`** và `P2` được xóa khỏi `DPT` trong RAM. |
| **`40`** | `10` | **`T1`** | `UPDATE P2: B = 250 -> 300` | **`P2`** | `T1` sửa tiếp `P2` trong RAM (làm `P2` bẩn trở lại từ `LSN = 40`, chưa xuống đĩa). |
| **`50`** | `40` | **`T1`** | **`COMMIT`** | — | `T1` hoàn tất và ghi `COMMIT` vào WAL (nhưng `P1` và `P2` mới của `T1` vẫn nằm trong RAM — chính sách `NO-FORCE`!). |
| **`60`** | `50` | **`T1`** | **`END`** | — | Kết thúc vòng đời giao dịch `T1` (xóa `T1` khỏi `ATT`). |
| **`70`** | `20` | **`T2`** | `UPDATE P1: A = 150 -> 999` | **`P1`** | `T2` sửa tiếp `P1` trong RAM (`prevLSN = 20`). |
| ⚡ | — | — | **⚡ SẬP NGUỒN (SYSTEM CRASH)!** | — | Mất sạch bộ nhớ RAM! Trên đĩa cứng lúc này: **`P1.pageLSN = 0`** (`A = 100`), **`P2.pageLSN = 20`** (`B = 250`). |

Hãy quan sát trạng thái hỗn loạn trên đĩa cứng ngay khi máy chủ vừa bật nguồn trở lại:
- Giao dịch **`T1` đã `COMMIT`**, nhưng thay đổi của `T1` ở `LSN = 10` (`P1: A=150`) và `LSN = 40` (`P2: B=300`) đều **chưa hề được ghi xuống đĩa** (`P1.pageLSN = 0`, `P2.pageLSN = 20`)!
- Giao dịch **`T2` chưa `COMMIT`** (đang chạy dở thì sập nguồn), nhưng thay đổi của `T2` ở `LSN = 20` (`P2: B=250`) lại **đã nằm chễm chệ trên đĩa cứng**!

Bây giờ, hãy chạy tay từng bước qua **3 giai đoạn của ARIES** để xem cơ sở dữ liệu tự chữa lành như thế nào:

---

#### Giai đoạn 1: Analysis Phase (Quét xuôi từ `Checkpoint LSN = 30` đến cuối WAL `LSN = 70`)

1. **Khởi tạo tại `LSN = 30` (`CHECKPOINT`)**: Đọc nội dung bản chụp lưu trong bản ghi Checkpoint ở `LSN = 30`:
   - Bảng `ATT` ban đầu:
     - `T1`: `(status = Running, lastLSN = 10)`
     - `T2`: `(status = Running, lastLSN = 20)`
   - Bảng `DPT` ban đầu:
     - `Page P1`: `recLSN = 10`
     - `Page P2`: `recLSN = 20` *(Lưu ý: Bản ghi Checkpoint tại `LSN = 30` chưa biết việc `P2` được flush xuống đĩa ngay sau `LSN = 30`, nên trong `DPT` vẫn giữ `P2: recLSN = 20` — hoàn toàn an toàn vì `recLSN` bảo thủ hơn thực tế chỉ làm quét kiểm tra thêm chứ không gây sai!).*
2. **Quét tới `LSN = 40` (`T1 UPDATE P2`)**:
   - Cập nhật `ATT`: `T1.lastLSN = 40`.
   - Kiểm tra `DPT`: `Page P2` đã có mặt trong `DPT` (với `recLSN = 20`) nên giữ nguyên `recLSN = 20` (nếu `P2` chưa có trong `DPT` thì mới thêm vào với `recLSN = 40`).
3. **Quét tới `LSN = 50` (`T1 COMMIT`) & `LSN = 60` (`T1 END`)**:
   - `T1` đã hoàn tất thành công $\implies$ **Xóa `T1` khỏi bảng `ATT`**!
4. **Quét tới `LSN = 70` (`T2 UPDATE P1`)**:
   - Cập nhật `ATT`: **`T2.lastLSN = 70`**.
   - `Page P1` đã có trong `DPT` với `recLSN = 10` nên giữ nguyên.

**Kết quả chốt hạ sau khi kết thúc Analysis Phase:**

| Bảng kết quả sau Analysis | Nội dung chi tiết các dòng trong bảng | Ý nghĩa điều khiển cho 2 pha tiếp theo |
| :--- | :--- | :--- |
| **Bảng `ATT` (Active Transactions)** | Chỉ còn duy nhất **`T2`**: `(status = Loser/Undo, lastLSN = 70)` | `T1` đã thắng (`Winner`); chỉ có **`T2` là `Loser Transaction`** cần phải hoàn tác ở pha Undo, bắt đầu từ `lastLSN = 70`. |
| **Bảng `DPT` (Dirty Pages)** | - **`Page P1`**: `recLSN = 10`<br/>- **`Page P2`**: `recLSN = 20` | Giá trị `recLSN` nhỏ nhất trong toàn bảng `DPT` là:$$\min(\text{recLSN}) = \min(10, 20) = \mathbf{10}$$Pha **Redo** sẽ bắt đầu quét xuôi từ đúng **`LSN = 10`**! |

---

#### Giai đoạn 2: Redo Phase — "Repeating History" (Quét xuôi từ `min(recLSN) = 10` đến `LSN = 70`)

Quy tắc lọc ở mỗi bản ghi cập nhật trang $P$ tại vị trí `LSN`:
- Hệ thống chỉ thực sự phải nạp trang $P$ và áp dụng lại (`Redo`) thay đổi nếu `Page P` nằm trong `DPT`, có `LSN >= DPT[P].recLSN`, **VÀ** khi đọc trang $P$ từ đĩa lên thấy **`P.pageLSN < LSN`** (nghĩa là thay đổi này thực sự chưa kịp xuống đĩa trước khi sập nguồn!).

Hãy theo dõi từng dòng từ `LSN = 10` đến `LSN = 70`:

| `LSN` đang xét | Nội dung bản ghi WAL | Kiểm tra `pageLSN` trên đĩa | Hành động của Redo Phase | Trạng thái trang sau bước này |
| :--- | :--- | :--- | :--- | :--- |
| **`LSN = 10`** | `T1 UPDATE P1: A = 100 -> 150` | Đọc `P1` từ đĩa: `P1.pageLSN = 0 < 10` | **CHẠY LẠI (`REDO`)!** Ghi `A = 150` vào `P1` và cập nhật `P1.pageLSN = 10`. | `P1: A = 150, pageLSN = 10` |
| **`LSN = 20`** | `T2 UPDATE P2: B = 200 -> 250` | Đọc `P2` từ đĩa: thấy **`P2.pageLSN = 20 >= 20`**! | **BỎ QUA (`SKIP`)!** Vì `P2` đã được đẩy xuống đĩa sau Checkpoint nên thay đổi tại `LSN = 20` đã có sẵn trên đĩa rồi! | `P2: B = 250, pageLSN = 20` *(Giữ nguyên)* |
| **`LSN = 30`** | `CHECKPOINT` | Không phải bản ghi sửa dữ liệu | Bỏ qua. | Giữ nguyên |
| **`LSN = 40`** | `T1 UPDATE P2: B = 250 -> 300` | Trên `P2` hiện có `P2.pageLSN = 20 < 40` | **CHẠY LẠI (`REDO`)!** Ghi `B = 300` vào `P2` và cập nhật `P2.pageLSN = 40`. *(Khôi phục thành công dữ liệu đã COMMIT của `T1`!)* | `P2: B = 300, pageLSN = 40` |
| **`LSN = 50, 60`** | `T1 COMMIT`, `T1 END` | Không sửa trang dữ liệu | Bỏ qua. | Giữ nguyên |
| **`LSN = 70`** | `T2 UPDATE P1: A = 150 -> 999` | Trên `P1` hiện có `P1.pageLSN = 10 < 70` | **CHẠY LẠI (`REDO`)!** Dù `T2` là giao dịch sẽ bị hủy (`Loser`), theo nguyên lý **Repeating History**, ARIES vẫn Redo `A = 999` và đặt `P1.pageLSN = 70`! | `P1: A = 999, pageLSN = 70` |

**Kết thúc Redo Phase**: Bộ nhớ RAM lúc này có `P1 (A = 999, pageLSN = 70)` và `P2 (B = 300, pageLSN = 40)` — **giống hệt `100%` trạng thái RAM ngay trước tích tắc sập nguồn**!

---

#### Giai đoạn 3: Undo Phase (Quét ngược chuỗi `prevLSN` của `Loser T2` từ `lastLSN = 70` về `0`)

Bảng `ATT` cho biết giao dịch cần hoàn tác là **`T2`** với tập các vị trí cần Undo khởi tạo là `ToUndo = { T2.lastLSN } = { 70 }`:

1. **Bước Undo 1 — Hoàn tác `LSN = 70` (`T2 UPDATE P1: A = 150 -> 999`, `prevLSN = 20`)**:
   - Đảo ngược thay đổi trên `Page P1`: khôi phục giá trị cũ **`A = 150`** (vốn là giá trị đã commit của `T1`!).
   - Ghi nối tiếp một bản ghi **`CLR` (`Compensation Log Record`)** mới vào cuối tệp WAL tại **`LSN = 80`**:
     - `LSN = 80, Type = CLR, TransID = T2, PageID = P1, Action = "Undo LSN 70 (Restore P1.A = 150)"`
     - Trường quan trọng nhất trong `CLR`: **`UndoNextLSN = 20`** (chính là `prevLSN` của bản ghi `70` vừa được hoàn tác xong!).
   - Cập nhật `P1.pageLSN = 80`. Tập cần hoàn tác tiếp theo lấy từ `UndoNextLSN`: `ToUndo = { 20 }`.
2. **Bước Undo 2 — Hoàn tác `LSN = 20` (`T2 UPDATE P2: B = 200 -> 250`, `prevLSN = 0`)**:
   - Lưu ý: Trên `Page P2`, sau khi `T2` sửa ở `LSN = 20`, `T1` đã cập nhật lên `B = 300` ở `LSN = 40` (trong thực tế khóa dòng `X-Lock` của 2PL sẽ ngăn `T1` và `T2` cùng sửa một dòng `B` trên `P2`; giả sử ở đây `LSN = 20` của `T2` sửa một dòng khác `B_2 = 200 -> 250` trên cùng trang `P2` còn `LSN = 40` của `T1` sửa dòng `B_1 = 250 -> 300` trên trang `P2` để minh họa cơ chế **Page-oriented Redo / Logical Undo** của ARIES!).
   - Hệ thống hoàn tác dòng `B_2` của `T2` trên `Page P2` về `200` (trong khi vẫn giữ nguyên dòng `B_1 = 300` đã commit của `T1`!).
   - Ghi thêm bản ghi **`CLR`** thứ hai vào cuối tệp WAL tại **`LSN = 90`**:
     - `LSN = 90, Type = CLR, TransID = T2, PageID = P2, Action = "Undo LSN 20", UndoNextLSN = 0`.
   - Cập nhật `P2.pageLSN = 90`.
3. **Bước kết thúc (`UndoNextLSN == 0`)**:
   - Vì `UndoNextLSN = 0`, toàn bộ các bước của giao dịch `T2` đã được hoàn tác sạch sẽ!
   - Hệ thống ghi bản ghi **`LSN = 100: T2 END`** vào WAL và xóa `T2` khỏi bảng `ATT`.

```text
Tệp WAL hoàn chỉnh sau khi ARIES khôi phục thành công (bổ sung LSN 80, 90, 100):
+-----+---------+---------+----------------------------------------+-------------+
| LSN | prevLSN | TransID | Nội dung bản ghi WAL                   | UndoNextLSN |
+-----+---------+---------+----------------------------------------+-------------+
| ... | ...     | ...     | (Các bản ghi LSN 10 .. 70 trước Crash) | —           |
| 80  | 70      | T2      | CLR: Hoàn tác LSN 70 trên P1 (A = 150) | 20          |
| 90  | 80      | T2      | CLR: Hoàn tác LSN 20 trên P2           | 0           |
| 100 | 90      | T2      | END (Kết thúc hoàn tác giao dịch T2)   | —           |
+-----+---------+---------+----------------------------------------+-------------+
```

> [!TIP]
> **Sức mạnh của `UndoNextLSN` khi sập nguồn kép (Crash during Recovery):**
> Giả sử máy chủ vừa ghi xong `LSN = 80 (CLR, UndoNextLSN = 20)` thì **lại bị cúp điện lần thứ 2** trước khi kịp Undo `LSN = 20`! Khi bật máy lại:
> 1. Pha **Redo** chạy từ đầu đến `LSN = 80` (bao gồm cả việc chạy lại bản ghi `CLR 80` để đặt `P1.A = 150`).
> 2. Sang pha **Undo**, hệ thống bắt đầu từ bản ghi cuối của `T2` là `LSN = 80`. Vì `LSN = 80` là một bản ghi `CLR`, hệ thống đọc trường **`UndoNextLSN = 20`** và **nhảy vọt thẳng về `LSN = 20`** để làm nốt bước cuối cùng, hoàn toàn bỏ qua `LSN = 70` đã làm xong! Quá trình khôi phục luôn tiến về phía trước mà không bao giờ bị lặp vô hạn.

---

## Kiểm soát đồng thời (Concurrency Control), MVCC và các dị thường {#concurrency-control}

### Bài toán thực tế & Mental Model

Khi hàng nghìn giao dịch cùng đọc và sửa dữ liệu đồng thời, nếu bắt các giao dịch xếp hàng chạy nối đuôi nhau từng cái một (`Serial Execution`), độ trễ sẽ tăng vọt và hầu hết các nhân CPU bị bỏ không. Ngược lại, nếu cho chạy đan xen tự do mà không có cơ chế bảo vệ, dữ liệu sẽ gặp phải các hiện tượng dị thường nghiêm trọng (**Concurrency Anomalies**).

Để đạt được sự cân bằng giữa độ cô lập (`Isolation`) và tốc độ xử lý, các hệ quản trị cơ sở dữ liệu hiện đại kết hợp **MVCC (`Multi-Version Concurrency Control`)** với các cơ chế khóa hoặc phát hiện xung đột đồ thị.

### 1. Cơ chế hoạt động của MVCC qua ví dụ bảng phiên bản `(xmin, xmax)`

**Mental Model — "Chụp ảnh nhanh theo dòng thời gian (Time-Travel Snapshot)":**
Thay vì ghi đè trực tiếp lên dòng dữ liệu cũ (khiến luồng đang đọc nhìn thấy dữ liệu bị sửa nửa chừng hoặc phải đứng đợi luồng ghi khóa xong), **MVCC không bao giờ ghi đè bản ghi đang được đọc**. Mỗi lần `UPDATE` thực chất tạo ra một **phiên bản bản ghi mới (`Tuple Version`)** gắn kèm con dấu thời gian/mã giao dịch tạo ra nó (`xmin`) và mã giao dịch xóa/thay thế nó (`xmax`). Nhờ đó: **Đọc không bao giờ chặn Ghi, và Ghi không bao giờ chặn Đọc!**

*(Lưu ý kiến trúc: **PostgreSQL** lưu trực tiếp nhiều phiên bản Tuple nối nhau qua con trỏ `t_ctid` ngay trên các trang dữ liệu rồi dọn dẹp sau bằng `VACUUM`; trong khi **MySQL InnoDB** và **Oracle** chỉ giữ phiên bản mới nhất trên trang B-Tree và lưu chuỗi các phiên bản cũ trong vùng **Undo Log / Rollback Segment**).*

#### Ví dụ chạy tay từng bước: 3 giao dịch đồng thời trên PostgreSQL MVCC
Giả sử bảng `accounts` có dòng dữ liệu của tài khoản `id = 1` ban đầu được tạo bởi giao dịch `T90` đã commit từ trước với số dư `balance = 1000`.
Hiện tại có 3 giao dịch mới bắt đầu theo thứ tự mã giao dịch tăng dần (`txid`):
- **`T100`** (Chỉ đọc — chạy ở mức `REPEATABLE READ / Snapshot Isolation`, chụp Snapshot tại thời điểm bắt đầu nên chỉ nhìn thấy các giao dịch đã commit có `txid < 100`).
- **`T101`** (Giao dịch ghi — cập nhật `balance` từ `1000` lên `2000` rồi `COMMIT`).
- **`T102`** (Giao dịch đọc mới — bắt đầu **sau khi** `T101` đã `COMMIT`).

Bảng trạng thái các phiên bản vật lý (**Physical Tuple Versions**) của dòng `id = 1` trong Page dữ liệu:

| Phiên bản vật lý (`ctid`) | `id` | `balance` | **`xmin`** *(Tx tạo)* | **`xmax`** *(Tx xóa/sửa)* | Con trỏ `t_ctid` tiếp theo | Giải thích vòng đời phiên bản |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Version 1** `(0, 1)` | `1` | **`1000`** | **`90`** *(Committed)* | **`101`** *(Committed)* | Trỏ sang `(0, 2)` | Phiên bản gốc do `T90` tạo; sau đó bị `T101` đánh dấu hết hạn (`xmax = 101`) khi cập nhật. |
| **Version 2** `(0, 2)` | `1` | **`2000`** | **`101`** *(Committed)* | **`0`** *(Đang sống)* | `(0, 2)` *(Cuối chuỗi)* | Phiên bản mới do `T101` sinh ra khi chạy `UPDATE accounts SET balance = 2000 WHERE id = 1`. |

Cách quy tắc hiển thị (**Visibility Rule**) quyết định mỗi giao dịch nhìn thấy phiên bản nào mà không cần khóa chặn nhau:
1. **Khi `T100` (`txid = 100`, Snapshot chỉ thấy `txid < 100`) đọc dòng `id = 1`**:
   - Kiểm tra **Version 1 `(0, 1)`**: `xmin = 90 < 100` (đã tồn tại lúc `T100` chụp ảnh) và `xmax = 101 > 100` (tức đối với bức ảnh quá khứ của `T100`, giao dịch `101` chưa từng xảy ra, nên Version 1 vẫn chưa bị xóa!).
   - Kiểm tra **Version 2 `(0, 2)`**: `xmin = 101 > 100` $\implies$ Không hiển thị đối với `T100`.
   - **Kết quả cho `T100`**: Nhìn thấy **`balance = 1000`** một cách nhất quán tuyệt đối trong suốt giao dịch mà không hề bị `T101` chặn!
2. **Khi `T102` (`txid = 102`, bắt đầu sau khi `T101` đã `COMMIT`) đọc dòng `id = 1`**:
   - Kiểm tra **Version 1 `(0, 1)`**: `xmax = 101 < 102` và `T101` đã commit $\implies$ Version 1 đã chết đối với `T102`.
   - Đi theo con trỏ `t_ctid` sang **Version 2 `(0, 2)`**: `xmin = 101 < 102` (đã commit) và `xmax = 0` (chưa ai xóa).
   - **Kết quả cho `T102`**: Nhìn thấy giá trị mới **`balance = 2000`**!

---

### 2. Các dị thường đồng thời và bài toán Write Skew dưới Snapshot Isolation

Các dị thường cổ điển bao gồm:
- **Dirty Read**: `T1` đọc phải dữ liệu chưa `COMMIT` của `T2`.
- **Non-Repeatable Read (Fuzzy Read)**: `T1` đọc cùng một dòng hai lần nhưng nhận hai giá trị khác nhau vì `T2` vừa sửa và `COMMIT` ở giữa.
- **Phantom Read**: `T1` chạy cùng một truy vấn khoảng (`WHERE dept = 'IT'`) hai lần nhưng lần hai thấy xuất hiện thêm dòng mới do `T2` vừa `INSERT`.
- **Lost Update**: `T1` và `T2` cùng đọc giá trị cũ `x = 100`, cùng tính toán dựa trên `100` rồi lần lượt ghi đè kết quả xuống, làm mất bản cập nhật của giao dịch commit trước.

Mặc dù **Snapshot Isolation (`MVCC`)** chặn đứng được Dirty Read, Non-Repeatable Read và Lost Update (nhờ quy tắc `First-Committer-Wins` báo lỗi nếu hai giao dịch cùng sửa **cùng một dòng**), nó vẫn bất lực trước một dị thường cực kỳ nguy hiểm là **Write Skew (Dị thường lệch ghi)**.

#### Ví dụ chạy tay: Dị thường Write Skew và cách SSI phát hiện chu trình `rw-antidependency`

**Bài toán nghiệp vụ**: Hệ thống ngân hàng (hoặc lịch trực bác sĩ) có quy tắc toàn vẹn: *"Một khách hàng có 2 tài khoản `Checking (TK_A)` và `Savings (TK_B)`; tổng số dư hai tài khoản $A + B$ không bao giờ được phép âm ($A + B \ge 0$)"*.
Ban đầu: `TK_A = 100$`, `TK_B = 100$` (Tổng $= 200\$ \ge 0$).
Khách hàng thực hiện đồng thời `2` giao dịch rút tiền tại `2` cây ATM khác nhau dưới mức cô lập **Snapshot Isolation (`REPEATABLE READ`)**:
- **`T1`**: Rút `150$` từ tài khoản `TK_A`.
- **`T2`**: Rút `150$` từ tài khoản `TK_B`.

```mermaid
sequenceDiagram
    participant T1 as Giao dịch T1 (Rút 150$ từ TK_A)
    participant DB as Database (Ban đầu: TK_A = 100$, TK_B = 100$)
    participant T2 as Giao dịch T2 (Rút 150$ từ TK_B)

    T1->>DB: 1. SELECT TK_A, TK_B -> Thấy (100$, 100$), Tổng = 200$
    T2->>DB: 2. SELECT TK_A, TK_B -> Thấy (100$, 100$), Tổng = 200$
    Note over T1,T2: Cả T1 và T2 đều kiểm tra thấy: 200$ - 150$ = +50$ >= 0 (Hợp lệ!)
    T1->>DB: 3. UPDATE TK_A = -50$ (Ghi vào dòng TK_A)<br/>Tạo cạnh phụ thuộc: T2 --[rw]--> T1
    T2->>DB: 4. UPDATE TK_B = -50$ (Ghi vào dòng TK_B)<br/>Tạo cạnh phụ thuộc: T1 --[rw]--> T2
    T1->>DB: 5. COMMIT (Thành công dưới Snapshot Isolation!)
    T2->>DB: 6. COMMIT (Dưới SI: Thành công -> Tổng = -100$ VI PHẠM!<br/>Dưới SSI: Phát hiện chu trình T1 <--> T2 -> ABORT T2!)
```

**Tại sao Snapshot Isolation thông thường bị lừa?**
- Ở Bước 3, `T1` chỉ sửa dòng **`TK_A`**.
- Ở Bước 4, `T2` chỉ sửa dòng **`TK_B`**.
- Vì hai giao dịch sửa **hai dòng vật lý hoàn toàn khác nhau** (`TK_A` $\neq$ `TK_B`), bộ kiểm tra xung đột ghi-ghi (`Write-Write Conflict`) thấy không có dòng nào bị ghi đè trùng nhau nên cho cả `T1` và `T2` `COMMIT` thành công! Kết quả cuối cùng trên đĩa: `TK_A = -50$`, `TK_B = -50$`, tổng số dư $= -100\$ < 0$ (vi phạm nghiêm trọng ràng buộc toàn vẹn!).

**Cách 1 — Chặn bằng Khóa bi quan (`2PL / SELECT ... FOR UPDATE`)**:
Nếu ở Bước 1 và Bước 2, cả hai giao dịch đều dùng `SELECT ... FOR UPDATE` (hoặc dùng **Next-Key Locks** trong InnoDB `REPEATABLE READ` khi cập nhật), cả hai dòng `TK_A` và `TK_B` đều bị khóa độc quyền (`X-Lock`), buộc `T2` phải đợi `T1` chạy xong và thấy tổng mới chỉ còn `50$` nên từ chối rút `150$`.

**Cách 2 — Phát hiện bằng `SSI` (`Serializable Snapshot Isolation` trong PostgreSQL `SERIALIZABLE`)**:
Thay vì dùng khóa chặn làm giảm hiệu năng đọc, thuật toán **SSI** (do *Cahill, Röhm & Fekete* phát triển năm 2008) vẫn giữ nguyên tốc độ đọc không chặn của MVCC nhưng ghi nhận thêm các **`SIREAD Locks`** nhẹ trong RAM để theo dõi **cạnh phụ thuộc ngược đọc-ghi (`rw-antidependency` / `rw-conflict`)**:
- Một cạnh $T_{\text{reader}} \xrightarrow{rw} T_{\text{writer}}$ hình thành khi $T_{\text{reader}}$ đọc một phiên bản cũ của dòng dữ liệu $X$, và ngay sau đó $T_{\text{writer}}$ tạo ra một phiên bản mới cho dòng $X$ (tức là trong thứ tự tuần tự hóa, $T_{\text{reader}}$ bắt buộc phải đứng trước $T_{\text{writer}}$ vì $T_{\text{reader}}$ không nhìn thấy bản ghi của $T_{\text{writer}}$).
- Trong ví dụ trên:
  1. `T2` đọc `TK_A = 100$`, sau đó `T1` sửa `TK_A = -50$` $\implies$ Hình thành cạnh: **`T2 --[rw]--> T1`**.
  2. `T1` đọc `TK_B = 100$`, sau đó `T2` sửa `TK_B = -50$` $\implies$ Hình thành cạnh: **`T1 --[rw]--> T2`**.
- Hai cạnh này khép kín tạo thành một **chu trình phụ thuộc (`Dangerous Structure / rw-cycle`)**: $T_1 \xrightarrow{rw} T_2 \xrightarrow{rw} T_1$. Ngay khi `T2` gọi `COMMIT`, bộ phát hiện của SSI thấy chu trình này và lập tức **hủy (`ROLLBACK`) `T2`** với mã lỗi `40001: could not serialize access due to read/write dependencies among transactions`, bảo vệ toàn vẹn dữ liệu mà không cần chặn bất kỳ câu lệnh `SELECT` nào!

---

## Phân biệt Lock vs Latch và kỹ thuật Latch Crabbing {#lock-vs-latch}

### 1. Phân biệt rõ Lock (Khóa giao dịch logic) và Latch (Khóa bộ nhớ vật lý)

Trong tài liệu kiến trúc Storage Engine, **Lock** và **Latch** là hai khái niệm hoàn toàn khác biệt. Nhầm lẫn giữa hai thuật ngữ này sẽ dẫn đến hiểu sai toàn bộ cách B-Tree vận hành đồng thời:

| Tiêu chí đối chiếu | Lock (Khóa giao dịch logic — `Transaction Lock`) | Latch (Khóa nội bộ bộ nhớ — `Page Latch / RWLatch`) |
| :--- | :--- | :--- |
| **Đối tượng bảo vệ** | Bảo vệ các **thực thể dữ liệu logic** của ứng dụng (`Row/Tuple`, `Key Range / Gap`, `Table`). | Bảo vệ tính toàn vẹn của **cấu trúc dữ liệu vật lý trong RAM** (`B-Tree Page`, `Slot Array`, `Hash Bucket`). |
| **Thời gian nắm giữ** | Giữ **rất lâu** — trong suốt vòng đời của giao dịch SQL (từ vài mili-giây đến hàng chục giây, kể cả khi chờ mạng hay Disk I/O). | Giữ **cực ngắn** — chỉ trong vài chục nano-giây đến micro-giây khi CPU đang đọc hoặc dịch chuyển các byte trong một Page. |
| **Đối tượng cạnh tranh** | Các giao dịch SQL khác nhau (`Transactions`). | Các luồng thực thi CPU (`Worker Threads` — ngay cả 2 luồng thuộc cùng một truy vấn song song vẫn phải xin Latch!). |
| **Cơ chế xử lý Deadlock** | Có bộ phát hiện Deadlock runtime bằng đồ thị **`Wait-For Graph`** hoặc `Lock Timeout` để chọn và `ROLLBACK` một giao dịch nạn nhân. | **Không có bộ phát hiện Deadlock runtime!** Mã nguồn của Storage Engine bắt buộc phải được thiết kế tuân thủ thứ tự lấy Latch nghiêm ngặt (`Deadlock-free by coding discipline`). |
| **Khả năng Rollback** | Các thay đổi dữ liệu dưới sự bảo vệ của Lock có thể được hoàn tác qua `Undo Log / WAL`. | Các thao tác dưới Latch là bước nguyên tử cấp thấp trên bộ nhớ, hoàn toàn trong suốt với người dùng SQL. |

---

### 2. Kỹ thuật Latch Crabbing / Latch Coupling trên cây B-Tree

#### Bài toán thực tế & Mental Model
Khi một luồng CPU (`Thread A`) đi từ `Root` xuống `Leaf` để thực hiện lệnh `INSERT` hoặc `DELETE`, làm sao nó khóa `Latch` các nút trên đường đi để:
1. Không bị một luồng khác (`Thread B`) đang tách/gộp nút làm hỏng con trỏ ngay dưới chân mình?
2. Đồng thời **không khóa cứng nút `Root`** trong suốt quá trình (vì nếu giữ Latch ở `Root` cho đến khi xong việc ở `Leaf`, toàn bộ các luồng khác trên toàn hệ thống sẽ bị chặn đứng ngay tại cửa `Root`!)?

**Mental Model — "Con cua bò xuống cành cây" (`Latch Crabbing / Latch Coupling`):**
Hãy hình dung cách một người leo núi (hoặc một con cua) di chuyển xuống các bậc thang:
1. Tay trên đang nắm chắc bậc cha (`Parent Latch`).
2. Tay dưới vươn xuống nắm chặt bậc con (`Child Latch`).
3. **Kiểm tra xem bậc con có "An toàn" (`Safe Node`) hay không**: Nếu bậc con đủ vững chắc (tức là chắc chắn không bị gãy/tách đôi hay gộp trang làm ảnh hưởng ngược lên các bậc phía trên), người leo núi **buông ngay tay trên (`Release All Ancestor Latches`)** để những người đi sau có thể bước qua các bậc trên thoải mái!

```mermaid
flowchart TD
    subgraph Step1["Bước 1-2: Giữ X-Latch trên Root P1 -> Xin X-Latch trên Internal P14"]
        R1["Root P1 (Đang giữ X-Latch)"] --> I1["Internal P14 (Xin X-Latch)<br/>Kiểm tra: P14 còn 10 chỗ trống -> SAFE NODE!"]
    end

    subgraph Step2["Bước 3: Vì P14 là Safe Node -> Nhả ngay X-Latch của Root P1!"]
        R2["Root P1 (ĐÃ NHẢ LATCH - Tự do cho luồng khác!)"] -.-> I2["Internal P14 (Đang giữ X-Latch)"]
        I2 --> L2["Leaf P89 (Xin X-Latch)<br/>Kiểm tra: P89 đã ĐẦY (0 chỗ trống) -> UNSAFE NODE!"]
    end

    subgraph Step3["Bước 4: Vì Leaf P89 Unsafe (sẽ Split) -> Phải giữ cả X-Latch của P14 và P89!"]
        I3["Internal P14 (Vẫn giữ X-Latch để nhận Separator Key)"] --> L3["Leaf P89 (Giữ X-Latch & Thực hiện Split)"]
    end

    Step1 --> Step2 --> Step3
```

#### Khi nào một nút được coi là "Safe Node" (Nút an toàn)?
Một nút con $C$ được gọi là **Safe Node** nếu thao tác hiện tại chắc chắn **không bao giờ gây ra sự thay đổi cấu trúc (`Split` hoặc `Merge`) lan truyền ngược lên nút cha** của $C$:
- **Đối với thao tác Đọc (`SELECT / Search`)**: Mọi nút đều là **Safe Node**! Luồng đọc dùng **Shared Latch (`S-Latch`)**:
  1. Xin `S-Latch` trên `Parent`.
  2. Tìm nhánh con và xin `S-Latch` trên `Child`.
  3. Ngay khi đã nắm được `S-Latch` trên `Child`, **nhả ngay lập tức `S-Latch` trên `Parent`**! (Tại mọi thời điểm, một luồng đọc chỉ giữ tối đa `2` Shared Latches liên tiếp).
- **Đối với thao tác Chèn (`INSERT`)**: Một nút con $C$ là **Safe Node** khi và chỉ khi **nó chưa đầy** (`C.free_space >= new_entry_size`), nghĩa là dù dưới nó có bị tách trang đẩy `1` khóa lên thì bản thân $C$ vẫn đủ chỗ chứa và sẽ **không bị Split** tiếp lên trên!
- **Đối với thao tác Xóa (`DELETE`)**: Một nút con $C$ là **Safe Node** khi và chỉ khi **nó đang có nhiều hơn mức tối thiểu** (`C.num_keys > min_keys`), nghĩa là dù bị rút bớt `1` khóa thì $C$ vẫn không rơi vào trạng thái `Underflow` và **không bị Merge**.

#### Ví dụ chạy tay: Pessimistic vs Optimistic Latch Crabbing khi `INSERT`

Giả sử luồng thực thi cần `INSERT` khóa `K = 48` đi qua đường dẫn `Root P1` $\to$ `Internal P14` (còn trống `10` chỗ — **Safe**) $\to$ `Leaf P89` (đã đầy `100%` — **Unsafe, chắc chắn phải Split**):

1. **Cách 1 — Pessimistic Latch Crabbing (Truyền thống)**:
   - **Bước 1**: Xin khóa độc quyền **`X-Latch` trên `Root P1`**.
   - **Bước 2**: Đi xuống và xin **`X-Latch` trên `Internal P14`**. Kiểm tra thấy `P14` còn trống `10` chỗ $\implies$ `P14` là **Safe Node** (dù `Leaf P89` bên dưới có tách đôi và đẩy `1` khóa lên `P14` thì `P14` vẫn dư sức chứa mà không bao giờ lan truyền tiếp lên `Root P1`!).
   - **Bước 3 (Nhả sớm tổ tiên)**: Nhờ `P14` là Safe Node, luồng **nhả ngay lập tức `X-Latch` của `Root P1`**! Các luồng khác lại có thể đi qua `Root P1` bình thường.
   - **Bước 4**: Đi xuống và xin **`X-Latch` trên `Leaf P89`**. Kiểm tra thấy `P89` đã đầy (`Unsafe Node`). Do đó luồng **không được nhả `X-Latch` của `P14`** mà phải giữ cả `X-Latch(P14)` và `X-Latch(P89)` để tách `P89` và chèn khóa phân tách lên `P14` an toàn, xong xuôi mới nhả cả hai.
2. **Cách 2 — Optimistic Latch Crabbing (Tối ưu hóa hiện đại trong thực tế)**:
   - *Nhận xét thực tế*: Nếu một Leaf Page chứa được `200` bản ghi, thì **`199 / 200` (`99.5%`) các lệnh `INSERT` sẽ KHÔNG gây tách trang (`Node Split`)**! Vậy tại sao ở Bước 1 của cách truyền thống, mọi lệnh `INSERT` đều phải xin `X-Latch` (khóa độc quyền) ngay tại `Root P1` làm chặn các luồng khác?
   - **Cơ chế Optimistic**:
     - Luồng `INSERT` giả định lạc quan rằng Leaf Page sẽ không bị tách. Do đó, nó đi từ `Root P1` qua `Internal P14` bằng **Shared Latch (`S-Latch`)** nhẹ nhàng (nhả cha ngay khi nắm được con, giống hệt luồng đọc!), và chỉ xin **`X-Latch` ở đúng nút lá cuối cùng `Leaf P89`**.
     - Nếu `Leaf P89` còn chỗ trống (xảy ra trong `99.5%` trường hợp): chèn xong tại `P89`, nhả `X-Latch(P89)` và hoàn tất! Không một nút trung gian hay nút gốc nào bị khóa độc quyền!
     - Nếu chẳng may `Leaf P89` đã đầy (chỉ xảy ra trong `0.5%` trường hợp): luồng lập tức nhả `X-Latch(P89)` (không sửa gì cả) và **chạy lại từ `Root` bằng chế độ Pessimistic (`X-Latch` Crabbing)** để thực hiện tách trang an toàn.

---

## Tóm tắt & Ghi nhớ cốt lõi (Key Takeaways) {#key-takeaways}

- **Buffer Pool tự quản lý RAM để bảo vệ WAL và chống Cache Pollution**: Một trang có `pin_count > 0` không bao giờ bị trục xuất. Để ngăn câu lệnh `Seq Scan` đuổi sạch các trang nóng ra khỏi bộ nhớ đệm (điểm yếu của **Pure LRU**), MySQL InnoDB dùng danh sách chia đôi **Midpoint Insertion (`Young / Old`)**, còn PostgreSQL dùng vòng quay **Clock-Sweep (`usage_count`)** kết hợp Ring Buffer.
- **Chính sách `STEAL + NO-FORCE` là tiêu chuẩn vàng**: `STEAL` cho phép đẩy Dirty Page của giao dịch chưa commit xuống đĩa khi thiếu RAM (đòi hỏi cơ chế `Undo`); `NO-FORCE` cho phép trả về `COMMIT` tức thì ngay khi bản ghi nhật ký đã được `fsync` tuần tự vào tệp **WAL** mà không cần chờ ghi các trang dữ liệu ngẫu nhiên xuống đĩa (đòi hỏi cơ chế `Redo`).
- **Thuật toán ARIES khôi phục qua 3 pha (`Analysis -> Redo -> Undo`)**:
  - **Analysis**: Quét xuôi từ Checkpoint để dựng lại bảng giao dịch dở dang **`ATT` (`lastLSN`)** và bảng trang bẩn **`DPT` (`recLSN`)**.
  - **Redo (Repeating History)**: Quét xuôi từ **`smallest recLSN`** trong `DPT` để thực hiện lại mọi thay đổi (kể cả của giao dịch chưa commit) nếu trên đĩa có `pageLSN < LSN`, đưa cơ sở dữ liệu về đúng trạng thái RAM ngay trước lúc sập nguồn.
  - **Undo**: Quét ngược theo chuỗi `prevLSN` để hoàn tác các giao dịch `Loser` trong `ATT` và ghi bản ghi **`CLR` (`UndoNextLSN`)** giúp quá trình khôi phục không bao giờ phải làm lại phần đã Undo nếu mất điện lặp lại.
- **MVCC giúp Đọc/Ghi không chặn nhau, nhưng cần `SSI` hoặc `2PL` để chống Write Skew**: Dưới Snapshot Isolation, hai giao dịch đọc cùng một tập dữ liệu rồi sửa hai dòng khác nhau sẽ vượt qua bộ kiểm tra xung đột ghi-ghi và gây lỗi **Write Skew**. Để ngăn chặn ở mức `SERIALIZABLE`, hệ thống phải dùng khóa khoảng (**Next-Key Locks** trong 2PL) hoặc phát hiện chu trình phụ thuộc ngược **`rw-antidependency`** (**SSI** trong PostgreSQL).
- **Phân biệt rõ `Lock` và `Latch`**: **Lock** bảo vệ thực thể dữ liệu logic suốt giao dịch và có bộ phát hiện Deadlock; **Latch** bảo vệ cấu trúc byte của Page trong vài nano-giây và tránh Deadlock nhờ kỹ thuật **Latch Crabbing** (nhả sớm Latch của toàn bộ tổ tiên ngay khi bước xuống một **Safe Node**, kết hợp **Optimistic Latch Crabbing** chỉ giữ `S-Latch` trên đường đi xuống).

### Tài liệu & Nguồn tham khảo
- [Petrov, A. (2019) — *Database Internals: A Deep Dive into How Distributed Data Systems Work*, Chapter 5: Transaction Processing and Recovery (O'Reilly Media)](https://www.databass.dev/)
- [Mohan, C., Haderle, D., Lindsay, B., Pirahesh, H., & Schwarz, P. (1992) — *ARIES: A Transaction Recovery Method Supporting Fine-Granularity Locking and Partial Rollbacks Using Write-Ahead Logging* (ACM TODS)](https://people.eecs.berkeley.edu/~brewer/cs262/Aries.pdf)
- [Haerder, T., & Reuter, A. (1983) — *Principles of Transaction-Oriented Database Recovery* (ACM Computing Surveys)](https://dl.acm.org/doi/10.1145/289.291)
- [Berenson, H., Bernstein, P., Gray, J., Melton, J., O'Neil, E., & O'Neil, P. (1995) — *A Critique of ANSI SQL Isolation Levels* (ACM SIGMOD)](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/tr-95-51.pdf)
- [Cahill, M. J., Röhm, U., & Fekete, A. D. (2008) — *Serializable Isolation for Snapshot Databases* (ACM SIGMOD)](https://dl.acm.org/doi/10.1145/1376616.1376690)
