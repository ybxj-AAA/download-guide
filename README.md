# 下载引导页模板（download-guide）

可配置广告位的静态下载引导页：文件信息卡 + 限速倒计时 + 下载按钮 + 3 个广告位。
纯 HTML/CSS/JS，零依赖，丢到任何静态托管上就能跑。

在线预览：https://ybxj-aaa.github.io/download-guide/

## 改什么

全部配置集中在 **`assets/config.js`**：

```js
window.SITE_CONFIG = {
  brand: '资源下载中心',
  file: { name, icon, size, version, updated, desc, badge },
  downloadUrl: 'https://...',   // 直链或网盘页
  countdownSeconds: 5,
  speedText: '120 KB/s',
  ads: {
    top: '<a href="..."><img src="..." alt=""></a>',
    side1: '',
    side2: ''
  },
  adClickBeacon: ''   // 选填，广告点击上报
};
```

## 广告位

| 位置 | 键名 | 建议尺寸 |
|---|---|---|
| 文件卡下方横幅 | `ads.top` | 728×90 |
| 下载按钮下方左 | `ads.side1` | 300×250 |
| 下载按钮下方右 | `ads.side2` | 300×250 |

填 HTML 字符串即可，`<a>`、`<img>`、`<iframe>`、联盟 `<ins>` 都支持。不填就是虚线占位框。

## 安全约定

- `downloadUrl` 只放行 `http/https/mailto`，`javascript:` 等协议会被丢弃
- 页面默认 `noindex, nofollow`，避免引导页被搜索引擎收录造成降权
- 倒计时结束前按钮不可点击，防止误触

## 部署

推送到 `main` 分支，仓库设置里 Pages 选 main / root 即可。
