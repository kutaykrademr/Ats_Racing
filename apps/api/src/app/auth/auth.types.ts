export type UserRole = 'user' | 'dealer' | 'admin';
export type AccountStatus = 'pending' | 'approved' | 'rejected';

/** Raw row shape of public.profiles. */
export interface ProfileRow {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  dealership_name: string | null;
  status: AccountStatus;
  rejection_reason: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Shape returned to the authenticated client (frontend AuthUser). */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
  avatar: string;
}

/** Richer shape for the admin registrations list. */
export interface RegistrationView {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  dealershipName: string | null;
  status: AccountStatus;
  rejectionReason: string | null;
  createdAt: string;
  approvedAt: string | null;
}

export function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '??'
  );
}

export function toAuthUser(p: ProfileRow): AuthUser {
  return {
    id: p.id,
    name: p.full_name,
    email: p.email,
    role: p.role,
    company: p.dealership_name ?? undefined,
    avatar: initials(p.full_name || p.email),
  };
}

export function toRegistrationView(p: ProfileRow): RegistrationView {
  return {
    id: p.id,
    email: p.email,
    fullName: p.full_name,
    phone: p.phone,
    role: p.role,
    dealershipName: p.dealership_name,
    status: p.status,
    rejectionReason: p.rejection_reason,
    createdAt: p.created_at,
    approvedAt: p.approved_at,
  };
}
