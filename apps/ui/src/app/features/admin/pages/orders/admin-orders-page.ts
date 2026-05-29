import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

interface AdminOrder {
  id: string; user: string; email: string;
  vehicle: string; stage: string; ecu: string;
  status: OrderStatus;
  date: string; price: string;
  vin?: string; km?: string; transmission?: string;
  notes?: string;
  fileUploaded: boolean; fileSent: boolean;
}

const MOCK_ORDERS: AdminOrder[] = [
  { id: 'ORD-048', user: 'Ali Yıldız',    email: 'kullanici@atsracing.com', vehicle: 'BMW M3 G80',       stage: 'Stage 1', ecu: 'Bosch MG1',      status: 'pending',    date: '29 May 2026', price: '₺2.500', vin: 'WBA7E2103MCH52841', km: '12.000', transmission: 'Manuel',    notes: 'Decat paketi de isteniyor.', fileUploaded: false, fileSent: false },
  { id: 'ORD-047', user: 'Mert Kaya',     email: 'mert@gmail.com',          vehicle: 'Audi RS6 C8',      stage: 'Stage 2', ecu: 'Bosch MED17',    status: 'processing', date: '28 May 2026', price: '₺4.000', vin: 'WAUZZZ4G8KN012345', km: '8.500',  transmission: 'Otomatik',  notes: '',                           fileUploaded: true,  fileSent: false },
  { id: 'ORD-046', user: 'Selin Demir',   email: 'selin@hotmail.com',       vehicle: 'VW Golf R Mk8',    stage: 'Stage 1', ecu: 'Bosch MG1CS',    status: 'completed',  date: '27 May 2026', price: '₺2.500', vin: 'WVWZZZ1KZMW123456', km: '5.200',  transmission: 'DSG',       notes: '',                           fileUploaded: true,  fileSent: true  },
  { id: 'ORD-045', user: 'Emre Şahin',   email: 'emre@outlook.com',        vehicle: 'Porsche 911 Turbo',stage: 'Stage 3', ecu: 'Bosch ME7',      status: 'completed',  date: '26 May 2026', price: '₺7.500', vin: 'WP0ZZZ99ZLS123456', km: '22.000', transmission: 'PDK',       notes: 'OPF silme de dahil.',        fileUploaded: true,  fileSent: true  },
  { id: 'ORD-044', user: 'Zeynep Arslan', email: 'zeynep@gmail.com',        vehicle: 'Mercedes C63 AMG', stage: 'Stage 2', ecu: 'Siemens SIM266', status: 'processing', date: '25 May 2026', price: '₺4.000', vin: 'WDDGF4HB3FR123456', km: '31.000', transmission: 'Otomatik',  notes: '',                           fileUploaded: false, fileSent: false },
  { id: 'ORD-043', user: 'Berk Öztürk',  email: 'berk@gmail.com',          vehicle: 'BMW M5 F90',       stage: 'Stage 1', ecu: 'Bosch MG1',      status: 'pending',    date: '24 May 2026', price: '₺2.500', vin: 'WBSJF0C59LC123456', km: '4.100',  transmission: 'Otomatik',  notes: '',                           fileUploaded: false, fileSent: false },
  { id: 'ORD-042', user: 'Mert Kaya',     email: 'mert@gmail.com',          vehicle: 'Audi S3 8Y',       stage: 'Stage 3', ecu: 'Bosch MED17',    status: 'cancelled',  date: '20 May 2026', price: '₺7.500', vin: '',                  km: '',       transmission: '',          notes: 'Müşteri iptal etti.',        fileUploaded: false, fileSent: false },
];

