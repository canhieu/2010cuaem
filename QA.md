# kiểm tra bản v3 · 20/10

bản này dành cho Thuwcutie, ký Híu húi, nhân ngày phụ nữ việt nam 20/10. lời nhắn xưng tớ/cậu. các kết quả dưới đây được ghi nhận trong Chromium của môi trường xem thử; không phải kiểm tra trên điện thoại vật lý.

## âm thanh và chuyển động

- khi bắt đầu trong yên lặng, trạng thái âm thanh thao tác và nhạc nền đều tắt. chọn nhận bưu kiện có âm thanh bật cả hai trạng thái.
- đã phát lần lượt giọng của Chiikawa, Hachiware và Usagi; nguồn và trạng thái phát đúng theo từng nhân vật. APNG tương ứng xuất hiện khi phát, có kích thước ảnh hợp lệ.
- đã quan sát trạng thái kết thúc tự nhiên của clip, nút phát lại trong phong thư và trạng thái giảm âm lượng nhạc nền khi giọng đang phát.
- đã nạp một file M4A thử, đọc được thời lượng khoảng 2,1 giây và kiểm tra giao diện phát ghi âm người gửi. file thử đã được gỡ; cấu hình bản nhận cuối có `senderVoice` rỗng.

kiểm tra này xác nhận nguồn media, metadata, trạng thái phát và giao diện. chưa có kiểm chứng nghe trực tiếp âm thanh đầu ra.

## đọc thư và vé hẹn

- đã mở cả ba thư và đạt đủ 3/3 tem, cất vé hẹn, chọn phương án đi dạo và mở thư cuối.
- vé PNG được tạo và xem trước với kích thước 1200 × 700. đã kiểm tra liên kết tải dự phòng của vé.
- đã quan sát chế độ buổi tối đổi nền, hiện vầng trăng và phản hồi khi chạm vào nhân vật.
- ở những vòng kiểm tra trước của cùng luồng soạn, ảnh webp đã được chọn, thu nhỏ và hiển thị; tên, tiếng việt, xuống dòng và ký tự đặc biệt đã được giữ đúng. chuỗi thử chứa thẻ đóng script được giữ dưới dạng chữ, không tạo phần tử HTML mới.

## bản html dành cho người nhận

- bản nhận đã được render qua `iframe.srcdoc` bằng chính chuỗi HTML dùng tạo Blob tải xuống.
- bản xem thử không còn công cụ soạn thiệp, bắt đầu ở 0/3 tem, giữ tên Thuwcutie, chữ ký Híu húi và dịp 20/10.
- đã trích chính chuỗi HTML đó thành file thực để kiểm tra cấu trúc. các tài nguyên được nhúng bằng data URL; không cần file ảnh, font hoặc media bên ngoài để mở bản đã gói.
- bản gửi sẵn nằm ở `index.html` tại gốc gói. `dist/index.html` là bản có công cụ soạn; build tạo lại file này, sau đó người soạn xuất bản nhận mới nếu muốn thay nội dung gửi đi.

## bố cục và kiểm tra mã

- đã kiểm tra trang và dialog trên Chromium, cùng bố cục ở các khung iframe rộng 390 px và 320 px trong chính trình duyệt đó.
- đã sửa tràn ngang do các tem ẩn, chặn phần tràn tạm thời của chuyển động và điều chỉnh cỡ chữ nhãn người nhận ở chiều rộng hẹp. ở trạng thái cuối được kiểm tra của dialog thư nhỏ và thư cuối, chiều rộng nội dung không vượt chiều rộng hiển thị (`scrollWidth` bằng `clientWidth`).
- ở khung 320 px, nhãn người nhận nằm trên một dòng. chuyển động nhân vật giữ phép căn giữa; tâm ảnh đo được ở 159 px so với tâm vùng hiển thị ở 160 px.
- các module media mới đã qua kiểm tra cú pháp JavaScript. các harness kiểm tra module đã chạy đạt.

## giới hạn còn lại

trình duyệt cloud không trả về sự kiện tải Blob trong thời gian chờ 10 giây, dù nội dung xuất và liên kết Blob đã được tạo. vì vậy chưa xác nhận việc lưu tự động qua sự kiện tải của môi trường này. đã xác nhận nội dung HTML xuất bằng file trích từ `srcdoc`, bản xem thử độc lập, ảnh vé PNG và các liên kết tải dự phòng.

chưa kiểm tra trên Safari/iOS hay điện thoại vật lý. các khung 390 px và 320 px chỉ xác nhận bố cục ở kích thước tương ứng trong Chromium.

chưa có bản triển khai Sites thành công: bước đưa nguồn vào môi trường đó bị chặn tại source proxy. README cung cấp cách tự đưa file tĩnh lên GitHub Pages hoặc VPS; tài liệu không khẳng định các bước triển khai này đã được thực hiện.


## wording revision · v4 · 20/10/2026

- rewritten from the sender’s answers: daily messages, shared photos/memes/cute clips and teasing, with a direct “tớ nhớ cậu” and a wish to meet and go out.
- three distinct note titles and bodies, the final letter, fallback content, envelope labels and ticket date are synchronized. date text is “lần tới mình gặp nhau”.
- checked the recipient HTML in the browser: quiet welcome, all three notes in sequence, updated coupon and the final letter with Híu húi signature. visually checked the final letter layout.
- verified both editable and recipient builds match src/config.json, retain inline image/audio assets, have unique element IDs and pass JavaScript syntax checking. recipient build omits the editor and starts with a new gift ID.
- this revision changes wording only; mobile/device and audio compatibility checks from v3 were not repeated.


## wording revision · v5 · 20/10/2026

- rewrote only the second note and its envelope title as “cứ muốn kể cậu nghe.”; the message now expresses wanting to tell Thư things and send a few words even without a particular story.
- checked that the other notes, final letter, names, occasion, coupon and inline media match v4. both generated configurations and envelope titles match the updated source and both JavaScript bundles pass syntax checking.
- no additional browser or audio test was needed for this shorter text-only edit.


## lời thư v6 — 20/10/2026

- Chèn nguyên văn đoạn xin lỗi đã duyệt vào thư cuối, ngay trước lời cảm ơn Thư.
- Đối chiếu src/config.json, fallback và bản build: thư đúng vị trí chèn, ba lời nhắn giữ nguyên v5.
- Xem bản nhận trong trình duyệt: đoạn xin lỗi hiển thị đầy đủ, cuộn được tới lời chúc 20/10 và chữ ký Híu húi.
- Bản đăng Sites phục vụ out/index.html, giống bản recipient root/index.html; bản soạn tiếp tục ở dist/index.html.
