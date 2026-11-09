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
    var firstCrumb = document.querySelectorAll('.crumb a')[0];
    if (firstCrumb) firstCrumb.textContent = C.brand;
  }

  /* ---------- 2. 文件信息 ---------- */
  text('fName', f.name);
  text('fSize', f.size);
  text('fVer', f.version);
  text('fDate', f.updated);
  text('fDesc', f.desc);
  text('crName', f.name);
  text('fIco', f.ext || 'ZIP');
  if (f.name) document.title = f.name + (C.brand ? ' - ' + C.brand : ' - 文件下载');

  /* ---------- 3. 广告位注入 ---------- */
  document.querySelectorAll('.ad-slot').forEach(function (box) {
    var key = box.getAttribute('data-slot');
    var html = ads[key];
    if (html && String(html).trim()) {
      box.insertAdjacentHTML('beforeend', html);
      box.setAttribute('data-filled', '');
      // 广告位内没有 <a> 时，整个广告位变成可点击链接
      if (!box.querySelector('a') && C.downloadUrl) {
        box.style.cursor = 'pointer';
        box.addEventListener('click', function (e) {
          if (e.target.closest('a')) return;
          window.open(C.downloadUrl, '_blank', 'noopener');
        });
      }
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

  /* ---------- 5. 倒计时 + 自动跳转 ---------- */
  var total = Math.max(0, parseInt(C.countdownSeconds, 10) || 0);
  text('gSpeed', C.speedText);

  var btn = $('dlBtn'), btnTxt = $('dlTxt'), bar = $('gBar'), cnt = $('gCount');
  var left = total;
  var jumped = false;

  function paint() {
    if (cnt) {
      cnt.innerHTML = left > 0
        ? '页面将在 <b>' + left + '</b> 秒后自动跳转'
        : '正在跳转…';
    }
    if (bar) bar.style.width = ((total - left) / (total || 1) * 100) + '%';
  }

  function unlock() {
    if (!btn) return;
    if (target) {
      btn.href = target;
      btn.setAttribute('aria-disabled', 'false');
      btnTxt.textContent = C.downloadText || '点击下载';
    } else {
      btnTxt.textContent = '下载地址未配置';
      btn.classList.add('dead');
    }
  }

  function autoJump() {
    if (jumped || !target) return;
    jumped = true;
    try {
      // 自动跳当前页，避免被浏览器当作弹窗拦截
      location.href = target;
    } catch (e) {
      window.open(target, '_blank', 'noopener');
    }
  }

  paint();
  if (left > 0) {
    var t = setInterval(function () {
      left -= 1;
      paint();
      if (left <= 0) {
        clearInterval(t);
        unlock();
        autoJump();
      }
    }, 1000);
  } else {
    unlock();
    autoJump();
  }

  /* 倒计时中禁止手动跳转 */
  if (btn) {
    btn.addEventListener('click', function (e) {
      if (btn.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      jumped = true;
    });
  }
  if (target) {
    document.addEventListener('visibilitychange', function () {
      // 用户切走了就不用再跳
      if (document.visibilityState === 'hidden') jumped = true;
    });
  }
})();
