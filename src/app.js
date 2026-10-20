/* a small, entirely local post office. no accounts, uploads or requests. */
(() => {
  'use strict';

  const boot = () => {
    const $ = (id) => document.getElementById(id);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
    const names = ['chiikawa', 'hachiware', 'usagi'];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fallback = {
      "id": "chiikawa-gift-20-10-thuwcutie-v6",
      "recipient": "Thuwcutie",
      "sender": "Híu húi",
      "occasion": "20/10",
      "recipientMode": false,
      "photo": "",
      "voices": [
        "",
        "",
        ""
      ],
      "motionAssets": [
        "",
        "",
        ""
      ],
      "senderVoice": "",
      "notes": [
        {
          "title": "chúc Thư 20/10 vui nhé.",
          "text": "Thư ơi, 20/10 vui vẻ nhé.\n\nchúc cậu luôn khỏe, xinh xắn và có thật nhiều chuyện vui để kể tớ nghe. tớ biết cậu thích Chiikawa nhất nên hôm nay nhờ bạn ấy mang thư đến. mấy lời trong này là tớ dành riêng cho cậu đó."
        },
        {
          "title": "cứ muốn kể cậu nghe.",
          "text": "có chuyện gì vui, tớ muốn kể cậu nghe. thấy cái gì hay hay, tớ lại muốn gửi cho cậu.\n\ncó lúc cũng chẳng có chuyện gì, chỉ muốn nhắn cậu vài câu thôi."
        },
        {
          "title": "gặp nhau, mình đi chơi.",
          "text": "lần tới gặp nhau, mình đi xem phim nhé. cậu chọn phim, còn ăn gì thì hai đứa tính tiếp. xem xong mình đi dạo phố một vòng.\n\ntớ muốn được đi cạnh cậu, nghe cậu kể chuyện, rồi trêu cậu trực tiếp luôn. tớ mong có một buổi như thế với Thư lắm."
        }
      ],
      "coupon": "một buổi xem phim và dạo phố",
      "letter": "một năm rồi đó, Thư.\n\nbình thường hai đứa hay trêu nhau, nhưng hôm nay cho tớ nói nghiêm túc một chút nhé: tớ nhớ cậu.\n\ntớ muốn được ngồi cạnh cậu, nói chuyện một lúc lâu và dành hẳn một buổi cho hai đứa. tớ muốn có những hôm chỉ cần hỏi “đi chơi với tớ không?”, rồi mình có thể gặp nhau luôn. tớ mong đến lúc đó lắm.\n\nThư ơi, tớ xin lỗi vì đã nhiều lần làm cậu buồn. có những điều tớ đã làm chưa tốt với cậu, và tớ biết mình cần sửa những điều ấy.\n\ntớ thương cậu. tớ muốn lắng nghe cậu hơn, để ý đến cảm xúc của cậu hơn và cẩn thận hơn trong những lời mình nói. tớ mong những lúc có tớ, cậu sẽ thấy được quan tâm và yên tâm hơn. tớ muốn làm được điều đó từ những chuyện nhỏ mỗi ngày.\n\ncảm ơn cậu vì một năm qua nhé. tớ làm món quà này vì muốn cậu vui, và muốn cậu biết là tớ rất mong được gặp cậu.\n\n20/10 vui vẻ, Thuwcutie. gửi cậu một cái ôm trước nhé."
    };

    const cleanText = (value, defaultValue, max) => typeof value === 'string'
      ? value.trim().slice(0, max)
      : defaultValue;
    const safePhoto = (value) => typeof value === 'string'
      && value.length < 4_000_000
      && /^data:image\/(?:jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(value)
      ? value : '';
    const safeAudio = (value) => typeof value === 'string'
      && value.length < 4_300_000
      && /^data:audio\/(?:mpeg|mp3|mp4|x-m4a|wav|ogg|webm);base64,[a-zA-Z0-9+/=]+$/.test(value)
      ? value : '';
    const normalize = (raw, base = fallback) => {
      const value = raw && typeof raw === 'object' ? raw : {};
      return {
        id: cleanText(value.id, base.id, 100) || base.id,
        recipient: cleanText(value.recipient, base.recipient, 40) || base.recipient,
        sender: cleanText(value.sender, base.sender, 40) || base.sender,
        occasion: cleanText(value.occasion, base.occasion, 30) || base.occasion,
        letter: cleanText(value.letter, base.letter, 6000),
        notes: base.notes.map((note, index) => ({
          title: cleanText(value.notes?.[index]?.title, note.title, 160) || note.title,
          text: cleanText(value.notes?.[index]?.text, note.text, 3000)
        })),
        coupon: cleanText(value.coupon, base.coupon, 160),
        photo: safePhoto(value.photo),
        voices: [0, 1, 2].map((index) => typeof value.voices?.[index] === 'string'
          ? safeAudio(value.voices[index]) : safeAudio(base.voices?.[index])),
        motionAssets: [0, 1, 2].map((index) => safePhoto(value.motionAssets?.[index] || base.motionAssets?.[index])),
        senderVoice: typeof value.senderVoice === 'string' ? safeAudio(value.senderVoice) : safeAudio(base.senderVoice),
        recipientMode: value.recipientMode === true
      };
    };
    const readStorage = (key) => {
      try {
        const value = window.localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      } catch (_) { return null; }
    };
    const writeStorage = (key, value) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (_) { return false; }
    };
    let initial;
    try { initial = normalize(JSON.parse($('gift-config')?.textContent || '{}')); }
    catch (_) { initial = normalize(fallback); }
    const draftKey = `chiikawa-post-office:draft:v1:${initial.id}`;
    let gift = initial;
    if (!initial.recipientMode) {
      const storedDraft = readStorage(draftKey);
      if (storedDraft && typeof storedDraft === 'object') {
        gift = normalize(storedDraft, initial);
        gift.id = initial.id;
        gift.recipientMode = false;
      }
    }

    // a content fingerprint keeps reading progress tied to this actual gift.
    const fingerprint = (value) => {
      let hash = 2166136261;
      for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
      }
      return (hash >>> 0).toString(36);
    };
    const getProgressKey = () => `chiikawa-post-office:journey:v1:${gift.id}:${fingerprint(JSON.stringify(gift))}`;
    let progressKey = getProgressKey();
    const restored = readStorage(progressKey);
    let visited = new Set(Array.isArray(restored?.visited)
      ? restored.visited.filter((index) => [0, 1, 2].includes(index)) : []);
    let couponKept = restored?.couponKept === true;
    let datePlan = restored?.datePlan === 'walk' ? 'walk' : 'movie';
    let celebrated = restored?.celebrated === true;
    let currentNote = 0;
    let toastTimer;
    let celebrationTimer;
    let editorPhoto = gift.photo;
    let photoJob = 0;
    let pendingPhoto = Promise.resolve(true);
    let operationInFlight = false;
    let lastExportUrl = null;
    let lastExportHTML = '';
    let editorRevision = 0;

    const resetExportLinks = () => {
      editorRevision += 1;
      lastExportHTML = '';
      ['downloadReady', 'previewReady'].forEach((id) => {
        if ($(id)) { $(id).hidden = true; $(id).removeAttribute('href'); }
      });
    };

    const toast = (message) => {
      if ($('editorDialog')?.open && $('editorStatus')) $('editorStatus').textContent = message;
      const element = $('toast');
      if (!element) return;
      clearTimeout(toastTimer);
      element.textContent = message;
      element.hidden = false;
      element.classList.add('is-visible');
      toastTimer = setTimeout(() => element.classList.remove('is-visible'), 4300);
    };
    const saveProgress = () => writeStorage(progressKey, {
      visited: [...visited], couponKept, celebrated, datePlan
    });
    const scrollToMail = () => $('mailboxShelf')?.scrollIntoView({
      behavior: reducedMotion.matches ? 'instant' : 'smooth',
      block: 'start'
    });

    const renderCoupon = () => {
      if ($('couponText')) $('couponText').textContent = gift.coupon;
      if ($('couponStatus')) $('couponStatus').textContent = couponKept
        ? 'đã cất lời hẹn này trong thiệp ♡' : '';
      if ($('keepCoupon')) {
        $('keepCoupon').disabled = couponKept;
        $('keepCoupon').textContent = couponKept ? 'đã cất lời hẹn ♡' : 'giữ lời hẹn này';
      }
    };
    const renderProgress = () => {
      $$('[data-open-note]').forEach((button) => {
        const index = Number(button.dataset.openNote);
        const hasRead = visited.has(index);
        button.classList.toggle('is-opened', hasRead);
        if (gift.notes[index]) {
          button.setAttribute('aria-label', `${names[index]}: ${gift.notes[index].title}${hasRead ? ', đã mở' : ''}`);
        }
        const status = button.querySelector('[data-note-status]');
        if (status) status.textContent = hasRead ? 'đã mở thư' : 'chạm để mở';
      });
      $$('[data-stamp]').forEach((stamp) => {
        const index = Number(stamp.dataset.stamp);
        stamp.classList.toggle('is-stamped', visited.has(index));
        stamp.setAttribute('aria-label', `tem ${names[index]}${visited.has(index) ? ', đã nhận' : ', chưa nhận'}`);
      });
      if ($('stampCount')) $('stampCount').textContent = `${visited.size} / 3`;
      if ($('progressText')) $('progressText').textContent = visited.size === 3
        ? 'đủ ba con tem rồi. lá thư cuối đang chờ Thư ♡'
        : visited.size === 0
          ? 'Chiikawa và hai người bạn đang giữ thư cho Thư.'
          : `đã nhận ${visited.size} con tem, còn ${3 - visited.size} lời nhắn đang chờ.`;
      if ($('deliveryProgress')) {
        $('deliveryProgress').max = 3;
        $('deliveryProgress').value = visited.size;
      }
      if ($('finalLetterButton')) $('finalLetterButton').disabled = false;
      const finalLabel = document.querySelector('[data-final-label]');
      if (finalLabel) finalLabel.textContent = visited.size === 3 ? 'nhận lá thư cuối ♡' : 'đọc lá thư cuối';
      if ($('resetJourney')) $('resetJourney').hidden = visited.size === 0 && !couponKept;
      renderCoupon();
    };
    const renderGift = () => {
      $$('[data-recipient]').forEach((element) => { element.textContent = gift.recipient; });
      $$('[data-sender]').forEach((element) => { element.textContent = gift.sender; });
      $$('[data-occasion]').forEach((element) => { element.textContent = gift.occasion; });
      if ($('letterText')) $('letterText').textContent = gift.letter;
      if ($('letterGreeting')) $('letterGreeting').textContent = `gửi ${gift.recipient},`;
      if ($('letterSignature')) $('letterSignature').textContent = `hẹn gặp cậu,\n${gift.sender}`;
      if ($('giftPhoto')) {
        if (gift.photo) $('giftPhoto').src = gift.photo;
        else $('giftPhoto').removeAttribute('src');
        $('giftPhoto').alt = `tấm ảnh ${gift.sender} gửi ${gift.recipient}`;
      }
      if ($('photoFrame')) $('photoFrame').hidden = !gift.photo;
      if ($('defaultMemory')) $('defaultMemory').hidden = Boolean(gift.photo);
      if ($('personalizeButton')) $('personalizeButton').hidden = gift.recipientMode;
      $$('[data-editor-only]').forEach((element) => { element.hidden = gift.recipientMode; });
      document.documentElement.dataset.recipientMode = String(gift.recipientMode);
      renderProgress();
      window.LivingGift?.render(gift);
    };

    const dialogOpeners = new WeakMap();
    const closeDialog = (dialog) => {
      if (!dialog) return;
      if (typeof dialog.close === 'function') dialog.close();
      else {
        dialog.removeAttribute('open');
        document.body.classList.remove('dialog-open');
      }
    };
    const showDialog = (dialog) => {
      if (!dialog || dialog.open) return;
      window.LivingGift?.stopVoice();
      const active = document.activeElement;
      const previousDialog = active?.closest('dialog');
      const opener = previousDialog ? dialogOpeners.get(previousDialog) || $('startDelivery') : active;
      $$('dialog[open]').forEach((other) => closeDialog(other));
      dialogOpeners.set(dialog, opener);
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else {
        dialog.setAttribute('open', '');
        dialog.querySelector('button, input, [tabindex]')?.focus();
      }
      document.body.classList.add('dialog-open');
    };
    $$('dialog').forEach((dialog) => {
      dialog.addEventListener('close', () => {
        if (!document.querySelector('dialog[open]')) document.body.classList.remove('dialog-open');
        const opener = dialogOpeners.get(dialog);
        if (opener?.isConnected && !document.querySelector('dialog[open]')) {
          opener.focus({ preventScroll: true });
        }
      });
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const surface = dialog.querySelector('[data-dialog-surface]') || dialog.firstElementChild || dialog;
        const rect = surface.getBoundingClientRect();
        const outside = event.clientX < rect.left || event.clientX > rect.right
          || event.clientY < rect.top || event.clientY > rect.bottom;
        if (outside) closeDialog(dialog);
      });
    });

    const celebrate = () => {
      if (celebrated) return;
      celebrated = true;
      saveProgress();
      const container = $('celebration');
      if (!container || reducedMotion.matches) return;
      clearTimeout(celebrationTimer);
      container.replaceChildren();
      const colors = ['#f2aabd', '#a8cde8', '#edce87', '#b8c9a6'];
      const fragment = document.createDocumentFragment();
      for (let index = 0; index < 22; index += 1) {
        const piece = document.createElement('i');
        piece.className = 'confetti-piece';
        piece.dataset.transient = '';
        piece.style.setProperty('--x', `${7 + Math.random() * 86}%`);
        piece.style.setProperty('--delay', `${Math.random() * 400}ms`);
        piece.style.setProperty('--rotation', `${Math.floor(Math.random() * 600) - 300}deg`);
        piece.style.setProperty('--color', colors[index % colors.length]);
        fragment.append(piece);
      }
      container.append(fragment);
      celebrationTimer = setTimeout(() => container.replaceChildren(), 3600);
    };
    const renderNote = (index) => {
      currentNote = index;
      const note = gift.notes[index];
      if (!note) return;
      const art = document.querySelector(`[data-character-asset="${index}"]`);
      if ($('noteCharacter') && art) {
        $('noteCharacter').src = art.currentSrc || art.src;
        $('noteCharacter').alt = names[index];
      }
      if ($('noteDialog')) $('noteDialog').dataset.note = String(index);
      if ($('noteEyebrow')) $('noteEyebrow').textContent = `${names[index]} · phong thư số 0${index + 1}`;
      if ($('noteTitle')) $('noteTitle').textContent = note.title;
      if ($('noteText')) $('noteText').textContent = note.text;
      if ($('coupon')) $('coupon').hidden = index !== 2;
      renderCoupon();
      if ($('noteNext')) $('noteNext').textContent = visited.size < 3
        ? 'mở phong thư tiếp theo' : 'đọc lá thư cuối ♡';
      const scrollSurface = $('noteDialog')?.querySelector('[data-dialog-surface]');
      if (scrollSurface) scrollSurface.scrollTop = 0;
      if ($('noteDialog')) $('noteDialog').scrollTop = 0;
      window.LivingGift?.renderNote(index);
    };
    const openNote = (index) => {
      if (![0, 1, 2].includes(index)) return;
      const alreadyOpen = $('noteDialog')?.open;
      const fresh = !visited.has(index);
      visited.add(index);
      saveProgress();
      renderNote(index);
      renderProgress();
      showDialog($('noteDialog'));
      window.LivingGift?.noteOpened(index, fresh);
      if (alreadyOpen && $('noteTitle')) {
        $('noteTitle').tabIndex = -1;
        $('noteTitle').focus({ preventScroll: true });
      }
      if (visited.size === 3) celebrate();
    };
    const openLetter = () => {
      renderGift();
      showDialog($('letterDialog'));
      window.LivingGift?.letterOpened();
      if ($('letterDialog')) $('letterDialog').scrollTop = 0;
      celebrate();
    };

    $$('[data-open-note]').forEach((button) => button.addEventListener('click', () => openNote(Number(button.dataset.openNote))));
    $('noteClose')?.addEventListener('click', () => closeDialog($('noteDialog')));
    $('letterClose')?.addEventListener('click', () => closeDialog($('letterDialog')));
    $('noteNext')?.addEventListener('click', () => {
      const next = [1, 2, 3].map((offset) => (currentNote + offset) % 3).find((index) => !visited.has(index));
      if (next === undefined) openLetter();
      else openNote(next);
    });
    const letterButtons = new Set([$('finalLetterButton'), $('readLetterNow'), ...$$('[data-open-letter]')].filter(Boolean));
    letterButtons.forEach((button) => button.addEventListener('click', openLetter));
    $('startDelivery')?.addEventListener('click', scrollToMail);
    $('backToLetters')?.addEventListener('click', () => { closeDialog($('letterDialog')); scrollToMail(); });
    $('keepCoupon')?.addEventListener('click', () => {
      couponKept = true;
      saveProgress();
      renderCoupon();
      window.LivingGift?.couponKept();
      toast('lời hẹn đã được cất trong thiệp ♡');
    });
    $('resetJourney')?.addEventListener('click', () => {
      visited = new Set(); couponKept = false; celebrated = false; datePlan = 'movie';
      window.LivingGift?.clearTicket();
      saveProgress(); renderProgress(); scrollToMail();
      window.LivingGift?.render();
      toast('mình mở bưu kiện từ đầu nhé ♡');
    });

    const setPhotoStatus = (message) => {
      if ($('photoStatus')) $('photoStatus').textContent = message;
    };
    const updatePhotoPreview = () => {
      if ($('editorPhotoPreview')) {
        if (editorPhoto) $('editorPhotoPreview').src = editorPhoto;
        else $('editorPhotoPreview').removeAttribute('src');
        $('editorPhotoPreview').hidden = !editorPhoto;
      }
      if ($('removePhoto')) $('removePhoto').hidden = !editorPhoto;
    };
    const openEditor = () => {
      if (gift.recipientMode || !$('editorDialog')) return;
      if ($('editorStatus')) $('editorStatus').textContent = '';
      const values = {
        recipientInput: gift.recipient, senderInput: gift.sender, occasionInput: gift.occasion,
        letterInput: gift.letter, couponInput: gift.coupon,
        note0Input: gift.notes[0].text, note1Input: gift.notes[1].text, note2Input: gift.notes[2].text
      };
      Object.entries(values).forEach(([id, value]) => {
        if ($(id)) { $(id).value = value; $(id).setCustomValidity(''); }
      });
      photoJob += 1;
      editorPhoto = gift.photo;
      pendingPhoto = Promise.resolve(true);
      if ($('photoInput')) $('photoInput').value = '';
      updatePhotoPreview();
      setPhotoStatus(editorPhoto ? 'ảnh đã nằm trong thiệp.' : 'thêm một tấm ảnh của hai người, nếu bạn muốn.');
      window.GiftAudioEditor?.open(gift);
      showDialog($('editorDialog'));
    };
    $('personalizeButton')?.addEventListener('click', openEditor);
    $('editorClose')?.addEventListener('click', () => closeDialog($('editorDialog')));
    ['recipientInput', 'senderInput', 'occasionInput', 'letterInput', 'couponInput', 'note0Input', 'note1Input', 'note2Input'].forEach((id) => {
      $(id)?.addEventListener('input', () => {
        $(id).setCustomValidity('');
        resetExportLinks();
      });
    });
    const revealField = (field) => {
      let details = field?.closest('details');
      while (details) {
        details.open = true;
        details = details.parentElement?.closest('details');
      }
    };
    // native required validation runs before submit; reveal a folded field first.
    $('giftForm')?.addEventListener('invalid', (event) => revealField(event.target), true);

    const resizePhoto = (file) => new Promise((resolve, reject) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        reject(new Error('chọn ảnh jpg, png hoặc webp nhé.')); return;
      }
      if (file.size > 8 * 1024 * 1024) {
        reject(new Error('ảnh hơi lớn. chọn ảnh nhỏ hơn 8 mb nhé.')); return;
      }
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        try {
          if (!image.naturalWidth || !image.naturalHeight) throw new Error('ảnh này chưa đọc được. thử một ảnh khác nhé.');
          const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
          const context = canvas.getContext('2d');
          if (!context) throw new Error('trình duyệt chưa xử lý được ảnh. thử một ảnh khác nhé.');
          context.fillStyle = '#fff8ef';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          const result = canvas.toDataURL('image/jpeg', 0.86);
          if (!safePhoto(result)) throw new Error('ảnh này chưa xử lý được. thử một ảnh nhỏ hơn nhé.');
          resolve(result);
        } catch (error) { reject(error); }
        finally { URL.revokeObjectURL(url); }
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('ảnh này chưa đọc được. thử một ảnh khác nhé.'));
      };
      image.src = url;
    });
    $('photoInput')?.addEventListener('change', () => {
      const file = $('photoInput').files?.[0];
      if (!file) return;
      resetExportLinks();
      const job = ++photoJob;
      setPhotoStatus('đang đặt ảnh vào thiệp…');
      pendingPhoto = resizePhoto(file).then((data) => {
        if (job !== photoJob) return true;
        editorPhoto = data;
        updatePhotoPreview();
        setPhotoStatus('ảnh đã sẵn sàng. ảnh chỉ nằm trong thiệp của bạn.');
        return true;
      }).catch((error) => {
        if (job === photoJob) {
          setPhotoStatus(error.message);
          toast(error.message);
          $('photoInput').value = '';
          if ($('removePhoto')) $('removePhoto').hidden = false;
        }
        return false;
      });
    });
    $('removePhoto')?.addEventListener('click', () => {
      resetExportLinks();
      photoJob += 1;
      editorPhoto = '';
      pendingPhoto = Promise.resolve(true);
      if ($('photoInput')) $('photoInput').value = '';
      updatePhotoPreview();
      setPhotoStatus('đã bỏ ảnh. thiệp vẫn có ba người bạn nhỏ.');
    });
    const waitForPhoto = async () => {
      let current;
      let result;
      do {
        current = pendingPhoto;
        result = await current;
      } while (current !== pendingPhoto);
      return result;
    };
    const waitForMedia = async () => {
      let revision;
      let result;
      do {
        revision = editorRevision;
        result = await Promise.all([waitForPhoto(), window.GiftAudioEditor?.ready() ?? true]);
      } while (revision !== editorRevision);
      if (!result[0]) toast('chọn lại ảnh hợp lệ hoặc bấm bỏ ảnh trước khi lưu nhé.');
      return result.every(Boolean);
    };
    const readEditor = () => {
      const required = {
        recipientInput: 'bạn điền tên người nhận nhé.',
        senderInput: 'bạn điền tên người gửi nhé.',
        occasionInput: 'bạn điền ngày hoặc dịp tặng nhé.',
        letterInput: 'bạn viết vài dòng cho lá thư cuối nhé.',
        note0Input: 'bạn viết lời nhắn của Chiikawa nhé.',
        note1Input: 'bạn viết lời nhắn của Hachiware nhé.',
        note2Input: 'bạn viết lời nhắn của Usagi nhé.',
        couponInput: 'bạn viết một lời hẹn trên chiếc vé nhé.'
      };
      for (const [id, message] of Object.entries(required)) {
        if ($(id) && !$(id).value.trim()) {
          $(id).setCustomValidity(message);
          revealField($(id));
          $(id).reportValidity();
          return null;
        }
      }
      if ($('giftForm') && !$('giftForm').reportValidity()) return null;
      const value = (id, defaultValue) => $(id) ? $(id).value : defaultValue;
      const draft = normalize({
        ...gift,
        recipient: value('recipientInput', gift.recipient),
        sender: value('senderInput', gift.sender),
        occasion: value('occasionInput', gift.occasion),
        letter: value('letterInput', gift.letter),
        coupon: value('couponInput', gift.coupon),
        notes: gift.notes.map((note, index) => ({ ...note, text: value(`note${index}Input`, note.text) })),
        photo: editorPhoto,
        ...(window.GiftAudioEditor?.read() || {}),
        recipientMode: false
      }, initial);
      draft.id = initial.id;
      return draft;
    };
    const applyDraft = (draft) => {
      const changed = JSON.stringify(gift) !== JSON.stringify(draft);
      gift = draft;
      if (changed) {
        progressKey = getProgressKey();
        visited = new Set(); couponKept = false; celebrated = false; datePlan = 'movie';
        window.LivingGift?.clearTicket();
        saveProgress();
      }
      renderGift();
      if ($('noteDialog')?.open) renderNote(currentNote);
      // Built-in motion and voice assets already live in this HTML. Store only
      // replacements in the draft, leaving room for the sender's photo/audio.
      return writeStorage(draftKey, {
        ...gift,
        motionAssets: undefined,
        voices: gift.voices.map((voice, index) => voice === initial.voices[index] ? null : voice)
      });
    };
    const setOperationBusy = (busy) => {
      operationInFlight = busy;
      ['editorSave', 'exportGift'].forEach((id) => {
        if ($(id)) { $(id).disabled = busy; $(id).setAttribute('aria-busy', String(busy)); }
      });
    };
    $('giftForm')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (operationInFlight || gift.recipientMode) return;
      setOperationBusy(true);
      try {
        if (!await waitForMedia()) return;
        const draft = readEditor();
        if (!draft) return;
        const saved = applyDraft(draft);
        closeDialog($('editorDialog'));
        toast(saved ? 'đã cất bản nháp trong trình duyệt này ♡' : 'thiệp đã cập nhật. tải thiệp để giữ lại nhé ♡');
      } finally { setOperationBusy(false); }
    });

    const exportGift = async () => {
      if (operationInFlight || gift.recipientMode) return;
      setOperationBusy(true);
      resetExportLinks();
      try {
        if (!await waitForMedia()) return;
        const draft = readEditor();
        if (!draft) return;
        applyDraft(draft);
        const random = window.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
        const exported = { ...gift, id: `gift-${random}`, recipientMode: true };
        const clone = document.documentElement.cloneNode(true);
        clone.dataset.recipientMode = 'true';
        const config = clone.querySelector('#gift-config');
        if (!config || !clone.querySelector('#site-script') || !clone.querySelector('#site-styles')) {
          throw new Error('thiệp chưa đóng gói xong. tải lại trang rồi thử lại nhé.');
        }
        config.textContent = JSON.stringify(exported).replace(/</g, '\\u003c');
        const title = clone.querySelector('title');
        if (title) title.textContent = `gửi ${gift.recipient} — những điều bé xíu`;
        clone.querySelectorAll('#editorDialog, #personalizeButton, [data-editor-only], [data-transient], .confetti-piece, link[rel="canonical"], meta[property="og:url"]').forEach((element) => element.remove());
        clone.querySelectorAll('script').forEach((script) => {
          if (!['gift-config', 'site-script'].includes(script.id)) script.remove();
        });
        clone.querySelectorAll('dialog[open]').forEach((dialog) => dialog.removeAttribute('open'));
        clone.querySelectorAll('.is-opened, .is-stamped, .music-on, .dialog-open, .is-visible').forEach((element) => {
          element.classList.remove('is-opened', 'is-stamped', 'music-on', 'dialog-open', 'is-visible');
        });
        const clonedBody = clone.querySelector('body');
        if (clonedBody) {
          clonedBody.style.removeProperty('overflow');
          clonedBody.style.removeProperty('padding-right');
        }
        const exportedToast = clone.querySelector('#toast');
        if (exportedToast) exportedToast.textContent = '';
        const count = clone.querySelector('#stampCount');
        if (count) count.textContent = '0 / 3';
        const progress = clone.querySelector('#deliveryProgress');
        if (progress) progress.setAttribute('value', '0');
        const sound = clone.querySelector('#soundToggle');
        if (sound) { sound.setAttribute('aria-pressed', 'false'); sound.removeAttribute('disabled'); }
        const soundLabel = clone.querySelector('#soundLabel');
        if (soundLabel) soundLabel.textContent = 'bật nhạc';
        window.LivingGift?.resetClone(clone);
        const missingImage = [...clone.querySelectorAll('img[src]')].find((image) => {
          const src = image.getAttribute('src');
          return src && !src.startsWith('data:');
        });
        if (missingImage) throw new Error('hình ảnh chưa tải đầy đủ. tải lại trang rồi thử lại nhé.');
        lastExportHTML = `<!doctype html>\n${clone.outerHTML}`;
        const file = new Blob([lastExportHTML], { type: 'text/html;charset=utf-8' });
        if (lastExportUrl) URL.revokeObjectURL(lastExportUrl);
        const url = URL.createObjectURL(file);
        lastExportUrl = url;
        if ($('downloadReady')) {
          $('downloadReady').href = url;
          $('downloadReady').download = 'gui-Thuwcutie-20-10.html';
          $('downloadReady').textContent = 'nhấn vào đây nếu thiệp chưa tải xuống';
          $('downloadReady').dataset.transient = '';
          $('downloadReady').hidden = false;
        }
        if ($('previewReady')) {
          $('previewReady').href = '#';
          $('previewReady').removeAttribute('target');
          $('previewReady').removeAttribute('rel');
          $('previewReady').textContent = 'mở thử tấm thiệp đã gói';
          $('previewReady').dataset.transient = '';
          $('previewReady').hidden = false;
        }
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'gui-Thuwcutie-20-10.html';
        anchor.hidden = true;
        ($('editorDialog')?.open ? $('editorDialog') : document.body).append(anchor);
        anchor.click();
        anchor.remove();
        toast('thiệp html đã sẵn sàng tải xuống ♡');
      } catch (error) {
        toast(error instanceof Error ? error.message : 'chưa tải được thiệp. thử lại một lần nhé.');
      } finally { setOperationBusy(false); }
    };
    $('exportGift')?.addEventListener('click', exportGift);
    $('previewReady')?.addEventListener('click', (event) => {
      event.preventDefault();
      if (!lastExportHTML || !$('recipientPreview') || !$('previewDialog')) {
        toast('bấm tải thiệp để gói lại bản xem thử nhé.');
        return;
      }
      $('recipientPreview').srcdoc = lastExportHTML;
      showDialog($('previewDialog'));
    });
    $('previewClose')?.addEventListener('click', () => closeDialog($('previewDialog')));
    $('previewDialog')?.addEventListener('close', () => {
      // removing srcdoc destroys the preview document, including its audio context.
      $('recipientPreview')?.removeAttribute('srcdoc');
    });

    // an original, quiet music-box phrase. sound begins only on a deliberate tap.
    let audioContext;
    let masterGain;
    let musicEnabled = false;
    let musicBusy = false;
    let musicTimer;
    let musicEpoch = 0;
    const activeOscillators = new Set();
    const melody = [74, 78, 81, 78, 76, 74, 69, null, 73, 76, 81, 83, 81, 78, 76, null];
    const syncSoundUI = () => {
      if ($('soundToggle')) {
        $('soundToggle').setAttribute('aria-pressed', String(musicEnabled));
        $('soundToggle').setAttribute('aria-label', musicEnabled ? 'tắt nhạc hộp nhạc' : 'bật nhạc hộp nhạc');
      }
      if ($('soundLabel')) $('soundLabel').textContent = musicEnabled ? 'tắt nhạc' : 'bật nhạc';
      document.body.classList.toggle('music-on', musicEnabled);
      window.GiftSound?.setMusicEnabled(musicEnabled);
    };
    const clearMusicSchedule = () => {
      musicEpoch += 1;
      clearTimeout(musicTimer);
      activeOscillators.forEach((oscillator) => {
        try { oscillator.stop(); } catch (_) { /* an ended note is already quiet. */ }
      });
      activeOscillators.clear();
    };
    const playTone = (midi, when, volume = 0.035) => {
      if (!audioContext || !masterGain) return;
      const oscillator = audioContext.createOscillator();
      const envelope = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
      envelope.gain.setValueAtTime(0.0001, when);
      envelope.gain.exponentialRampToValueAtTime(volume, when + 0.018);
      envelope.gain.exponentialRampToValueAtTime(0.0001, when + 1.15);
      oscillator.connect(envelope);
      envelope.connect(masterGain);
      activeOscillators.add(oscillator);
      oscillator.onended = () => { activeOscillators.delete(oscillator); oscillator.disconnect(); envelope.disconnect(); };
      oscillator.start(when);
      oscillator.stop(when + 1.2);
    };
    const scheduleMusic = (epoch) => {
      if (!musicEnabled || document.hidden || epoch !== musicEpoch || audioContext?.state !== 'running') return;
      const start = audioContext.currentTime + 0.08;
      melody.forEach((midi, index) => {
        if (midi !== null) playTone(midi, start + index * 0.48);
      });
      [62, 57, 59, 57].forEach((midi, index) => playTone(midi, start + index * 1.92, 0.018));
      musicTimer = setTimeout(() => scheduleMusic(epoch), 7680);
    };
    const resumeMusic = async () => {
      if (!musicEnabled || document.hidden) return;
      const epoch = ++musicEpoch;
      await audioContext.resume();
      if (musicEnabled && epoch === musicEpoch && !document.hidden) scheduleMusic(epoch);
    };
    const toggleMusic = async (forceValue) => {
      const next = typeof forceValue === 'boolean' ? forceValue : !musicEnabled;
      if (next === musicEnabled) return;
      if (musicBusy) return;
      musicBusy = true;
      try {
        if (!next) {
          musicEnabled = false;
          clearMusicSchedule();
          await audioContext?.suspend();
        } else {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (!AudioContextClass) throw new Error('trình duyệt này chưa mở được hộp nhạc.');
          if (!audioContext || audioContext.state === 'closed') {
            audioContext = new AudioContextClass();
            masterGain = audioContext.createGain();
            masterGain.gain.value = window.GiftSound?.getState().ducked ? 0.12 : 0.42;
            masterGain.connect(audioContext.destination);
          }
          musicEnabled = true;
          await resumeMusic();
        }
      } catch (_) {
        musicEnabled = false;
        clearMusicSchedule();
        toast('chưa mở được hộp nhạc. bạn có thể thử lại nhé.');
      } finally {
        musicBusy = false;
        syncSoundUI();
      }
    };
    $('soundToggle')?.addEventListener('click', () => toggleMusic());
    window.GiftSound?.setMusicDucker((ducked) => {
      document.body.dataset.musicDucked = String(ducked);
      if (masterGain && audioContext) masterGain.gain.setTargetAtTime(ducked ? 0.12 : 0.42, audioContext.currentTime, 0.1);
    });
    document.addEventListener('visibilitychange', () => {
      if (!audioContext || !musicEnabled) return;
      if (document.hidden) {
        clearMusicSchedule();
        audioContext.suspend().catch(() => {});
      } else resumeMusic().catch(() => {
        musicEnabled = false; clearMusicSchedule(); syncSoundUI();
      });
    });
    window.addEventListener('pagehide', () => {
      if (lastExportUrl) {
        URL.revokeObjectURL(lastExportUrl);
        lastExportUrl = null;
        resetExportLinks();
      }
      clearMusicSchedule();
      if (audioContext?.state === 'running') audioContext.suspend().catch(() => {});
    });
    window.addEventListener('pageshow', (event) => {
      if (event.persisted && musicEnabled && audioContext) resumeMusic().catch(() => {});
    });

    window.GiftAudioEditor?.init({ getGift: () => gift, toast, changed: resetExportLinks });
    window.LivingGift?.bind({
      getGift: () => gift, openNote, openLetter, showDialog, closeDialog, toast, scrollToMail,
      startMusic: () => toggleMusic(true),
      getDatePlan: () => datePlan,
      setDatePlan: (value) => { datePlan = value; saveProgress(); }
    });
    renderGift();
    syncSoundUI();
    if (!gift.recipientMode && new URLSearchParams(window.location.search).get('edit') === '1') openEditor();
    else window.LivingGift?.startWelcome();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
