import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

interface UserOrder {
  id: string;
  vehicle: string;
  stage: string;
  ecu: string;
  date: string;
  price: string;
  status: OrderStatus;
  vin?: string;
  km?: string;
  transmission?: string;
  notes?: string;
  fileAvailable: boolean;
  fileName?: string;
}

const MOCK_ORDERS: UserOrder[] = [
  { id: 'ORD-048', vehicle: 'BMW M3 G80',         stage: 'Stage 1', ecu: 'Bosch MG1',      status: 'pending',    date: '29 May 2026', price: '₺2.500', vin: 'WBA7E2103MCH52841', km: '12.000', transmission: 'Manuel',   notes: 'Decat paketi de isteniyor.', fileAvailable: false },
  { id: 'ORD-003', vehicle: 'BMW M3 G80',         stage: 'Stage 1', ecu: 'Bosch MG1',      status: 'completed',  date: '18 Mar 2026', price: '₺2.500', vin: 'WBA7E2103MCH52841', km: '10.000', transmission: 'Manuel',   notes: '',                           fileAvailable: true,  fileName: 'bmw_m3_g80_stage1_ORD003.bin' },
  { id: 'ORD-001', vehicle: 'Audi S3 8Y',         stage: 'Stage 2', ecu: 'Bosch MED17',    status: 'completed',  date: '12 May 2026', price: '₺2.750', vin: 'WAUZZZ8YXMA012345', km: '6.000',  transmission: 'DSG',      notes: '',                           fileAvailable: true,  fileName: 'audi_s3_8y_stage2_ORD001.bin' },
];

