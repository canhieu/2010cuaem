# bưu điện những điều bé xíu

món quà Chiikawa dành cho Thuwcutie, người gửi Híu húi, nhân ngày phụ nữ việt nam 20/10. lời nhắn xưng tớ/cậu, dựa trên một năm còn ở xa, những lần nhắn tin kể chuyện, gửi ảnh/meme/clip rồi trêu nhau. nội dung nói rõ nỗi nhớ và mong được gặp, cùng xem phim và đi dạo phố.

trang dùng html, css và javascript thuần. bản v3 được đóng gói thành một file html chứa giao diện, hình ảnh, APNG, âm thanh, phông chữ và nội dung cá nhân hóa. máy chủ chỉ cần phục vụ file tĩnh; ứng dụng không cần backend, tài khoản hay cơ sở dữ liệu.

## dùng file nào

| file trong gói | dùng để |
| --- | --- |
| `index.html` ở gốc dự án | bản dành cho người nhận, đã gói sẵn cho Thuwcutie từ Híu húi vào dịp 20/10; có thể mở, gửi hoặc đưa lên hosting ngay |
| `dist/index.html` | bản dành cho người soạn, có nút “viết thiệp” để thay đổi nội dung và xuất một bản nhận mới |
| `src/`, `build.py` và `dist/assets/` | mã nguồn và tài nguyên để sửa giao diện, tính năng hoặc nội dung mặc định rồi build lại |

bản `index.html` ở gốc không có công cụ soạn thiệp. khi muốn sửa món quà, mở `dist/index.html`, chỉnh trong “viết thiệp”, rồi xuất lại. chi tiết những bước đã kiểm tra và giới hạn của môi trường kiểm tra nằm trong [QA.md](QA.md).

## trải nghiệm v3

| phần | hành vi |
| --- | --- |
| nhận bưu kiện | cảnh chào mở đầu có lựa chọn nghe âm thanh hoặc mở trong yên lặng; không tự phát tiếng khi vừa tải trang |
| ba người bạn | Chiikawa, Hachiware và Usagi giữ ba phong thư; có APNG và đoạn âm thanh preview LINE tương ứng |
| âm thanh | tiếng động khi thao tác và giọng nhân vật được điều khiển riêng với nhạc nền |
| nhạc nền | giai điệu hộp nhạc nhẹ, tạo bằng Web Audio; người xem chủ động bật hoặc tắt |
| buổi tối | đổi sang nền tím dịu, thêm vầng trăng nhỏ và giảm độ rực của ảnh; vẫn giữ nội dung và các nút đọc được |
| ba phong thư | có thể mở theo thứ tự bất kỳ, đóng tem sau khi đọc, quay lại xem và mở thư cuối ngay khi muốn |
| lời hẹn | có lựa chọn cục bộ của người nhận và vé hẹn dạng PNG để giữ lại |
| thư cuối | lời chúc 20/10, chữ ký Híu húi, ảnh tùy chọn và đoạn ghi âm của người gửi nếu đã thêm |
| góc viết thiệp | đổi tên, dịp tặng, ba lời nhắn, thư cuối, lời hẹn, ảnh và ghi âm |
| bản gửi đi | xuất một file html riêng cho người nhận, đã nhúng các nội dung và bỏ công cụ soạn thiệp |

