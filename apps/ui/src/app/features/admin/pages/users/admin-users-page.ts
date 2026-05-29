import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

type UserRole   = 'user' | 'dealer' | 'admin';
type UserStatus = 'active' | 'passive';

interface OrderRef { id: string; vehicle: string; stage: string; date: string; price: string; status: string; statusKey: string; }

interface AdminUser {
  id: string; name: string; email: string;
  role: UserRole; status: UserStatus;
  company?: string; phone?: string;
  orders: number; paymentTotal: string;
  joinDate: string; lastLogin: string;
  orderHistory: OrderRef[];
}

const MOCK_USERS: AdminUser[] = [
  { id: 'U001', name: 'Ali Yıldız',    email: 'kullanici@atsracing.com', role: 'user',   status: 'active',  orders: 3,  paymentTotal: '₺7.750',   joinDate: '10 Oca 2026', lastLogin: '29 May 2026',
    orderHistory: [
      { id: 'ORD-048', vehicle: 'BMW M3 G80',     stage: 'Stage 1', date: '29 May 2026', price: '₺2.500', status: 'Beklemede',  statusKey: 'pending'   },
      { id: 'ORD-003', vehicle: 'BMW M3 G80',     stage: 'Stage 1', date: '18 Mar 2026', price: '₺2.500', status: 'Tamamlandı', statusKey: 'completed' },
      { id: 'ORD-001', vehicle: 'Audi S3 8Y',     stage: 'Stage 2', date: '12 May 2026', price: '₺2.750', status: 'Tamamlandı', statusKey: 'completed' },
    ]
  },
  { id: 'U002', name: 'Mert Kaya',     email: 'mert@gmail.com',          role: 'user',   status: 'active',  orders: 7,  paymentTotal: '₺18.250',  joinDate: '5 Şub 2026',  lastLogin: '28 May 2026',
    orderHistory: [
      { id: 'ORD-047', vehicle: 'Audi RS6 C8',    stage: 'Stage 2', date: '28 May 2026', price: '₺4.000', status: 'İşlemde',    statusKey: 'processing' },
      { id: 'ORD-042', vehicle: 'Audi S3 8Y',     stage: 'Stage 3', date: '20 May 2026', price: '₺7.500', status: 'İptal',      statusKey: 'cancelled'  },
    ]
  },
  { id: 'U003', name: 'Selin Demir',   email: 'selin@hotmail.com',       role: 'user',   status: 'active',  orders: 2,  paymentTotal: '₺5.000',   joinDate: '20 Şub 2026', lastLogin: '27 May 2026',
    orderHistory: [
      { id: 'ORD-046', vehicle: 'VW Golf R Mk8',  stage: 'Stage 1', date: '27 May 2026', price: '₺2.500', status: 'Tamamlandı', statusKey: 'completed' },
    ]
  },
  { id: 'U004', name: 'Emre Şahin',   email: 'emre@outlook.com',        role: 'user',   status: 'passive', orders: 1,  paymentTotal: '₺7.500',   joinDate: '1 Mar 2026',  lastLogin: '15 Nis 2026',
    orderHistory: [
      { id: 'ORD-045', vehicle: 'Porsche 911 Turbo', stage: 'Stage 3', date: '26 May 2026', price: '₺7.500', status: 'Tamamlandı', statusKey: 'completed' },
    ]
  },
  { id: 'U005', name: 'Zeynep Arslan', email: 'zeynep@gmail.com',        role: 'user',   status: 'active',  orders: 5,  paymentTotal: '₺12.000',  joinDate: '12 Mar 2026', lastLogin: '28 May 2026',
    orderHistory: [
      { id: 'ORD-044', vehicle: 'Mercedes C63 AMG', stage: 'Stage 2', date: '25 May 2026', price: '₺4.000', status: 'İşlemde', statusKey: 'processing' },
    ]
  },
  { id: 'U006', name: 'Ahmet Yılmaz',  email: 'bayi@atsracing.com',      role: 'dealer', status: 'active',  orders: 48, paymentTotal: '₺142.000', joinDate: '1 Oca 2026',  lastLogin: '29 May 2026', company: 'ATS Bayi İstanbul', phone: '+90 532 111 0001',
    orderHistory: [
      { id: 'ORD-B001', vehicle: 'BMW M3 G80',    stage: 'Stage 2', date: '28 May 2026', price: '₺4.000', status: 'Tamamlandı', statusKey: 'completed' },
      { id: 'ORD-B002', vehicle: 'Audi RS6 C8',   stage: 'Stage 1', date: '26 May 2026', price: '₺2.500', status: 'Tamamlandı', statusKey: 'completed' },
      { id: 'ORD-B003', vehicle: 'VW Golf R Mk8', stage: 'Stage 3', date: '24 May 2026', price: '₺7.500', status: 'İşlemde',    statusKey: 'processing' },
    ]
  },
  { id: 'U007', name: 'Turan Çelik',   email: 'turan@bayiankara.com',    role: 'dealer', status: 'active',  orders: 31, paymentTotal: '₺89.500',  joinDate: '15 Oca 2026', lastLogin: '28 May 2026', company: 'Speed Tuning Ankara', phone: '+90 533 222 0002',
    orderHistory: [
      { id: 'ORD-C001', vehicle: 'Porsche Cayenne', stage: 'Stage 2', date: '25 May 2026', price: '₺4.000', status: 'Beklemede', statusKey: 'pending' },
    ]
  },
  { id: 'U008', name: 'Berk Öztürk',   email: 'berk@gmail.com',          role: 'user',   status: 'active',  orders: 0,  paymentTotal: '₺0',       joinDate: '20 May 2026', lastLogin: '21 May 2026', orderHistory: [] },
  { id: 'A001', name: 'Admin Yetkili', email: 'admin@atsracing.com',      role: 'admin',  status: 'active',  orders: 0,  paymentTotal: '—',        joinDate: '1 Oca 2026',  lastLogin: '29 May 2026', orderHistory: [] },
  { id: 'A002', name: 'Destek Ekibi',  email: 'destek@atsracing.com',    role: 'admin',  status: 'active',  orders: 0,  paymentTotal: '—',        joinDate: '1 Oca 2026',  lastLogin: '28 May 2026', orderHistory: [] },
];

