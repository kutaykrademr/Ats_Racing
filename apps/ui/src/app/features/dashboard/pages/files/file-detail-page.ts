import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';

/* ─── Shared mock store (same data as files-page) ──────────── */
export interface TuningFileDetail {
  id: string;
  vehicle: string;
  brand: string;
  model: string;
  series: string;
  fileName: string;
  type: string;
  ecu: string;
  engineCode: string;
  displacementCc: number;
  bore: string;
  compressionRatio: string;
  fuel: 'Benzin' | 'Dizel' | 'Hibrit';
  stockHp: number;
  stockTorque: number;
  tunedHp: number;
  tunedTorque: number;
  stage: 'Stage 1' | 'Stage 2' | 'Stage 3';
  date: Date;
  deliveryDate: Date | null;
  amount: number;
  status: 'Teslim Edildi' | 'Hazırlanıyor' | 'İncelemede';
  downloadable: boolean;
  notes: string;
  orderRef: string;
  timeline: TimelineStep[];
}

export interface TimelineStep {
  label: string;
  date: Date | null;
  done: boolean;
  active: boolean;
}

const FILES_DB: TuningFileDetail[] = [
  {
    id: '1',
    vehicle: 'BMW M3 F80', brand: 'BMW', model: 'M3', series: 'F80 (2014–2018)',
    fileName: 'bmw_m3_f80_stage2.bin', type: 'Stage 2', ecu: 'Bosch MG1CS001',
    engineCode: 'S55B30', displacementCc: 2979, bore: '84.0 × 89.6 mm', compressionRatio: '10.2:1',
    fuel: 'Benzin', stockHp: 431, stockTorque: 550, tunedHp: 560, tunedTorque: 680,
    stage: 'Stage 2', date: new Date('2025-05-20'), deliveryDate: new Date('2025-05-22'),
    amount: 1500, status: 'Teslim Edildi', downloadable: true,
    notes: 'Pop & Bang aktif, Vmax kaldırıldı. Tüm adaptasyon değerleri sıfırlandı.',
    orderRef: 'ATS-2025-0081',
    timeline: [
      { label: 'Sipariş Alındı',    date: new Date('2025-05-20'), done: true,  active: false },
      { label: 'Dosya İnceleniyor', date: new Date('2025-05-20'), done: true,  active: false },
      { label: 'Yazılım Hazırlanıyor', date: new Date('2025-05-21'), done: true, active: false },
      { label: 'Kalite Kontrolü',   date: new Date('2025-05-22'), done: true,  active: false },
      { label: 'Teslim Edildi',     date: new Date('2025-05-22'), done: true,  active: false },
    ],
  },
  {
    id: '2',
    vehicle: 'Audi RS6 C8', brand: 'Audi', model: 'RS6', series: 'C8 (2020–)',
    fileName: 'audi_rs6_c8_pop_bang.bin', type: 'Pop & Bang', ecu: 'Bosch MG1CS002',
    engineCode: 'DKCE', displacementCc: 3996, bore: '84.5 × 89.0 mm', compressionRatio: '9.8:1',
    fuel: 'Benzin', stockHp: 600, stockTorque: 800, tunedHp: 680, tunedTorque: 880,
    stage: 'Stage 1', date: new Date('2025-05-15'), deliveryDate: new Date('2025-05-16'),
    amount: 950, status: 'Teslim Edildi', downloadable: true,
    notes: 'Pop & Bang yoğunluğu %80 seviyesine ayarlandı. Orijinal güç değerleri korundu.',
    orderRef: 'ATS-2025-0074',
    timeline: [
      { label: 'Sipariş Alındı',    date: new Date('2025-05-15'), done: true,  active: false },
      { label: 'Dosya İnceleniyor', date: new Date('2025-05-15'), done: true,  active: false },
      { label: 'Yazılım Hazırlanıyor', date: new Date('2025-05-16'), done: true, active: false },
      { label: 'Kalite Kontrolü',   date: new Date('2025-05-16'), done: true,  active: false },
      { label: 'Teslim Edildi',     date: new Date('2025-05-16'), done: true,  active: false },
    ],
  },
  {
    id: '3',
    vehicle: 'VW Golf R Mk8', brand: 'VW', model: 'Golf R', series: 'Mk8 (2021–)',
    fileName: 'vw_golf_r_mk8_stage1.bin', type: 'Stage 1', ecu: 'Bosch MG1CS011',
    engineCode: 'DKZ', displacementCc: 1984, bore: '82.5 × 92.8 mm', compressionRatio: '10.5:1',
    fuel: 'Benzin', stockHp: 320, stockTorque: 420, tunedHp: 380, tunedTorque: 490,
    stage: 'Stage 1', date: new Date('2025-05-28'), deliveryDate: null,
    amount: 750, status: 'Hazırlanıyor', downloadable: false,
    notes: 'Sipariş işlemde. Tahmini teslim 1–2 iş günü.',
    orderRef: 'ATS-2025-0092',
    timeline: [
      { label: 'Sipariş Alındı',    date: new Date('2025-05-28'), done: true,  active: false },
      { label: 'Dosya İnceleniyor', date: new Date('2025-05-28'), done: true,  active: false },
      { label: 'Yazılım Hazırlanıyor', date: null, done: false, active: true },
      { label: 'Kalite Kontrolü',   date: null, done: false, active: false },
      { label: 'Teslim Edildi',     date: null, done: false, active: false },
    ],
  },
  {
    id: '4',
    vehicle: 'Mercedes C63 AMG', brand: 'Mercedes', model: 'C63 AMG', series: 'W205 (2015–2021)',
    fileName: 'merc_c63_amg_dpf_egr.bin', type: 'DPF+EGR Off', ecu: 'Bosch MED17.7.2',
    engineCode: 'M177', displacementCc: 3982, bore: '83.0 × 92.0 mm', compressionRatio: '10.5:1',
    fuel: 'Benzin', stockHp: 476, stockTorque: 650, tunedHp: 560, tunedTorque: 730,
    stage: 'Stage 1', date: new Date('2025-04-10'), deliveryDate: new Date('2025-04-12'),
    amount: 1200, status: 'Teslim Edildi', downloadable: true,
    notes: 'DPF + EGR devre dışı bırakıldı. P0401, P2002 hata kodları temizlendi.',
    orderRef: 'ATS-2025-0051',
    timeline: [
      { label: 'Sipariş Alındı',    date: new Date('2025-04-10'), done: true,  active: false },
      { label: 'Dosya İnceleniyor', date: new Date('2025-04-10'), done: true,  active: false },
      { label: 'Yazılım Hazırlanıyor', date: new Date('2025-04-11'), done: true, active: false },
      { label: 'Kalite Kontrolü',   date: new Date('2025-04-12'), done: true,  active: false },
      { label: 'Teslim Edildi',     date: new Date('2025-04-12'), done: true,  active: false },
    ],
  },
  {
    id: '5',
    vehicle: 'Porsche 911 Turbo S', brand: 'Porsche', model: '911', series: 'Turbo S 992 (2021–)',
    fileName: 'porsche_911ts_stage1.bin', type: 'Stage 1', ecu: 'Bosch ME9.8',
    engineCode: '9A2.51', displacementCc: 3745, bore: '91.0 × 76.4 mm', compressionRatio: '9.8:1',
    fuel: 'Benzin', stockHp: 650, stockTorque: 800, tunedHp: 730, tunedTorque: 890,
    stage: 'Stage 1', date: new Date('2025-03-22'), deliveryDate: new Date('2025-03-24'),
    amount: 2200, status: 'Teslim Edildi', downloadable: true,
    notes: 'Stage 1 yazılım. Vmax kaldırıldı. Launch control yoğunluğu optimize edildi.',
    orderRef: 'ATS-2025-0033',
    timeline: [
      { label: 'Sipariş Alındı',    date: new Date('2025-03-22'), done: true,  active: false },
      { label: 'Dosya İnceleniyor', date: new Date('2025-03-22'), done: true,  active: false },
      { label: 'Yazılım Hazırlanıyor', date: new Date('2025-03-23'), done: true, active: false },
      { label: 'Kalite Kontrolü',   date: new Date('2025-03-24'), done: true,  active: false },
      { label: 'Teslim Edildi',     date: new Date('2025-03-24'), done: true,  active: false },
    ],
  },
  {
    id: '6',
    vehicle: 'BMW M5 F90', brand: 'BMW', model: 'M5', series: 'F90 (2018–)',
    fileName: 'bmw_m5_f90_stage3.bin', type: 'Stage 3', ecu: 'Bosch MED17.2',
    engineCode: 'S63B44', displacementCc: 4395, bore: '89.0 × 88.3 mm', compressionRatio: '10.5:1',
    fuel: 'Benzin', stockHp: 600, stockTorque: 750, tunedHp: 850, tunedTorque: 1020,
    stage: 'Stage 3', date: new Date('2025-03-05'), deliveryDate: null,
    amount: 1850, status: 'İncelemede', downloadable: false,
    notes: 'Stage 3 için ek donanım (turbo, enjektör) gereksinimleri inceleniyor.',
    orderRef: 'ATS-2025-0021',
    timeline: [
      { label: 'Sipariş Alındı',    date: new Date('2025-03-05'), done: true,  active: false },
      { label: 'Dosya İnceleniyor', date: new Date('2025-03-05'), done: true,  active: true  },
      { label: 'Yazılım Hazırlanıyor', date: null, done: false, active: false },
      { label: 'Kalite Kontrolü',   date: null, done: false, active: false },
      { label: 'Teslim Edildi',     date: null, done: false, active: false },
    ],
  },
];

