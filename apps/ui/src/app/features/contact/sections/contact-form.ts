import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, TextareaModule, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
})
export class ContactForm {
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    name:    ['', [Validators.required, Validators.minLength(2)]],
    email:   ['', [Validators.required, Validators.email]],
    phone:   ['', [Validators.required, Validators.minLength(7)]],
    subject: ['', [Validators.required, Validators.minLength(3)]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly error = signal<string | null>(null);

  protected hasError(control: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.touched || c.dirty);
  }

  protected errorOf(control: keyof typeof this.form.controls): string | null {
    const c = this.form.controls[control];
    if (!c.errors || !(c.touched || c.dirty)) return null;
    if (c.errors['required']) return 'Bu alan zorunlu.';
    if (c.errors['email']) return 'Geçerli bir e-posta gir.';
    if (c.errors['minlength']) return `En az ${c.errors['minlength'].requiredLength} karakter olmalı.`;
    return 'Geçersiz değer.';
  }

  protected async submit(): Promise<void> {
    this.error.set(null);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.submitting.set(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      this.submitted.set(true);
      this.form.reset();
    } catch {
      this.error.set('Mesaj gönderilemedi. Lütfen tekrar dene.');
    } finally {
      this.submitting.set(false);
    }
  }
}
