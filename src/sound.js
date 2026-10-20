(function (window) {
  'use strict';

  // The caller owns background music. This module owns short, original SFX and
  // one optional, user-supplied voice clip. No sound is enabled on page load.
  const document = window.document;
  const VOICE_DATA_URL = /^data:audio\/(?:mpeg|mp3|mp4|x-m4a|wav|ogg|webm)(?:;[^,\r\n]*)?,[\s\S]+$/i;
  const EFFECT_NAMES = new Set(['door', 'bell', 'paper', 'stamp', 'ticket', 'happy']);
  const EFFECT_THROTTLE_MS = 250;

  let enabled = false;
  let musicEnabled = false;
  let context = null;
  let effectsGain = null;
  let audioEpoch = 0;
  let wantsContextRunning = false;
  let effectsEpoch = 0;
  let lastEffectAt = -Infinity;
  let activeVoice = null;
  let voiceRequestEpoch = 0;
  let musicDucker = null;
  let lastDucked = false;
  const effectSources = new Set();

  function isHidden() {
    return Boolean(document.hidden);
  }

  function getState() {
    const voicePlaying = Boolean(activeVoice && activeVoice.started && !activeVoice.finished);
    return {
      enabled,
      musicEnabled,
      unlocked: Boolean(context && context.state === 'running' && !isHidden()),
      contextState: context ? context.state : 'unavailable',
      voicePlaying,
      voicePending: Boolean(activeVoice && !activeVoice.started && !activeVoice.finished),
      ducked: voicePlaying,
      hidden: isHidden()
    };
  }

  function callSafely(callback, ...args) {
    if (typeof callback !== 'function') return;
    try {
      // Also contain rejection if the host chooses to use an async callback.
      const result = callback(...args);
      if (result && typeof result.then === 'function') result.catch(() => {});
    } catch (_) {
      // A host callback must never break audio cleanup or leave music ducked.
    }
  }

  function notifyMusicDucker(force) {
    const state = getState();
    if (!force && state.ducked === lastDucked) return;
    lastDucked = state.ducked;
    callSafely(musicDucker, state.ducked, state);
  }

  function setMusicDucker(callback) {
    musicDucker = typeof callback === 'function' ? callback : null;
    notifyMusicDucker(true);
  }

  function ensureContext() {
    if (context && context.state !== 'closed') return context;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    try {
      const nextContext = new AudioContextClass();
      const nextGain = nextContext.createGain();
      nextGain.gain.value = 0.2;
      nextGain.connect(nextContext.destination);
      context = nextContext;
      effectsGain = nextGain;
      return context;
    } catch (_) {
      return null;
    }
  }

  function suspendSafely() {
    if (!context || context.state === 'closed') return;
    try {
      Promise.resolve(context.suspend()).catch(() => {});
    } catch (_) {
      // Some browsers reject suspension while a document is being discarded.
    }
  }

  // Call directly inside the user's sound-on gesture; do not await another task
  // before calling it. It unlocks SFX but does not change the enabled preference.
  async function unlock() {
    if (isHidden()) return false;
    const currentContext = ensureContext();
    if (!currentContext) return false;
    wantsContextRunning = true;
    const epoch = ++audioEpoch;
    try {
      if (currentContext.state !== 'running') await currentContext.resume();
      if (!wantsContextRunning || isHidden()) {
        suspendSafely();
        return false;
      }
      return epoch === audioEpoch && !isHidden() && currentContext.state === 'running';
    } catch (_) {
      return false;
    }
  }

  function trackSource(source, nodes) {
    const record = { source, nodes, cleaned: false };
    effectSources.add(record);
    record.cleanup = function () {
      if (record.cleaned) return;
      record.cleaned = true;
      effectSources.delete(record);
      source.onended = null;
      for (const node of nodes) {
        try { node.disconnect(); } catch (_) {}
      }
    };
    source.onended = record.cleanup;
    return record;
  }

  function cancelEffects() {
    effectsEpoch += 1;
    for (const record of Array.from(effectSources)) {
      try { record.source.stop(); } catch (_) {}
      record.cleanup();
    }
  }

  function tone(start, duration, frequency, amplitude, endFrequency) {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, start);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(amplitude, start + 0.006);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(envelope);
    envelope.connect(effectsGain);
    const record = trackSource(oscillator, [oscillator, envelope]);
    try {
      oscillator.start(start);
      oscillator.stop(start + duration + 0.015);
    } catch (error) {
      record.cleanup();
      throw error;
    }
  }

  function rustle(start, duration, amplitude, frequency, filterType) {
    const frameCount = Math.max(1, Math.ceil(context.sampleRate * duration));
    const buffer = context.createBuffer(1, frameCount, context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < channel.length; index += 1) channel[index] = Math.random() * 2 - 1;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();
    source.buffer = buffer;
    filter.type = filterType || 'bandpass';
    filter.frequency.setValueAtTime(frequency, start);
    filter.Q.value = 0.7;
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(amplitude, start + 0.006);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(effectsGain);
    const record = trackSource(source, [source, filter, envelope]);
    try {
      source.start(start);
      source.stop(start + duration + 0.01);
    } catch (error) {
      record.cleanup();
      throw error;
    }
  }

  // Original, quiet UI sounds; none synthesize or imitate a character voice.
  async function playEffect(kind) {
    const effect = typeof kind === 'string' ? kind.toLowerCase() : '';
    if (!enabled || isHidden() || !EFFECT_NAMES.has(effect)) return false;
    const now = window.performance ? window.performance.now() : Date.now();
    if (now - lastEffectAt < EFFECT_THROTTLE_MS) return false;
    lastEffectAt = now;
    const epoch = effectsEpoch;
    if ((!context || context.state !== 'running') && !(await unlock())) return false;
    if (!enabled || isHidden() || epoch !== effectsEpoch || !context || context.state !== 'running') return false;

    try {
      const start = context.currentTime + 0.012;
      if (effect === 'door') {
        for (const offset of [0, 0.15]) {
          tone(start + offset, 0.095, 165, 0.45, 78);
          rustle(start + offset, 0.055, 0.25, 430, 'lowpass');
        }
      } else if (effect === 'bell') {
        tone(start, 0.37, 880, 0.32);
        tone(start + 0.045, 0.32, 1320, 0.13);
      } else if (effect === 'paper') {
        rustle(start, 0.14, 0.38, 1450);
        rustle(start + 0.10, 0.10, 0.16, 2050);
      } else if (effect === 'stamp') {
        tone(start, 0.12, 140, 0.55, 61);
        rustle(start, 0.055, 0.3, 580, 'lowpass');
      } else if (effect === 'ticket') {
        for (const offset of [0, 0.05, 0.105]) rustle(start + offset, 0.065, 0.32, 1850);
      } else if (effect === 'happy') {
        [659.25, 783.99, 987.77].forEach((frequency, index) => tone(start + index * 0.07, 0.22, frequency, 0.25));
      }
      return true;
    } catch (_) {
      cancelEffects();
      return false;
    }
  }

  function finishVoice(record, reason) {
    if (!record || record.finished) return;
    record.finished = true;
    const wasCurrent = activeVoice === record;
    if (wasCurrent) activeVoice = null;
    for (const [eventName, listener] of Object.entries(record.listeners)) {
      record.audio.removeEventListener(eventName, listener);
    }
    try { record.audio.pause(); } catch (_) {}
    try {
      record.audio.removeAttribute('src');
      record.audio.load();
    } catch (_) {}
    record.resolveStart(false);
    if (wasCurrent) notifyMusicDucker();
    callSafely(record.onEnd, reason);
  }

  function stopVoice(reason) {
    voiceRequestEpoch += 1;
    finishVoice(activeVoice, typeof reason === 'string' ? reason : 'stopped');
  }

  // Resolves true when playback starts, false when unavailable/blocked/stopped
  // before starting. onEnd(reason) runs exactly once for each accepted request.
  function playVoice(dataURL, options) {
    if (!enabled || isHidden() || typeof dataURL !== 'string' || !VOICE_DATA_URL.test(dataURL)) {
      return Promise.resolve(false);
    }
    const requestEpoch = ++voiceRequestEpoch;
    finishVoice(activeVoice, 'replaced');
    // A host onEnd/ducker callback may itself stop playback or request a newer
    // clip. Keep that newer decision instead of creating two playing elements.
    if (requestEpoch !== voiceRequestEpoch || !enabled || isHidden()) return Promise.resolve(false);
    const callbacks = options && typeof options === 'object' ? options : {};
    let media;
    try {
      media = new window.Audio();
    } catch (_) {
      return Promise.resolve(false);
    }
    let resolveStart;
    const startPromise = new Promise((resolve) => { resolveStart = resolve; });
    const record = {
      audio: media,
      started: false,
      finished: false,
      resolveStart,
      onStart: callbacks.onStart,
      onEnd: callbacks.onEnd,
      listeners: {}
    };
    activeVoice = record;

    function markStarted() {
      if (record.finished || activeVoice !== record) return;
      if (!enabled || isHidden()) {
        finishVoice(record, isHidden() ? 'hidden' : 'disabled');
        return;
      }
      if (record.started) return;
      record.started = true;
      record.resolveStart(true);
      notifyMusicDucker();
      if (!record.finished) callSafely(record.onStart);
    }

    record.listeners = {
      playing: markStarted,
      ended: () => finishVoice(record, 'ended'),
      error: () => finishVoice(record, 'error'),
      pause: () => {
        if (record.started) finishVoice(record, media.ended ? 'ended' : 'paused');
      }
    };

    try {
      for (const [eventName, listener] of Object.entries(record.listeners)) media.addEventListener(eventName, listener);
      media.preload = 'auto';
      media.volume = 0.88;
      media.src = dataURL;
      // Call play before yielding so a button click retains user activation.
      const playPromise = media.play();
      Promise.resolve(playPromise).then(() => {
        if (!media.paused) markStarted();
        else if (!record.finished) finishVoice(record, 'paused');
      }).catch((error) => {
        finishVoice(record, error && error.name === 'NotAllowedError' ? 'blocked' : 'error');
      });
    } catch (_) {
      finishVoice(record, 'error');
    }
    return startPromise;
  }

  function stopAll(reason) {
    audioEpoch += 1;
    wantsContextRunning = false;
    cancelEffects();
    stopVoice(typeof reason === 'string' ? reason : 'stopped');
    suspendSafely();
  }

  function setEnabled(value) {
    enabled = Boolean(value);
    if (!enabled) stopAll('disabled');
    notifyMusicDucker(true);
    return enabled;
  }

  function setMusicEnabled(value) {
    musicEnabled = Boolean(value);
    notifyMusicDucker(true);
    return musicEnabled;
  }

  document.addEventListener('visibilitychange', () => {
    if (isHidden()) stopAll('hidden');
    // Returning to the page never resumes a voice or replays an effect.
  });
  window.addEventListener('pagehide', () => stopAll('pagehide'));

  window.GiftSound = Object.freeze({
    unlock,
    setEnabled,
    setMusicEnabled,
    playEffect,
    playVoice,
    stopVoice,
    stopAll,
    getState,
    setMusicDucker
  });
})(window);