const STATUS_LABEL: Record<OrderStatus, string> = { pending: 'Beklemede', processing: 'İşlemde', completed: 'Tamamlandı', cancelled: 'İptal' };

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="op">

  <!-- HEADER -->
  <div class="op__header">
    <div>
      <h1 class="op__title">Siparişlerim</h1>
      <p class="op__sub">Oluşturduğunuz tüm chip tuning siparişleri</p>
    </div>
    <div class="op__summary">
      <div class="op__sum-item">
        <span class="op__sum-val">{{ orders.length }}</span>
        <span class="op__sum-lbl">Toplam</span>
      </div>
      <div class="op__sum-sep"></div>
      <div class="op__sum-item op__sum-item--green">
        <span class="op__sum-val">{{ countBy('completed') }}</span>
        <span class="op__sum-lbl">Tamamlandı</span>
      </div>
      <div class="op__sum-sep"></div>
      <div class="op__sum-item op__sum-item--yellow">
        <span class="op__sum-val">{{ countBy('pending') }}</span>
        <span class="op__sum-lbl">Beklemede</span>
      </div>
      <div class="op__sum-sep"></div>
      <div class="op__sum-item op__sum-item--blue">
        <span class="op__sum-val">{{ countBy('processing') }}</span>
        <span class="op__sum-lbl">İşlemde</span>
      </div>
    </div>
  </div>

  <!-- FILTERS -->
  <div class="op__filters">
    <div class="op__search">
      <i class="pi pi-search"></i>
      <input type="text" placeholder="Sipariş veya araç ara…" [(ngModel)]="search" />
    </div>
    <div class="op__filter-chips">
      @for (f of filterOptions; track f.value) {
        <button class="filter-chip"
          [class.filter-chip--active]="activeFilter() === f.value"
          type="button"
          (click)="activeFilter.set(f.value)">{{ f.label }}</button>
      }
    </div>
  </div>

  <!-- LAYOUT -->
  <div class="op__layout" [class.op__layout--detail]="selectedOrder()">

    <!-- TABLE -->
    <div class="op__table-wrap">
      <table class="op__table">
        <thead>
          <tr>
            <th>Araç</th>
            <th>Stage</th>
            <th>ECU</th>
            <th>Tarih</th>
            <th>Tutar</th>
            <th>Durum</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          @if (filtered().length === 0) {
            <tr>
              <td colspan="7" class="op__empty">
                <i class="pi pi-inbox"></i>
                <span>Sipariş bulunamadı</span>
              </td>
            </tr>
          }
          @for (o of filtered(); track o.id) {
            <tr class="op__row" [class.op__row--active]="selectedOrder()?.id === o.id" (click)="selectOrder(o)">
              <td>
                <div class="op__vehicle">
                  <div class="op__vehicle-icon"><i class="pi pi-car"></i></div>
                  <div>
                    <p class="op__vehicle-name">{{ o.vehicle }}</p>
                    <p class="op__order-id">{{ o.id }}</p>
                  </div>
                </div>
              </td>
              <td><span class="stage-chip stage-chip--{{ o.stage === 'Stage 1' ? 's1' : o.stage === 'Stage 2' ? 's2' : 's3' }}">{{ o.stage }}</span></td>
              <td class="op__ecu">{{ o.ecu }}</td>
              <td class="op__date">{{ o.date }}</td>
              <td class="op__amount">{{ o.price }}</td>
              <td>
                <span class="status-chip status--{{ o.status }}">
                  <span class="status-dot"></span>{{ statusLabel(o.status) }}
                </span>
              </td>
              <td>
                <div class="op__actions">
                  @if (o.fileAvailable) {
                    <button class="op__btn op__btn--dl" title="Dosyayı İndir" type="button" (click)="$event.stopPropagation()">
                      <i class="pi pi-download"></i>
                    </button>
                  } @else {
                    <button class="op__btn op__btn--disabled" title="Dosya Hazır Değil" type="button" disabled>
                      <i class="pi pi-clock"></i>
                    </button>
                  }
                  <button class="op__btn" title="Detay" type="button" (click)="$event.stopPropagation(); selectOrder(o)">
                    <i class="pi pi-chevron-right"></i>
                  </button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <!-- DETAIL PANEL -->
    @if (selectedOrder(); as o) {
      <div class="op-detail">

        <div class="op-detail__head">
          <div>
            <p class="op-detail__id">{{ o.id }}</p>
            <h3 class="op-detail__vehicle">{{ o.vehicle }}</h3>
          </div>
          <button class="op-close-btn" type="button" (click)="selectedOrder.set(null)"><i class="pi pi-times"></i></button>
        </div>

        <!-- Status -->
        <div class="op-detail__status-bar">
          <span class="status-chip status--{{ o.status }}"><span class="status-dot"></span>{{ statusLabel(o.status) }}</span>
          @if (o.status === 'pending') {
            <span class="op-detail__hint"><i class="pi pi-info-circle"></i> Siparişiniz inceleniyor, kısa süre içinde hazırlanacak.</span>
          }
          @if (o.status === 'processing') {
            <span class="op-detail__hint"><i class="pi pi-cog"></i> Yazılım dosyanız hazırlanıyor…</span>
          }
        </div>

        <!-- Info grid -->
        <div class="op-detail__section">
          <p class="op-detail__section-title">Sipariş Bilgileri</p>
          <div class="op-info-grid">
            <div class="op-info-item"><span class="op-info-item__lbl">Stage</span>
              <span class="stage-chip stage-chip--{{ o.stage === 'Stage 1' ? 's1' : o.stage === 'Stage 2' ? 's2' : 's3' }}">{{ o.stage }}</span>
            </div>
            <div class="op-info-item"><span class="op-info-item__lbl">ECU</span><span class="op-info-item__val">{{ o.ecu }}</span></div>
            <div class="op-info-item"><span class="op-info-item__lbl">Tarih</span><span class="op-info-item__val">{{ o.date }}</span></div>
            <div class="op-info-item"><span class="op-info-item__lbl">Ücret</span><span class="op-info-item__val op-info-item__val--price">{{ o.price }}</span></div>
            @if (o.transmission) { <div class="op-info-item"><span class="op-info-item__lbl">Şanzıman</span><span class="op-info-item__val">{{ o.transmission }}</span></div> }
            @if (o.km) { <div class="op-info-item"><span class="op-info-item__lbl">Kilometre</span><span class="op-info-item__val">{{ o.km }} km</span></div> }
            @if (o.vin) { <div class="op-info-item op-info-item--full"><span class="op-info-item__lbl">VIN</span><span class="op-info-item__val op-info-item__val--mono">{{ o.vin }}</span></div> }
          </div>
          @if (o.notes) {
            <div class="op-notes"><i class="pi pi-comment"></i> {{ o.notes }}</div>
          }
        </div>

        <!-- File section -->
        <div class="op-detail__section">
          <p class="op-detail__section-title">Yazılım Dosyası</p>
          @if (o.fileAvailable && o.fileName) {
            <div class="op-file-ready">
              <i class="pi pi-file"></i>
              <div class="op-file-ready__info">
                <p class="op-file-ready__name">{{ o.fileName }}</p>
                <p class="op-file-ready__sub">Dosyanız hazır, indirebilirsiniz.</p>
              </div>
              <button class="op-dl-btn" type="button">
                <i class="pi pi-download"></i> İndir
              </button>
            </div>
          } @else if (o.status === 'completed') {
            <div class="op-file-missing"><i class="pi pi-clock"></i><p>Dosya yükleniyor, lütfen bekleyin.</p></div>
          } @else {
            <div class="op-file-missing"><i class="pi pi-hourglass"></i><p>Sipariş tamamlandıktan sonra dosyanız burada görünecek.</p></div>
          }
        </div>

        <!-- Upload original file -->
        <div class="op-detail__section">
          <p class="op-detail__section-title">Orijinal Dosya Yükle <span class="op-detail__optional">(opsiyonel)</span></p>
          <p class="op-detail__hint-text">Mevcut araç yazılım dosyanız varsa yükleyebilirsiniz.</p>
          <div class="op-upload-zone" [class.op-upload-zone--filled]="uploadedFile()"
            (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
            @if (!uploadedFile()) {
              <i class="pi pi-cloud-upload"></i>
              <p>Dosyayı sürükle veya seç</p>
              <label class="op-upload-btn">
                <i class="pi pi-folder-open"></i> Dosya Seç
                <input type="file" accept=".bin,.ori,.hex,.mod" (change)="onFileSelect($event)" style="display:none" />
              </label>
            } @else {
              <i class="pi pi-file" style="color:#4ade80"></i>
              <span class="op-upload-fname">{{ uploadedFile()!.name }}</span>
              <div class="op-upload-actions">
                <button type="button" class="op-upload-send-btn" (click)="sendOriginalFile()">
                  <i class="pi pi-send"></i> Gönder
                </button>
                <button type="button" class="op-upload-remove" (click)="uploadedFile.set(null)"><i class="pi pi-times"></i></button>
              </div>
            }
          </div>
          @if (fileSent()) {
            <div class="op-sent-note"><i class="pi pi-check-circle"></i> Dosyanız başarıyla gönderildi.</div>
          }
        </div>

      </div>
    }

  </div>

  <!-- Pagination -->
  <div class="op__pagination">
    <span class="op__page-info">{{ filtered().length }} / {{ orders.length }} sipariş gösteriliyor</span>
    <div class="op__page-btns">
      <button class="op__page-btn" disabled><i class="pi pi-chevron-left"></i></button>
      <button class="op__page-btn op__page-btn--active">1</button>
      <button class="op__page-btn"><i class="pi pi-chevron-right"></i></button>
    </div>
  </div>

</div>
  `,
  styles: [`
    .op { display: flex; flex-direction: column; gap: 1.5rem; }

    /* ── Header ── */
    .op__header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
    .op__title { font-size: 1.6rem; font-weight: 700; color: #fff; margin: 0; }
    .op__sub   { font-size: 0.875rem; color: rgba(255,255,255,0.4); margin: 0.25rem 0 0; }

    .op__summary {
      display: flex; align-items: center; gap: 1.25rem;
      background: #1a1d27; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1rem 1.5rem;
    }
    .op__sum-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .op__sum-val  { font-size: 1.2rem; font-weight: 700; color: #fff; }
    .op__sum-lbl  { font-size: 0.7rem; color: rgba(255,255,255,0.4); white-space: nowrap; }
    .op__sum-sep  { width: 1px; height: 32px; background: rgba(255,255,255,0.08); }
    .op__sum-item--green .op__sum-val { color: #4ade80; }
    .op__sum-item--yellow .op__sum-val { color: #fbbf24; }
    .op__sum-item--blue  .op__sum-val { color: #60a5fa; }

    /* ── Filters ── */
    .op__filters { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .op__search {
      display: flex; align-items: center; gap: 0.625rem;
      background: #1a1d27; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 0.625rem 1rem;
      flex: 1; min-width: 200px; transition: border-color 200ms;
      &:focus-within { border-color: rgba(230,57,70,0.5); }
      i { color: rgba(255,255,255,0.35); font-size: 0.875rem; }
      input { background: transparent; border: none; outline: none; color: rgba(255,255,255,0.85); font-size: 0.875rem; width: 100%; &::placeholder { color: rgba(255,255,255,0.3); } }
    }
    .op__filter-chips { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .filter-chip {
      padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);
      background: #1a1d27; color: rgba(255,255,255,0.5); font-size: 0.8rem; cursor: pointer; transition: all 180ms;
      &:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.85); }
      &--active { background: rgba(230,57,70,0.15); border-color: rgba(230,57,70,0.4); color: #e63946; }
    }

    /* ── Layout ── */
    .op__layout {
      display: grid; grid-template-columns: 1fr; gap: 1.25rem; align-items: start;
      &--detail { grid-template-columns: 1fr 380px; }
      @media(max-width:1100px) { &--detail { grid-template-columns: 1fr; } }
    }

    /* ── Table ── */
    .op__table-wrap { background: #1a1d27; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; }
    .op__table { width: 100%; border-collapse: collapse; }
    .op__table thead th {
      padding: 1rem 1.25rem; font-size: 0.72rem; font-weight: 600; color: rgba(255,255,255,0.35);
      text-transform: uppercase; letter-spacing: 0.06em; text-align: left;
      border-bottom: 1px solid rgba(255,255,255,0.06); white-space: nowrap;
    }
    .op__row { border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 160ms; cursor: pointer;
      &:last-child { border-bottom: none; }
      &:hover { background: rgba(255,255,255,0.025); }
      &--active { background: rgba(230,57,70,0.05) !important; }
      td { padding: 1rem 1.25rem; font-size: 0.82rem; color: rgba(255,255,255,0.7); vertical-align: middle; }
    }
    .op__vehicle { display: flex; align-items: center; gap: 0.625rem; }
    .op__vehicle-icon { width: 32px; height: 32px; border-radius: 8px; background: rgba(230,57,70,0.12); color: #e63946; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; flex-shrink: 0; }
    .op__vehicle-name { font-weight: 600; color: rgba(255,255,255,0.9); margin: 0 0 2px; white-space: nowrap; }
    .op__order-id { font-size: 0.68rem; color: rgba(255,255,255,0.3); margin: 0; font-family: monospace; }
    .op__ecu   { font-size: 0.75rem; color: rgba(255,255,255,0.45); }
    .op__date  { white-space: nowrap; }
    .op__amount { font-weight: 700; color: #fff; white-space: nowrap; }

    .stage-chip {
      display: inline-flex; padding: 0.13rem 0.5rem; border-radius: 5px; font-size: 0.65rem; font-weight: 700;
      &--s1 { background: rgba(96,165,250,0.12);  color: #60a5fa; border: 1px solid rgba(96,165,250,0.25);  }
      &--s2 { background: rgba(230,57,70,0.12);   color: #e63946; border: 1px solid rgba(230,57,70,0.25);   }
      &--s3 { background: rgba(167,139,250,0.12); color: #a78bfa; border: 1px solid rgba(167,139,250,0.25); }
    }
    .status-chip { display: inline-flex; align-items: center; gap: 5px; font-size: 0.72rem; font-weight: 600; padding: 4px 10px; border-radius: 20px; white-space: nowrap; }
    .status-dot  { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .status--pending    { background: rgba(251,191,36,0.12);  color: #fbbf24; }
    .status--processing { background: rgba(96,165,250,0.12);  color: #60a5fa; }
    .status--completed  { background: rgba(74,222,128,0.12);  color: #4ade80; }
    .status--cancelled  { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4); }

    .op__actions { display: flex; gap: 0.5rem; }
    .op__btn {
      width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.5);
      transition: background 180ms, color 180ms;
      &:hover { background: rgba(255,255,255,0.12); color: #fff; }
      &--dl { background: rgba(74,222,128,0.12); color: #4ade80; &:hover { background: rgba(74,222,128,0.2); } }
      &--disabled { opacity: 0.4; cursor: not-allowed; }
    }
    .op__empty { text-align: center; padding: 3rem !important; color: rgba(255,255,255,0.3); i { font-size: 2rem; display: block; margin-bottom: 0.5rem; } }

    /* ── Detail Panel ── */
    .op-detail {
      background: #1a1d27; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden;
      display: flex; flex-direction: column;
      animation: slideIn 260ms cubic-bezier(0.22,1,0.36,1) both;
    }
    @keyframes slideIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }

    .op-detail__head {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.07); gap: 0.75rem;
    }
    .op-detail__id      { font-family: monospace; font-size: 0.75rem; font-weight: 700; color: #e63946; margin: 0 0 3px; }
    .op-detail__vehicle { font-size: 1.05rem; font-weight: 700; color: #fff; margin: 0; }
    .op-close-btn { width: 30px; height: 30px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: rgba(255,255,255,0.4); cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; &:hover { color: #fff; background: rgba(255,255,255,0.08); } }

    .op-detail__status-bar { padding: 0.75rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .op-detail__hint { font-size: 0.75rem; color: rgba(255,255,255,0.4); display: flex; align-items: center; gap: 0.35rem; i { font-size: 0.75rem; color: #fbbf24; } }

    .op-detail__section { padding: 1rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06); &:last-child { border-bottom: none; } }
    .op-detail__section-title { font-size: 0.68rem; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: .07em; margin: 0 0 0.75rem; }
    .op-detail__optional { font-size: 0.6rem; color: rgba(255,255,255,0.2); text-transform: none; letter-spacing: 0; font-weight: 400; }
    .op-detail__hint-text { font-size: 0.75rem; color: rgba(255,255,255,0.3); margin: -0.25rem 0 0.75rem; }

    .op-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; }
    .op-info-item {
      display: flex; flex-direction: column; gap: 2px;
      &--full { grid-column: 1 / -1; }
      &__lbl { font-size: 0.65rem; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: .04em; }
      &__val { font-size: 0.82rem; color: rgba(255,255,255,0.85); font-weight: 500; &--price { color: #fff; font-weight: 700; } &--mono { font-family: monospace; font-size: 0.72rem; } }
    }
    .op-notes { margin-top: 0.75rem; display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.8rem; color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.03); border-radius: 8px; padding: 0.6rem 0.75rem; i { color: rgba(230,57,70,0.6); flex-shrink: 0; margin-top: 1px; } }

    /* File section */
    .op-file-ready {
      display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1rem; border-radius: 12px;
      background: rgba(74,222,128,0.07); border: 1px solid rgba(74,222,128,0.18);
      i { font-size: 1.4rem; color: #4ade80; flex-shrink: 0; }
      &__info { flex: 1; min-width: 0; }
      &__name { font-size: 0.78rem; font-weight: 600; color: #fff; margin: 0 0 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: monospace; }
      &__sub  { font-size: 0.7rem; color: rgba(74,222,128,0.7); margin: 0; }
    }
    .op-dl-btn { display: flex; align-items: center; gap: 0.4rem; flex-shrink: 0; padding: 0.45rem 0.85rem; border-radius: 8px; border: 1px solid rgba(74,222,128,0.3); background: rgba(74,222,128,0.12); color: #4ade80; font-size: 0.78rem; font-weight: 600; cursor: pointer; &:hover { background: rgba(74,222,128,0.2); } }
    .op-file-missing { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: rgba(255,255,255,0.3); i { flex-shrink: 0; } }

    /* Upload zone */
    .op-upload-zone {
      border: 2px dashed rgba(255,255,255,0.1); border-radius: 12px; background: rgba(255,255,255,0.02);
      display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
      padding: 1.25rem; text-align: center;
      i { font-size: 1.5rem; color: rgba(255,255,255,0.2); }
      p { font-size: 0.78rem; color: rgba(255,255,255,0.3); margin: 0; }
      &--filled { flex-direction: row; padding: 0.75rem 1rem; border-color: rgba(74,222,128,0.3); background: rgba(74,222,128,0.03); }
    }
    .op-upload-btn {
      display: inline-flex; align-items: center; gap: 0.4rem; cursor: pointer;
      background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px;
      padding: 0.4rem 0.85rem; font-size: 0.75rem; color: rgba(255,255,255,0.7);
      &:hover { background: rgba(255,255,255,0.12); }
    }
    .op-upload-fname { flex: 1; font-size: 0.78rem; color: rgba(255,255,255,0.8); text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: monospace; }
    .op-upload-actions { display: flex; align-items: center; gap: 0.4rem; flex-shrink: 0; }
    .op-upload-send-btn { display: flex; align-items: center; gap: 0.35rem; padding: 0.4rem 0.75rem; border-radius: 8px; border: none; background: linear-gradient(135deg,#e63946,#c1121f); color: #fff; font-size: 0.75rem; font-weight: 600; cursor: pointer; &:hover { opacity: 0.88; } }
    .op-upload-remove { border: none; background: transparent; color: rgba(255,255,255,0.3); cursor: pointer; font-size: 0.8rem; &:hover { color: #fff; } }
    .op-sent-note { margin-top: 0.65rem; display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; color: #4ade80; }

    /* ── Pagination ── */
    .op__pagination { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
    .op__page-info { font-size: 0.8rem; color: rgba(255,255,255,0.35); }
    .op__page-btns { display: flex; gap: 0.375rem; }
    .op__page-btn {
      width: 34px; height: 34px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);
      background: #1a1d27; color: rgba(255,255,255,0.5); font-size: 0.82rem; font-weight: 500;
      display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 180ms;
      &:hover:not(:disabled) { border-color: rgba(255,255,255,0.2); color: #fff; }
      &:disabled { opacity: 0.35; cursor: not-allowed; }
      &--active { background: rgba(230,57,70,0.15); border-color: rgba(230,57,70,0.4); color: #e63946; }
    }
  `],
})
export class OrdersPage {
  protected readonly selectedOrder = signal<UserOrder | null>(null);
  protected readonly activeFilter  = signal<string>('all');
  protected readonly uploadedFile  = signal<File | null>(null);
  protected readonly fileSent      = signal(false);
  protected search = '';

  protected readonly filterOptions = [
    { label: 'Tümü',        value: 'all'        },
    { label: 'Beklemede',   value: 'pending'    },
    { label: 'İşlemde',     value: 'processing' },
    { label: 'Tamamlandı',  value: 'completed'  },
  ];

  protected readonly orders: UserOrder[] = MOCK_ORDERS;

  protected readonly filtered = computed(() => {
    const q = this.search.toLowerCase();
    const f = this.activeFilter();
    return this.orders.filter(o => {
      const matchQ = !q || o.vehicle.toLowerCase().includes(q) || o.id.toLowerCase().includes(q);
      const matchF = f === 'all' || o.status === f;
      return matchQ && matchF;
    });
  });

  countBy(s: OrderStatus): number { return this.orders.filter(o => o.status === s).length; }
  statusLabel(s: OrderStatus): string { return STATUS_LABEL[s]; }

  selectOrder(o: UserOrder): void {
    const same = this.selectedOrder()?.id === o.id;
    this.selectedOrder.set(same ? null : o);
    if (!same) { this.uploadedFile.set(null); this.fileSent.set(false); }
  }

  onFileSelect(ev: Event): void {
    const file = (ev.target as HTMLInputElement).files?.[0] ?? null;
    this.uploadedFile.set(file);
    this.fileSent.set(false);
  }

  onDrop(ev: DragEvent): void {
    ev.preventDefault();
    const file = ev.dataTransfer?.files?.[0] ?? null;
    if (file) { this.uploadedFile.set(file); this.fileSent.set(false); }
  }

  sendOriginalFile(): void {
    this.uploadedFile.set(null);
    this.fileSent.set(true);
  }
}
