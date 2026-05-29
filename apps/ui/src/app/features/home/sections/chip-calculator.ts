import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

/* ─── Types ─────────────────────────────────────────────────── */
interface EngineGain {
  readonly engine: string;
  readonly engineCode: string;
  readonly displacementCc: number;
  readonly bore: string;
  readonly compressionRatio: string;
  readonly ecu: string;
  readonly fuel: 'Benzin' | 'Dizel' | 'Hibrit';
  readonly stockHp: number;
  readonly stockTq: number;
  readonly stage1Hp: number;
  readonly stage1Tq: number;
  readonly stage2Hp: number;
  readonly stage2Tq: number;
  readonly stage3Hp: number;
  readonly stage3Tq: number;
}

interface Series {
  readonly name: string;
  readonly engines: readonly EngineGain[];
}

interface Model {
  readonly name: string;
  readonly series: readonly Series[];
}

interface Brand {
  readonly name: string;
  readonly models: readonly Model[];
}

/* ─── Catalog (synced with dashboard tools-page) ────────────── */
const CATALOG: readonly Brand[] = [
  {
    name: 'BMW',
    models: [
      {
        name: 'M3',
        series: [
          {
            name: 'F80 (2014–2018)',
            engines: [
              {
                engine: 'S55B30 3.0T · 431 HP',
                engineCode: 'S55B30', displacementCc: 2979, bore: '84.0 × 89.6 mm',
                compressionRatio: '10.2:1', ecu: 'Bosch MG1CS001', fuel: 'Benzin',
                stockHp: 431, stockTq: 550,
                stage1Hp: 500, stage1Tq: 620,
                stage2Hp: 560, stage2Tq: 680,
                stage3Hp: 640, stage3Tq: 780,
              },
            ],
          },
          {
            name: 'G80 (2021–)',
            engines: [
              {
                engine: 'S58B30 3.0T · 510 HP',
                engineCode: 'S58B30', displacementCc: 2993, bore: '84.0 × 90.0 mm',
                compressionRatio: '10.2:1', ecu: 'Bosch MG1CS024', fuel: 'Benzin',
                stockHp: 510, stockTq: 650,
                stage1Hp: 580, stage1Tq: 730,
                stage2Hp: 650, stage2Tq: 820,
                stage3Hp: 730, stage3Tq: 920,
              },
            ],
          },
        ],
      },
      {
        name: 'M5',
        series: [
          {
            name: 'F90 (2018–)',
            engines: [
              {
                engine: 'S63B44 4.4T V8 · 600 HP',
                engineCode: 'S63B44', displacementCc: 4395, bore: '89.0 × 88.3 mm',
                compressionRatio: '10.5:1', ecu: 'Bosch MED17.2', fuel: 'Benzin',
                stockHp: 600, stockTq: 750,
                stage1Hp: 680, stage1Tq: 840,
                stage2Hp: 750, stage2Tq: 920,
                stage3Hp: 850, stage3Tq: 1020,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Audi',
    models: [
      {
        name: 'RS6',
        series: [
          {
            name: 'C8 (2020–)',
            engines: [
              {
                engine: 'DKCE 4.0 TFSI V8 · 600 HP',
                engineCode: 'DKCE', displacementCc: 3996, bore: '84.5 × 89.0 mm',
                compressionRatio: '9.8:1', ecu: 'Bosch MG1CS002', fuel: 'Benzin',
                stockHp: 600, stockTq: 800,
                stage1Hp: 680, stage1Tq: 880,
                stage2Hp: 760, stage2Tq: 960,
                stage3Hp: 860, stage3Tq: 1080,
              },
            ],
          },
        ],
      },
      {
        name: 'S3',
        series: [
          {
            name: '8Y (2021–)',
            engines: [
              {
                engine: 'DKZ 2.0 TFSI · 310 HP',
                engineCode: 'DKZ', displacementCc: 1984, bore: '82.5 × 92.8 mm',
                compressionRatio: '10.5:1', ecu: 'Bosch MG1CS011', fuel: 'Benzin',
                stockHp: 310, stockTq: 400,
                stage1Hp: 370, stage1Tq: 470,
                stage2Hp: 430, stage2Tq: 530,
                stage3Hp: 490, stage3Tq: 600,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Mercedes',
    models: [
      {
        name: 'C63 AMG',
        series: [
          {
            name: 'W205 (2015–2021)',
            engines: [
              {
                engine: 'M177 4.0T V8 · 476 HP',
                engineCode: 'M177', displacementCc: 3982, bore: '83.0 × 92.0 mm',
                compressionRatio: '10.5:1', ecu: 'Bosch MED17.7.2', fuel: 'Benzin',
                stockHp: 476, stockTq: 650,
                stage1Hp: 560, stage1Tq: 730,
                stage2Hp: 630, stage2Tq: 810,
                stage3Hp: 720, stage3Tq: 920,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Porsche',
    models: [
      {
        name: '911 Turbo S',
        series: [
          {
            name: '992 (2021–)',
            engines: [
              {
                engine: '9A2.51 3.8T Flat-6 · 650 HP',
                engineCode: '9A2.51', displacementCc: 3745, bore: '91.0 × 76.4 mm',
                compressionRatio: '9.8:1', ecu: 'Bosch ME9.8', fuel: 'Benzin',
                stockHp: 650, stockTq: 800,
                stage1Hp: 730, stage1Tq: 890,
                stage2Hp: 820, stage2Tq: 980,
                stage3Hp: 920, stage3Tq: 1100,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Volkswagen',
    models: [
      {
        name: 'Golf R',
        series: [
          {
            name: 'Mk8 (2021–)',
            engines: [
              {
                engine: 'DKZ 2.0 TSI · 320 HP',
                engineCode: 'DKZ', displacementCc: 1984, bore: '82.5 × 92.8 mm',
                compressionRatio: '10.5:1', ecu: 'Bosch MG1CS011', fuel: 'Benzin',
                stockHp: 320, stockTq: 420,
                stage1Hp: 380, stage1Tq: 490,
                stage2Hp: 440, stage2Tq: 560,
                stage3Hp: 510, stage3Tq: 640,
              },
            ],
          },
        ],
      },
    ],
  },
];

/* ─── Component ─────────────────────────────────────────────── */
@Component({
  selector: 'app-home-chip-calculator',
  standalone: true,
  imports: [DecimalPipe, RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chip-calculator.html',
  styleUrl: './chip-calculator.scss',
})
export class HomeChipCalculator {
  protected readonly catalog = CATALOG;

  protected readonly brand  = signal<string>('');
  protected readonly model  = signal<string>('');
  protected readonly series = signal<string>('');
  protected readonly engine = signal<string>('');
  protected readonly showModal = signal<boolean>(false);

  protected readonly models = computed<readonly Model[]>(() =>
    this.catalog.find((b) => b.name === this.brand())?.models ?? [],
  );
  protected readonly seriesList = computed<readonly Series[]>(() =>
    this.models().find((m) => m.name === this.model())?.series ?? [],
  );
  protected readonly engines = computed<readonly EngineGain[]>(() =>
    this.seriesList().find((s) => s.name === this.series())?.engines ?? [],
  );
  protected readonly result = signal<EngineGain | null>(null);
  protected readonly submitted = signal(false);

  /* ─── Selectors ─── */
  protected onBrand(v: string): void {
    this.brand.set(v); this.model.set(''); this.series.set(''); this.engine.set(''); this.result.set(null); this.submitted.set(false);
  }
  protected onModel(v: string): void {
    this.model.set(v); this.series.set(''); this.engine.set(''); this.result.set(null); this.submitted.set(false);
  }
  protected onSeries(v: string): void {
    this.series.set(v); this.engine.set(''); this.result.set(null); this.submitted.set(false);
  }
  protected onEngine(v: string): void {
    this.engine.set(v); this.result.set(null); this.submitted.set(false);
  }

  protected canSubmit(): boolean {
    return !!this.brand() && !!this.model() && !!this.series() && !!this.engine();
  }

  protected calculate(): void {
    this.submitted.set(true);
    if (!this.canSubmit()) { return; }
    const found = this.engines().find((e) => e.engine === this.engine()) ?? null;
    this.result.set(found);
    if (found) {
      this.showModal.set(true);
      document.body.style.overflow = 'hidden';
    }
  }

  protected closeModal(): void {
    this.showModal.set(false);
    document.body.style.overflow = '';
  }

  protected reset(): void {
    this.brand.set(''); this.model.set(''); this.series.set(''); this.engine.set('');
    this.result.set(null); this.submitted.set(false);
    this.closeModal();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void { if (this.showModal()) { this.closeModal(); } }

  /* ─── Helpers ─── */
  protected fuelClass(fuel: string): string {
    return fuel === 'Benzin' ? 'petrol' : fuel === 'Dizel' ? 'diesel' : 'hybrid';
  }
}