const STATUS_LABEL: Record<OrderStatus, string> = { pending: 'Beklemede', processing: 'İşlemde', completed: 'Tamamlandı', cancelled: 'İptal' };
const STATUS_NEXT:  Record<OrderStatus, OrderStatus> = { pending: 'processing', processing: 'completed', completed: 'completed', cancelled: 'cancelled' };

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="aor">
  <div class="aor__header">
    <div>
      <h1 class="aor__title">Siparişler</h1>
      <p class="aor__sub">{{ filtered().length }} sipariş</p>
    </div>
    <div class="aor__actions">
      <div class="aor-search">
        <i class="pi pi-search"></i>
        <input type="text" placeholder="Sipariş veya kullanıcı ara…" [(ngModel)]="search" />
      </div>
      <select class="aor-filter" [(ngModel)]="filterStatus">
        <option value="">Tüm Durumlar</option>
        <option value="pending">Beklemede</option>
        <option value="processing">İşlemde</option>
        <option value="completed">Tamamlandı</option>
        <option value="cancelled">İptal</option>
      </select>
    </div>
  </div>

  <!-- Status tab counts -->
  <div class="aor__status-bar">
    @for (s of statusTabs; track s.key) {
      <button class="aor-stab" type="button"
        [class.aor-stab--active]="filterStatus === s.key"
        (click)="filterStatus = filterStatus === s.key ? '' : s.key">
        <span class="aor-stab__dot aor-stab__dot--{{ s.key }}"></span>
        {{ s.label }}
        <span class="aor-stab__count">{{ countByStatus(s.key) }}</span>
      </button>
    }
  </div>

  <div class="aor__layout" [class.aor__layout--detail]="selectedOrder()">

    <!-- ── Orders list ── -->
    <div class="aor-list-wrap">
      @for (o of filtered(); track o.id) {
        <div class="aor-card" [class.aor-card--active]="selectedOrder()?.id === o.id"
          [class.aor-card--completed]="o.status === 'completed'"
          [class.aor-card--processing]="o.status === 'processing'"
          (click)="selectOrder(o)">

          <div class="aor-card__top">
            <span class="aor-card__id">{{ o.id }}</span>
            <span class="aor-status aor-status--{{ o.status }}">
              <span class="aor-status__dot"></span>{{ statusLabel(o.status) }}
            </span>
          </div>

          <div class="aor-card__user">
            <div class="aor-card__avatar">{{ initials(o.user) }}</div>
            <div>
              <p class="aor-card__name">{{ o.user }}</p>
              <p class="aor-card__email">{{ o.email }}</p>
            </div>
          </div>

          <div class="aor-card__vehicle-row">
            <span class="aor-card__vehicle">{{ o.vehicle }}</span>
            <span class="aor-stage aor-stage--{{ o.stage === 'Stage 1' ? 's1' : o.stage === 'Stage 2' ? 's2' : 's3' }}">{{ o.stage }}</span>
          </div>

          <div class="aor-card__footer">
            <span class="aor-card__price">{{ o.price }}</span>
            <span class="aor-card__date">{{ o.date }}</span>
            @if (o.fileSent) {
              <span class="aor-file-chip aor-file-chip--sent"><i class="pi pi-check-circle"></i> Gönderildi</span>
            } @else if (o.fileUploaded) {
              <span class="aor-file-chip aor-file-chip--ready"><i class="pi pi-file"></i> Hazır</span>
            } @else if (o.status !== 'completed' && o.status !== 'cancelled') {
              <span class="aor-file-chip aor-file-chip--missing"><i class="pi pi-clock"></i> Bekleniyor</span>
            }
          </div>

        </div>
      }
      @if (filtered().length === 0) {
        <div class="aor-empty"><i class="pi pi-inbox"></i><p>Sipariş bulunamadı</p></div>
      }
    </div>

    <!-- ── Order detail ── -->
    @if (selectedOrder(); as o) {
      <div class="aor-detail">
        <div class="aor-detail__head">
          <div>
            <h2 class="aor-detail__id">{{ o.id }}</h2>
            <span class="aor-status aor-status--{{ o.status }}"><span class="aor-status__dot"></span>{{ statusLabel(o.status) }}</span>
          </div>
          <button class="aor-close-btn" type="button" (click)="selectedOrder.set(null)"><i class="pi pi-times"></i></button>
        </div>

        <!-- User -->
        <div class="aor-detail__section">
          <p class="aor-detail__section-title">Müşteri</p>
          <div class="aor-detail__user-row">
            <div class="aor-detail__avatar">{{ initials(o.user) }}</div>
            <div>
              <p class="aor-detail__user-name">{{ o.user }}</p>
              <p class="aor-detail__user-email">{{ o.email }}</p>
            </div>
          </div>
        </div>

        <!-- Vehicle & Order info -->
        <div class="aor-detail__section">
          <p class="aor-detail__section-title">Araç & Sipariş Bilgileri</p>
          <div class="aor-info-grid">
            <div class="aor-info-item"><span class="aor-info-item__lbl">Araç</span><span class="aor-info-item__val">{{ o.vehicle }}</span></div>
            <div class="aor-info-item"><span class="aor-info-item__lbl">Stage</span>
              <span class="aor-stage aor-stage--{{ o.stage === 'Stage 1' ? 's1' : o.stage === 'Stage 2' ? 's2' : 's3' }}">{{ o.stage }}</span>
            </div>
            <div class="aor-info-item"><span class="aor-info-item__lbl">ECU</span><span class="aor-info-item__val">{{ o.ecu }}</span></div>
            <div class="aor-info-item"><span class="aor-info-item__lbl">Tarih</span><span class="aor-info-item__val">{{ o.date }}</span></div>
            <div class="aor-info-item"><span class="aor-info-item__lbl">Ücret</span><span class="aor-info-item__val aor-info-item__val--price">{{ o.price }}</span></div>
            @if (o.transmission) { <div class="aor-info-item"><span class="aor-info-item__lbl">Şanzıman</span><span class="aor-info-item__val">{{ o.transmission }}</span></div> }
            @if (o.km) { <div class="aor-info-item"><span class="aor-info-item__lbl">Kilometre</span><span class="aor-info-item__val">{{ o.km }} km</span></div> }
            @if (o.vin) { <div class="aor-info-item aor-info-item--full"><span class="aor-info-item__lbl">VIN</span><span class="aor-info-item__val aor-info-item__val--mono">{{ o.vin }}</span></div> }
          </div>
          @if (o.notes) {
            <div class="aor-notes"><i class="pi pi-comment"></i> {{ o.notes }}</div>
          }
        </div>

        <!-- Status change -->
        @if (o.status !== 'cancelled') {
          <div class="aor-detail__section">
            <p class="aor-detail__section-title">Sipariş Durumu</p>
            <div class="aor-status-btns">
              @for (s of statusTabs; track s.key) {
                @if (s.key !== 'cancelled') {
                  <button type="button" class="aor-status-btn"
                    [class.aor-status-btn--active]="o.status === s.key"
                    [class.aor-status-btn--done]="statusRank(o.status) > statusRank(s.key)"
                    (click)="setStatus(o, s.key)">
                    <span class="aor-stab__dot aor-stab__dot--{{ s.key }}"></span>
                    {{ s.label }}
                  </button>
                }
              }
            </div>
          </div>
        }

        <!-- File section -->
        <div class="aor-detail__section">
          <p class="aor-detail__section-title">Yazılım Dosyası</p>
          @if (o.fileSent) {
            <div class="aor-file-sent-banner">
              <i class="pi pi-check-circle"></i>
              <div>
                <p class="aor-file-sent-banner__title">Dosya Gönderildi</p>
                <p class="aor-file-sent-banner__sub">Müşteri dosyasını indirebilir.</p>
              </div>
            </div>
          } @else if (o.status !== 'cancelled') {
            <div class="aor-upload-zone" [class.aor-upload-zone--filled]="selectedFile(o.id)"
              (dragover)="$event.preventDefault()" (drop)="onDrop($event, o.id)">
              @if (!selectedFile(o.id)) {
                <i class="pi pi-cloud-upload"></i>
                <p>Dosyayı buraya sürükle veya seç</p>
                <label class="aor-upload-btn">
                  <i class="pi pi-folder-open"></i> Dosya Seç
                  <input type="file" accept=".bin,.ori,.hex,.mod" (change)="onFileSelect($event, o.id)" style="display:none" />
                </label>
              } @else {
                <i class="pi pi-file" style="color:#4ade80; font-size:1.5rem"></i>
                <span class="aor-upload-fname">{{ selectedFile(o.id)!.name }}</span>
                <button type="button" class="aor-remove-file" (click)="removeFile(o.id)"><i class="pi pi-times"></i></button>
              }
            </div>
            <button class="aor-send-btn" type="button"
              [disabled]="!selectedFile(o.id)"
              (click)="sendFile(o)">
              <i class="pi pi-send"></i> Müşteriye Gönder & Tamamla
            </button>
          } @else {
            <p class="aor-detail__empty-note">İptal edilen sipariş için dosya işlemi yapılamaz.</p>
          }
        </div>

      </div>
    }

  </div>
