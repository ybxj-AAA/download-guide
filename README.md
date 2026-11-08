# download-guide

下载引导页模板。纯 HTML / CSS / JS，无框架、无依赖。

在线：https://ybxj-aaa.github.io/download-guide/

## 改配置

只改 `assets/config.js`，其它文件不用动。

```js
window.SITE_CONFIG = {
  brand: '资源站',
  file: {
    name: 'xxx.zip',
    ext: 'ZIP',
    size: '128 MB',
    version: 'v1.0.0',
    updated: '2026-11-08',
    desc: '一句话说明。'
  },
  downloadUrl: '',        // 直链或网盘页
  downloadText: '立即下载',
  countdownSeconds: 5,
  speedText: '120 KB/s',
  ads: {
    top:   '',            // 横幅 728×90
    side1: '',            // 方块 300×250
    side2: ''
  },
  adClickBeacon: ''
};
```

填完 push，Pages 约 1 分钟自动重建。

## 广告位自适应

不给广告写死高度，只给 `min-height` 保底：

| 位置 | 保底高度 | 说明 |
|---|---|---|
| 横幅 `top` | `clamp(60px, 15vw, 92px)` | 窄屏变矮 |
| 方块 `side1/2` | `clamp(110px, 32vw, 250px)` | 手机 ≤620px 时上下堆叠 |

真实广告图或 iframe 撑高时自动跟随；`width: 100%` 自适应容器，不会溢出。
不填广告时显示等高的虚线占位，**不会把页面撑塌**。

## 安全

- `downloadUrl` 只放行 `http/https/mailto`
- 页面 `noindex, nofollow`
- 倒计时结束前按钮不可点

## 部署

GitHub Pages，源：`main` 分支根目录。
