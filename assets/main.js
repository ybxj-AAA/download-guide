/* =========================================================
   download-guide · 交互
   原生 JS，无依赖
   ========================================================= */
(function () {
  'use strict';

  var C = window.SITE_CONFIG || {};
  var f = C.file || {};
  var ads = C.ads || {};

  function $(id) { return document.getElementById(id); }
  function text(id, v) {
    var el = $(id);
    if (el && v != null && v !== '') el.textContent = v;
  }

  /* ---------- 1. 站名 ---------- */
  if (C.brand) {
    text('brandName', C.brand);
    text('footBrand', C.brand);
    document.querySelectorAll('.crumb a')[0].textContent = C.brand;
  }

  /* ---------- 2. 文件信息 ---------- */
  text('fName', f.name);
  text('fSize', f.size);
  text('fVer', f.version);
  text('fDate', f.updated);
  text('fDesc', f.desc);
  text('crName', f.name);          // 面包屑最后一项
  text('fIco', f.ext || 'ZIP');    // 文件类型缩写
  if (f.name) document.title = f.name + (C.brand ? ' - ' + C.brand : ' - 文件下载');

  /* ---------- 3. 广告位注入 ----------
     ads.top / ads.side1 / ads.side2 可以是：
     - HTML 字符串（含 <a>/<img>/<iframe>/<ins>）
     - 空值 → 保留虚线占位，不塌陷
  ------------------------------------ */
  document.querySelectorAll('.ad-slot').forEach(function (box) {
    var key = box.getAttribute('data-slot');
    var html = ads[key];
    if (html && String(html).trim()) {
      box.insertAdjacentHTML('beforeend', html);
      box.setAttribute('data-filled', '');
    }
  });

  /* 广告点击统计（选填） */
  document.querySelectorAll('.ad-slot').forEach(function (box) {
    box.addEventListener('click', function () {
      if (!C.adClickBeacon) return;
      try {
        var body = JSON.stringify({ slot: box.getAttribute('data-slot'), path: location.pathname, ts: Date.now() });
        if (navigator.sendBeacon) navigator.sendBeacon(C.adClickBeacon, body);
        else fetch(C.adClickBeacon, { method: 'POST', body: body, keepalive: true }).catch(function () {});
      } catch (e) { /* 忽略 */ }
    }, true);
  });

  /* ---------- 4. 下载地址校验 ---------- */
  function safeUrl(url) {
    if (!url) return '';
    try {
      var u = new URL(url, location.href);
      if (u.protocol === 'http:' || u.protocol === 'https:' || u.protocol === 'mailto:') return u.href;
    } catch (e) { /* 非法地址 */ }
    return '';
  }
  var target = safeUrl(C.downloadUrl);

  /* ---------- 5. 倒计时 ---------- */
  var total = Math.max(0, parseInt(C.countdownSeconds, 10) || 0);
  text('gSpeed', C.speedText);

  var btn = $('dlBtn'), btnTxt = $('dlTxt'), bar = $('gBar'), cnt = $('gCount');
  var left = total;

  function paint() {
    if (cnt) {
      cnt.innerHTML = left > 0
        ? '链接生成中：<b>' + left + '</b> 秒'
        : '链接已就绪';
    }
    if (bar) bar.style.width = ((total - left) / (total || 1) * 100) + '%';
  }

  function unlock() {
    if (!btn) return;
    if (target) {
      btn.href = target;
      btn.setAttribute('aria-disabled', 'false');
      btnTxt.textContent = C.downloadText || '立即下载';
    } else {
      btnTxt.textContent = '下载地址未配置';
      btn.classList.add('dead');
    }
  }

  paint();
  if (left > 0) {
    var t = setInterval(function () {
      left -= 1;
      paint();
      if (left <= 0) { clearInterval(t); unlock(); }
    }, 1000);
  } else {
    unlock();
  }

  /* 倒计时中禁止跳转 */
  if (btn) {
    btn.addEventListener('click', function (e) {
      if (btn.getAttribute('aria-disabled') === 'true') e.preventDefault();
    });
  }
})();
