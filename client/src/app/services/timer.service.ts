import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  public isRunning = signal<boolean>(false);
  public isPaused = signal<boolean>(false);
  public isOpen = signal<boolean>(false);
  public timeLeft = signal<number>(60);
  public initialDuration = signal<number>(60);
  public isFinished = signal<boolean>(false);

  private timerInterval: any = null;
  private targetTimestamp: number = 0;
  private remainingWhenPaused: number = 60;
  private audioCtx: AudioContext | null = null;

  constructor() {}

  public toggleOpen() {
    this.isOpen.update((v) => !v);
  }

  public openTimer(durationSeconds: number = 60) {
    this.isOpen.set(true);
    if (!this.isRunning()) {
      this.start(durationSeconds);
    }
  }

  public start(durationSeconds: number = 60) {
    this.clearTimer();
    this.initialDuration.set(durationSeconds);
    this.timeLeft.set(durationSeconds);
    this.isFinished.set(false);
    this.isPaused.set(false);
    this.isRunning.set(true);
    this.isOpen.set(true);

    this.targetTimestamp = Date.now() + durationSeconds * 1000;
    this.startInterval();
  }

  public pause() {
    if (!this.isRunning() || this.isPaused()) return;
    this.clearTimer();
    this.isPaused.set(true);
    this.remainingWhenPaused = Math.max(0, Math.ceil((this.targetTimestamp - Date.now()) / 1000));
    this.timeLeft.set(this.remainingWhenPaused);
  }

  public resume() {
    if (!this.isPaused()) return;
    this.isPaused.set(false);
    this.targetTimestamp = Date.now() + this.remainingWhenPaused * 1000;
    this.startInterval();
  }

  public reset() {
    this.start(this.initialDuration());
  }

  public dismiss() {
    this.clearTimer();
    this.isRunning.set(false);
    this.isPaused.set(false);
    this.isFinished.set(false);
    this.isOpen.set(false);
    this.timeLeft.set(this.initialDuration());
  }

  public setPreset(seconds: number) {
    this.start(seconds);
  }

  public get progressPercentage(): number {
    const init = this.initialDuration();
    if (init <= 0) return 0;
    const current = this.timeLeft();
    return Math.min(100, Math.max(0, Math.round(((init - current) / init) * 100)));
  }

  private startInterval() {
    this.timerInterval = setInterval(() => {
      const now = Date.now();
      const diffMs = this.targetTimestamp - now;
      const secondsRemaining = Math.max(0, Math.ceil(diffMs / 1000));

      this.timeLeft.set(secondsRemaining);

      if (secondsRemaining <= 0) {
        this.clearTimer();
        this.isRunning.set(false);
        this.isFinished.set(true);
        this.playChime();
      }
    }, 250); // fast polling ensures UI remains silky smooth even under tab throttle
  }

  private clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // Pure Web Audio API chime (athletic double-beep bell)
  private playChime() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      // Note 1: 880 Hz (A5)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);

      // Note 2: 1760 Hz (A6) high bell ring
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1760, now + 0.2);
      gain2.gain.setValueAtTime(0.35, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.2);
      osc2.stop(now + 0.8);
    } catch (e) {
      console.warn('Audio chime notice:', e);
    }
  }
}
