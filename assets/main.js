/* =====================================================
   download-guide · 交互逻辑（零依赖，原生 JS）
   ===================================================== */
(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  var file = CFG.file || {};
  var ads = CFG.ads || {};

  function $(id) { return document.getElementById(id); }
  function setText(id, value) {
    var el = $(id);
    if (el && value) el.textContent = value;
  }

  /* ---------- 1. 渲染文件信息 ---------- */
  setText('fileName', file.name);
  setText('fileSize', file.size);
  setText('fileVersion', file.version);
  setText('fileUpdated', file.updated);
  setText('fileDesc', file.desc);
  setText('fileBadge', file.badge);
  setText('fileIco', file.icon);
  if (file.name) document.title = file.name + ' - 下载';

  var brandEl = document.querySelector('.brand span:last-child');
  if (brandEl && CFG.brand) brandEl.textContent = CFG.brand;
  var tagEl = document.querySelector('.topbar-note');
  if (tagEl && CFG.tagline) tagEl.textContent = CFG.tagline;

  /* ---------- 2. 渲染广告位 ---------- */
  var AD_SLOTS = { top: 'adTop', side1: 'adSide1', side2: 'adSide2' };
  Object.keys(AD_SLOTS).forEach(function (key) {
    var host = $(AD_SLOTS[key]);
    if (!host) return;
    var html = ads[key];
    if (html && html.trim()) {
      host.innerHTML = html;           // 广告主自己的 HTML，由站点主配置
      host.classList.add('ad-loaded');
    }
  });

  /* ---------- 3. 广告点击上报（可选） ---------- */
  function beacon(slot) {
    if (!CFG.adClickBeacon) return;
    try {
      var payload = JSON.stringify({ slot: slot, path: location.pathname, ts: Date.now() });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(CFG.adClickBeacon, payload);
      } else {
        fetch(CFG.adClickBeacon, { method: 'POST', body: payload, keepalive: true }).catch(function () {});
      }
    } catch (e) { /* 埋点失败不影响跳转 */ }
  }
  document.querySelectorAll('.ad').forEach(function (ad) {
    ad.addEventListener('click', function () {
      beacon(ad.querySelector('.ad-body') ? ad.querySelector('.ad-body').id : 'ad');
    }, true);
  });

  /* ---------- 4. 下载链接合法性校验 ---------- */
  function safeUrl(url) {
    if (!url) return '';
    try {
      var u = new URL(url, location.href);
      // 只放行 http/https/mailto，挡住 javascript: 等协议
      return (u.protocol === 'http:' || u.protocol === 'https:' || u.protocol === 'mailto:') ? u.href : '';
    } catch (e) { return ''; }
  }
  var target = safeUrl(CFG.downloadUrl);

  /* ---------- 5. 限速倒计时 ---------- */
  var total = Math.max(0, parseInt(CFG.countdownSeconds, 10) || 0);
  setText('speedText', CFG.speedText);
  var speedTipEl = document.querySelector('.speed-tip');
  if (speedTipEl && CFG.speedTip) speedTipEl.textContent = CFG.speedTip;

  var btn = $('downloadBtn');
  var btnText = $('btnText');
  var barFill = $('barFill');
  var countdownText = $('countdownText');
  var remain = total;

  function renderCountdown() {
    if (countdownText) {
      countdownText.innerHTML = remain > 0
        ? '正在准备下载链接：<b>' + remain + '</b> 秒'
        : '链接已就绪，可以下载了';
    }
    if (barFill) barFill.style.width = ((total - remain) / (total || 1) * 100) + '%';
  }

  function unlock() {
    if (!btn) return;
    if (target) {
      btn.href = target;
      btn.setAttribute('aria-disabled', 'false');
      btn.classList.add('ready');
      btnText.textContent = CFG.downloadText || '立即下载';
    } else {
      btnText.textContent = '下载地址未配置';
      btn.classList.add('disabled');
    }
  }

  renderCountdown();
  if (remain > 0) {
    var timer = setInterval(function () {
      remain -= 1;
      renderCountdown();
      if (remain <= 0) {
        clearInterval(timer);
        unlock();
      }
    }, 1000);
  } else {
    unlock();
  }

  /* ---------- 6. 防止倒计时期间误点 ---------- */
  if (btn) {
    btn.addEventListener('click', function (e) {
      if (btn.getAttribute('aria-disabled') === 'true') {
        e.preventDefault();
      }
    });
  }
  window.__DG_READY__ = function () { return target !== ''; };
})();
