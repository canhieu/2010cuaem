/* Small, deliberate interactions. The letter is always one tap away. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const characterNames = ['Chiikawa', 'Hachiware', 'Usagi'];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let hooks;
  let enabled = false;
  let evening = false;
  let currentNote = 0;
  let voiceJob = 0;
  let playingAt = '';
  let welcomeTimer;
  let welcomeFinished = false;
  let petTimer;
  let petTurn = 0;
  let lastPetAt = 0;
  let ticketURL = '';
  let ticketJob = 0;
  let ticketBusy = false;

  const gift = () => hooks?.getGift() || {};
  const sound = () => window.GiftSound;
  const still = (index) => document.querySelector(`[data-character-asset="${index}"]`)?.src || '';
  const animate = (element, name) => {
    if (!element || reducedMotion.matches) return;
    element.classList.remove(name);
    void element.offsetWidth;
    element.classList.add(name);
  };
  const syncEffects = () => {
    $('effectsToggle')?.setAttribute('aria-pressed', String(enabled));
    $('effectsToggle')?.setAttribute('aria-label', enabled ? 'tắt tiếng nhân vật và hiệu ứng' : 'bật tiếng nhân vật và hiệu ứng');
    if ($('effectsLabel')) $('effectsLabel').textContent = enabled ? 'tắt tiếng' : 'bật tiếng';
    document.body.dataset.effectsEnabled = String(enabled);
  };
  const setEnabled = (value) => {
    enabled = Boolean(value);
    sound()?.setEnabled(enabled);
    syncEffects();
  };
  const enableFromTap = () => {
    setEnabled(true);
    // Keep both calls in the original click handler for browser audio policies.
    sound()?.unlock();
  };
  const resetNoteImage = () => {
    if (!$('noteCharacter')) return;
    $('noteCharacter').classList.remove('is-speaking');
    const src = still(currentNote);
    if (src) $('noteCharacter').src = src;
  };
  const resetVoiceUI = (reason = 'stopped') => {
    playingAt = '';
    document.body.dataset.voiceState = reason;
    $('noteVoiceButton')?.classList.remove('is-playing');
    $('noteVoiceButton')?.setAttribute('aria-pressed', 'false');
    if ($('noteVoiceLabel')) $('noteVoiceLabel').textContent = `nghe lại ${characterNames[currentNote]}`;
    $('senderRecording')?.classList.remove('is-playing');
    $('senderVoiceButton')?.setAttribute('aria-pressed', 'false');
    if ($('senderVoiceLabel')) $('senderVoiceLabel').textContent = `nghe ${gift().sender || 'tớ'} một chút nhé`;
    resetNoteImage();
  };
  const stopVoice = () => {
    voiceJob += 1;
    sound()?.stopVoice();
    resetVoiceUI();
  };
  const playCharacter = (index, place) => {
    if (!enabled || !gift().voices?.[index]) return Promise.resolve(false);
    const job = ++voiceJob;
    playingAt = '';
    resetNoteImage();
    return sound().playVoice(gift().voices[index], {
      onStart: () => {
        if (job !== voiceJob) return;
        playingAt = place;
        document.body.dataset.voiceState = `${characterNames[index].toLowerCase()}:playing`;
        document.body.dataset.voiceStarts = String(Number(document.body.dataset.voiceStarts || 0) + 1);
        if (place === 'note' && currentNote === index && $('noteDialog')?.open) {
          $('noteVoiceButton')?.classList.add('is-playing');
          $('noteVoiceButton')?.setAttribute('aria-pressed', 'true');
          if ($('noteVoiceLabel')) $('noteVoiceLabel').textContent = `đang nghe ${characterNames[index]} · dừng`;
          if (gift().motionAssets?.[index] && !reducedMotion.matches && $('noteCharacter')) {
            $('noteCharacter').src = gift().motionAssets[index];
            $('noteCharacter').classList.add('is-speaking');
          }
        }
      },
      onEnd: (reason) => {
        if (job !== voiceJob) return;
        resetVoiceUI(reason);
        if (reason === 'blocked' || reason === 'error') {
          hooks.toast('chưa mở được tiếng chào. chạm nút nghe để thử lại nhé.');
        }
      }
    });
  };
  const renderNote = (index) => {
    currentNote = index;
    if ($('noteVoiceButton')) {
      $('noteVoiceButton').hidden = !gift().voices?.[index];
      $('noteVoiceButton').classList.remove('is-playing');
      $('noteVoiceButton').setAttribute('aria-pressed', 'false');
    }
    if ($('noteVoiceLabel')) $('noteVoiceLabel').textContent = `nghe lời chào của ${characterNames[index]}`;
  };
  const noteOpened = (index, fresh) => {
    stopVoice();
    currentNote = index;
    renderNote(index);
    animate($('noteDialog')?.querySelector('.note-paper'), 'paper-arrive');
    if (fresh) animate(document.querySelector(`[data-stamp="${index}"]`), 'stamp-in');
    sound()?.playEffect('paper');
    if (enabled) playCharacter(index, 'note');
  };
  const letterOpened = () => {
    stopVoice();
    sound()?.playEffect('paper');
    animate($('letterDialog')?.querySelector('.letter-paper'), 'paper-arrive');
    if ($('senderVoiceStatus')) $('senderVoiceStatus').textContent = '';
  };
  const render = () => {
    if (!hooks) return;
    if ($('senderRecording')) $('senderRecording').hidden = !gift().senderVoice;
    if (!playingAt && $('senderVoiceLabel')) $('senderVoiceLabel').textContent = `nghe ${gift().sender || 'tớ'} một chút nhé`;
    document.querySelectorAll('input[name="datePlan"]').forEach((input) => {
      input.checked = input.value === hooks.getDatePlan();
    });
  };
  const finishWelcome = (readLetter = false) => {
    clearTimeout(welcomeTimer);
    welcomeFinished = true;
    $('welcomeDialog')?.classList.remove('is-delivering');
    hooks.closeDialog($('welcomeDialog'));
    if (readLetter) hooks.openLetter();
    else {
      hooks.scrollToMail();
      document.querySelector('[data-open-note="0"]')?.focus({ preventScroll: true });
    }
  };
  const receive = (withSound) => {
    if (welcomeFinished || $('welcomeDialog')?.classList.contains('is-delivering')) return;
    if (withSound) {
      enableFromTap();
      hooks.startMusic?.();
      sound()?.playEffect('door');
      playCharacter(0, 'welcome');
    } else setEnabled(false);
    $('welcomeDialog')?.classList.add('is-delivering');
    ['enterSound', 'enterQuiet'].forEach((id) => { if ($(id)) $(id).disabled = true; });
    welcomeTimer = setTimeout(() => finishWelcome(false), reducedMotion.matches ? (withSound ? 2400 : 100) : (withSound ? 2400 : 1250));
  };
  const startWelcome = () => {
    if (!$('welcomeDialog') || !hooks) return;
    welcomeFinished = false;
    ['enterSound', 'enterQuiet'].forEach((id) => { if ($(id)) $(id).disabled = false; });
    hooks.showDialog($('welcomeDialog'));
  };
  const setScene = (value) => {
    evening = Boolean(value);
    document.body.dataset.evening = String(evening);
    $('sceneToggle')?.setAttribute('aria-pressed', String(evening));
    $('sceneToggle')?.setAttribute('aria-label', evening ? 'chuyển sang bưu điện ban ngày' : 'chuyển sang bưu điện buổi tối');
    if ($('sceneLabel')) $('sceneLabel').textContent = evening ? 'ban ngày' : 'buổi tối';
    const symbol = $('sceneToggle')?.querySelector('.scene-symbol');
    if (symbol) symbol.textContent = evening ? '☀' : '☾';
  };
  const clearTicket = () => {
    ticketJob += 1;
    if (ticketURL) URL.revokeObjectURL(ticketURL);
    ticketURL = '';
    if ($('ticketPreview')) $('ticketPreview').hidden = true;
    $('ticketPreviewImage')?.removeAttribute('src');
    $('ticketDownloadLink')?.removeAttribute('href');
    if ($('ticketStatus')) $('ticketStatus').textContent = '';
  };
  const downloadTicket = async () => {
    if (ticketBusy || !window.GiftTicket) return;
    ticketBusy = true;
    if ($('downloadTicket')) $('downloadTicket').disabled = true;
    const job = ++ticketJob;
    sound()?.playEffect('ticket');
    animate($('coupon'), 'unroll-ticket');
    if ($('ticketStatus')) $('ticketStatus').textContent = 'đang gói chiếc vé thành một tấm ảnh…';
    const details = gift();
    const first = hooks.getDatePlan() === 'walk' ? 'đi dạo trước, rồi mình xem phim' : 'xem phim trước, rồi đi dạo phố';
    try {
      const canvas = await window.GiftTicket.draw({
        recipient: details.recipient,
        sender: details.sender,
        occasion: details.occasion,
        plan: `${details.coupon}\n${first}`,
        characterSrc: still(0)
      });
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((value) => value ? resolve(value) : reject(new Error('png unavailable')), 'image/png');
      });
      // The recipient can change the plan while the font/image is loading.
      // Do not start a download until the captured plan is still current.
      if (job !== ticketJob) return;
      if (ticketURL) URL.revokeObjectURL(ticketURL);
      ticketURL = URL.createObjectURL(blob);
      if ($('ticketPreviewImage')) $('ticketPreviewImage').src = canvas.toDataURL('image/png');
      if ($('ticketPreview')) $('ticketPreview').hidden = false;
      if ($('ticketDownloadLink')) {
        $('ticketDownloadLink').href = ticketURL;
        $('ticketDownloadLink').download = 've-hen-Thuwcutie.png';
      }
      const anchor = document.createElement('a');
      anchor.href = ticketURL;
      anchor.download = 've-hen-Thuwcutie.png';
      anchor.hidden = true;
      (document.querySelector('dialog[open]') || document.body).append(anchor);
      try { anchor.click(); } finally { anchor.remove(); }
      if ($('ticketStatus')) $('ticketStatus').textContent = 'vé đã sẵn sàng ♡ nếu chưa tải được, giữ ảnh bên dưới để lưu nhé.';
    } catch (_) {
      if (job === ticketJob && $('ticketStatus')) $('ticketStatus').textContent = 'chưa tạo được ảnh vé. cậu chạm lưu ảnh vé để thử lại nhé.';
    } finally {
      ticketBusy = false;
      if ($('downloadTicket')) $('downloadTicket').disabled = false;
    }
  };
  const resetClone = (clone) => {
    const body = clone.querySelector('body');
    if (body) {
      body.dataset.evening = 'false';
      body.dataset.effectsEnabled = 'false';
      delete body.dataset.voiceState;
      delete body.dataset.voiceStarts;
      delete body.dataset.musicDucked;
    }
    clone.querySelectorAll('.is-playing, .is-speaking, .is-delivering, .is-cheering, .stamp-in, .paper-arrive, .unroll-ticket').forEach((element) => {
      element.classList.remove('is-playing', 'is-speaking', 'is-delivering', 'is-cheering', 'stamp-in', 'paper-arrive', 'unroll-ticket');
    });
    ['enterSound', 'enterQuiet', 'downloadTicket'].forEach((id) => clone.querySelector(`#${id}`)?.removeAttribute('disabled'));
    ['effectsToggle', 'sceneToggle', 'noteVoiceButton', 'senderVoiceButton'].forEach((id) => clone.querySelector(`#${id}`)?.setAttribute('aria-pressed', 'false'));
    const labels = { effectsLabel: 'bật tiếng', sceneLabel: 'buổi tối', petBubble: 'chạm để chào tớ ♡', ticketStatus: '', senderVoiceStatus: '' };
    Object.entries(labels).forEach(([id, value]) => { const element = clone.querySelector(`#${id}`); if (element) element.textContent = value; });
    const symbol = clone.querySelector('.scene-symbol');
    if (symbol) symbol.textContent = '☾';
    clone.querySelector('#ticketPreview')?.setAttribute('hidden', '');
    clone.querySelector('#ticketPreviewImage')?.removeAttribute('src');
    clone.querySelector('#ticketDownloadLink')?.removeAttribute('href');
    const art = clone.querySelector('#noteCharacter');
    if (art) { art.removeAttribute('src'); art.classList.remove('is-speaking'); }
    clone.querySelectorAll('input[name="datePlan"]').forEach((input) => {
      if (input.value === 'movie') input.setAttribute('checked', '');
      else input.removeAttribute('checked');
    });
  };
  const bind = (options) => {
    if (hooks) return;
    hooks = options;
    setEnabled(false);
    setScene(false);
    resetVoiceUI('idle');
    $('effectsToggle')?.addEventListener('click', () => {
      if (enabled) setEnabled(false);
      else { enableFromTap(); sound()?.playEffect('bell'); }
    });
    $('sceneToggle')?.addEventListener('click', () => { setScene(!evening); sound()?.playEffect('bell'); });
    $('enterSound')?.addEventListener('click', () => receive(true));
    $('enterQuiet')?.addEventListener('click', () => receive(false));
    $('welcomeSkip')?.addEventListener('click', () => { stopVoice(); finishWelcome(true); });
    $('welcomeDialog')?.addEventListener('close', () => {
      const finishedDelivery = welcomeFinished;
      clearTimeout(welcomeTimer);
      welcomeFinished = true;
      $('welcomeDialog')?.classList.remove('is-delivering');
      // Let a longer uploaded greeting finish after the delivery animation.
      // Manual dismissal also cancels a clip that is still waiting to start.
      if (!finishedDelivery) stopVoice();
    });
    $('noteVoiceButton')?.addEventListener('click', () => {
      if (playingAt === 'note') { stopVoice(); return; }
      enableFromTap();
      playCharacter(currentNote, 'note');
    });
    $('senderVoiceButton')?.addEventListener('click', () => {
      if (playingAt === 'sender') { stopVoice(); return; }
      if (!gift().senderVoice) return;
      enableFromTap();
      const job = ++voiceJob;
      sound().playVoice(gift().senderVoice, {
        onStart: () => {
          if (job !== voiceJob) return;
          playingAt = 'sender';
          document.body.dataset.voiceState = 'sender:playing';
          $('senderRecording')?.classList.add('is-playing');
          $('senderVoiceButton')?.setAttribute('aria-pressed', 'true');
          if ($('senderVoiceLabel')) $('senderVoiceLabel').textContent = 'đang nghe tớ · chạm để dừng';
          if ($('senderVoiceStatus')) $('senderVoiceStatus').textContent = '';
        },
        onEnd: (reason) => {
          if (job !== voiceJob) return;
          resetVoiceUI(reason);
          if (['error', 'blocked'].includes(reason) && $('senderVoiceStatus')) $('senderVoiceStatus').textContent = 'chạm nghe để thử lại nhé.';
        }
      });
    });
    $('petChiikawa')?.addEventListener('click', () => {
      if (Date.now() - lastPetAt < 500) return;
      lastPetAt = Date.now();
      const phrases = [
        `thư của ${gift().sender} vẫn ở đây nè ♡`,
        `${gift().recipient}, chạm đúng bưu tá rồi!`,
        'hôm nay cậu nhớ dành thời gian cho mình nhé.',
        'một chiếc vẫy tay gửi cậu từ xa ♡'
      ];
      if ($('petBubble')) $('petBubble').textContent = phrases[petTurn++ % phrases.length];
      animate($('petChiikawa'), 'is-cheering');
      if (enabled) playCharacter(0, 'pet');
      clearTimeout(petTimer);
      petTimer = setTimeout(() => {
        $('petChiikawa')?.classList.remove('is-cheering');
        if ($('petBubble')) $('petBubble').textContent = 'chạm để chào tớ ♡';
      }, 3600);
    });
    $('downloadTicket')?.addEventListener('click', downloadTicket);
    document.querySelectorAll('input[name="datePlan"]').forEach((input) => {
      input.addEventListener('change', () => {
        if (!input.checked) return;
        hooks.setDatePlan(input.value === 'walk' ? 'walk' : 'movie');
        clearTicket();
        sound()?.playEffect('stamp');
        if ($('ticketStatus')) $('ticketStatus').textContent = 'đã ghi lựa chọn trên vé ở máy cậu ♡';
      });
    });
    ['noteDialog', 'letterDialog', 'editorDialog', 'previewDialog'].forEach((id) => {
      $(id)?.addEventListener('close', () => {
        if (!document.querySelector('#noteDialog[open], #letterDialog[open]')) stopVoice();
      });
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) resetVoiceUI('hidden'); });
    reducedMotion.addEventListener?.('change', () => { if (reducedMotion.matches) resetNoteImage(); });
    window.addEventListener('pagehide', () => { clearTicket(); clearTimeout(petTimer); clearTimeout(welcomeTimer); });
    render();
  };
  window.LivingGift = {
    bind, render, renderNote, noteOpened, letterOpened, startWelcome, stopVoice, resetClone, clearTicket,
    couponKept: () => { sound()?.playEffect('stamp'); animate($('coupon'), 'unroll-ticket'); }
  };
})();
