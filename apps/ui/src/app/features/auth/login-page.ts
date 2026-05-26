import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export default class LoginPage {
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: new FormControl<boolean>(true, { nonNullable: true }),
  });

  protected readonly submitting = signal(false);
  protected readonly serverError = signal<string | null>(null);

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
    this.serverError.set(null);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.submitting.set(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
    } catch {
      this.serverError.set('Giriş başarısız. E-posta veya şifren hatalı olabilir.');
    } finally {
      this.submitting.set(false);
    }
  }
}