ba đoạn giọng nhân vật và APNG lấy từ preview công khai của [bộ sticker LINE 37825](https://store.line.me/stickershop/product/37825/ja), ghép theo cùng sticker ID. nguồn từng file, thời lượng và ghi chú xác minh nằm trong [asset-provenance.md](asset-provenance.md) và `dist/assets/voices/README.txt`.

## mở và cá nhân hóa

1. để chỉnh sửa món quà, mở `dist/index.html` bằng trình duyệt có bật javascript.
2. ở phần nhận bưu kiện, chọn nghe âm thanh hoặc xem trong yên lặng. nút âm thanh và nút nhạc nền có thể thay đổi riêng sau đó.
3. nhấn “viết thiệp” để mở phần soạn. mặc định là Thuwcutie, Híu húi và 20/10.
4. sửa lời nhắn theo cách hai người thường nói chuyện. phần nhập thư cuối chỉ cần thân thư; lời chào và chữ ký đã có vị trí riêng.
5. có thể thêm một ảnh jpg, png hoặc webp tối đa 8 mb. ảnh được thu gọn ngay trong trình duyệt trước khi đưa vào thiệp.
6. có thể thêm một đoạn ghi âm của người gửi, tối đa 3 mb và không quá 90 giây. chọn tệp âm thanh mà trình duyệt đọc được; ứng dụng kiểm tra kích thước và thời lượng trước khi nhận. phần này không bắt buộc.
7. nhấn “xem thiệp của mình” để lưu bản nháp trong trình duyệt hiện tại, hoặc “tải thiệp để gửi” để đóng gói bản dành cho người nhận.

khi có ghi âm riêng, người nhận chủ động nhấn để nghe. ảnh và âm thanh được chọn chỉ được xử lý cục bộ, rồi nằm trong file html đã xuất.

## xuất thiệp và giữ vé hẹn

“tải thiệp để gửi” tạo một bản html độc lập. nếu trình duyệt chưa bắt đầu tải tự động, dùng liên kết tải xuất hiện ngay trong phần soạn. liên kết “mở thử tấm thiệp đã gói” mở đúng nội dung đã đóng gói trong một khung xem thử trên trang.

bản nhận đã chứa nội dung, ảnh, âm thanh và tài nguyên cần thiết. có thể gửi file đó hoặc đổi tên thành `index.html` để đưa lên web tĩnh. tên và lời nhắn trong bản đã xuất không phụ thuộc vào bản nháp của người tạo.

vé hẹn được vẽ bằng canvas thành PNG 1200 × 700, có tên Thuwcutie và Híu húi, lời hẹn, ngày 20/10 và dòng “lần tới mình gặp nhau”. tên file là `ve-hen-Thuwcutie.png`. liên kết tải dự phòng dùng cùng ảnh với thao tác tải tự động.

đóng trang sẽ làm các liên kết Blob tạm thời hết hiệu lực. file đã tải về vẫn là file riêng; cần tải trước khi đóng trang nếu muốn giữ thiệp hoặc vé.

## lựa chọn và dữ liệu được lưu ở đâu

tiến độ đọc thư, các lựa chọn trong lời hẹn và bản nháp chỉ được giữ trong trình duyệt đang dùng. Híu húi không nhận được thông báo khi Thư bấm một lựa chọn, và lựa chọn đó không tự đồng bộ sang máy khác. nếu muốn chia sẻ phản hồi, người nhận có thể gửi vé hoặc nhắn lại trong cuộc trò chuyện của hai người.

trang không gửi ảnh, ghi âm hay phản hồi lên một API. việc thêm file trong editor là đưa file vào tấm thiệp, không phải tải lên máy chủ. khi chủ động đăng html lên một dịch vụ web, những nội dung đã nhúng sẽ được phân phối cùng trang đó.

nếu trình duyệt không cho phép lưu cục bộ hoặc bản nháp quá lớn, phần lưu có thể báo không giữ được bản nháp. tải bản html để giữ những thay đổi đang có. mở trang ở thiết bị khác, chế độ riêng tư hoặc sau khi xóa dữ liệu trình duyệt có thể không còn tiến độ và lựa chọn trước đó.

## sửa mã nguồn và build

| file | vai trò |
| --- | --- |
| `src/index.html` | cấu trúc trang, phong thư, editor và các dialog |
| `src/styles.css` | bố cục, chữ, màu và chuyển động cơ bản |
| `src/living.css` | cảnh nhận bưu kiện, buổi tối và các hiệu ứng của bản v3 |
| `src/app.js` | dữ liệu thiệp, đọc thư, editor, lưu cục bộ, nhạc và xuất html |
| `src/living.js` | tương tác mở đầu và các trạng thái trải nghiệm v3 |
| `src/sound.js` | tiếng động ngắn, phát giọng nhân vật hoặc ghi âm và dọn trạng thái âm thanh |
| `src/audio-editor.js` | nhận, kiểm tra và nhúng bản ghi âm người gửi hoặc clip thay thế |
| `src/ticket.js` | tạo vé PNG bằng canvas, xuống dòng và tải ảnh |
| `src/config.json` | nội dung mặc định của món quà |
| `dist/assets/` | hình, phông chữ và các tài nguyên nguồn để build |
| `dist/assets/voices/` | các đoạn âm thanh preview LINE và hồ sơ nguồn |
| `dist/assets/motions/` | APNG tương ứng với ba nhân vật |
| `build.py` | ghép và nhúng tài nguyên vào `dist/index.html` |

tại thư mục dự án, chạy:

```bash
python build.py
```

nếu hệ thống dùng tên lệnh `python3`, chạy `python3 build.py`; trên Windows có Python Launcher có thể dùng `py build.py`. bước build chỉ dùng thư viện chuẩn Python, không cần npm hay cài package Python. các file tài nguyên nguồn phải có mặt trước khi build.

sau khi build, mở lại `dist/index.html`. đây là đầu ra dành cho người soạn: mở “viết thiệp”, kiểm tra nội dung và xuất một bản html mới cho người nhận. đổi tên bản xuất thành `index.html` để thay bản ở gốc dự án hoặc đưa lên hosting. bước build không tự cập nhật bản nhận `index.html` ở gốc. giữ `src/`, `build.py` và `dist/assets/` để sửa và build các phiên bản sau.

### khi đổi nội dung mặc định

sửa `src/config.json` và những nhãn HTML liên quan. các câu kể dùng “tớ/cậu”, tên trên bưu kiện là `Thuwcutie`, còn chữ ký là `Híu húi`.

nếu bản nháp cũ vẫn hiện sau khi đổi mặc định, tăng trường `id` của cấu hình và fallback tương ứng để tạo một phiên bản lưu mới. tiến độ được gắn với từng nội dung thiệp. các bản html đã xuất trước đó giữ nguyên nội dung cũ, vì vậy cần xuất lại sau khi sửa.

các module phải được ghép vào cùng `script#site-script` của bản đóng gói. bộ xuất loại bỏ script và giao diện tạm không thuộc bản nhận; thêm script ngoài bundle có thể khiến chức năng đó thiếu trong file xuất.

## đưa lên GitHub Pages

trong gói này, `index.html` ở gốc đã là bản gửi Thư sẵn để đăng. nếu vừa chỉnh sửa món quà, dùng bản html mới xuất và đổi tên thành `index.html`. cũng có thể đăng `dist/index.html` bằng cách đặt nó ở gốc thư mục xuất bản, nhưng file đó giữ giao diện của người soạn; bản nhận đã xuất giữ đúng nội dung đã gói và bỏ phần soạn thiệp.

1. tạo hoặc mở repository trên GitHub.
2. đặt `index.html` ở gốc repository; có thể thêm file rỗng `.nojekyll` để phục vụ bộ file tĩnh đã build.
3. mở `Settings → Pages`.
4. trong `Build and deployment`, chọn `Deploy from a branch`; chọn nhánh chứa file, thường là `main`, và thư mục `/(root)`, rồi lưu.
5. đợi workflow triển khai hoàn tất. lấy địa chỉ ở phần Pages.
6. bật `Enforce HTTPS` nếu tùy chọn này có thể chọn.

GitHub Pages cần `index.html` ở gốc thư mục xuất bản. nếu chọn `/(root)`, đặt `index.html` ngay ở gốc repository. hướng dẫn chính thức: [tạo trang](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site), [chọn nguồn xuất bản](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [bật HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).

với GitHub Free, Pages dùng repository công khai. trang Pages thông thường có thể được xem công khai trên internet, vì vậy chọn đúng bản thiệp bạn muốn chia sẻ trước khi đăng.

## đưa lên VPS với Nginx

ví dụ này dùng VPS đã cài Nginx, có quyền quản trị và có tên miền trỏ tới VPS. thay `user`, `ip-vps` và `thu.example.com` bằng thông tin của bạn.

trên máy chứa `index.html`, chuyển file lên VPS:

```bash
scp index.html user@ip-vps:/tmp/chiikawa-index.html
```

trên VPS, tạo thư mục web và đặt file vào đó:

```bash
sudo install -d -m 755 /var/www/chiikawa
sudo install -m 644 /tmp/chiikawa-index.html /var/www/chiikawa/index.html
```

thêm server block vào nơi Nginx đang nạp cấu hình trong khối `http`. ví dụ `/etc/nginx/conf.d/chiikawa.conf` nếu cấu hình của máy đã include thư mục này:

```nginx
server {
    listen 80;
    server_name thu.example.com;

    root /var/www/chiikawa;
    index index.html;
    charset utf-8;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

kiểm tra và nạp lại cấu hình:

```bash
sudo nginx -t
sudo nginx -s reload
```

kiểm tra tên miền trả về trang; sau đó cấu hình chứng chỉ TLS tại Nginx hoặc reverse proxy đang dùng và gửi đường dẫn HTTPS. server block trên là ví dụ HTTP để kiểm tra việc phục vụ file. cách dùng `root`, server block và reload được mô tả trong [hướng dẫn Nginx](https://nginx.org/en/docs/beginners_guide.html); `try_files` có [tài liệu riêng](https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files).

## mở bằng file hay đường link

bản html đã đóng gói có thể chạy khi mở trực tiếp bằng trình duyệt. để gửi bằng điện thoại, ưu tiên đường link HTTPS: người nhận mở được trang trong trình duyệt, thay vì gặp màn hình xem trước file của ứng dụng nhắn tin. HTTPS vẫn giữ cơ chế âm thanh cần thao tác của người dùng; trang sẽ không tự bỏ qua lựa chọn yên lặng.

nếu nhạc hoặc một định dạng ghi âm chưa phát trên trình duyệt đang dùng, thử mở trang bằng trình duyệt đầy đủ và nhấn nút âm thanh tương ứng. ảnh động tuân theo khả năng hỗ trợ APNG của trình duyệt. thiết lập giảm chuyển động được tôn trọng trong các hiệu ứng của trang.

## nguồn tài nguyên

đây là món quà fan-made cá nhân. nhân vật và tài nguyên Chiikawa thuộc chủ sở hữu tương ứng; câu chuyện bưu điện và lời nhắn là nội dung của món quà. chi tiết nguồn hình, minh họa bưu điện, font, audio preview và APNG được lưu trong [asset-provenance.md](asset-provenance.md).
