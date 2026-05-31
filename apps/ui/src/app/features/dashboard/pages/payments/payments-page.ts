import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

type DebtStatus = 'accruing' | 'due' | 'paid' | 'overdue';

interface DebtOrder {
  id: string;
  date: string;
  vehicle: string;
  service: string;
  amount: number;
}

interface MonthlyStatement {
  id: string;
  /** Hangi ayın siparişleri (ör. "Mayıs 2026"). */
  period: string;
  /** Ödeme tarihi — bir sonraki ayın 1'i. */
  dueDate: string;
  status: DebtStatus;
  orders: DebtOrder[];
  paidAt?: string;
}

const STATUS_META: Record<DebtStatus, { label: string; }> = {
  accruing: { label: 'Birikiyor' },
  due:      { label: 'Ödeme Bekliyor' },
  paid:     { label: 'Ödendi' },
  overdue:  { label: 'Gecikmiş' },
};

/* ─── MOCK — bayi aylık ekstreleri ─── */
const STATEMENTS: MonthlyStatement[] = [
  {
    id: 'EXT-2026-05', period: 'Mayıs 2026', dueDate: '1 Haziran 2026', status: 'accruing',
    orders: [
      { id: 'ORD-051', date: '29 May', vehicle: 'BMW M3 G80',  service: 'Stage 1 + Decat',     amount: 2800 },
      { id: 'ORD-050', date: '24 May', vehicle: 'Audi RS6 C8',  service: 'Stage 2 + DPF/EGR',   amount: 4600 },
      { id: 'ORD-049', date: '18 May', vehicle: 'VW Golf R',    service: 'Stage 1',             amount: 2500 },
      { id: 'ORD-048', date: '11 May', vehicle: 'Mercedes C63', service: 'Stage 2',             amount: 4000 },
    ],
  },
  {
    id: 'EXT-2026-04', period: 'Nisan 2026', dueDate: '1 Mayıs 2026', status: 'due',
    orders: [
      { id: 'ORD-041', date: '28 Nis', vehicle: 'Audi S3 8Y',   service: 'Stage 2 + Vmax',  amount: 2950 },
      { id: 'ORD-039', date: '15 Nis', vehicle: 'BMW M5 F90',   service: 'Stage 1',         amount: 2500 },
      { id: 'ORD-037', date: '04 Nis', vehicle: 'Porsche 911',  service: 'Stage 1',         amount: 2500 },
    ],
  },
  {
    id: 'EXT-2026-03', period: 'Mart 2026', dueDate: '1 Nisan 2026', status: 'paid', paidAt: '1 Nisan 2026',
    orders: [
      { id: 'ORD-031', date: '22 Mar', vehicle: 'BMW M3 F80',   service: 'Stage 1',         amount: 2500 },
      { id: 'ORD-028', date: '09 Mar', vehicle: 'VW Golf R',    service: 'Stage 2 + EGR',   amount: 4250 },
    ],
  },
  {
    id: 'EXT-2026-02', period: 'Şubat 2026', dueDate: '1 Mart 2026', status: 'paid', paidAt: '3 Mart 2026',
    orders: [
      { id: 'ORD-021', date: '19 Şub', vehicle: 'Audi RS6 C8',  service: 'Stage 1',         amount: 2500 },
    ],
  },
];