export function getFileById(id: string): TuningFileDetail | undefined {
  return FILES_DB.find(f => f.id === id);
}

/* ─── Component ─────────────────────────────────────────────── */
@Component({
  selector: 'app-file-detail-page',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fd">

      @if (!file()) {
        <div class="fd__not-found">
          <i class="pi pi-inbox"></i>
          <h2>Dosya bulunamadı</h2>
          <a routerLink="/dashboard/files" class="fd__back-btn"><i class="pi pi-arrow-left"></i> Dosyalarıma Dön</a>
        </div>
      } @else {

        <!-- TOP NAV -->
        <div class="fd__nav">
          <a routerLink="/dashboard/files" class="fd__back">
            <i class="pi pi-arrow-left"></i> Dosyalarıma Dön
          </a>
          <span class="fd__ref">{{ file()!.orderRef }}</span>
        </div>

        <!-- HEADER BANNER -->
        <div class="fd__banner">
          <div class="fd__banner-left">
            <div class="fd__vehicle-icon">
              <i class="pi pi-car"></i>
            </div>
            <div>
              <div class="fd__brand-chip">{{ file()!.brand }}</div>
              <h1 class="fd__vehicle">{{ file()!.vehicle }}</h1>
              <p class="fd__series">{{ file()!.series }}</p>
            </div>
          </div>
          <div class="fd__banner-right">
            <span class="fd__status-badge" [class]="statusClass()">
              <span class="fd__status-dot"></span>
              {{ file()!.status }}
            </span>
            <span class="fd__stage-badge fd__stage-badge--{{ stageBadgeColor() }}">{{ file()!.stage }}</span>
          </div>
        </div>

        <!-- MAIN GRID -->
        <div class="fd__grid">

          <!-- LEFT COLUMN -->
          <div class="fd__col-left">

            <!-- TIMELINE -->
            <div class="fd__card">
              <h2 class="fd__card-title"><i class="pi pi-list-check"></i> Sipariş Takibi</h2>
              <div class="fd__timeline">
                @for (step of file()!.timeline; track step.label; let last = $last) {
                  <div class="tl-step" [class.tl-step--done]="step.done" [class.tl-step--active]="step.active">
                    <div class="tl-step__line-wrap">
                      <div class="tl-step__dot">
                        @if (step.done) { <i class="pi pi-check"></i> }
                        @else if (step.active) { <span class="tl-step__pulse"></span> }
                      </div>
                      @if (!last) { <div class="tl-step__line"></div> }
                    </div>
                    <div class="tl-step__body">
                      <span class="tl-step__label">{{ step.label }}</span>
                      @if (step.date) {
                        <span class="tl-step__date">{{ step.date | date:'d MMM yyyy, HH:mm' }}</span>
                      } @else {
                        <span class="tl-step__date tl-step__date--pending">Bekleniyor…</span>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- NOTES -->
            <div class="fd__card">
              <h2 class="fd__card-title"><i class="pi pi-file-edit"></i> Teknik Notlar</h2>
              <p class="fd__notes">{{ file()!.notes }}</p>
            </div>

          </div>

          <!-- RIGHT COLUMN -->
          <div class="fd__col-right">

            <!-- FILE INFO -->
            <div class="fd__card">
              <h2 class="fd__card-title"><i class="pi pi-file"></i> Dosya Bilgileri</h2>
              <div class="fd__info-list">
                <div class="fd__info-row">
                  <span class="fd__info-k">Dosya Adı</span>
                  <span class="fd__info-v fd__info-v--mono">{{ file()!.fileName }}</span>
                </div>
                <div class="fd__info-row">
                  <span class="fd__info-k">Yazılım Türü</span>
                  <span class="fd__info-v"><span class="fd__type-chip">{{ file()!.type }}</span></span>
                </div>
                <div class="fd__info-row">
                  <span class="fd__info-k">Sipariş Tarihi</span>
                  <span class="fd__info-v">{{ file()!.date | date:'d MMMM yyyy' }}</span>
                </div>
                @if (file()!.deliveryDate) {
                  <div class="fd__info-row">
                    <span class="fd__info-k">Teslim Tarihi</span>
                    <span class="fd__info-v fd__info-v--green">{{ file()!.deliveryDate | date:'d MMMM yyyy' }}</span>
                  </div>
                }
                <div class="fd__info-row">
                  <span class="fd__info-k">Tutar</span>
                  <span class="fd__info-v fd__info-v--amount">₺{{ file()!.amount | number:'1.0-0' }}</span>
                </div>
                <div class="fd__info-row">
                  <span class="fd__info-k">Sipariş No</span>
                  <span class="fd__info-v fd__info-v--mono">{{ file()!.orderRef }}</span>
                </div>
              </div>
            </div>

            <!-- POWER COMPARISON -->
            <div class="fd__card">
              <h2 class="fd__card-title"><i class="pi pi-bolt"></i> Güç Kazanımı</h2>
              <div class="fd__power">
                <div class="fd__power-col">
                  <span class="fd__power-lbl">Orjinal</span>
                  <div class="fd__power-vals">
                    <div class="fd__power-val">
                      <span class="fd__power-num">{{ file()!.stockHp }}</span>
                      <span class="fd__power-unit">HP</span>
                    </div>
                    <div class="fd__power-sep"></div>
                    <div class="fd__power-val">
                      <span class="fd__power-num">{{ file()!.stockTorque }}</span>
                      <span class="fd__power-unit">Nm</span>
                    </div>
                  </div>
                </div>
                <div class="fd__power-arrow"><i class="pi pi-arrow-right"></i></div>
                <div class="fd__power-col fd__power-col--tuned">
                  <span class="fd__power-lbl fd__power-lbl--red">{{ file()!.stage }}</span>
                  <div class="fd__power-vals">
                    <div class="fd__power-val">
                      <span class="fd__power-num fd__power-num--white">{{ file()!.tunedHp }}</span>
                      <span class="fd__power-unit">HP</span>
                    </div>
                    <span class="fd__power-delta">+{{ file()!.tunedHp - file()!.stockHp }}</span>
                    <div class="fd__power-sep"></div>
                    <div class="fd__power-val">
                      <span class="fd__power-num fd__power-num--white">{{ file()!.tunedTorque }}</span>
                      <span class="fd__power-unit">Nm</span>
                    </div>
                    <span class="fd__power-delta">+{{ file()!.tunedTorque - file()!.stockTorque }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ENGINE SPECS -->
            <div class="fd__card">
              <h2 class="fd__card-title"><i class="pi pi-cog"></i> Motor Özellikleri</h2>
              <div class="fd__spec-grid">
                <div class="fd__spec-item">
                  <span class="fd__spec-k">Motor Kodu</span>
                  <span class="fd__spec-v fd__spec-v--code">{{ file()!.engineCode }}</span>
                </div>
                <div class="fd__spec-item">
                  <span class="fd__spec-k">Silindir Hacmi</span>
                  <span class="fd__spec-v">{{ file()!.displacementCc | number }} cc</span>
                </div>
                <div class="fd__spec-item">
                  <span class="fd__spec-k">Bore × Stroke</span>
                  <span class="fd__spec-v">{{ file()!.bore }}</span>
                </div>
                <div class="fd__spec-item">
                  <span class="fd__spec-k">Sıkıştırma Oranı</span>
                  <span class="fd__spec-v">{{ file()!.compressionRatio }}</span>
                </div>
                <div class="fd__spec-item">
                  <span class="fd__spec-k">Yakıt Tipi</span>
                  <span class="fd__spec-v">
                    <span class="fd__fuel-badge fd__fuel-badge--{{ file()!.fuel === 'Benzin' ? 'petrol' : file()!.fuel === 'Dizel' ? 'diesel' : 'hybrid' }}">
                      {{ file()!.fuel }}
                    </span>
                  </span>
                </div>
                <div class="fd__spec-item">
                  <span class="fd__spec-k">ECU</span>
                  <span class="fd__spec-v">{{ file()!.ecu }}</span>
                </div>
              </div>
            </div>

            <!-- ACTIONS -->
            <div class="fd__actions">
              @if (file()!.downloadable) {
                <button class="fd__btn fd__btn--primary">
                  <i class="pi pi-download"></i> Dosyayı İndir
                </button>
              } @else {
                <button class="fd__btn fd__btn--primary" disabled>
                  <i class="pi pi-clock"></i> Hazırlanıyor…
                </button>
              }
              <a href="/contact" class="fd__btn fd__btn--outline">
                <i class="pi pi-headphones"></i> Destek Al
              </a>
            </div>

          </div>
        </div>

      }
    </div>
  `,
  styles: [`
    .fd { display: flex; flex-direction: column; gap: 1.5rem; }

    /* NOT FOUND */
    .fd__not-found {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 1rem; padding: 4rem; color: rgba(255,255,255,0.3); text-align: center;
      i { font-size: 2.5rem; }
      h2 { margin: 0; font-size: 1.1rem; font-weight: 600; color: rgba(255,255,255,0.4); }
    }
    .fd__back-btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.6rem 1.25rem; border-radius: 10px;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.6); font-size: 0.82rem; font-weight: 600;
      text-decoration: none; transition: all 180ms;
      &:hover { background: rgba(255,255,255,0.1); color: #fff; }
    }

    /* TOP NAV */
    .fd__nav {
      display: flex; align-items: center; justify-content: space-between; gap: 1rem;
    }
    .fd__back {
      display: inline-flex; align-items: center; gap: 0.5rem;
      font-size: 0.82rem; font-weight: 600; color: rgba(255,255,255,0.45);
      text-decoration: none; transition: color 180ms;
      &:hover { color: #fff; }
    }
    .fd__ref {
      font-family: 'Courier New', monospace; font-size: 0.75rem; font-weight: 600;
      color: rgba(255,255,255,0.3); letter-spacing: 0.05em;
    }

    /* BANNER */
    .fd__banner {
      background: linear-gradient(135deg, #1e0f12, #1a1d27);
      border: 1px solid rgba(230,57,70,0.18);
      border-radius: 20px; padding: 1.75rem;
      display: flex; align-items: center; justify-content: space-between;
      gap: 1.5rem; flex-wrap: wrap;
    }
    .fd__banner-left { display: flex; align-items: center; gap: 1.25rem; }
    .fd__vehicle-icon {
      width: 56px; height: 56px; border-radius: 16px; flex-shrink: 0;
      background: rgba(230,57,70,0.15); color: #e63946;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem;
    }
    .fd__brand-chip {
      display: inline-block; font-size: 0.65rem; font-weight: 800; letter-spacing: 0.1em;
      text-transform: uppercase; background: rgba(230,57,70,0.15); color: #e63946;
      padding: 2px 10px; border-radius: 20px; margin-bottom: 0.375rem;
    }
    .fd__vehicle { font-size: 1.5rem; font-weight: 800; color: #fff; margin: 0 0 2px; }
    .fd__series  { font-size: 0.78rem; color: rgba(255,255,255,0.4); margin: 0; }
    .fd__banner-right { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .fd__status-badge {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 0.78rem; font-weight: 700; padding: 6px 14px; border-radius: 20px;
    }
    .fd__status-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
    .status--delivered { background: rgba(74,222,128,0.12); color: #4ade80; }
    .status--preparing { background: rgba(251,191,36,0.12); color: #fbbf24; }
    .status--review    { background: rgba(96,165,250,0.12); color: #60a5fa; }
    .fd__stage-badge {
      font-size: 0.78rem; font-weight: 800; letter-spacing: 0.06em;
      padding: 6px 14px; border-radius: 10px;
      &--blue   { background: rgba(96,165,250,0.15); color: #60a5fa; }
      &--red    { background: rgba(230,57,70,0.15); color: #e63946; }
      &--purple { background: rgba(168,85,247,0.15); color: #a855f7; }
    }

    /* MAIN GRID */
    .fd__grid {
      display: grid; grid-template-columns: 1fr 1.4fr; gap: 1.25rem; align-items: start;
    }
    @media (max-width: 900px) { .fd__grid { grid-template-columns: 1fr; } }
    .fd__col-left, .fd__col-right { display: flex; flex-direction: column; gap: 1.25rem; }

    /* CARD */
    .fd__card {
      background: #1a1d27; border: 1px solid rgba(255,255,255,0.07);
      border-radius: 16px; padding: 1.5rem;
    }
    .fd__card-title {
      font-size: 0.875rem; font-weight: 700; color: #fff;
      margin: 0 0 1.25rem; display: flex; align-items: center; gap: 0.5rem;
      i { color: rgba(255,255,255,0.35); font-size: 0.85rem; }
    }

    /* TIMELINE */
    .fd__timeline { display: flex; flex-direction: column; }
    .tl-step {
      display: flex; gap: 1rem; padding-bottom: 1.25rem;
      &:last-child { padding-bottom: 0; }
    }
    .tl-step__line-wrap {
      display: flex; flex-direction: column; align-items: center; flex-shrink: 0;
    }
    .tl-step__dot {
      width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
      background: rgba(255,255,255,0.06); border: 2px solid rgba(255,255,255,0.1);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; color: rgba(255,255,255,0.3);
      position: relative;
    }
    .tl-step__pulse {
      width: 10px; height: 10px; border-radius: 50%; background: #fbbf24;
      animation: pulse 1.4s ease-in-out infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }
    .tl-step__line {
      flex: 1; width: 2px; background: rgba(255,255,255,0.06);
      margin: 4px 0; min-height: 16px;
    }
    .tl-step__body { padding-top: 4px; }
    .tl-step__label { display: block; font-size: 0.82rem; font-weight: 600; color: rgba(255,255,255,0.5); }
    .tl-step__date  {
      display: block; font-size: 0.7rem; color: rgba(255,255,255,0.3); margin-top: 2px;
      &--pending { color: rgba(251,191,36,0.6); font-style: italic; }
    }
    .tl-step--done {
      .tl-step__dot {
        background: rgba(74,222,128,0.15); border-color: rgba(74,222,128,0.4);
        color: #4ade80;
      }
      .tl-step__line { background: rgba(74,222,128,0.2); }
      .tl-step__label { color: rgba(255,255,255,0.85); }
    }
    .tl-step--active {
      .tl-step__dot {
        background: rgba(251,191,36,0.12); border-color: rgba(251,191,36,0.5);
      }
      .tl-step__label { color: #fbbf24; }
    }

    /* NOTES */
    .fd__notes {
      font-size: 0.82rem; color: rgba(255,255,255,0.5); line-height: 1.7; margin: 0;
      background: rgba(255,255,255,0.02); border-radius: 10px; padding: 1rem;
      border: 1px solid rgba(255,255,255,0.05);
    }

    /* FILE INFO LIST */
    .fd__info-list { display: flex; flex-direction: column; }
    .fd__info-row {
      display: flex; align-items: center; justify-content: space-between;
      gap: 1rem; padding: 0.75rem 0;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      &:last-child { border-bottom: none; }
    }
    .fd__info-k { font-size: 0.75rem; color: rgba(255,255,255,0.35); white-space: nowrap; }
    .fd__info-v {
      font-size: 0.82rem; font-weight: 600; color: rgba(255,255,255,0.85);
      text-align: right;
      &--mono   { font-family: 'Courier New', monospace; font-size: 0.72rem; color: rgba(255,255,255,0.5); }
      &--green  { color: #4ade80; }
      &--amount { font-size: 1rem; font-weight: 800; color: #fff; }
    }
    .fd__type-chip {
      background: rgba(96,165,250,0.12); color: #60a5fa;
      font-size: 0.68rem; font-weight: 700; padding: 2px 10px; border-radius: 20px;
    }

    /* POWER */
    .fd__power {
      display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
    }
    .fd__power-col {
      flex: 1; min-width: 120px;
      &--tuned { }
    }
    .fd__power-lbl {
      display: block; font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.07em; color: rgba(255,255,255,0.35); margin-bottom: 0.5rem;
      &--red { color: #e63946; }
    }
    .fd__power-vals {
      display: flex; align-items: center; gap: 0.625rem; flex-wrap: wrap;
    }
    .fd__power-val { display: flex; align-items: baseline; gap: 3px; }
    .fd__power-num {
      font-size: 1.75rem; font-weight: 800; color: rgba(255,255,255,0.4); line-height: 1;
      &--white { color: #fff; }
    }
    .fd__power-unit { font-size: 0.75rem; color: rgba(255,255,255,0.25); }
    .fd__power-sep { width: 1px; height: 30px; background: rgba(255,255,255,0.08); }
    .fd__power-delta {
      font-size: 0.68rem; font-weight: 800; color: #4ade80;
      background: rgba(74,222,128,0.12); padding: 2px 7px; border-radius: 20px;
    }
    .fd__power-arrow { color: rgba(255,255,255,0.2); font-size: 1.1rem; flex-shrink: 0; }

    /* ENGINE SPECS */
    .fd__spec-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;
    }
    @media (max-width: 480px) { .fd__spec-grid { grid-template-columns: 1fr; } }
    .fd__spec-item {
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
      border-radius: 10px; padding: 0.875rem;
      display: flex; flex-direction: column; gap: 4px;
    }
    .fd__spec-k { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(255,255,255,0.3); }
    .fd__spec-v {
      font-size: 0.875rem; font-weight: 700; color: rgba(255,255,255,0.85);
      &--code { font-family: 'Courier New', monospace; color: #e63946; letter-spacing: 0.04em; }
    }
    .fd__fuel-badge {
      display: inline-block; font-size: 0.7rem; font-weight: 700; padding: 2px 10px; border-radius: 20px;
      &--petrol { background: rgba(230,57,70,0.15); color: #e63946; }
      &--diesel { background: rgba(96,165,250,0.15); color: #60a5fa; }
      &--hybrid { background: rgba(74,222,128,0.15); color: #4ade80; }
    }

    /* ACTIONS */
    .fd__actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .fd__btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.75rem 1.5rem; border-radius: 10px; border: none; cursor: pointer;
      font-size: 0.875rem; font-weight: 700; text-decoration: none; transition: all 200ms;
      &--primary {
        background: linear-gradient(135deg, #e63946, #c1121f); color: #fff; flex: 1;
        justify-content: center;
        &:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
        &:disabled { opacity: 0.35; cursor: not-allowed; }
      }
      &--outline {
        background: transparent; color: rgba(255,255,255,0.7);
        border: 1px solid rgba(255,255,255,0.15);
        &:hover { border-color: rgba(255,255,255,0.3); color: #fff; }
      }
    }
  `],
})
export class FileDetailPage {
  private readonly route  = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly file = computed(() => {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    return getFileById(id);
  });

  statusClass(): string {
    const map: Record<string, string> = {
      'Teslim Edildi': 'fd__status-badge status--delivered',
      'Hazırlanıyor':  'fd__status-badge status--preparing',
      'İncelemede':    'fd__status-badge status--review',
    };
    return map[this.file()?.status ?? ''] ?? 'fd__status-badge';
  }

  stageBadgeColor(): string {
    const map: Record<string, string> = {
      'Stage 1': 'blue',
      'Stage 2': 'red',
      'Stage 3': 'purple',
    };
    return map[this.file()?.stage ?? ''] ?? 'blue';
  }
}
