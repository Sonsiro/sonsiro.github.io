# Sonsiro Apps Home

Trang chủ tải ứng dụng dạng Liquid Glass, chạy trực tiếp trên GitHub Pages.

## Đưa lên repo `Sonsiro/sonsiro`

Copy 3 file:
- `index.html`
- `style.css`
- `apps.js`

Sau đó vào **Settings → Pages**:
- Source: **Deploy from a branch**
- Branch: `main`
- Folder: `/ (root)`

### Thêm app
Mở `apps.js`, thêm một object vào mảng `apps`:

```js
{
  name:"Tên app",
  cat:"android",
  icon:"AB",
  desc:"Mô tả app",
  version:"v1.0.0",
  url:"https://link-tai-app-cua-ban.apk"
}
```

Nếu file APK cũng nằm trong repository, có thể dùng:
`url:"./downloads/app.apk"`

> Lưu ý: GitHub Pages phù hợp để làm trang web; file APK lớn nên dùng GitHub Releases nếu vượt giới hạn file thông thường.