</div>
  `,
  styles: [`
    .aor { display: flex; flex-direction: column; gap: 1.25rem; }
    .aor__title { font-size: 1.6rem; font-weight: 700; color: #fff; margin: 0; }
    .aor__sub { font-size: 0.875rem; color: rgba(255,255,255,0.4); margin: 0.25rem 0 0; }
    .aor__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
    .aor__actions { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }

    .aor-search {
      display: flex; align-items: center; gap: 0.5rem;
      background: #13151c; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 0 0.9rem;
      i { color: rgba(255,255,255,0.3); font-size: 0.8rem; }
      input { background: transparent; border: none; color: rgba(255,255,255,0.85); font-size: 0.85rem; padding: 0.6rem 0; width: 220px;
        &:focus { outline: none; } &::placeholder { color: rgba(255,255,255,0.2); }
      }
    }
    .aor-filter {
      background: #13151c; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
      padding: 0.6rem 1rem; color: rgba(255,255,255,0.75); font-size: 0.8rem; cursor: pointer; appearance: none; min-width: 140px;
      option { background: #1a1d27; }
    }

    /* ── Status bar ── */
    .aor__status-bar { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .aor-stab {
      display: flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.85rem; border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.08); background: #13151c; color: rgba(255,255,255,0.5); font-size: 0.78rem; cursor: pointer;
      transition: all 160ms;
      &:hover { border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.85); }
      &--active { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.2); color: #fff; }
      &__count { background: rgba(255,255,255,0.1); border-radius: 10px; padding: 0 6px; font-size: 0.7rem; font-weight: 700; }
      &__dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
        &--pending    { background: #fbbf24; }
        &--processing { background: #60a5fa; box-shadow: 0 0 5px #60a5fa88; }
        &--completed  { background: #4ade80; }
        &--cancelled  { background: rgba(255,255,255,0.2); }
      }
    }

    /* ── Layout ── */
    .aor__layout {
      display: grid; grid-template-columns: 1fr; gap: 1.25rem; align-items: start;
      &--detail { grid-template-columns: 1fr 400px; }
      @media(max-width:1100px) { &--detail { grid-template-columns: 1fr; } }
    }

    /* ── Order Cards ── */
    .aor-list-wrap { display: flex; flex-direction: column; gap: 0.75rem; }
    .aor-card {
      background: #13151c; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 1rem 1.25rem;
      cursor: pointer; display: flex; flex-direction: column; gap: 0.6rem; transition: border-color 180ms, background 180ms;
      &:hover { border-color: rgba(255,255,255,0.13); background: rgba(255,255,255,0.01); }
      &--active   { border-color: rgba(245,158,11,0.5) !important; background: rgba(245,158,11,0.03); }
      &--processing { border-left: 3px solid rgba(96,165,250,0.5); }
      &--completed  { border-left: 3px solid rgba(74,222,128,0.4); }

      &__top { display: flex; align-items: center; justify-content: space-between; }
      &__id  { font-family: monospace; font-size: 0.82rem; font-weight: 700; color: #f59e0b; }
      &__user { display: flex; align-items: center; gap: 0.65rem; }
      &__avatar { width: 32px; height: 32px; border-radius: 8px; background: rgba(96,165,250,0.12); color: #60a5fa; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; flex-shrink: 0; }
      &__name  { font-size: 0.85rem; font-weight: 600; color: #fff; margin: 0 0 1px; }
      &__email { font-size: 0.7rem; color: rgba(255,255,255,0.3); margin: 0; }
      &__vehicle-row { display: flex; align-items: center; gap: 0.5rem; }
      &__vehicle { font-size: 0.82rem; color: rgba(255,255,255,0.7); }
      &__footer { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
      &__price { font-size: 0.85rem; font-weight: 700; color: #fff; }
      &__date  { font-size: 0.73rem; color: rgba(255,255,255,0.3); margin-left: auto; }
    }

    .aor-stage {
      display: inline-flex; padding: 0.13rem 0.45rem; border-radius: 5px; font-size: 0.65rem; font-weight: 700;
      &--s1 { background: rgba(96,165,250,0.12); color: #60a5fa; border: 1px solid rgba(96,165,250,0.25); }
      &--s2 { background: rgba(230,57,70,0.12);  color: #e63946; border: 1px solid rgba(230,57,70,0.25);  }
      &--s3 { background: rgba(167,139,250,0.12);color: #a78bfa; border: 1px solid rgba(167,139,250,0.25);}
    }

    .aor-status {
      display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; font-weight: 600;
      &__dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
      &--pending    { color: #fbbf24; .aor-status__dot { background: #fbbf24; } }
      &--processing { color: #60a5fa; .aor-status__dot { background: #60a5fa; box-shadow: 0 0 6px #60a5fa88; } }
      &--completed  { color: #4ade80; .aor-status__dot { background: #4ade80; } }
      &--cancelled  { color: rgba(255,255,255,0.3); .aor-status__dot { background: rgba(255,255,255,0.2); } }
    }

    .aor-file-chip {
      display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.18rem 0.55rem; border-radius: 6px; font-size: 0.68rem; font-weight: 600;
      i { font-size: 0.65rem; }
      &--sent    { background: rgba(74,222,128,0.1);  color: #4ade80;  border: 1px solid rgba(74,222,128,0.2);  }
      &--ready   { background: rgba(96,165,250,0.1);  color: #60a5fa;  border: 1px solid rgba(96,165,250,0.2);  }
      &--missing { background: rgba(251,191,36,0.08); color: #fbbf24;  border: 1px solid rgba(251,191,36,0.15); }
    }

    .aor-empty { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem; color: rgba(255,255,255,0.2); i { font-size: 2.5rem; } p { font-size: 0.875rem; margin: 0; } }

    /* ── Detail Panel ── */
    .aor-detail {
      background: #13151c; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden;
      display: flex; flex-direction: column;
      animation: slideIn 260ms cubic-bezier(0.22,1,0.36,1) both;
    }
    @keyframes slideIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }

    .aor-detail__head {
      display: flex; align-items: flex-start; justify-content: space-between; padding: 1.25rem;
      border-bottom: 1px solid rgba(255,255,255,0.07); gap: 0.75rem;
      h2 { font-family: monospace; font-size: 1.1rem; font-weight: 700; color: #f59e0b; margin: 0 0 5px; }
    }
    .aor-close-btn { width: 30px; height: 30px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: rgba(255,255,255,0.4); cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; &:hover { color: #fff; background: rgba(255,255,255,0.08); } }

    .aor-detail__section { padding: 1rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06); &:last-child { border-bottom: none; } }
    .aor-detail__section-title { font-size: 0.68rem; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: .07em; margin: 0 0 0.75rem; }

    .aor-detail__user-row { display: flex; align-items: center; gap: 0.75rem; }
    .aor-detail__avatar { width: 40px; height: 40px; border-radius: 10px; background: rgba(96,165,250,0.12); color: #60a5fa; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; }
    .aor-detail__user-name  { font-size: 0.9rem; font-weight: 600; color: #fff; margin: 0 0 2px; }
    .aor-detail__user-email { font-size: 0.75rem; color: rgba(255,255,255,0.35); margin: 0; }

    .aor-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; }
    .aor-info-item {
      display: flex; flex-direction: column; gap: 2px;
      &--full { grid-column: 1 / -1; }
      &__lbl { font-size: 0.65rem; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: .04em; }
      &__val { font-size: 0.82rem; color: rgba(255,255,255,0.85); font-weight: 500; &--price { color: #fff; font-weight: 700; } &--mono { font-family: monospace; font-size: 0.75rem; } }
    }
    .aor-notes { margin-top: 0.75rem; display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.8rem; color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.03); border-radius: 8px; padding: 0.6rem 0.75rem; i { color: rgba(245,158,11,0.6); flex-shrink: 0; margin-top: 1px; } }

    /* Status change */
    .aor-status-btns { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .aor-status-btn {
      display: flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.85rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); background: transparent; color: rgba(255,255,255,0.4); font-size: 0.78rem; cursor: pointer;
      &:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.8); }
      &--active { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.25); color: #fff; font-weight: 600; }
      &--done { opacity: 0.45; cursor: default; }
    }

    /* File upload */
    .aor-upload-zone {
      border: 2px dashed rgba(255,255,255,0.1); border-radius: 12px; background: rgba(255,255,255,0.02);
      display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
      padding: 1.5rem; text-align: center; margin-bottom: 0.75rem;
      i { font-size: 1.75rem; color: rgba(255,255,255,0.2); }
      p { font-size: 0.8rem; color: rgba(255,255,255,0.3); margin: 0; }
      &--filled { border-color: rgba(74,222,128,0.3); background: rgba(74,222,128,0.03); flex-direction: row; padding: 0.75rem 1rem; }
    }
    .aor-upload-btn {
      display: inline-flex; align-items: center; gap: 0.4rem; cursor: pointer;
      background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px;
      padding: 0.4rem 0.85rem; font-size: 0.78rem; color: rgba(255,255,255,0.7);
      &:hover { background: rgba(255,255,255,0.12); }
    }
    .aor-upload-fname { flex: 1; font-size: 0.82rem; color: rgba(255,255,255,0.8); text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .aor-remove-file { border: none; background: transparent; color: rgba(255,255,255,0.3); cursor: pointer; font-size: 0.8rem; &:hover { color: #fff; } }
    .aor-send-btn {
      width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      padding: 0.7rem; border-radius: 10px; border: none; cursor: pointer;
      background: linear-gradient(135deg, #4ade80, #16a34a); color: #000; font-size: 0.875rem; font-weight: 700;
      &:hover:not(:disabled) { opacity: 0.9; } &:disabled { opacity: 0.3; cursor: not-allowed; }
    }
    .aor-file-sent-banner {
      display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.9rem 1rem; border-radius: 12px;
      background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.2); color: #4ade80;
      i { font-size: 1.25rem; flex-shrink: 0; margin-top: 1px; }
      p { margin: 0; } &__title { font-weight: 700; font-size: 0.875rem; } &__sub { font-size: 0.75rem; opacity: 0.7; margin-top: 2px; }
    }
    .aor-detail__empty-note { font-size: 0.8rem; color: rgba(255,255,255,0.3); margin: 0; }
  `],
})
export class AdminOrdersPage {
  protected readonly orders = signal<AdminOrder[]>(MOCK_ORDERS);
  protected readonly selectedOrder = signal<AdminOrder | null>(null);
  protected readonly files = signal<Record<string, File | null>>({});
  protected search       = '';
  protected filterStatus = '';

  protected readonly statusTabs = [
    { key: 'pending'    as OrderStatus, label: 'Beklemede'  },
    { key: 'processing' as OrderStatus, label: 'İşlemde'    },
    { key: 'completed'  as OrderStatus, label: 'Tamamlandı' },
    { key: 'cancelled'  as OrderStatus, label: 'İptal'      },
  ];

  protected readonly filtered = computed(() => {
    let list = this.orders();
    if (this.search) { const q = this.search.toLowerCase(); list = list.filter(o => o.id.toLowerCase().includes(q) || o.user.toLowerCase().includes(q)); }
    if (this.filterStatus) { list = list.filter(o => o.status === this.filterStatus); }
    return list;
  });

  statusLabel(s: OrderStatus): string { return STATUS_LABEL[s]; }
  countByStatus(s: OrderStatus): number { return this.orders().filter(o => o.status === s).length; }
  initials(name: string): string { return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(); }
  selectedFile(id: string): File | null { return this.files()[id] ?? null; }
  statusRank(s: OrderStatus): number { return { pending: 0, processing: 1, completed: 2, cancelled: -1 }[s]; }

  selectOrder(o: AdminOrder): void {
    const current = this.selectedOrder();
    this.selectedOrder.set(current?.id === o.id ? null : o);
  }

  setStatus(o: AdminOrder, status: OrderStatus): void {
    if (o.status === status) { return; }
    this.orders.update(list => list.map(x => x.id === o.id ? { ...x, status } : x));
    if (this.selectedOrder()?.id === o.id) {
      this.selectedOrder.update(sel => sel ? { ...sel, status } : sel);
    }
  }

  onFileSelect(ev: Event, orderId: string): void {
    const file = (ev.target as HTMLInputElement).files?.[0] ?? null;
    this.files.update(m => ({ ...m, [orderId]: file }));
  }

  onDrop(ev: DragEvent, orderId: string): void {
    ev.preventDefault();
    const file = ev.dataTransfer?.files?.[0] ?? null;
    if (file) { this.files.update(m => ({ ...m, [orderId]: file })); }
  }

  removeFile(orderId: string): void { this.files.update(m => ({ ...m, [orderId]: null })); }

  sendFile(o: AdminOrder): void {
    if (!this.files()[o.id]) { return; }
    this.orders.update(list => list.map(x =>
      x.id === o.id ? { ...x, fileUploaded: true, fileSent: true, status: 'completed' } : x
    ));
    this.selectedOrder.update(sel => sel?.id === o.id ? { ...sel, fileUploaded: true, fileSent: true, status: 'completed' } : sel);
    this.files.update(m => ({ ...m, [o.id]: null }));
  }
}
