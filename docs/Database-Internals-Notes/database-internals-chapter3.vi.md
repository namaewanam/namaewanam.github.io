---
title: "Chapter 3 - File Formats"
date: 2026-10-28
description: "Biểu diễn dữ liệu nhị phân trên đĩa: Binary Encoding, cấu trúc Slotted Page, định dạng Cell, Overflow Pages (TOAST) và quản lý phiên bản File Format."
order: 4
tags: ["database-internals", "storage-engine", "file-formats", "slotted-page"]
---

## Table of Contents
1. [Binary Encoding (Mã hóa nhị phân: Endianness, Varint, String, Null Bitmap)](#binary-encoding)
2. [Cấu trúc Page tổng quát và Slotted Pages](#slotted-pages)
3. [Ví dụ chạy tay (Step-by-Step Dry Run): Vòng đời một Slotted Page 8192 bytes](#slotted-page-dry-run)
4. [Cấu trúc Cell (Key Cells vs Key-Value Data Cells & Truy cập cột O(1))](#cell-layout)
5. [Quản lý dữ liệu kích thước lớn và Overflow Pages (TOAST)](#overflow-pages)
6. [Quản lý phiên bản File Format & Checksum (Versioning)](#versioning)
7. [Tóm tắt & Ghi nhớ cốt lõi (Key Takeaways)](#key-takeaways)

---

Ở Chương 2, cây B+Tree đã được giới thiệu dưới góc nhìn logic gồm các Node và các con trỏ. Tuy nhiên, phần cứng ổ đĩa (HDD/SSD) không hề hiểu khái niệm "Node" hay "Con trỏ" — ổ đĩa chỉ biết đọc và ghi các mảng byte thô theo từng khối cố định gọi là **Page** (`4 KB`, `8 KB` hoặc `16 KB`).

Chương 3 giải đáp câu hỏi cốt lõi của kỹ thuật chế tạo Storage Engine: **Làm thế nào để đóng gói (serialize) các con số, chuỗi ký tự, giá trị `NULL` và các dòng dữ liệu có độ dài co giãn bất kỳ vào bên trong một mảng `8.192 bytes` của Page sao cho truy xuất nhanh nhất, không bị phân mảnh và không làm gãy các con trỏ chỉ mục?**

---

## Binary Encoding (Mã hóa nhị phân: Endianness, Varint, String, Null Bitmap) {#binary-encoding}

### Bài toán thực tế: Tại sao không lưu dữ liệu dưới dạng Text (JSON / CSV) trong Page?
Giả sử lưu dòng dữ liệu `{"id": 1000000, "active": true, "name": "Alice"}` dưới dạng chuỗi JSON thuần túy:
1. **Lãng phí dung lượng**: Con số `1000000` ở dạng văn bản ASCII tốn `7 bytes` (và lặp lại tên trường `"id":` ở mọi dòng), trong khi bản chất số nguyên 32-bit chỉ tốn `4 bytes`.
2. **Không thể nhảy trực tiếp đến cột thứ $k$ với độ phức tạp $\mathcal{O}(1)$**: Muốn đọc trường `"name"`, CPU buộc phải quét từng byte từ đầu dòng, đếm từng dấu ngoặc kép `"` và dấu phẩy `,` ($\mathcal{O}(N)$ parsing overhead).

Để đạt hiệu năng cao nhất, Storage Engine mã hóa mọi kiểu dữ liệu nguyên thủy sang định dạng **Nhị phân có cấu trúc chặt chẽ (Structured Binary Encoding)**.

---

### 1. Số nguyên kích thước cố định (Fixed-Width Integers) & Thứ tự Byte (`Endianness`)
Các số nguyên có kích thước cố định (`INT8 = 1 byte`, `INT16 = 2 bytes`, `INT32 = 4 bytes`, `INT64 = 8 bytes`) khi trải ra mảng byte trong bộ nhớ hoặc trên đĩa có thể xếp theo hai thứ tự ngược nhau:

![So sánh thứ tự lưu trữ byte 32-bit giữa Big-Endian và Little-Endian](./images/endianness-32bit.svg)

- **Big-Endian (*Most Significant Byte First — MSB First*)**: Byte có trọng số lớn nhất đứng ở địa chỉ đầu tiên (bên trái). Ví dụ số 32-bit `0x12345678` được lưu lần lượt là `12 34 56 78` (giống hệt cách con người viết số từ hàng triệu xuống hàng đơn vị).
- **Little-Endian (*Least Significant Byte First — LSB First*)**: Byte có trọng số nhỏ nhất đứng ở địa chỉ đầu tiên. Số `0x12345678` được lưu ngược thành `78 56 34 12`. Đây là định dạng gốc của kiến trúc vi xử lý `x86_64` và `ARM64` hiện đại.

#### Tại sao Big-Endian lại cực kỳ quan trọng khi mã hóa Khóa chỉ mục (Index Keys) để so sánh bằng `memcmp`?
Trong B+Tree hoặc LSM-Tree, mỗi lần tìm kiếm một khóa, CPU phải thực hiện hàng chục phép so sánh giữa các khóa. Thay vì phải giải mã (deserialize) từng khóa nhị phân ra kiểu dữ liệu gốc (`INT32`, `INT64`, `VARCHAR`) rồi mới so sánh, các Storage Engine (như RocksDB, MySQL InnoDB, SQLite) muốn dùng thẳng hàm **`memcmp(key1, key2, len)`** (so sánh từng byte thô từ trái sang phải bằng lệnh vector hóa của CPU) cho mọi loại khóa!

Hãy xem điều gì xảy ra nếu so sánh hai số nguyên 16-bit là **`1` (`0x0001`)** và **`256` (`0x0100`)** bằng `memcmp` (so sánh byte đầu tiên bên trái trước):

```text
+---------------+-------------------------+-------------------------+-----------------------------------+
| Giá trị số    | Biểu diễn Big-Endian    | Biểu diễn Little-Endian | Kết quả so sánh byte đầu (memcmp) |
+---------------+-------------------------+-------------------------+-----------------------------------+
| Số nhỏ:   1   | [ 0x00, 0x01 ]          | [ 0x01, 0x00 ]          | - Big-Endian: 0x00 < 0x01 (ĐÚNG!) |
| Số lớn: 256   | [ 0x01, 0x00 ]          | [ 0x00, 0x01 ]          | - Little-Endian: 0x01 > 0x00      |
|               |                         |                         |   -> Báo 1 > 256 (SAI THỨ TỰ!)    |
+---------------+-------------------------+-------------------------+-----------------------------------+
```

> [!TIP]
> **Mẹo kỹ thuật trong InnoDB & RocksDB (Byte-Orderable Encoding)**:
> Để `memcmp` trả về đúng thứ tự số học từ nhỏ đến lớn:
> 1. Phải lưu khóa số nguyên theo chuẩn **Big-Endian** (để byte bậc cao được so sánh trước).
> 2. Với **số nguyên có dấu (Signed Integers — bù 2 / Two's Complement)**, số âm luôn có bit dấu đầu tiên bằng `1` (ví dụ `-1 = 0xFFFFFFFF`), còn số dương có bit dấu bằng `0` (ví dụ `+1 = 0x00000001`). Nếu chạy `memcmp` trực tiếp, `0xFF > 0x00` nên số âm sẽ bị coi là lớn hơn số dương! Để khắc phục, trước khi lưu khóa xuống đĩa, Storage Engine chỉ cần **đảo bit đầu tiên (Flip the Sign Bit — `XOR 0x80000000`)**: lúc này `-1` biến thành `0x7FFFFFFF` và `+1` biến thành `0x80000001`, giúp hàm `memcmp` so sánh đúng tuyệt đối cả số âm lẫn số dương!

---

### 2. Số nguyên độ dài thay đổi: `Varint` / `LEB128` (Variable-Length Integer)
- **Bài toán thực tế**: Trong các cấu trúc nội bộ của Page (như lưu độ dài chuỗi `VARCHAR`, lưu `Row ID`, hoặc lưu độ lệch `Offset`), 99% các con số đều rất nhỏ (ví dụ chuỗi dài `5` đến `100 bytes`). Nếu lúc nào cũng cấp cứng một kiểu `UINT64` (`8 bytes`) cho một con số có giá trị bằng `5` (`00 00 00 00 00 00 00 05`), hệ thống sẽ lãng phí `7 bytes` chứa toàn số `0` vô nghĩa!
- **Giải pháp `Varint` (*Base-128 Variable-Length Encoding / LEB128* — dùng trong SQLite, RocksDB, Protocol Buffers)**:
  - Thay vì cố định số byte, `Varint` chia mỗi byte (`8 bits`) thành 2 phần:
    - **1 bit đầu tiên (MSB — Continuation Bit)**: Đóng vai trò là cờ báo hiệu:
      - Nếu $\text{MSB} = \mathbf{1}$: *"Vẫn còn byte tiếp theo thuộc về con số này, hãy đọc tiếp!"*
      - Nếu $\text{MSB} = \mathbf{0}$: *"Đây là byte cuối cùng của con số này, dừng lại!"*
    - **7 bits còn lại (Payload Bits)**: Chứa giá trị nhị phân thực sự của con số.
  - Nhờ đó, mọi số từ `0` đến `127` ($2^7 - 1$) chỉ tốn đúng **`1 byte`**; số từ `128` đến `16.383` ($2^{14} - 1$) chỉ tốn **`2 bytes`**!

#### Ví dụ chạy tay từng bit: Mã hóa con số `300` sang `Varint (LEB128)` thành `2 bytes`
Giả sử cần lưu độ dài của một cột văn bản là **`300` bytes** theo chuẩn Little-Endian Base-128 (`LEB128`):

1. **Bước 1 — Đổi số `300` sang hệ nhị phân**:
   - Biểu diễn nhị phân: $300 = 256 + 32 + 8 + 4 = \mathbf{100101100_2}$ (gồm `9 bits`).
2. **Bước 2 — Cắt thành từng nhóm `7 bits` từ phải sang trái (từ bit trọng số thấp đến cao)**:
   - Nhóm 7 bits thấp (bên phải): `0101100` (tương ứng giá trị $32 + 8 + 4 = 44$).
   - Nhóm 7 bits cao (bên trái, thêm các số `0` ở đầu cho đủ 7 bits): `0000010` (tương ứng giá trị $2 \times 128 = 256$).
3. **Bước 3 — Gắn bit cờ tiếp nối (`Continuation Bit - MSB`) vào đầu mỗi nhóm 7 bits**:
   - **Byte thứ nhất** (chứa nhóm 7 bits thấp `0101100`): Vì phía sau vẫn còn nhóm nữa nên gắn bit đầu $\text{MSB} = \mathbf{1}$:
     $\implies \mathbf{1}\text{0101100}_2 = \text{0xAC}$ (`172` thập phân).
   - **Byte thứ hai** (chứa nhóm 7 bits cao `0000010`): Vì đây là byte cuối cùng nên gắn bit đầu $\text{MSB} = \mathbf{0}$:
     $\implies \mathbf{0}\text{0000010}_2 = \text{0x02}$ (`2` thập phân).

```text
[Quá trình mã hóa số 300 (nhị phân: 100101100) thành 2 bytes Varint (LEB128)]

Giá trị nhị phân 9-bit:           10   0101100
                                  ||   |||||||
Tách thành 2 nhóm 7-bit:     0000010   0101100
                             (Nhóm 2)  (Nhóm 1 - Trọng số thấp)

Đặt Nhóm 1 lên Byte đầu (gắn MSB = 1 vì còn tiếp) và Nhóm 2 ở Byte sau (gắn MSB = 0 vì kết thúc):
+------------------------------------+------------------------------------+
| Byte 0: [1] 0 1 0 1 1 0 0  (0xAC)  | Byte 1: [0] 0 0 0 0 0 1 0  (0x02)  |
+---------^^^------------------------+---------^^^------------------------+
           |                                    |
   MSB = 1 (Đọc tiếp byte sau)          MSB = 0 (Byte cuối cùng -> Dừng!)

Kiểm tra giải mã ngược: (0101100_2) + (0000010_2 << 7) = 44 + (2 * 128) = 44 + 256 = 300!
```

---

### 3. Chuỗi ký tự (`VARCHAR` / `BLOB`) và `Null Bitmap`
- **Chuỗi ký tự độ dài thay đổi (Length-Prefixed Strings / Pascal Strings)**:
  - Trong ngôn ngữ C, chuỗi được kết thúc bằng byte `0x00` (`Null-terminated string`). Tuy nhiên Database không dùng cách này vì: (1) Muốn biết chuỗi dài bao nhiêu phải chạy vòng lặp đếm từng byte $\mathcal{O}(N)$, và (2) Không thể lưu dữ liệu nhị phân (`BLOB`/`BYTEA`) có chứa byte `0x00` hợp lệ ở giữa.
  - Thay vào đó, Database luôn lưu **Độ dài chuỗi (`Length` — thường mã hóa bằng `Varint` hoặc `2-4 bytes` integer)** ngay phía trước mảng byte nội dung: `[Length][UTF-8 Payload Bytes]`.
- **Null Bitmap (Mặt nạ bit quản lý giá trị `NULL`)**:
  - **Bài toán**: Nếu một bảng có 32 cột nhưng trong một bản ghi cụ thể có tới 20 cột mang giá trị `NULL`, làm sao để không tốn một byte dữ liệu nào cho 20 cột `NULL` đó?
  - **Giải pháp**: Đặt ở đầu mỗi bản ghi một mảng bit gọi là **Null Bitmap**, trong đó mỗi cột của bảng chỉ chiếm đúng **`1 bit`** (32 cột chỉ tốn $32 / 8 = 4\text{ bytes}$). Nếu bit thứ $i$ cho biết cột $i$ là `NULL`, cột đó được **bỏ qua hoàn toàn** trong phần dữ liệu phía sau!

#### Ví dụ tổng hợp: Đóng gói nhị phân một bản ghi hoàn chỉnh
Xét bảng `users(id INT32, name VARCHAR, active BOOLEAN, bio VARCHAR)` với bản ghi:
- `id = 42` (`0x0000002A` theo Big-Endian)
- `name = "Alice"` (`5 bytes` ASCII: `41 6C 69 63 65`)
- `active = true` (`0x01`)
- `bio = NULL`

Bố cục từng byte liên tiếp (Contiguous Byte Layout) của bản ghi này chỉ chiếm đúng **`13 bytes`**:

| Thành phần | Kích thước | Giá trị Hex | Giải thích kỹ thuật chi tiết |
| :--- | :--- | :--- | :--- |
| **1. Null Bitmap** | `1 byte` | `0x08` (`00001000` nhị phân) | Bit thứ `3` (`0-indexed`, ứng với cột thứ 4 là `bio`) bằng `1` báo hiệu `bio IS NULL`. Các bit `0, 1, 2` đều bằng `0` (khác `NULL`). |
| **2. Fixed: `id`** | `4 bytes` | `00 00 00 2A` | Giá trị `42` kiểu `INT32` (Big-Endian). Đặt cố định ngay sau Null Bitmap. |
| **3. Fixed: `active`** | `1 byte` | `01` | Giá trị `true`. Gom toàn bộ các cột kích thước cố định lên đầu giúp tính địa chỉ byte bằng phép cộng $\mathcal{O}(1)$. |
| **4. Var Offset/Len** | `2 bytes` | `00 05` | Độ dài (hoặc vị trí kết thúc) của cột biến đổi đầu tiên (`name` dài `5 bytes`). Cột `bio` là `NULL` nên không cần lưu! |
| **5. Var Data: `name`**| `5 bytes` | `41 6C 69 63 65` | 5 ký tự ASCII `"Alice"`. Cột `bio` tốn **`0 bytes`** ở vùng dữ liệu! |

---

## Cấu trúc Page tổng quát và Slotted Pages {#slotted-pages}

### Bài toán thực tế: Điều gì xảy ra nếu xếp các dòng dữ liệu nối đuôi nhau trực tiếp từ đầu Page?
Giả sử có một Page `8 KB` (`8.192 bytes`). Nếu thiết kế theo cách ngây thơ là cứ chèn bản ghi thứ nhất ở đầu trang (`offset 0..200`), bản ghi thứ hai nối tiếp ngay sau (`offset 200..400`), bản ghi thứ ba ở (`offset 400..700`), hệ thống sẽ vấp phải **3 bài toán bế tắc**:

1. **Xóa dữ liệu gây phân mảnh lỗ chỗ (External Fragmentation)**:
   - Khi xóa bản ghi thứ hai ở giữa (`offset 200..400`), nó để lại một "lỗ thủng" rộng `200 bytes`. Nếu bản ghi mới cần chèn vào nặng `250 bytes`, lỗ thủng này không nhét vừa và bị bỏ hoang!
2. **Cập nhật làm phình kích thước bản ghi (`UPDATE` mở rộng chuỗi)**:
   - Nếu sửa tên khách hàng ở bản ghi thứ nhất làm kích thước của nó tăng từ `200 bytes` lên `300 bytes`, nó không thể phình ra tại chỗ vì ngay sát byte `200` đã bị bản ghi thứ hai chiếm đóng!
3. **Thảm họa hỏng con trỏ Secondary Index khi dồn trang (Compaction)**:
   - Để gom các lỗ thủng lại hoặc dời bản ghi đi chỗ khác trong trang, địa chỉ byte vật lý (`Byte Offset`) của các bản ghi trong Page sẽ bị thay đổi. Nếu các cây chỉ mục (Secondary Index) bên ngoài đang lưu địa chỉ `(Page 10, ByteOffset 400)`, mỗi lần dồn trang hoặc dịch chuyển 1 dòng trong Page sẽ buộc phải đi sửa lại toàn bộ các Index trên bảng!

### Giải pháp kinh điển: Cấu trúc Slotted Page (Dùng trong PostgreSQL, InnoDB, SQLite)
**Slotted Page** giải quyết triệt để cả 3 vấn đề trên bằng hai ý tưởng thiết kế xuất sắc:
1. **Thêm một tầng gián tiếp (`Indirection Layer` — `Slot Array` / `Line Pointer Directory`)**: Các Index bên ngoài **không bao giờ lưu địa chỉ `Byte Offset` trực tiếp**, mà chỉ lưu chỉ số thứ tự của ô trong mảng **`Slot ID`** (`TID = (PageID, SlotID)`). Bản thân `Slot[i]` mới lưu `(offset, length)` trỏ tới vị trí byte thực tế của bản ghi trong Page!
2. **Cho hai đầu mọc ngược chiều nhau vào vùng trống ở giữa**:
   - **Mảng `Slot Array`** nằm ở đầu trang (ngay dưới `Page Header`) và **mọc từ trên xuống dưới** (con trỏ ranh giới **`lower`** tăng dần).
   - **Các `Data Cells (Tuples)`** chứa dữ liệu thật được xếp từ đáy trang và **mọc từ dưới đáy đi lên trên** (con trỏ ranh giới **`upper`** giảm dần).
   - Khoảng không gian nằm giữa `lower` và `upper` chính là **Vùng trống liên tục (`Contiguous Free Space`)**!

```mermaid
flowchart TD
    subgraph SlottedPage["Cấu trúc Slotted Page (Kích thước 8 KB = 8192 bytes, đánh địa chỉ 0 .. 8192)"]
        direction TB
        Header["<b>1. Page Header (Offset 0 .. 24)</b><br/>Page LSN | Flags | <b>lower</b> (đáy của Slot Array) | <b>upper</b> (đỉnh của Data Cells)"]
        Slots["<b>2. Slot Array / Line Pointers (Từ Offset 24 -> lower)</b><br/>Mỗi Slot 4 bytes: [Slot 0: off, len] | [Slot 1: off, len] | [Slot 2: off, len]<br/><i>Mở rộng từ trên xuống dưới (lower tăng dần ↓)</i>"]
        FreeSpace["<b>3. Free Space (Vùng trống liên tục ở giữa: từ lower đến upper)</b><br/>Dung lượng trống còn lại = <code>upper - lower</code>"]
        Cells["<b>4. Variable-Size Data Cells / Tuples (Từ upper -> 8192)</b><br/>[Cell 2] ... [Cell 1] ... [Cell 0 (sát đáy 8192)]<br/><i>Mở rộng từ đáy Page đi lên trên (upper giảm dần ↑)</i>"]
        
        Header --> Slots
        Slots -->|"lower ↓"| FreeSpace
        Cells -->|"upper ↑"| FreeSpace
    end
```

---

## Ví dụ chạy tay (Step-by-Step Dry Run): Vòng đời một Slotted Page 8192 bytes {#slotted-page-dry-run}

Hãy theo dõi chính xác từng con số tọa độ byte (`lower`, `upper`, và mảng `Slot Array`) của một **Slotted Page kích thước `8.192 bytes`** (địa chỉ từ `0` đến `8192`) qua 4 thao tác liên tiếp.

**Trạng thái khởi tạo (Trang rỗng)**:
- `Page Header` chiếm `24 bytes` đầu tiên (từ byte `0` đến `24`).
- Mỗi phần tử trong `Slot Array` chiếm `4 bytes`.
- Khi trang hoàn toàn trống: **`lower = 24`**, **`upper = 8192`** (vùng trống `Free Space = 8192 - 24 = 8168 bytes`).

---

### Bước 1: `INSERT` liên tiếp 3 bản ghi (`Record 0`, `Record 1`, `Record 2`)
Giả sử chèn 3 bản ghi có kích thước lần lượt là:
- **Record 0** nặng **`192 bytes`**:
  - Đặt sát đáy trang: từ `8192 - 192 = 8000` đến `8192` $\implies$ `upper` tụt xuống **`8000`**.
  - Cấp `Slot[0]` (chiếm byte `24..28`): lưu `(offset = 8000, len = 192)` $\implies$ `lower = 28`.
- **Record 1** nặng **`200 bytes`**:
  - Đặt ngay phía trên Record 0: từ `8000 - 200 = 7800` đến `8000` $\implies$ `upper` tụt xuống **`7800`**.
  - Cấp `Slot[1]` (chiếm byte `28..32`): lưu `(offset = 7800, len = 200)` $\implies$ `lower = 32`.
- **Record 2** nặng **`300 bytes`**:
  - Đặt ngay phía trên Record 1: từ `7800 - 300 = 7500` đến `7800` $\implies$ `upper` tụt xuống **`7500`**.
  - Cấp `Slot[2]` (chiếm byte `32..36`): lưu `(offset = 7500, len = 300)` $\implies$ `lower = 36`.

**Trạng thái Page sau Bước 1**:

```text
[Bước 1: Sau khi INSERT 3 bản ghi — lower = 36, upper = 7500, Free Space = 7464 bytes]
Byte 0        24               28               32               36
+-------------+----------------+----------------+----------------+
| Page Header | Slot[0]        | Slot[1]        | Slot[2]        |
| lower = 36  | off=8000,      | off=7800,      | off=7500,      |
| upper = 7500| len=192        | len=200        | len=300        |
+-------------+----------------+----------------+----------------+
              |        (VÙNG TRỐNG LIÊN TỤC: byte 36 .. 7500)    |
+-------------+----------------+----------------+----------------+
| ... Trống ...| Cell 2 (300B)  | Cell 1 (200B)  | Cell 0 (192B)  |
+-------------+----------------+----------------+----------------+
            7500             7800             8000             8192
```

Lúc này, các chỉ mục (Secondary Index) bên ngoài đang lưu định danh của 3 dòng lần lượt là:
- Record 0: `TID = (Page, Slot 0)`
- Record 1: `TID = (Page, Slot 1)`
- Record 2: `TID = (Page, Slot 2)`

---

### Bước 2: `DELETE` bản ghi ở `Slot 1` (`Record 1`)
Khi người dùng chạy lệnh xóa bản ghi thứ hai (`TID = (Page, Slot 1)`):
- Storage Engine **không dịch chuyển `Cell 2` ngay lập tức** (để tránh tốn CPU copy bộ nhớ trong luồng giao dịch).
- Hệ thống chỉ cần đánh dấu **`Slot[1] = DEAD (offset = 0, len = 0)`**!
- Con trỏ `upper` vẫn đứng ở `7500`, còn vùng byte từ `7800..8000` (`200 bytes`) trở thành một **lỗ hổng phân mảnh (Fragmented Hole)** nằm kẹp giữa `Cell 2` và `Cell 0`:

```text
[Bước 2: Sau khi DELETE Slot 1 — Slot[1] đánh dấu DEAD, tạo lỗ hổng 200 bytes ở 7800..8000]
Byte 0        24               28               32               36
+-------------+----------------+----------------+----------------+
| Page Header | Slot[0]        | Slot[1]        | Slot[2]        |
| lower = 36  | off=8000,      | ** DEAD **     | off=7500,      |
| upper = 7500| len=192        | (off=0, len=0) | len=300        |
+-------------+----------------+----------------+----------------+
              |        (VÙNG TRỐNG LIÊN TỤC: byte 36 .. 7500)    |
+-------------+----------------+----------------+----------------+
| ... Trống ...| Cell 2 (300B)  | [LỖ HỔNG 200B] | Cell 0 (192B)  |
+-------------+----------------+----------------+----------------+
            7500             7800             8000             8192
```

---

### Bước 3: `UPDATE` bản ghi `Slot 0` làm tăng kích thước từ `192 bytes` lên `300 bytes`
Giả sử người dùng cập nhật thêm nội dung vào `Record 0` khiến kích thước của nó phình từ `192 bytes` lên **`300 bytes`**:
- Chỗ cũ của `Cell 0` (`8000..8192` = `192 bytes`) không đủ chứa `300 bytes` (hay kể cả lỗ hổng `200 bytes` của `Cell 1` cũng không vừa `300 bytes`).
- Nhờ cấu trúc Slotted Page, việc xử lý diễn ra cực kỳ gọn nhẹ:
  1. Cấp phát `300 bytes` mới ngay trên đỉnh `upper` hiện tại: từ `7500 - 300 = 7200` đến `7500`, rồi ghi nội dung mới của `Record 0` vào đó $\implies$ `upper` cập nhật thành **`7200`**.
  2. Vùng cũ `8000..8192` (`192 bytes`) được bỏ lại thành vùng rác chưa dọn.
  3. **Chỉ cần sửa lại con trỏ bên trong `Slot[0]` thành `(offset = 7200, len = 300)`!**
  4. **Định danh bên ngoài `TID = (Page, Slot 0)` hoàn toàn KHÔNG THAY ĐỔI!** Không một Secondary Index nào bị ảnh hưởng!

```text
[Bước 3: Sau khi UPDATE Slot 0 (192B -> 300B) — Ghi vào 7200..7500 và chỉ sửa Slot[0].off = 7200!]
Byte 0        24               28               32               36
+-------------+----------------+----------------+----------------+
| Page Header | Slot[0]        | Slot[1]        | Slot[2]        |
| lower = 36  | off=7200 (MỚI!)| ** DEAD **     | off=7500,      |
| upper = 7200| len=300  (MỚI!)| (off=0, len=0) | len=300        |
+-------------+----------------+----------------+----------------+
              |        (VÙNG TRỐNG LIÊN TỤC: byte 36 .. 7200)    |
+-------------+----------------+----------------+----------------+----------------+
| ..Trống..   | Cell 0 Mới     | Cell 2 (300B)  | [LỖ HỔNG 200B] | [RÁC CŨ 192B]  |
+-------------+----------------+----------------+----------------+----------------+
            7200             7500             7800             8000             8192
```

---

### Bước 4: Dồn trang (Page Defragmentation / Compaction) thu hồi vùng phân mảnh
Sau Bước 3, đáy trang đang có hai vùng rác bị bỏ trống là `7800..8000` (`200 bytes`) và `8000..8192` (`192 bytes`), tổng cộng lãng phí `392 bytes`. Khi Page dần đầy và cần gom lại toàn bộ khoảng trống để chèn bản ghi mới, Storage Engine chạy hàm **Page Defragmentation (Compaction)** ngay trên RAM:
1. Chỉ giữ lại các Cell đang còn sống là **`Cell 2` (`300 bytes`)** và **`Cell 0 Mới` (`300 bytes`)**.
2. Dồn cả hai Cell này về sát đáy trang `8192`:
   - Dời **`Cell 2` (`300 bytes`)** về sát đáy trang: từ `8192 - 300 = 7892` đến `8192` $\implies$ cập nhật **`Slot[2].offset = 7892`**.
   - Dời **`Cell 0` (`300 bytes`)** nằm ngay sát trên `Cell 2`: từ `7892 - 300 = 7592` đến `7892` $\implies$ cập nhật **`Slot[0].offset = 7592`**.
3. Cập nhật con trỏ **`upper = 7592`** (thu hồi trọn vẹn `392 bytes` rác vào lại vùng trống liên tục `Free Space`!).
4. Trong suốt quá trình dồn trang này, `Slot 0` vẫn là `Slot 0`, `Slot 2` vẫn là `Slot 2` (và `Slot 1` đang `DEAD` có thể được tái sử dụng cho lần `INSERT` tiếp theo). **Mọi Secondary Index bên ngoài hoàn toàn không hề hay biết các byte bên dưới đáy Page vừa được sắp xếp lại!**

```text
[Bước 4: Sau khi Page Defragmentation — Thu hồi sạch 392B rác, upper tăng từ 7200 lên lại 7592!]
Byte 0        24               28               32               36
+-------------+----------------+----------------+----------------+
| Page Header | Slot[0]        | Slot[1]        | Slot[2]        |
| lower = 36  | off=7592 (Đổi!)| ** DEAD **     | off=7892 (Đổi!)|
| upper = 7592| len=300        | (Tái sử dụng)  | len=300        |
+-------------+----------------+----------------+----------------+
              |  (VÙNG TRỐNG LIÊN TỤC ĐÃ ĐƯỢC KHÔI PHỤC: 36..7592)|
+-------------+---------------------------------+----------------+
| ... Trống ...                | Cell 0 (300B)  | Cell 2 (300B)  |
+------------------------------+----------------+----------------+
                             7592             7892             8192
```

---

## Cấu trúc Cell (Key Cells vs Key-Value Data Cells & Truy cập cột O(1)) {#cell-layout}

Bên trong vùng `Data Cells` ở đáy một Slotted Page của B+Tree, mỗi phần tử được đóng gói theo một trong hai định dạng **Cell** tùy thuộc vào loại trang:

### 1. Phân biệt `Key Cells` và `Key-Value Data Cells`

```text
1. KEY CELL (Dùng trong Internal Pages của B+Tree — Chỉ điều hướng):
+------------+--------------------+------------------------+----------------------------+
| Cell Flags | Key Size (Varint)  | Child Page ID (4-8 B)  | Separator Key Bytes        |
+------------+--------------------+------------------------+----------------------------+

2. KEY-VALUE DATA CELL (Dùng trong Leaf Pages của B+Tree — Chứa dữ liệu dòng):
+------------+-------------+--------------------+-----------------------+------------------------+
| Cell Header| Null Bitmap | Fixed-Width Cols   | Variable Offset Array | Variable-Width Payloads|
| (Flags/Txn)| (1 bit/col) | (INT, BIGINT, DATE)| [Off_Col1, Off_Col2]  | (VARCHAR, TEXT, JSONB) |
+------------+-------------+--------------------+-----------------------+------------------------+
```

- **Key Cell (Internal Node Cell)**: Chỉ lưu khóa phân tách (`Separator Key`) và địa chỉ trang con (`Child Page ID`). Vì không chứa dữ liệu dòng, một Key Cell chỉ tốn khoảng `12 – 20 bytes`, giúp nhét được hàng ngàn Key Cells vào một Internal Page.
- **Key-Value Data Cell (Leaf Node Cell / Heap Tuple)**: Lưu trữ khóa chính cùng toàn bộ giá trị các cột của bản ghi (kèm thông tin giao dịch MVCC như `xmin/xmax` hoặc `trx_id/roll_pointer`).

### 2. Tại sao cách sắp xếp trường trong Data Cell cho phép đọc bất kỳ cột nào với $\mathcal{O}(1)$?
Giả sử một bảng có 5 cột: `(c1 INT32, c2 VARCHAR, c3 BIGINT, c4 VARCHAR, c5 INT16)`.
- Nếu lưu các cột theo đúng thứ tự khai báo trong lệnh `CREATE TABLE` (`c1 -> c2 -> c3 -> c4 -> c5`): bởi vì `c2` và `c4` là kiểu `VARCHAR` có độ dài thay đổi ở mỗi dòng, nên để đọc cột cố định `c5`, CPU buộc phải đọc độ dài của `c2` rồi cộng thêm độ dài của `c4` mới biết `c5` nằm ở đâu.
- Thay vào đó, trình biên dịch Schema của Storage Engine tự động **tái sắp xếp thứ tự vật lý (Physical Column Reordering)** bên trong Cell thành 2 khu vực tách biệt:
  1. **Khu vực Fixed-Width Columns đứng đầu**: Xếp `c1 (4B)`, `c3 (8B)`, `c5 (2B)` nằm cố định ngay sau `Null Bitmap`. Nhờ vậy, bất kể chuỗi `c2` và `c4` dài bao nhiêu, cột `c5` luôn luôn nằm chính xác tại độ lệch `Byte Offset = Header + 4 + 8 = Header + 12`!
  2. **Khu vực Variable-Width Columns đứng sau kèm `Variable Offset Array`**: Ngay sau khu vực cố định là một mảng nhỏ chứa các con trỏ `Offset` của từng cột biến đổi (`[Offset_c2, Offset_c4]`). Muốn lấy cột biến đổi thứ $k$, CPU chỉ cần đọc phần tử thứ $k$ trong mảng Offset này (`offset_start = Offset[k]`, `offset_end = Offset[k+1]`) và nhảy thẳng một bước $\mathcal{O}(1)$ tới đúng lát cắt byte của chuỗi đó!

---

## Quản lý dữ liệu kích thước lớn và Overflow Pages (TOAST) {#overflow-pages}

### Bài toán thực tế: Chuyện gì xảy ra khi chèn một bài viết `description` nặng `40 KB` vào Page `8 KB`?
Một Page tiêu chuẩn trong PostgreSQL chỉ có kích thước **`8 KB` (`8.192 bytes`)** (hoặc `16 KB` trong MySQL InnoDB). Điều này đặt ra hai câu hỏi hóc búa:
1. Làm sao nhét một cột `TEXT` / `JSONB` / `BYTEA` nặng **`40 KB`** vào một Page chỉ rộng **`8 KB`**?
2. Kể cả khi cột đó chỉ nặng **`3 KB`** (nhét vừa vào Page `8 KB`), nếu cứ để nguyên cột `3 KB` đó nằm trực tiếp trong Page chính (**Inline Storage**), thì mỗi Page `8 KB` chỉ chứa được vỏn vẹn **2 dòng dữ liệu**! Khi một bảng `10 triệu` dòng mà mỗi Page chỉ chứa được 2 dòng, số lượng trang sẽ phình lên `5 triệu Pages` và làm giảm tốc độ quét bảng đi hàng chục lần, đặc biệt với những câu truy vấn `SELECT id, title FROM articles` vốn **không hề cần đọc cột `description`**!

### Giải pháp: Overflow Pages & Cơ chế TOAST (*The Oversized-Attribute Storage Technique*)
Khi kích thước một bản ghi vượt quá ngưỡng cho phép trên một trang (thường gọi là **`TOAST_TUPLE_THRESHOLD`**, bằng `1/4` kích thước Page — tức khoảng **`2 KB`** trên Page `8 KB` của PostgreSQL, hoặc khoảng **`7 KB` – `8 KB`** trên Page `16 KB` của InnoDB), Storage Engine tự động kích hoạt quy trình xử lý dữ liệu quá khổ (**Out-of-line Storage**).

#### Ví dụ chạy tay cụ thể: Lưu bản ghi có cột `description` nặng `40 KB` vào PostgreSQL (`Page = 8 KB`)
Giả sử thực thi lệnh:

```sql
INSERT INTO articles (id, title, views, description)
VALUES (501, 'Database Internals Notes', 1200, '<Chuỗi văn bản dài 40 KB = 40.960 bytes>');
```

Quá trình xử lý bên dưới tầng Storage Engine diễn ra theo **4 bước**:

1. **Bước 1 — Phát hiện vượt ngưỡng & Nén dữ liệu tại chỗ (In-line Compression)**:
   - Storage Engine thấy tổng kích thước dòng là $\approx 41\text{ KB} > 2\text{ KB}$ (`TOAST_TUPLE_THRESHOLD`).
   - Trước khi tách trang, hệ thống thử nén cột `description` (`40 KB`) bằng thuật toán nén nhanh **`LZ4`** hoặc **`pglz`**.
   - Giả sử văn bản `40 KB` sau khi nén bằng `LZ4` thu gọn xuống còn **`10 KB`** (`10.240 bytes`). Con số `10 KB` này vẫn lớn hơn ngưỡng `2 KB` của Page chính, nên bắt buộc phải chuyển sang lưu trữ ngoài dòng (**Out-of-line Overflow / TOAST Storage**).
2. **Bước 2 — Cắt nhỏ thành các mảnh (`Chunks`) và ghi sang `TOAST Table` / `Overflow Pages`**:
   - Hệ thống lấy cục dữ liệu đã nén (`10 KB`) cắt thành **5 mảnh (`Chunks`)**, mỗi mảnh có kích thước tối đa khoảng **`2 KB` (`2.000 bytes`)**:
     - `Chunk 0`: byte `0 .. 2000`
     - `Chunk 1`: byte `2000 .. 4000`
     - `Chunk 2`: byte `4000 .. 6000`
     - `Chunk 3`: byte `6000 .. 8000`
     - `Chunk 4`: byte `8000 .. 10240`
   - Trong PostgreSQL, mỗi bảng chính có một bảng phụ ẩn đi kèm gọi là **`pg_toast.pg_toast_<oid>`** (có cây chỉ mục B+Tree riêng trên khóa `(chunk_id, chunk_seq)`). Năm mảnh dữ liệu trên được chèn thành 5 dòng `(chunk_id = 9901, chunk_seq = 0..4, chunk_data)` vào các trang của bảng TOAST này (cứ 4 mảnh `2 KB` lại lấp đầy vừa khít 1 Page `8 KB` của bảng TOAST!).
3. **Bước 3 — Thay thế cột `40 KB` ở Page chính bằng một `TOAST Pointer` chỉ nặng `18 bytes`!**:
   - Quay trở lại `Data Page` chính của bảng `articles`, thay vì lưu `40.960 bytes` của cột `description`, Data Cell của dòng `id = 501` chỉ lưu một con trỏ đại diện (**TOAST Pointer**) siêu nhỏ gọn chiếm đúng **`18 bytes`**:
     - `va_rawsize = 40960` (Kích thước gốc trước khi nén: `40 KB`)
     - `va_extsize = 10240` (Kích thước sau khi nén: `10 KB` + cờ báo `LZ4`)
     - `va_valueid = 9901` (`chunk_id` định danh chuỗi mảnh trong bảng TOAST)
     - `va_toastrelid = <OID của bảng TOAST>`

```mermaid
flowchart LR
    subgraph MainPage["1. Main Table Page (8 KB) — Chứa hàng trăm dòng gọn nhẹ!"]
        Row501["<b>Row id = 501 (Tổng kích thước chỉ ~60 bytes!)</b><br/>id = 501 (4B) | title = 'Database...' (24B) | views = 1200 (4B)<br/><b>description = [TOAST Pointer: 18 bytes]</b><br/><i>(raw=40KB, compressed=10KB, chunk_id=9901)</i>"]
    end
    subgraph ToastTable["2. Out-of-Line TOAST Storage (Chỉ đọc khi SELECT có gọi cột description)"]
        Idx["<b>TOAST B+Tree Index</b><br/>Key: (chunk_id, chunk_seq)"]
        TP1["<b>TOAST Page #1 (8 KB)</b><br/>(9901, seq=0): 2 KB<br/>(9901, seq=1): 2 KB<br/>(9901, seq=2): 2 KB<br/>(9901, seq=3): 2 KB"]
        TP2["<b>TOAST Page #2 (8 KB)</b><br/>(9901, seq=4): 2 KB"]
        Idx --> TP1
        Idx --> TP2
    end
    Row501 -->|"Lazy Loading:<br/>Tra cứu chunk_id = 9901"| Idx
```

4. **Bước 4 — Lợi ích kép khi Truy vấn (`Lazy Loading`) và khi Cập nhật (`UPDATE`)**:
   - **Khi chạy `SELECT id, title, views FROM articles WHERE views > 1000`**:
     - Nhờ cột `description` đã được rút gọn thành `18 bytes`, một Page `8 KB` của bảng `articles` chứa được hơn **100 dòng dữ liệu** thay vì 1 dòng! Hệ thống quét vèo qua bảng chính mà **không cần chạm vào bất kỳ trang TOAST nào** (**Zero Overhead cho các cột không được SELECT**).
   - **Khi chạy `UPDATE articles SET views = 1201 WHERE id = 501`**:
     - Bản ghi mới được tạo ra cho dòng `501` chỉ cần **sao chép lại đúng `18 bytes` của `TOAST Pointer`** trỏ tới `chunk_id = 9901` cũ mà **không phải sao chép lại `40 KB` văn bản**!
   - **Tại sao dùng B+Tree TOAST Table (`chunk_id, chunk_seq`) tốt hơn Linked List các Overflow Pages truyền thống?**
     - Trong thiết kế cũ (nối các Overflow Pages thành danh sách liên kết đơn `Page A -> Page B -> Page C -> Page D`), nếu người dùng chỉ muốn cắt lấy một đoạn ở cuối văn bản (`SUBSTRING(description FROM 35000 FOR 100)`), hệ thống vẫn buộc phải đọc tuần tự qua `Page A`, `Page B`, `Page C` mới biết địa chỉ của `Page D`. Với chỉ mục B+Tree trên `(chunk_id, chunk_seq)`, hệ thống có thể nhảy thẳng tới mảnh `seq` cần thiết!

---

## Quản lý phiên bản File Format & Checksum (Versioning) {#versioning}

Các file dữ liệu trên đĩa của một cơ sở dữ liệu sản phẩm có thể tồn tại suốt 5–10 năm qua nhiều lần nâng cấp phiên bản phần mềm (ví dụ nâng cấp PostgreSQL 14 lên 17, hoặc RocksDB v6 lên v9). Để đảm bảo tính tương thích và phát hiện sớm lỗi phần cứng ổ đĩa (Bit Rot / Silent Data Corruption), mọi file dữ liệu đều tuân thủ cấu trúc **File Header / Trailer & Page Checksum**:

```text
+-----------------------------------------------------------------------------------+
|                               CẤU TRÚC MỘT DATA FILE                              |
+----------------------+----------------------+--------------+----------------------+
| File Header          | Slotted Page #1      |   ...        | File Trailer / Footer|
| - Magic Number (4-8B)| - Page Header        |              | - Root/Index Offsets |
| - Format Version     | - Page Checksum      |              | - File Checksum      |
| - Page Size (8KB)    | - Payload (8 KB)     |              | - Magic Number       |
+----------------------+----------------------+--------------+----------------------+
```

1. **Magic Number**: Chuỗi byte định danh cố định nằm ngay đầu (và/hoặc cuối) file. Ví dụ: mọi file cơ sở dữ liệu SQLite 3 đều bắt đầu bằng đúng `16 bytes` ASCII: `"SQLite format 3\0"` (`53 51 4c 69 74 65 20 66 6f 72 6d 61 74 20 33 00`). Nếu mở nhầm một file khác, Storage Engine báo lỗi ngay ở byte đầu tiên.
2. **Format Version Number (`Major.Minor`)**: Lưu phiên bản định dạng nhị phân để bộ giải mã (Parser) biết cách đọc cấu trúc Page tương ứng, hỗ trợ **Backward Compatibility** (phần mềm mới đọc được file cũ) hoặc hướng dẫn công cụ nâng cấp (`pg_upgrade`).
3. **Page Checksum (`CRC32C` / `xxHash`)**: Mỗi Page trên đĩa đều lưu một mã băm kiểm tra `Checksum` trong `Page Header` được tính từ toàn bộ các byte trong Page đó. Mỗi khi đọc một Page từ đĩa lên `Buffer Pool`, Storage Engine tính lại hàm băm `CRC32C` (bằng tập lệnh phần cứng của CPU) và đối chiếu: nếu lệch dù chỉ `1 bit` (do lỗi điện tích trên SSD hoặc lỗi ghi rách trang *Torn Page*), hệ thống lập tức phát cảnh báo hỏng trang thay vì âm thầm trả dữ liệu sai cho người dùng!

---

## Tóm tắt & Ghi nhớ cốt lõi (Key Takeaways) {#key-takeaways}

1. **Tại sao phải mã hóa khóa số nguyên theo chuẩn `Big-Endian` (và lật bit dấu) trong các chỉ mục Database?**
   - Vì trên kiến trúc `Little-Endian`, byte hàng đơn vị đứng trước byte hàng trăm nên hàm so sánh mảng byte `memcmp` sẽ kết luận sai rằng `1 (0x01 0x00) > 256 (0x00 0x01)`. Chuẩn `Big-Endian` đặt byte có trọng số lớn nhất lên đầu (giống thứ tự từ điển), cho phép Storage Engine so sánh mọi loại khóa trực tiếp bằng `memcmp` ở tốc độ cao mà không cần giải mã ngược về kiểu số học.
2. **Làm thế nào cơ chế `Varint (LEB128)` tiết kiệm dung lượng cho các số nguyên nhỏ?**
   - Thay vì luôn dùng cố định `4` hoặc `8 bytes`, `Varint` dành **1 bit đầu (`MSB`) của mỗi byte làm cờ báo hiệu còn byte tiếp theo hay không** (`1` = còn tiếp, `0` = kết thúc) và dùng **7 bits còn lại để chứa giá trị**. Nhờ đó các số từ `0..127` chỉ tốn `1 byte`, và số `300` chỉ tốn `2 bytes` (`0xAC 0x02`).
3. **Tại sao `Slotted Page` là thiết kế bắt buộc khi lưu các bản ghi có độ dài thay đổi?**
   - Bằng cách cho mảng con trỏ **`Slot Array` mọc từ trên xuống (`lower` tăng)** và các **`Data Cells` mọc từ dưới đáy lên (`upper` giảm)**, Slotted Page tách biệt hoàn toàn định danh logic bên ngoài **`TID = (PageId, SlotId)`** khỏi tọa độ byte vật lý bên trong trang. Khi một dòng bị `DELETE`, bị `UPDATE` phình to phải dời chỗ, hay khi chạy **Page Defragmentation (Compaction)** dồn các Cell về đáy trang, hệ thống chỉ cần sửa lại `offset` trong `Slot Array` mà **không làm hỏng bất kỳ Secondary Index nào**.
4. **Cơ chế `Overflow Pages / TOAST` bảo vệ hiệu năng B+Tree như thế nào?**
   - Khi một cột (như `TEXT`/`BLOB` nặng `40 KB`) vượt ngưỡng kích thước dòng ($\approx 2\text{ KB}$ trên Page `8 KB`), hệ thống tự động nén và cắt nhỏ cột đó thành các mảnh `2 KB` đẩy sang các trang tràn (`TOAST Table`), chỉ để lại một **`TOAST Pointer` nặng `18 bytes`** tại trang chính. Nhờ vậy, một Page `8 KB` của bảng chính vẫn chứa được hàng trăm dòng (duy trì **Fanout cao**), và các truy vấn không gọi đến cột lớn đó hoàn toàn không tốn Disk I/O để đọc dữ liệu tràn (**Lazy Loading**).

### Tài liệu & Nguồn tham khảo
- [Alex Petrov — *Database Internals*, Chapter 3: File Formats (O'Reilly)](https://www.databass.dev/)
- [PostgreSQL Documentation — Database Page Layout (`PageHeaderData` & `ItemIdData`)](https://www.postgresql.org/docs/current/storage-page-layout.html)
- [PostgreSQL Documentation — TOAST (The Oversized-Attribute Storage Technique)](https://www.postgresql.org/docs/current/storage-toast.html)
- [SQLite Database File Format Specification (B-Tree Pages & Varint Encoding)](https://www.sqlite.org/fileformat2.html)