const ROLE_LABEL: Record<UserRole, string>   = { user: 'Kullanıcı', dealer: 'Bayi', admin: 'Admin' };
const STATUS_LABEL: Record<UserStatus, string> = { active: 'Aktif', passive: 'Pasif' };

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="au">
  <div class="au__header">
    <div>
      <h1 class="au__title">Kullanıcı Yönetimi</h1>
      <p class="au__sub">{{ filteredByTab().length }} kayıt · Toplam {{ allUsers().length }} hesap</p>
    </div>
    <div class="au__search-wrap">
      <div class="au-search">
        <i class="pi pi-search"></i>
        <input type="text" placeholder="İsim veya e-posta ara…" [(ngModel)]="search" />
      </div>
      <select class="au-filter" [(ngModel)]="filterStatus">
        <option value="">Tüm Durumlar</option>
        <option value="active">Aktif</option>
        <option value="passive">Pasif</option>
      </select>
    </div>
  </div>

  <!-- Tabs -->
  <div class="au__tabs">
    <button class="au-tab" [class.au-tab--active]="activeTab() === 'user'"   type="button" (click)="setTab('user')">
      <i class="pi pi-user"></i> Kullanıcılar
      <span class="au-tab__count">{{ countByRole('user') }}</span>
    </button>
    <button class="au-tab" [class.au-tab--active]="activeTab() === 'dealer'" type="button" (click)="setTab('dealer')">
      <i class="pi pi-building"></i> Bayiler
      <span class="au-tab__count au-tab__count--amber">{{ countByRole('dealer') }}</span>
    </button>
    <button class="au-tab" [class.au-tab--active]="activeTab() === 'admin'"  type="button" (click)="setTab('admin')">
      <i class="pi pi-shield"></i> Adminler
      <span class="au-tab__count au-tab__count--purple">{{ countByRole('admin') }}</span>
    </button>
  </div>

  <div class="au__layout" [class.au__layout--detail]="selectedUser()">

    <!-- User list -->
    <div class="au-table-wrap">
      <table class="au-table">
        <thead><tr>
          <th>{{ tabLabel() }}</th>
          @if (activeTab() === 'dealer') { <th>Firma</th> }
          <th>Sipariş</th>
          @if (activeTab() !== 'admin') { <th>Ödeme</th> }
          <th>Durum</th>
          <th>Kayıt</th>
          <th>Son Giriş</th>
          <th></th>
        </tr></thead>
        <tbody>
          @for (u of filteredByTab(); track u.id) {
            <tr [class.au-row--active]="selectedUser()?.id === u.id" (click)="selectUser(u)">
              <td>
                <div class="au-user-cell">
                  <div class="au-avatar" [class.au-avatar--dealer]="u.role==='dealer'" [class.au-avatar--admin]="u.role==='admin'">
                    {{ initials(u.name) }}
                  </div>
                  <div>
                    <p class="au-user-cell__name">{{ u.name }}</p>
                    <p class="au-user-cell__email">{{ u.email }}</p>
                  </div>
                </div>
              </td>
              @if (activeTab() === 'dealer') {
                <td class="au-muted">{{ u.company || '—' }}</td>
              }
              <td class="au-center">{{ u.role === 'admin' ? '—' : u.orders }}</td>
              @if (activeTab() !== 'admin') {
                <td class="au-payment">{{ u.paymentTotal }}</td>
              }
              <td>
                <span class="au-status" [class.au-status--active]="u.status==='active'" [class.au-status--passive]="u.status==='passive'">
                  <span class="au-status__dot"></span>{{ u.status === 'active' ? 'Aktif' : 'Pasif' }}
                </span>
              </td>
              <td class="au-muted">{{ u.joinDate }}</td>
              <td class="au-muted">{{ u.lastLogin }}</td>
              <td>
                <button class="au-icon-btn" type="button" title="Detay" (click)="$event.stopPropagation(); selectUser(u)">
                  <i class="pi pi-chevron-right"></i>
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <!-- Detail panel -->
    @if (selectedUser(); as u) {
      <div class="au-detail">
        <div class="au-detail__head">
          <div class="au-detail__avatar" [class.au-detail__avatar--dealer]="u.role==='dealer'" [class.au-detail__avatar--admin]="u.role==='admin'">
            {{ initials(u.name) }}
          </div>
          <div class="au-detail__title-wrap">
            <h3 class="au-detail__name">{{ u.name }}</h3>
            <span class="au-badge" [class.au-badge--dealer]="u.role==='dealer'" [class.au-badge--admin]="u.role==='admin'" [class.au-badge--user]="u.role==='user'">
              {{ roleLabel(u.role) }}
            </span>
          </div>
          <button class="au-close-btn" type="button" (click)="selectedUser.set(null)"><i class="pi pi-times"></i></button>
        </div>

        <!-- Info rows -->
        <div class="au-detail__section">
          <div class="au-info-row"><i class="pi pi-envelope"></i><span>{{ u.email }}</span></div>
          @if (u.phone)   { <div class="au-info-row"><i class="pi pi-phone"></i><span>{{ u.phone }}</span></div> }
          @if (u.company) { <div class="au-info-row"><i class="pi pi-building"></i><span>{{ u.company }}</span></div> }
          <div class="au-info-row"><i class="pi pi-calendar"></i><span>Kayıt: {{ u.joinDate }}</span></div>
          <div class="au-info-row"><i class="pi pi-clock"></i><span>Son giriş: {{ u.lastLogin }}</span></div>
        </div>

        <!-- Stats -->
        @if (u.role !== 'admin') {
          <div class="au-detail__stats">
            <div class="au-d-stat">
              <span class="au-d-stat__val">{{ u.orders }}</span>
              <span class="au-d-stat__lbl">Sipariş</span>
            </div>
            <div class="au-d-stat">
              <span class="au-d-stat__val" style="color:#4ade80">{{ u.paymentTotal }}</span>
              <span class="au-d-stat__lbl">Toplam Ödeme</span>
            </div>
          </div>
        }

        <!-- Status toggle -->
        <div class="au-detail__section">
          <p class="au-detail__section-title">Hesap Durumu</p>
          <div class="au-detail__status-row">
            <span class="au-status" [class.au-status--active]="u.status==='active'" [class.au-status--passive]="u.status==='passive'">
              <span class="au-status__dot"></span>{{ u.status === 'active' ? 'Aktif' : 'Pasif' }}
            </span>
            <button class="au-toggle-btn" type="button"
              [class.au-toggle-btn--deactivate]="u.status==='active'"
              [class.au-toggle-btn--activate]="u.status==='passive'"
              (click)="toggleStatus(u)">
              <i [class]="u.status==='active' ? 'pi pi-ban' : 'pi pi-check'"></i>
              {{ u.status === 'active' ? 'Pasife Al' : 'Aktife Al' }}
            </button>
          </div>
        </div>

        <!-- Order history -->
        @if (u.role !== 'admin' && u.orderHistory.length > 0) {
          <div class="au-detail__section">
            <p class="au-detail__section-title">Sipariş Geçmişi</p>
            <div class="au-order-list">
              @for (o of u.orderHistory; track o.id) {
                <div class="au-order-item">
                  <div class="au-order-item__left">
                    <span class="au-order-item__id">{{ o.id }}</span>
                    <div>
                      <p class="au-order-item__vehicle">{{ o.vehicle }}</p>
                      <p class="au-order-item__meta">{{ o.stage }} · {{ o.date }}</p>
                    </div>
                  </div>
                  <div class="au-order-item__right">
                    <span class="au-order-item__price">{{ o.price }}</span>
                    <span class="au-obadge au-obadge--{{ o.statusKey }}">{{ o.status }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        }
        @if (u.role !== 'admin' && u.orderHistory.length === 0) {
          <div class="au-detail__empty"><i class="pi pi-inbox"></i><p>Henüz sipariş yok</p></div>
        }

      </div>
    }

  </div>
</div>
  `,
  styles: [`
    .au { display: flex; flex-direction: column; gap: 1.25rem; }
    .au__title { font-size: 1.6rem; font-weight: 700; color: #fff; margin: 0; }
    .au__sub { font-size: 0.875rem; color: rgba(255,255,255,0.4); margin: 0.25rem 0 0; }
    .au__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
    .au__search-wrap { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }

    .au-search {
      display: flex; align-items: center; gap: 0.5rem;
      background: #13151c; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 0 0.9rem;
      i { color: rgba(255,255,255,0.3); font-size: 0.8rem; flex-shrink: 0; }
      input { background: transparent; border: none; color: rgba(255,255,255,0.85); font-size: 0.85rem; padding: 0.6rem 0; width: 200px;
        &:focus { outline: none; } &::placeholder { color: rgba(255,255,255,0.2); }
      }
    }
    .au-filter {
      background: #13151c; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
      padding: 0.6rem 1rem; color: rgba(255,255,255,0.75); font-size: 0.8rem; cursor: pointer; appearance: none; min-width: 130px;
      option { background: #1a1d27; }
    }

    /* ── Tabs ── */
    .au__tabs { display: flex; gap: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.07); padding-bottom: 0; }
    .au-tab {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.65rem 1.1rem; border-radius: 10px 10px 0 0; border: none; cursor: pointer;
      background: transparent; color: rgba(255,255,255,0.4); font-size: 0.82rem; font-weight: 500;
      transition: background 180ms, color 180ms;
      &:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.8); }
      &--active { background: rgba(245,158,11,0.1); color: #f59e0b; border-bottom: 2px solid #f59e0b; }
      i { font-size: 0.85rem; }
    }
    .au-tab__count {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 20px; height: 20px; border-radius: 10px; padding: 0 5px;
      background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); font-size: 0.68rem; font-weight: 700;
      &--amber  { background: rgba(245,158,11,0.15); color: #f59e0b; }
      &--purple { background: rgba(167,139,250,0.15); color: #a78bfa; }
    }

    /* ── Layout ── */
    .au__layout {
      display: grid; grid-template-columns: 1fr; gap: 1.25rem; align-items: start;
      transition: grid-template-columns 300ms ease;
      &--detail { grid-template-columns: 1fr 360px; }
      @media(max-width:1024px) { &--detail { grid-template-columns: 1fr; } }
    }

    /* ── Table ── */
    .au-table-wrap { background: #13151c; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: auto; }
    .au-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; min-width: 600px;
      th { color: rgba(255,255,255,0.3); font-weight: 600; text-transform: uppercase; font-size: 0.65rem; letter-spacing: .05em; padding: 1rem 1.25rem 0.75rem; text-align: left; }
      td { padding: 0.85rem 1.25rem; border-top: 1px solid rgba(255,255,255,0.05); vertical-align: middle; color: rgba(255,255,255,0.8); }
      tr.au-row--active td { background: rgba(245,158,11,0.05); }
      tbody tr { cursor: pointer; transition: background 140ms; &:hover td { background: rgba(255,255,255,0.025); } }
    }
    .au-center { text-align: center; font-weight: 700; color: #fff; }
    .au-payment { font-weight: 700; color: #4ade80; font-size: 0.82rem; }
    .au-muted { color: rgba(255,255,255,0.35) !important; font-size: 0.78rem; }

    .au-user-cell { display: flex; align-items: center; gap: 0.75rem;
      &__name { font-size: 0.85rem; font-weight: 600; color: #fff; margin: 0 0 2px; }
      &__email { font-size: 0.72rem; color: rgba(255,255,255,0.35); margin: 0; }
    }
    .au-avatar {
      width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
      background: rgba(96,165,250,0.15); color: #60a5fa;
      display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700;
      &--dealer { background: rgba(245,158,11,0.15); color: #f59e0b; }
      &--admin  { background: rgba(167,139,250,0.15); color: #a78bfa; }
    }

    .au-badge {
      display: inline-flex; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
      &--user   { background: rgba(96,165,250,0.1);  color: #60a5fa; border: 1px solid rgba(96,165,250,0.2);  }
      &--dealer { background: rgba(245,158,11,0.1);  color: #f59e0b; border: 1px solid rgba(245,158,11,0.2);  }
      &--admin  { background: rgba(167,139,250,0.1); color: #a78bfa; border: 1px solid rgba(167,139,250,0.2); }
    }
    .au-status { display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem;
      &__dot { width: 7px; height: 7px; border-radius: 50%; }
      &--active  .au-status__dot { background: #4ade80; box-shadow: 0 0 6px #4ade8088; }
      &--passive .au-status__dot { background: rgba(255,255,255,0.2); }
      &--active  { color: #4ade80; } &--passive { color: rgba(255,255,255,0.35); }
    }
    .au-icon-btn {
      width: 32px; height: 32px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
      background: transparent; color: rgba(255,255,255,0.4); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.8rem;
      &:hover { background: rgba(255,255,255,0.08); color: #fff; }
    }

    /* ── Detail Panel ── */
    .au-detail {
      background: #13151c; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px;
      overflow: hidden; display: flex; flex-direction: column;
      animation: slideInRight 260ms cubic-bezier(0.22,1,0.36,1) both;
    }
    @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }

    .au-detail__head {
      display: flex; align-items: center; gap: 0.85rem; padding: 1.25rem 1.25rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .au-detail__avatar {
      width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0;
      background: rgba(96,165,250,0.15); color: #60a5fa;
      display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 700;
      &--dealer { background: rgba(245,158,11,0.15); color: #f59e0b; }
      &--admin  { background: rgba(167,139,250,0.15); color: #a78bfa; }
    }
    .au-detail__title-wrap { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
    .au-detail__name { font-size: 1rem; font-weight: 700; color: #fff; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .au-close-btn { margin-left: auto; flex-shrink: 0; width: 30px; height: 30px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: rgba(255,255,255,0.4); cursor: pointer; display: flex; align-items: center; justify-content: center; &:hover { color: #fff; background: rgba(255,255,255,0.08); } }

    .au-detail__section { padding: 1rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06); &:last-child { border-bottom: none; } }
    .au-detail__section-title { font-size: 0.7rem; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: .06em; margin: 0 0 0.75rem; }

    .au-info-row { display: flex; align-items: center; gap: 0.6rem; font-size: 0.8rem; color: rgba(255,255,255,0.65); margin-bottom: 0.5rem; &:last-child { margin-bottom: 0; } i { color: rgba(255,255,255,0.25); font-size: 0.8rem; flex-shrink: 0; } }

    .au-detail__stats { display: flex; gap: 1rem; padding: 0.75rem 1.25rem; background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.06); }
    .au-d-stat { display: flex; flex-direction: column; gap: 2px; flex: 1;
      &__val { font-size: 1.3rem; font-weight: 800; color: #fff; }
      &__lbl { font-size: 0.7rem; color: rgba(255,255,255,0.3); }
    }

    .au-detail__status-row { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
    .au-toggle-btn {
      display: flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.85rem; border-radius: 8px; border: none; cursor: pointer; font-size: 0.75rem; font-weight: 600;
      &--deactivate { background: rgba(248,113,113,0.1); color: #f87171; border: 1px solid rgba(248,113,113,0.2); &:hover { background: rgba(248,113,113,0.2); } }
      &--activate   { background: rgba(74,222,128,0.1);  color: #4ade80; border: 1px solid rgba(74,222,128,0.2);  &:hover { background: rgba(74,222,128,0.2); } }
    }

    .au-order-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .au-order-item {
      display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
      background: rgba(255,255,255,0.03); border-radius: 10px; padding: 0.65rem 0.85rem;
      &__left { display: flex; align-items: center; gap: 0.6rem; }
      &__id { font-family: monospace; font-size: 0.72rem; font-weight: 700; color: #f59e0b; flex-shrink: 0; }
      &__vehicle { font-size: 0.78rem; font-weight: 600; color: #fff; margin: 0 0 2px; }
      &__meta { font-size: 0.68rem; color: rgba(255,255,255,0.3); margin: 0; }
      &__right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; flex-shrink: 0; }
      &__price { font-size: 0.8rem; font-weight: 700; color: #fff; }
    }
    .au-obadge {
      display: inline-flex; padding: 0.15rem 0.45rem; border-radius: 5px; font-size: 0.6rem; font-weight: 700; text-transform: uppercase;
      &--completed  { background: rgba(74,222,128,0.1);  color: #4ade80;  border: 1px solid rgba(74,222,128,0.2);  }
      &--processing { background: rgba(96,165,250,0.1);  color: #60a5fa;  border: 1px solid rgba(96,165,250,0.2);  }
      &--pending    { background: rgba(251,191,36,0.1);  color: #fbbf24;  border: 1px solid rgba(251,191,36,0.2);  }
      &--cancelled  { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.35); border: 1px solid rgba(255,255,255,0.1); }
    }
    .au-detail__empty { padding: 1.5rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; color: rgba(255,255,255,0.2); i { font-size: 1.5rem; } p { font-size: 0.8rem; margin: 0; } }
  `],
})
export class AdminUsersPage {
  protected readonly allUsers = signal<AdminUser[]>(MOCK_USERS);
  protected readonly activeTab = signal<UserRole>('user');
  protected readonly selectedUser = signal<AdminUser | null>(null);
  protected search       = '';
  protected filterStatus = '';

  protected setTab(tab: UserRole): void {
    this.activeTab.set(tab);
    this.selectedUser.set(null);
  }

  protected countByRole(role: UserRole): number { return this.allUsers().filter(u => u.role === role).length; }
  protected tabLabel(): string { return { user: 'Kullanıcı', dealer: 'Bayi', admin: 'Admin' }[this.activeTab()]; }
  protected roleLabel(r: UserRole): string { return ROLE_LABEL[r]; }
  protected initials(name: string): string { return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(); }

  protected readonly filteredByTab = computed(() => {
    const tab = this.activeTab();
    let list = this.allUsers().filter(u => u.role === tab);
    if (this.search)       { const q = this.search.toLowerCase(); list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)); }
    if (this.filterStatus) { list = list.filter(u => u.status === this.filterStatus); }
    return list;
  });

  selectUser(u: AdminUser): void {
    this.selectedUser.set(this.selectedUser()?.id === u.id ? null : u);
  }

  toggleStatus(u: AdminUser): void {
    const next: UserStatus = u.status === 'active' ? 'passive' : 'active';
    this.allUsers.update(list => list.map(x => x.id === u.id ? { ...x, status: next } : x));
    // Keep selected user in sync
    if (this.selectedUser()?.id === u.id) {
      this.selectedUser.update(sel => sel ? { ...sel, status: next } : sel);
    }
  }
}
