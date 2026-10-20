(function (window) {
  'use strict';

  const document = window.document;
  const MAX_BYTES = 3 * 1024 * 1024;
  const MAX_SECONDS = 90;
  const LOAD_TIMEOUT_MS = 10000;
  const CANCELLED = { cancelled: true };
  const boundInputs = new WeakSet();
  const boundButtons = new WeakSet();
  const MIME_TYPES = {
    'audio/mpeg': 'audio/mpeg',
    'audio/mp3': 'audio/mpeg',
    'audio/x-mp3': 'audio/mpeg',
    'audio/mp4': 'audio/mp4',
    'audio/x-m4a': 'audio/x-m4a',
    'audio/m4a': 'audio/x-m4a',
    'audio/wav': 'audio/wav',
    'audio/x-wav': 'audio/wav',
    'audio/wave': 'audio/wav',
    'audio/vnd.wave': 'audio/wav',
    'audio/ogg': 'audio/ogg',
    'application/ogg': 'audio/ogg',
    'audio/webm': 'audio/webm'
  };
  const EXTENSIONS = {
    mp3: 'audio/mpeg',
    m4a: 'audio/x-m4a',
    mp4: 'audio/mp4',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    webm: 'audio/webm'
  };
  const slots = [0, 1, 2].map((index) => ({
    index,
    inputId: 'voice' + index + 'Input',
    statusId: 'voice' + index + 'Status',
    removeId: null,
    data: '',
    filename: '',
    duration: null,
    error: '',
    token: 0,
    job: null
  }));
  slots.push({
    index: null,
    inputId: 'senderAudioInput',
    statusId: 'senderAudioStatus',
    removeId: 'removeSenderAudio',
    data: '',
    filename: '',
    duration: null,
    error: '',
    token: 0,
    job: null
  });
  let callbacks = {};

  function callSafely(callback, ...args) {
    if (typeof callback !== 'function') return;
    try {
      const result = callback(...args);
      if (result && typeof result.then === 'function') result.catch(() => {});
      return result;
    } catch (_) {}
  }

  function notifyChanged() {
    callSafely(callbacks.changed);
  }

  function currentGift() {
    const value = callSafely(callbacks.getGift);
    return value && typeof value === 'object' ? value : {};
  }

  function render(slot) {
    const status = document.getElementById(slot.statusId);
    const input = document.getElementById(slot.inputId);
    const remove = slot.removeId && document.getElementById(slot.removeId);
    let text;
    if (slot.job) {
      text = 'đang kiểm tra file âm thanh…';
    } else if (slot.error) {
      text = slot.error + (slot.data ? ' clip trước vẫn được giữ.' : '');
    } else if (slot.data && slot.filename) {
      const duration = Number(slot.duration.toFixed(1)).toLocaleString('vi-VN');
      text = 'đã chọn ' + slot.filename + ' · ' + duration + ' giây.';
    } else if (slot.data) {
      text = slot.index === null ? 'bản ghi đã có trong thiệp.' : 'clip đã có trong thiệp.';
    } else {
      text = slot.index === null ? 'chưa có bản ghi riêng.' : 'chưa có clip riêng; bạn vẫn có thể đọc phong thư.';
    }
    if (status) {
      status.textContent = text;
      status.setAttribute('aria-busy', String(Boolean(slot.job)));
    }
    if (input) input.setAttribute('aria-invalid', String(Boolean(slot.error)));
    if (remove) remove.hidden = !slot.data && !slot.error && !slot.job;
  }

  function cancelJob(job) {
    if (!job || job.cancelled) return;
    job.cancelled = true;
    for (const cancel of Array.from(job.cancellers)) {
      try { cancel(); } catch (_) {}
    }
    job.cancellers.clear();
  }

  function invalidateSlot(slot) {
    slot.token += 1;
    const previous = slot.job;
    slot.job = null;
    cancelJob(previous);
  }

  function mimeForFile(file) {
    const declared = typeof file.type === 'string' ? file.type.toLowerCase().split(';')[0].trim() : '';
    if (MIME_TYPES[declared]) return MIME_TYPES[declared];
    const match = typeof file.name === 'string' ? /\.([a-z0-9]+)$/i.exec(file.name) : null;
    return match ? EXTENSIONS[match[1].toLowerCase()] || '' : '';
  }

  function readDataURL(file, mime, job) {
    return new Promise((resolve, reject) => {
      let reader;
      let timer;
      let finished = false;

      function finish(error, value) {
        if (finished) return;
        finished = true;
        window.clearTimeout(timer);
        job.cancellers.delete(cancel);
        if (reader) {
          reader.onload = null;
          reader.onerror = null;
          reader.onabort = null;
          if (reader.readyState === 1) {
            try { reader.abort(); } catch (_) {}
          }
        }
        if (error) reject(error);
        else resolve(value);
      }

      function cancel() {
        finish(CANCELLED);
      }

      job.cancellers.add(cancel);
      try {
        reader = new window.FileReader();
        reader.onload = () => {
          const result = reader.result;
          const match = typeof result === 'string' ? /^data:[^,]*;base64,([a-z0-9+/=\s]+)$/i.exec(result) : null;
          if (!match) {
            finish(new Error('không đọc được file âm thanh này. hãy chọn lại một file khác.'));
            return;
          }
          // FileReader may use an OS-specific MIME or application/octet-stream.
          // Normalize the header to the whitelist accepted by GiftSound.
          finish(null, 'data:' + mime + ';base64,' + match[1]);
        };
        reader.onerror = () => finish(new Error('không đọc được file âm thanh này. hãy chọn lại một file khác.'));
        reader.onabort = () => finish(CANCELLED);
        timer = window.setTimeout(() => finish(new Error('đọc file hơi lâu. hãy thử chọn lại file âm thanh.')), LOAD_TIMEOUT_MS);
        reader.readAsDataURL(file);
      } catch (_) {
        finish(new Error('trình duyệt chưa đọc được file này. hãy thử chọn lại.'));
      }
    });
  }

  function readDuration(file, mime, job) {
    return new Promise((resolve, reject) => {
      let audio;
      let objectURL = '';
      let timer;
      let finished = false;
      let triedSeek = false;

      function finish(error, duration) {
        if (finished) return;
        finished = true;
        window.clearTimeout(timer);
        job.cancellers.delete(cancel);
        if (audio) {
          audio.onloadedmetadata = null;
          audio.ondurationchange = null;
          audio.onseeked = null;
          audio.onerror = null;
          try { audio.pause(); } catch (_) {}
          try { audio.removeAttribute('src'); audio.load(); } catch (_) {}
        }
        if (objectURL) {
          try { window.URL.revokeObjectURL(objectURL); } catch (_) {}
          objectURL = '';
        }
        if (error) reject(error);
        else resolve(duration);
      }

      function cancel() {
        finish(CANCELLED);
      }

      function inspectDuration() {
        if (finished) return;
        const duration = Number(audio.duration);
        if (Number.isFinite(duration) && duration > 0) {
          if (duration > MAX_SECONDS) {
            finish(new Error('clip dài hơn 90 giây. hãy cắt ngắn rồi chọn lại.'));
          } else {
            finish(null, duration);
          }
          return;
        }
        // Some WebM files omit the duration header. A silent seek lets browsers
        // determine the end without playing the clip or trusting Infinity.
        if (!triedSeek && duration === Infinity) {
          triedSeek = true;
          audio.preload = 'auto';
          try { audio.currentTime = 1e10; } catch (_) {}
        }
      }

      job.cancellers.add(cancel);
      try {
        audio = new window.Audio();
        audio.preload = 'metadata';
        audio.muted = true;
        audio.onloadedmetadata = inspectDuration;
        audio.ondurationchange = inspectDuration;
        audio.onseeked = inspectDuration;
        audio.onerror = () => finish(new Error('trình duyệt không mở được âm thanh này. hãy thử một file khác.'));
        const typedFile = typeof file.slice === 'function' ? file.slice(0, file.size, mime) : file;
        objectURL = window.URL.createObjectURL(typedFile);
        timer = window.setTimeout(() => finish(new Error('chưa đọc được độ dài clip. hãy thử file mp3, m4a, wav, ogg hoặc webm khác.')), LOAD_TIMEOUT_MS);
        audio.src = objectURL;
        audio.load();
      } catch (_) {
        finish(new Error('trình duyệt chưa kiểm tra được âm thanh này. hãy thử chọn lại.'));
      }
    });
  }

  function rejectChoice(slot, message) {
    slot.error = message;
    render(slot);
    callSafely(callbacks.toast, message);
  }

  function chooseFile(slot, file) {
    if (!file) return;
    invalidateSlot(slot);
    slot.error = '';
    // Immediately retire an older download link while this choice is checked.
    notifyChanged();
    const mime = mimeForFile(file);
    if (!mime) {
      rejectChoice(slot, 'hãy chọn file mp3, m4a, mp4, wav, ogg hoặc webm.');
      return;
    }
    if (!Number.isFinite(file.size) || file.size <= 0) {
      rejectChoice(slot, 'file âm thanh đang trống hoặc chưa đọc được. hãy chọn file khác.');
      return;
    }
    if (file.size > MAX_BYTES) {
      rejectChoice(slot, 'file vượt quá 3 mb. hãy chọn một clip nhẹ hơn.');
      return;
    }

    const job = { token: slot.token, cancellers: new Set(), cancelled: false, promise: null };
    slot.job = job;
    render(slot);
    job.promise = Promise.all([readDataURL(file, mime, job), readDuration(file, mime, job)])
      .then(([data, duration]) => {
        if (job.cancelled || slot.token !== job.token || slot.job !== job) return;
        slot.data = data;
        slot.filename = typeof file.name === 'string' ? file.name : 'âm thanh đã chọn';
        slot.duration = duration;
        slot.error = '';
        notifyChanged();
      })
      .catch((error) => {
        if (error === CANCELLED || job.cancelled || slot.token !== job.token || slot.job !== job) return;
        slot.error = error && error.message ? error.message : 'không kiểm tra được âm thanh này. hãy chọn lại file.';
        callSafely(callbacks.toast, slot.error);
      })
      .finally(() => {
        cancelJob(job);
        if (slot.token !== job.token || slot.job !== job) return;
        slot.job = null;
        render(slot);
      });
  }

  function removeClip(slot) {
    invalidateSlot(slot);
    slot.data = '';
    slot.filename = '';
    slot.duration = null;
    slot.error = '';
    const input = document.getElementById(slot.inputId);
    if (input) input.value = '';
    render(slot);
    notifyChanged();
  }

  function open(gift) {
    const source = gift && typeof gift === 'object' ? gift : currentGift();
    const voices = Array.isArray(source.voices) ? source.voices : [];
    for (const slot of slots) {
      invalidateSlot(slot);
      const data = slot.index === null ? source.senderVoice : voices[slot.index];
      slot.data = typeof data === 'string' ? data : '';
      slot.filename = '';
      slot.duration = null;
      slot.error = '';
      const input = document.getElementById(slot.inputId);
      if (input) input.value = '';
      render(slot);
    }
    return api;
  }

  function read() {
    return {
      voices: slots.slice(0, 3).map((slot) => slot.data),
      senderVoice: slots[3].data
    };
  }

  async function ready() {
    // A user can replace a file while this function is awaiting an older job.
    // Take a fresh snapshot after every await, including all four audio slots.
    while (true) {
      const pending = slots.map((slot) => slot.job).filter(Boolean);
      if (pending.length) {
        await Promise.all(pending.map((job) => job.promise));
        continue;
      }
      const invalid = slots.find((slot) => slot.error);
      if (invalid) {
        callSafely(callbacks.toast, invalid.error);
        const input = document.getElementById(invalid.inputId);
        try { input?.focus(); } catch (_) {}
        return false;
      }
      return true;
    }
  }

  function init(options) {
    callbacks = options && typeof options === 'object' ? options : {};
    for (const slot of slots) {
      const input = document.getElementById(slot.inputId);
      if (input && !boundInputs.has(input)) {
        boundInputs.add(input);
        input.addEventListener('change', () => {
          const file = input.files && input.files[0];
          // Allow choosing the same file again after validation fails.
          input.value = '';
          chooseFile(slot, file);
        });
      }
      const remove = slot.removeId && document.getElementById(slot.removeId);
      if (remove && !boundButtons.has(remove)) {
        boundButtons.add(remove);
        remove.addEventListener('click', (event) => {
          event.preventDefault();
          removeClip(slot);
        });
      }
    }
    open(currentGift());
    return api;
  }

  const api = Object.freeze({ init, open, read, ready });
  window.GiftAudioEditor = api;
})(window);