@Component({
  selector: 'app-payments-page',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="pay">

  <!-- Sadece bayiler içindir -->
  @if (!isDealer()) {
    <div class="pay__guard">
      <i class="pi pi-info-circle"></i>
      <div>
        <h2>Bu sayfa bayiler içindir</h2>
        <p>
          Bireysel hesaplarda ödeme sipariş anında alınır; aylık borç biriktirilmez.
          Siparişlerinizi <a routerLink="/dashboard/orders">Siparişlerim</a> sayfasından görebilirsiniz.
        </p>
      </div>
    </div>
  } @else {

  <!-- HEADER -->
  <div class="pay__header">
    <div>
      <h1 class="pay__title">Ödeme Borçlarım</h1>
      <p class="pay__sub">Bayi hesabınızın aylık ekstresi — her ayın 1'inde ödenir</p>
    </div>
  </div>

  <!-- ÖZET KARTLARI -->
  <div class="pay__cards">
    <div class="sum-card sum-card--accent">
      <span class="sum-card__lbl">Bu Ay Birikiyor</span>
      <span class="sum-card__val">₺{{ accruingTotal() | number }}</span>
      <span class="sum-card__meta"><i class="pi pi-calendar-clock"></i> Son ödeme: {{ accruingDue() }}</span>
    </div>
    <div class="sum-card sum-card--warn">
      <span class="sum-card__lbl">Vadesi Gelen</span>
      <span class="sum-card__val">₺{{ dueTotal() | number }}</span>
      <span class="sum-card__meta"><i class="pi pi-exclamation-circle"></i> {{ dueCount() }} ekstre bekliyor</span>
    </div>
    <div class="sum-card">
      <span class="sum-card__lbl">Toplam Açık Bakiye</span>
      <span class="sum-card__val">₺{{ outstandingTotal() | number }}</span>
      <span class="sum-card__meta"><i class="pi pi-wallet"></i> Birikiyor + vadesi gelen</span>
    </div>
  </div>

  <!-- EKSTRELER -->
  <div class="pay__statements">
    @for (st of statements; track st.id) {
      <div class="stmt stmt--{{ st.status }}">

        <button class="stmt__head" type="button" (click)="toggle(st.id)">
          <div class="stmt__head-left">
            <i class="pi" [class.pi-chevron-down]="isOpen(st.id)" [class.pi-chevron-right]="!isOpen(st.id)"></i>
            <div>
              <p class="stmt__period">{{ st.period }} <span class="stmt__id">{{ st.id }}</span></p>
              <p class="stmt__due">
                <i class="pi pi-calendar"></i>
                @if (st.status === 'paid') { Ödendi · {{ st.paidAt }} }
                @else { Son ödeme: {{ st.dueDate }} }
              </p>
            </div>
          </div>
          <div class="stmt__head-right">
            <span class="stmt__count">{{ st.orders.length }} sipariş</span>
            <span class="stmt__amount">₺{{ totalOf(st) | number }}</span>
            <span class="st-chip st-chip--{{ st.status }}"><span class="st-dot"></span>{{ statusLabel(st.status) }}</span>
          </div>
        </button>

        @if (isOpen(st.id)) {
          <div class="stmt__body">
            <table class="stmt__table">
              <thead><tr><th>Sipariş</th><th>Araç</th><th>Servis</th><th>Tarih</th><th class="ta-r">Tutar</th></tr></thead>
              <tbody>
                @for (o of st.orders; track o.id) {
                  <tr>
                    <td class="mono">{{ o.id }}</td>
                    <td>{{ o.vehicle }}</td>
                    <td class="muted">{{ o.service }}</td>
                    <td class="muted">{{ o.date }}</td>
                    <td class="ta-r price">₺{{ o.amount | number }}</td>
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr><td colspan="4" class="ta-r foot-lbl">Dönem Toplamı</td><td class="ta-r foot-val">₺{{ totalOf(st) | number }}</td></tr>
              </tfoot>
            </table>

            @if (st.status === 'due' || st.status === 'overdue') {
              <div class="stmt__actions">
                <p class="stmt__pay-note">
                  <i class="pi pi-info-circle"></i>
                  Bu ekstrenin son ödeme tarihi {{ st.dueDate }}. Ödemeyi tamamlayarak hesabınızı güncel tutun.
                </p>
                <button class="pay-btn" type="button" (click)="payStatement(st.id)">
                  <i class="pi pi-credit-card"></i> ₺{{ totalOf(st) | number }} Öde
                </button>
              </div>
            } @else if (st.status === 'accruing') {
              <p class="stmt__accruing-note">
                <i class="pi pi-clock"></i>
                Bu dönem hâlâ açık. Ay sonunda kapanacak ve {{ st.dueDate }} tarihinde ödenecek.
              </p>
            }
          </div>
        }
      </div>
    }
  </div>

  @if (paidMsg()) {
    <div class="pay__toast"><i class="pi pi-check-circle"></i> {{ paidMsg() }}</div>
  }

  }
</div>
  `,
  styles: [`
    .pay { display: flex; flex-direction: column; gap: 1.5rem; }

    /* Guard (non-dealer) */
    .pay__guard {
      display: flex; align-items: flex-start; gap: 1rem; max-width: 560px;
      background: #1a1d27; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 1.75rem;
      i { font-size: 1.5rem; color: #60a5fa; flex-shrink: 0; }
      h2 { font-size: 1.05rem; color: #fff; margin: 0 0 0.4rem; }
      p { font-size: 0.85rem; color: rgba(255,255,255,0.55); margin: 0; line-height: 1.6; }
      a { color: #e63946; text-decoration: none; &:hover { text-decoration: underline; } }
    }

    .pay__title { font-size: 1.6rem; font-weight: 700; color: #fff; margin: 0; }
    .pay__sub   { font-size: 0.875rem; color: rgba(255,255,255,0.4); margin: 0.25rem 0 0; }

    /* Summary cards */
    .pay__cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; @media(max-width:820px){ grid-template-columns: 1fr; } }
    .sum-card {
      background: #1a1d27; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 1.3rem 1.4rem;
      display: flex; flex-direction: column; gap: 0.4rem;
      &__lbl { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(255,255,255,0.4); }
      &__val { font-size: 1.7rem; font-weight: 800; color: #fff; }
      &__meta { display: flex; align-items: center; gap: 0.4rem; font-size: 0.72rem; color: rgba(255,255,255,0.4); i { font-size: 0.75rem; } }
      &--accent { border-color: rgba(96,165,250,0.3); .sum-card__val { color: #60a5fa; } }
      &--warn   { border-color: rgba(251,191,36,0.3); .sum-card__val { color: #fbbf24; } }
    }

    /* Statements */
    .pay__statements { display: flex; flex-direction: column; gap: 0.85rem; }
    .stmt { background: #1a1d27; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; transition: border-color 200ms;
      &--due     { border-color: rgba(251,191,36,0.25); }
      &--overdue { border-color: rgba(248,113,113,0.3); }
    }
    .stmt__head {
      width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 1rem;
      padding: 1.1rem 1.4rem; background: transparent; border: none; cursor: pointer; text-align: left;
      transition: background 160ms; &:hover { background: rgba(255,255,255,0.02); }
    }
    .stmt__head-left { display: flex; align-items: center; gap: 0.85rem; min-width: 0;
      > i { color: rgba(255,255,255,0.35); font-size: 0.8rem; flex-shrink: 0; }
    }
    .stmt__period { font-size: 0.95rem; font-weight: 700; color: #fff; margin: 0 0 3px; }
    .stmt__id { font-size: 0.68rem; font-weight: 500; color: rgba(255,255,255,0.3); font-family: monospace; margin-left: 0.4rem; }
    .stmt__due { display: flex; align-items: center; gap: 0.4rem; font-size: 0.72rem; color: rgba(255,255,255,0.4); margin: 0; i { font-size: 0.7rem; } }
    .stmt__head-right { display: flex; align-items: center; gap: 1rem; flex-shrink: 0; }
    .stmt__count  { font-size: 0.72rem; color: rgba(255,255,255,0.35); white-space: nowrap; @media(max-width:640px){ display: none; } }
    .stmt__amount { font-size: 1.05rem; font-weight: 800; color: #fff; white-space: nowrap; }

    .st-chip { display: inline-flex; align-items: center; gap: 5px; font-size: 0.68rem; font-weight: 600; padding: 4px 10px; border-radius: 20px; white-space: nowrap; }
    .st-dot  { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .st-chip--accruing { background: rgba(96,165,250,0.12); color: #60a5fa; }
    .st-chip--due      { background: rgba(251,191,36,0.12); color: #fbbf24; }
    .st-chip--paid     { background: rgba(74,222,128,0.12); color: #4ade80; }
    .st-chip--overdue  { background: rgba(248,113,113,0.12); color: #f87171; }

    .stmt__body { padding: 0 1.4rem 1.4rem; border-top: 1px solid rgba(255,255,255,0.05); }
    .stmt__table { width: 100%; border-collapse: collapse; margin-top: 0.5rem;
      th { padding: 0.7rem 0.6rem; font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255,255,255,0.35); text-align: left; border-bottom: 1px solid rgba(255,255,255,0.06); }
      td { padding: 0.7rem 0.6rem; font-size: 0.8rem; color: rgba(255,255,255,0.75); border-bottom: 1px solid rgba(255,255,255,0.04); }
    }
    .ta-r { text-align: right !important; }
    .mono { font-family: monospace; color: rgba(255,255,255,0.6) !important; }
    .muted { color: rgba(255,255,255,0.45) !important; }
    .price { font-weight: 700; color: #fff !important; }
    .foot-lbl { font-size: 0.75rem; color: rgba(255,255,255,0.4) !important; font-weight: 600; padding-top: 0.85rem !important; }
    .foot-val { font-size: 0.95rem; font-weight: 800; color: #fff !important; padding-top: 0.85rem !important; }

    .stmt__actions { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-top: 1rem; }
    .stmt__pay-note { display: flex; align-items: center; gap: 0.5rem; font-size: 0.74rem; color: rgba(255,255,255,0.45); margin: 0; flex: 1; min-width: 220px; i { color: #fbbf24; } }
    .stmt__accruing-note { display: flex; align-items: center; gap: 0.5rem; font-size: 0.74rem; color: rgba(255,255,255,0.4); margin: 1rem 0 0; i { color: #60a5fa; } }
    .pay-btn {
      display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.7rem 1.4rem; border-radius: 11px; border: none; cursor: pointer;
      background: linear-gradient(135deg, #e63946, #c1121f); color: #fff; font-size: 0.85rem; font-weight: 700; white-space: nowrap;
      transition: all 180ms; &:hover { opacity: 0.9; transform: translateY(-1px); }
    }

    .pay__toast {
      position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 200;
      display: flex; align-items: center; gap: 0.5rem; padding: 0.85rem 1.25rem; border-radius: 12px;
      background: rgba(74,222,128,0.12); border: 1px solid rgba(74,222,128,0.3); color: #4ade80; font-size: 0.85rem; font-weight: 600;
      i { font-size: 1rem; }
    }
  `],
})
export class PaymentsPage {
  private readonly auth = inject(AuthService);
  protected readonly isDealer = this.auth.isDealer;

  protected readonly statements = STATEMENTS;
  protected readonly openIds = signal<Set<string>>(new Set(['EXT-2026-05', 'EXT-2026-04']));
  protected readonly paidMsg = signal('');

  protected readonly accruingDue = computed(
    () => this.statements.find(s => s.status === 'accruing')?.dueDate ?? '—',
  );
  protected readonly accruingTotal = computed(() =>
    this.sumByStatus('accruing'),
  );
  protected readonly dueTotal = computed(() =>
    this.sumByStatus('due') + this.sumByStatus('overdue'),
  );
  protected readonly dueCount = computed(() =>
    this.statements.filter(s => s.status === 'due' || s.status === 'overdue').length,
  );
  protected readonly outstandingTotal = computed(() =>
    this.accruingTotal() + this.dueTotal(),
  );

  private sumByStatus(status: DebtStatus): number {
    return this.statements
      .filter(s => s.status === status)
      .reduce((sum, s) => sum + this.totalOf(s), 0);
  }

  totalOf(st: MonthlyStatement): number {
    return st.orders.reduce((sum, o) => sum + o.amount, 0);
  }
  statusLabel(s: DebtStatus): string { return STATUS_META[s].label; }

  isOpen(id: string): boolean { return this.openIds().has(id); }
  toggle(id: string): void {
    const s = new Set(this.openIds());
    if (s.has(id)) { s.delete(id); } else { s.add(id); }
    this.openIds.set(s);
  }

  payStatement(id: string): void {
    const st = this.statements.find(s => s.id === id);
    if (st) {
      this.paidMsg.set(`${st.period} ekstresi için ödeme talebi alındı.`);
    }
  }
}
