import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PortfolioService } from './portfolio.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form class="card form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <label>Name <input formControlName="name" autocomplete="name"></label>
      <label>Email <input type="email" formControlName="email" autocomplete="email"></label>
      <label>Message <textarea rows="5" formControlName="message"></textarea></label>
      <input class="hp" formControlName="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      @if (form.invalid && form.touched) { <p class="hint">Please enter your name, a valid email and a message of at least 10 characters.</p> }
      <button class="btn" type="submit" [disabled]="status() === 'sending'">
        {{ status() === 'sending' ? 'Sending…' : 'Send message' }}
      </button>
      @if (status() === 'ok') { <p class="ok">Thanks! I will get back to you soon.</p> }
      @if (status() === 'error') { <p class="err">Could not send right now. Please email me directly.</p> }
    </form>
  `
})
export class ContactComponent {
  private fb = inject(FormBuilder).nonNullable;
  private api = inject(PortfolioService);
  status = signal<'idle' | 'sending' | 'ok' | 'error'>('idle');

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    website: ['']
  });

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.status.set('sending');
    this.api.sendMessage(this.form.getRawValue()).subscribe({
      next: () => { this.status.set('ok'); this.form.reset(); },
      error: () => this.status.set('error')
    });
  }
}
