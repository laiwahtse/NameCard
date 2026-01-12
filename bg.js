(function(){
  var changeBgBtn = document.getElementById('changeBgBtn');
  var bgInput = document.getElementById('bgImageInput');
  var cardEl = document.getElementById('cardPreview');
  var currentBgUrl = null;
  var LS_KEY = 'namecard_bg_data';
  var LS_SRC = 'namecard_bg_src';
  var LS_FIT = 'namecard_bg_fit';
  var LS_OVERLAY = 'namecard_bg_overlay';
  var LS_TEXT_Y = 'namecard_text_offset_y';
  var LS_BG_OFF_X = 'namecard_bg_off_x';
  var LS_BG_OFF_Y = 'namecard_bg_off_y';
  // Per-field offset keys
  var POS_KEYS = {
    companyX: 'namecard_pos_company_x',
    companyY: 'namecard_pos_company_y',
    nameX: 'namecard_pos_name_x',
    nameY: 'namecard_pos_name_y',
    positionX: 'namecard_pos_position_x',
    positionY: 'namecard_pos_position_y',
    phoneX: 'namecard_pos_phone_x',
    phoneY: 'namecard_pos_phone_y',
    emailX: 'namecard_pos_email_x',
    emailY: 'namecard_pos_email_y',
    addressX: 'namecard_pos_address_x',
    addressY: 'namecard_pos_address_y',
    logoX: 'namecard_pos_logo_x',
    logoY: 'namecard_pos_logo_y'
  };
  var fitCoverEl = document.getElementById('bgFitCover');
  var fitContainEl = document.getElementById('bgFitContain');
  var overlayEl = document.getElementById('bgOverlay');
  var textOffsetEl = document.getElementById('textOffsetY');
  // Advanced positioning controls
  var posEls = {
    companyX: document.getElementById('posCompanyX'),
    companyY: document.getElementById('posCompanyY'),
    nameX: document.getElementById('posNameX'),
    nameY: document.getElementById('posNameY'),
    positionX: document.getElementById('posPositionX'),
    positionY: document.getElementById('posPositionY'),
    phoneX: document.getElementById('posPhoneX'),
    phoneY: document.getElementById('posPhoneY'),
    emailX: document.getElementById('posEmailX'),
    emailY: document.getElementById('posEmailY'),
    addressX: document.getElementById('posAddressX'),
    addressY: document.getElementById('posAddressY')
  };
  var resetBtn = document.getElementById('resetPositionsBtn');
  var toggleMoveBtn = document.getElementById('toggleMoveModeBtn');
  var toggleMoveBgBtn = document.getElementById('toggleMoveBgBtn');
  var moveMode = false;
  var moveBgMode = false;
  var bgMenu = document.getElementById('bgMenu');
  var bgUploadBtn = document.getElementById('bgUploadBtn');
  if (changeBgBtn && bgInput && cardEl) {
    changeBgBtn.addEventListener('click', function(){
      if (bgMenu) {
        bgMenu.style.display = (bgMenu.style.display === 'none' || !bgMenu.style.display) ? 'block' : 'none';
      } else {
        bgInput.click();
      }
    });
    if (bgUploadBtn) {
      bgUploadBtn.addEventListener('click', function(){ bgInput.click(); });
    }
    bgInput.addEventListener('change', function(){
      var f = bgInput.files && bgInput.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function(ev){
        var srcUrl = ev && ev.target ? ev.target.result : null;
        if (!srcUrl) return;
        try { if (window.localStorage) localStorage.setItem(LS_SRC, srcUrl); } catch(e){}
        var img = new Image();
        img.onload = function(){
          try {
            var w = Math.max(1, cardEl.clientWidth || cardEl.offsetWidth || 560);
            var h = Math.max(1, cardEl.clientHeight || cardEl.offsetHeight || 360);
            var maxW = 1600, maxH = 1200;
            if (w > maxW || h > maxH) {
              var r = Math.min(maxW / w, maxH / h);
              w = Math.max(1, Math.round(w * r));
              h = Math.max(1, Math.round(h * r));
            }
            var canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            var ctx = canvas.getContext('2d');
            // Paint a beige base so transparent PNGs don't turn black when saved
            ctx.fillStyle = '#f1e3d4';
            ctx.fillRect(0, 0, w, h);
            var scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
            var drawW = img.naturalWidth * scale;
            var drawH = img.naturalHeight * scale;
            var dx = (w - drawW) / 2;
            var dy = (h - drawH) / 2;
            ctx.drawImage(img, dx, dy, drawW, drawH);
            var outUrl = canvas.toDataURL('image/jpeg', 0.9);
            try { if (window.localStorage) localStorage.setItem(LS_KEY, outUrl); } catch(e){}
            applyBg(outUrl);
          } catch (e) {
            try { if (window.localStorage) localStorage.setItem(LS_KEY, srcUrl); } catch(_){}
            applyBg(srcUrl);
          }
        };
        img.src = srcUrl;
      };
      reader.readAsDataURL(f);
    });
  }
  function currentFit(){
    var v = 'cover';
    try { if (window.localStorage) v = localStorage.getItem(LS_FIT) || 'cover'; } catch(e){}
    return v === 'contain' ? 'contain' : 'cover';
  }
  function currentOverlay(){
    var v = 0.15;
    try {
      if (window.localStorage) {
        var raw = localStorage.getItem(LS_OVERLAY);
        if (raw != null && raw !== '') v = Math.max(0, Math.min(0.35, parseFloat(raw)));
      }
    } catch(e){}
    return v;
  }
  function applyBg(url){
    if (!cardEl) return;
    if (currentBgUrl) { try { URL.revokeObjectURL(currentBgUrl); } catch(e){} }
    currentBgUrl = null;
    var ov = currentOverlay();
    var fit = currentFit();
    var chosen = url || '';
    try {
      if (window.localStorage) {
        if (fit === 'contain') {
          chosen = localStorage.getItem('namecard_bg_src') || chosen;
        } else {
          chosen = localStorage.getItem('namecard_bg_data') || chosen;
        }
      }
    } catch(e){}
    cardEl.style.backgroundColor = '#f1e3d4';
    cardEl.style.backgroundImage = 'linear-gradient(rgba(0,0,0,'+ ov +'), rgba(0,0,0,'+ ov +')), url(' + chosen + ')';
    cardEl.style.backgroundSize = fit;
    var off = getBgOffset();
    cardEl.style.backgroundPosition = 'calc(50% + ' + off.x + 'px) calc(50% + ' + off.y + 'px)';
    cardEl.style.backgroundRepeat = 'no-repeat';
  }
  function getBgOffset(){
    var x = 0, y = 0;
    try {
      if (window.localStorage) {
        x = parseInt(localStorage.getItem(LS_BG_OFF_X) || '0', 10) || 0;
        y = parseInt(localStorage.getItem(LS_BG_OFF_Y) || '0', 10) || 0;
      }
    } catch(e){}
    return { x: clampOffset(x), y: clampOffset(y) };
  }
  function setBgOffset(x, y){
    x = clampOffset(x|0); y = clampOffset(y|0);
    try { if (window.localStorage) { localStorage.setItem(LS_BG_OFF_X, String(x)); localStorage.setItem(LS_BG_OFF_Y, String(y)); } } catch(e){}
  }
  function syncControls(){
    var fit = currentFit();
    if (fitCoverEl) fitCoverEl.checked = (fit === 'cover');
    if (fitContainEl) fitContainEl.checked = (fit === 'contain');
    var ov = currentOverlay();
    if (overlayEl) overlayEl.value = String(ov);
    if (textOffsetEl) {
      var oy = 0;
      try { if (window.localStorage) oy = parseInt(localStorage.getItem(LS_TEXT_Y) || '0', 10) || 0; } catch(e){}
      textOffsetEl.value = String(oy);
    }
    // Load per-field offsets to sliders
    for (var k in posEls) {
      if (!posEls.hasOwnProperty(k)) continue;
      var el = posEls[k];
      if (!el) continue;
      var storeKey = POS_KEYS[k];
      var v = 0;
      try { if (window.localStorage) v = parseInt(localStorage.getItem(storeKey) || '0', 10) || 0; } catch(e){}
      el.value = String(v);
    }
  }
  if (fitCoverEl) fitCoverEl.addEventListener('change', function(){
    if (fitCoverEl.checked) {
      try { if (window.localStorage) localStorage.setItem(LS_FIT, 'cover'); } catch(e){}
      var saved = null; try { if (window.localStorage) saved = localStorage.getItem(LS_KEY); } catch(e){}
      applyBg(saved || '');
    }
  });
  if (fitContainEl) fitContainEl.addEventListener('change', function(){
    if (fitContainEl.checked) {
      try { if (window.localStorage) localStorage.setItem(LS_FIT, 'contain'); } catch(e){}
      var saved = null; try { if (window.localStorage) saved = localStorage.getItem(LS_KEY); } catch(e){}
      applyBg(saved || '');
    }
  });
  if (overlayEl) overlayEl.addEventListener('input', function(){
    var val = Math.max(0, Math.min(0.35, parseFloat(overlayEl.value || '0.15')));
    try { if (window.localStorage) localStorage.setItem(LS_OVERLAY, String(val)); } catch(e){}
    var saved = null; try { if (window.localStorage) saved = localStorage.getItem(LS_KEY); } catch(e){}
    applyBg(saved || '');
  });
  function applyTextOffset(){
    if (!cardEl) return;
    var block = cardEl.querySelector('.design-text-block');
    if (!block) return;
    var oy = 0;
    try { if (window.localStorage) oy = parseInt(localStorage.getItem(LS_TEXT_Y) || '0', 10) || 0; } catch(e){}
    block.style.transform = 'translateY(' + oy + 'px)';
  }
  if (textOffsetEl) textOffsetEl.addEventListener('input', function(){
    var oy = parseInt(textOffsetEl.value || '0', 10) || 0;
    oy = Math.max(-120, Math.min(120, oy));
    try { if (window.localStorage) localStorage.setItem(LS_TEXT_Y, String(oy)); } catch(e){}
    applyTextOffset();
  });
  var MAX_OFFSET = 600;
  function clampOffset(n){ return Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, n|0)); }
  function applyFieldOffsets(){
    if (!cardEl) return;
    var map = {
      company: cardEl.querySelector('#designCompany'),
      name: cardEl.querySelector('#designName'),
      position: cardEl.querySelector('#designPosition'),
      phone: cardEl.querySelector('#designPhones'),
      email: cardEl.querySelector('#designEmail'),
      address: cardEl.querySelector('#designAddress'),
      nameLine: cardEl.querySelector('.design-name-line'),
      logo: cardEl.querySelector('.design-logo'),
      phoneIcon: (function(){ var t = cardEl.querySelector('#designPhones'); return t ? t.parentElement.querySelector('.design-contact-icon') : null; })(),
      emailIcon: (function(){ var t = cardEl.querySelector('#designEmail'); return t ? t.parentElement.querySelector('.design-contact-icon') : null; })(),
      addressIcon: (function(){ var t = cardEl.querySelector('#designAddress'); return t ? t.parentElement.querySelector('.design-contact-icon') : null; })()
    };
    function valOf(key){
      var v = 0; try { if (window.localStorage) v = parseInt(localStorage.getItem(key) || '0', 10) || 0; } catch(e){}
      return clampOffset(v);
    }
    var nameX = valOf(POS_KEYS.nameX);
    var nameY = valOf(POS_KEYS.nameY);
    if (map.company) map.company.style.transform = 'translate('+ valOf(POS_KEYS.companyX) +'px,'+ valOf(POS_KEYS.companyY) +'px)';
    if (map.name) map.name.style.transform = 'translate('+ nameX +'px,'+ nameY +'px)';
    if (map.position) map.position.style.transform = 'translate('+ valOf(POS_KEYS.positionX) +'px,'+ valOf(POS_KEYS.positionY) +'px)';
    if (map.phone) map.phone.style.transform = 'translate('+ valOf(POS_KEYS.phoneX) +'px,'+ valOf(POS_KEYS.phoneY) +'px)';
    if (map.email) map.email.style.transform = 'translate('+ valOf(POS_KEYS.emailX) +'px,'+ valOf(POS_KEYS.emailY) +'px)';
    if (map.address) map.address.style.transform = 'translate('+ valOf(POS_KEYS.addressX) +'px,'+ valOf(POS_KEYS.addressY) +'px)';
    if (map.nameLine) map.nameLine.style.transform = 'translate('+ nameX +'px,'+ nameY +'px)';
    if (map.logo) map.logo.style.transform = 'translate('+ valOf(POS_KEYS.logoX) +'px,'+ valOf(POS_KEYS.logoY) +'px)';
    if (map.phoneIcon) map.phoneIcon.style.transform = 'translate('+ valOf(POS_KEYS.phoneX) +'px,'+ valOf(POS_KEYS.phoneY) +'px)';
    if (map.emailIcon) map.emailIcon.style.transform = 'translate('+ valOf(POS_KEYS.emailX) +'px,'+ valOf(POS_KEYS.emailY) +'px)';
    if (map.addressIcon) map.addressIcon.style.transform = 'translate('+ valOf(POS_KEYS.addressX) +'px,'+ valOf(POS_KEYS.addressY) +'px)';
  }
  // Wire slider listeners
  Object.keys(posEls).forEach(function(key){
    var el = posEls[key];
    if (!el) return;
    el.addEventListener('input', function(){
      var v = clampOffset(parseInt(el.value || '0', 10) || 0);
      try { if (window.localStorage) localStorage.setItem(POS_KEYS[key], String(v)); } catch(e){}
      applyFieldOffsets();
    });
  });
  if (resetBtn) resetBtn.addEventListener('click', function(){
    // clear storage values
    try {
      if (window.localStorage) {
        Object.keys(POS_KEYS).forEach(function(k){ localStorage.removeItem(POS_KEYS[k]); });
        localStorage.removeItem(LS_TEXT_Y);
      }
    } catch(e){}
    // reset sliders
    for (var k in posEls) { if (posEls[k]) posEls[k].value = '0'; }
    if (textOffsetEl) textOffsetEl.value = '0';
    // re-apply
    applyTextOffset();
    applyFieldOffsets();
  });

  // --- Drag move mode ---
  function setMoveMode(on){
    moveMode = !!on;
    if (!cardEl) return;
    var targets = getDragTargets();
    Object.keys(targets).forEach(function(k){
      var el = targets[k].el;
      if (!el) return;
      el.style.cursor = moveMode ? 'move' : '';
      el.style.outline = '';
    });
    if (toggleMoveBtn) toggleMoveBtn.textContent = moveMode ? 'Done moving' : 'Move text';
    // refresh transforms so user sees current offsets immediately
    applyFieldOffsets();
  }
  function getDragTargets(){
    return {
      company: { el: cardEl ? cardEl.querySelector('#designCompany') : null, keyX: POS_KEYS.companyX, keyY: POS_KEYS.companyY },
      name: { el: cardEl ? cardEl.querySelector('#designName') : null, keyX: POS_KEYS.nameX, keyY: POS_KEYS.nameY },
      position: { el: cardEl ? cardEl.querySelector('#designPosition') : null, keyX: POS_KEYS.positionX, keyY: POS_KEYS.positionY },
      phone: { el: cardEl ? cardEl.querySelector('#designPhones') : null, keyX: POS_KEYS.phoneX, keyY: POS_KEYS.phoneY },
      email: { el: cardEl ? cardEl.querySelector('#designEmail') : null, keyX: POS_KEYS.emailX, keyY: POS_KEYS.emailY },
      address: { el: cardEl ? cardEl.querySelector('#designAddress') : null, keyX: POS_KEYS.addressX, keyY: POS_KEYS.addressY },
      logo: { el: cardEl ? cardEl.querySelector('.design-logo') : null, keyX: POS_KEYS.logoX, keyY: POS_KEYS.logoY }
    };
  }
  function readOffset(key){
    var v = 0; try { if (window.localStorage) v = parseInt(localStorage.getItem(key) || '0', 10) || 0; } catch(e){}
    return clampOffset(v);
  }
  function writeOffset(key, v){
    try { if (window.localStorage) localStorage.setItem(key, String(clampOffset(v|0))); } catch(e){}
  }
  var dragging = null;
  function onDown(e, keyX, keyY, el){
    if (!moveMode) return;
    e.preventDefault();
    var startX = e.clientX, startY = e.clientY;
    var baseX = readOffset(keyX), baseY = readOffset(keyY);
    dragging = { keyX: keyX, keyY: keyY, baseX: baseX, baseY: baseY, sx: startX, sy: startY, el: el };
    if (el) el.style.outline = '1px dashed #b7695c';
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }
  function onMove(e){
    if (!dragging) return;
    var dx = e.clientX - dragging.sx;
    var dy = e.clientY - dragging.sy;
    writeOffset(dragging.keyX, dragging.baseX + dx);
    writeOffset(dragging.keyY, dragging.baseY + dy);
    applyFieldOffsets();
  }
  function onUp(){
    if (dragging && dragging.el) dragging.el.style.outline = '';
    dragging = null;
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  }
  function wireDragTargets(){
    var targets = getDragTargets();
    Object.keys(targets).forEach(function(k){
      var t = targets[k]; if (!t.el) return;
      t.el.addEventListener('mousedown', function(ev){ onDown(ev, t.keyX, t.keyY, t.el); });
      // touch support (basic)
      t.el.addEventListener('touchstart', function(ev){
        if (!moveMode) return;
        var touch = ev.touches && ev.touches[0]; if (!touch) return;
        onDown({ preventDefault: function(){ ev.preventDefault(); }, clientX: touch.clientX, clientY: touch.clientY }, t.keyX, t.keyY, t.el);
      }, { passive: false });
      t.el.addEventListener('touchmove', function(ev){
        if (!dragging) return;
        var touch = ev.touches && ev.touches[0]; if (!touch) return;
        onMove({ clientX: touch.clientX, clientY: touch.clientY });
        ev.preventDefault();
      }, { passive: false });
      t.el.addEventListener('touchend', function(){ onUp(); });
    });
  }
  if (toggleMoveBtn) toggleMoveBtn.addEventListener('click', function(){ setMoveMode(!moveMode); });
  // Background drag mode
  function setMoveBgMode(on){
    moveBgMode = !!on;
    if (!cardEl) return;
    cardEl.style.cursor = moveBgMode ? 'move' : '';
    if (toggleMoveBgBtn) toggleMoveBgBtn.textContent = moveBgMode ? 'Done moving bg' : 'Move background';
    // refresh background position immediately
    try { if (window.localStorage) { var saved = localStorage.getItem(LS_KEY); if (saved) applyBg(saved); } } catch(_){}
  }
  var draggingBg = null;
  function onBgDown(e){
    if (!moveBgMode) return;
    e.preventDefault();
    var startX = e.clientX, startY = e.clientY;
    var off = getBgOffset();
    draggingBg = { sx: startX, sy: startY, bx: off.x, by: off.y };
    window.addEventListener('mousemove', onBgMove);
    window.addEventListener('mouseup', onBgUp);
  }
  function onBgMove(e){
    if (!draggingBg) return;
    var dx = e.clientX - draggingBg.sx;
    var dy = e.clientY - draggingBg.sy;
    setBgOffset(draggingBg.bx + dx, draggingBg.by + dy);
    // re-apply background with new offset
    try { if (window.localStorage) { var saved = localStorage.getItem(LS_KEY); if (saved) applyBg(saved); } } catch(_){}
  }
  function onBgUp(){
    draggingBg = null;
    window.removeEventListener('mousemove', onBgMove);
    window.removeEventListener('mouseup', onBgUp);
  }
  if (toggleMoveBgBtn) toggleMoveBgBtn.addEventListener('click', function(){ setMoveBgMode(!moveBgMode); });
  if (cardEl) {
    cardEl.addEventListener('mousedown', onBgDown);
    // touch basic
    cardEl.addEventListener('touchstart', function(ev){
      if (!moveBgMode) return; var t = ev.touches && ev.touches[0]; if (!t) return; onBgDown({ preventDefault: function(){ ev.preventDefault(); }, clientX: t.clientX, clientY: t.clientY });
    }, { passive: false });
    cardEl.addEventListener('touchmove', function(ev){
      if (!draggingBg) return; var t = ev.touches && ev.touches[0]; if (!t) return; onBgMove({ clientX: t.clientX, clientY: t.clientY }); ev.preventDefault();
    }, { passive: false });
    cardEl.addEventListener('touchend', function(){ onBgUp(); });
  }
  try {
    if (window.localStorage) {
      var saved = localStorage.getItem(LS_KEY);
      syncControls();
      if (saved) applyBg(saved);
      else { // still apply background position offset even if using default image
        applyBg('');
      }
      applyTextOffset();
      applyFieldOffsets();
      wireDragTargets();
    }
  } catch(e){}
})();
