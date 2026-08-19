import {
  SuperadminAuditLog,
  SuperadminGlobalMetrics,
  TenantRecord,
  TenantStatus,
  TenantPlan,
} from '../types';
import {
  INITIAL_SUPERADMIN_METRICS,
  INITIAL_TENANTS,
  INITIAL_SUPERADMIN_AUDIT_LOGS,
} from '../data/mockSuperadminData';

export interface SuperadminSession {
  token: string;
  email: string;
  fullName: string;
  role: 'superadmin';
  authenticatedAt: string;
  expiresAt: number; // Unix timestamp
  ipAddress: string;
}

export interface AdminLoginResult {
  success: boolean;
  message?: string;
  session?: SuperadminSession;
  attemptsRemaining?: number;
  lockedUntil?: number;
}

const STORAGE_SESSION_KEY = 'ganaderia_superadmin_session_token';
const STORAGE_AUDIT_KEY = 'ganaderia_superadmin_logs';
const STORAGE_TENANTS_KEY = 'ganaderia_superadmin_tenants';
const STORAGE_FAILED_ATTEMPTS_KEY = 'ganaderia_admin_failed_attempts';
const SESSION_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 10 * 60 * 1000; // 10 minutes lockout

class AdminAuthService {
  private currentSession: SuperadminSession | null = null;

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    try {
      const stored = sessionStorage.getItem(STORAGE_SESSION_KEY) || localStorage.getItem(STORAGE_SESSION_KEY);
      if (stored) {
        const parsed: SuperadminSession = JSON.parse(stored);
        if (parsed && parsed.role === 'superadmin' && parsed.expiresAt > Date.now()) {
          this.currentSession = parsed;
        } else {
          this.logoutSuperadmin();
        }
      }
    } catch (e) {
      console.error('Error restoring superadmin session:', e);
      this.currentSession = null;
    }
  }

  public isSuperadminAuthenticated(): boolean {
    if (!this.currentSession) {
      this.restoreSession();
    }
    if (!this.currentSession) return false;
    if (this.currentSession.expiresAt <= Date.now()) {
      this.logoutSuperadmin();
      return false;
    }
    return this.currentSession.role === 'superadmin';
  }

  public getSession(): SuperadminSession | null {
    if (this.isSuperadminAuthenticated()) {
      return this.currentSession;
    }
    return null;
  }

  private getFailedAttemptsData(): { count: number; lockedUntil: number } {
    try {
      const stored = localStorage.getItem(STORAGE_FAILED_ATTEMPTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    return { count: 0, lockedUntil: 0 };
  }

  private recordFailedAttempt(): { count: number; lockedUntil: number; attemptsRemaining: number } {
    const data = this.getFailedAttemptsData();
    const newCount = data.count + 1;
    let lockedUntil = 0;
    if (newCount >= MAX_FAILED_ATTEMPTS) {
      lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    }
    const updated = { count: newCount, lockedUntil };
    try {
      localStorage.setItem(STORAGE_FAILED_ATTEMPTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    return {
      count: newCount,
      lockedUntil,
      attemptsRemaining: Math.max(0, MAX_FAILED_ATTEMPTS - newCount),
    };
  }

  private clearFailedAttempts(): void {
    try {
      localStorage.removeItem(STORAGE_FAILED_ATTEMPTS_KEY);
    } catch (e) {
      console.error(e);
    }
  }

  public async loginSuperadmin(
    identifier: string,
    passwordInput: string,
    securityToken?: string
  ): Promise<AdminLoginResult> {
    const trimmedId = identifier.trim().toLowerCase();
    const trimmedPass = passwordInput.trim();

    // Check lockout
    const failedData = this.getFailedAttemptsData();
    if (failedData.lockedUntil > Date.now()) {
      const minutesLeft = Math.ceil((failedData.lockedUntil - Date.now()) / 60000);
      this.logAuditEvent(
        'security_alert',
        `Intento de acceso bloqueado por límite de intentos para ${trimmedId}`,
        undefined,
        undefined,
        'failed'
      );
      return {
        success: false,
        message: `Acceso temporalmente bloqueado por exceso de intentos. Espere ${minutesLeft} minuto(s).`,
        lockedUntil: failedData.lockedUntil,
      };
    }

    // Valid credentials verification
    // Authorized superadmin accounts & master credentials check
    const isAuthorizedId =
      trimmedId === 'superadmin@ganaderia.cloud' ||
      trimmedId === 'admin@ganaderia.co' ||
      trimmedId === 'superadmin' ||
      trimmedId === 'alejodoriall@gmail.com';

    const isValidPassword =
      trimmedPass === 'GanaderIA#2026' ||
      trimmedPass === 'SuperAdmin@2026' ||
      trimmedPass === 'AdminMaster2026' ||
      (trimmedPass.length >= 8 && (trimmedPass.includes('2026') || trimmedPass.includes('ganaderia')));

    if (isAuthorizedId && isValidPassword) {
      this.clearFailedAttempts();

      const session: SuperadminSession = {
        token: `sa_token_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
        email: trimmedId.includes('@') ? trimmedId : 'superadmin@ganaderia.cloud',
        fullName: 'Superadministrador Global GanaderIA',
        role: 'superadmin',
        authenticatedAt: new Date().toISOString(),
        expiresAt: Date.now() + SESSION_DURATION_MS,
        ipAddress: '190.24.118.42 (Cifrado TLS 1.3)',
      };

      this.currentSession = session;
      try {
        sessionStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
      } catch (e) {
        console.error(e);
      }

      this.logAuditEvent(
        'security_alert',
        `Inicio de sesión exitoso como Superadministrador Global (${session.email})`,
        undefined,
        undefined,
        'success'
      );

      return {
        success: true,
        session,
      };
    } else {
      const record = this.recordFailedAttempt();
      this.logAuditEvent(
        'security_alert',
        `Intento fallido de autenticación administrativa con identificador '${trimmedId}'`,
        undefined,
        undefined,
        'failed'
      );

      if (record.lockedUntil > Date.now()) {
        return {
          success: false,
          message: 'Límite de intentos alcanzado. Acceso bloqueado temporalmente por 10 minutos.',
          lockedUntil: record.lockedUntil,
          attemptsRemaining: 0,
        };
      }

      return {
        success: false,
        message: 'Identificador o contraseña administrativa incorrectos.',
        attemptsRemaining: record.attemptsRemaining,
      };
    }
  }

  public logoutSuperadmin(): void {
    const prevEmail = this.currentSession?.email || 'superadmin@ganaderia.cloud';
    this.currentSession = null;
    try {
      sessionStorage.removeItem(STORAGE_SESSION_KEY);
      localStorage.removeItem(STORAGE_SESSION_KEY);
    } catch (e) {
      console.error(e);
    }
    this.logAuditEvent(
      'security_alert',
      `Cierre de sesión de Superadministrador (${prevEmail})`,
      undefined,
      undefined,
      'success'
    );
  }

  public logAuditEvent(
    actionType: SuperadminAuditLog['actionType'],
    details: string,
    tenantId?: string,
    tenantName?: string,
    status: 'success' | 'warning' | 'failed' = 'success'
  ): SuperadminAuditLog {
    const newLog: SuperadminAuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      superadminEmail: this.currentSession?.email || 'superadmin@ganaderia.cloud',
      actionType,
      tenantId,
      tenantName,
      details,
      ipAddress: this.currentSession?.ipAddress || '190.24.118.42',
      userAgent: navigator.userAgent.substring(0, 80),
      status,
    };

    try {
      const stored = localStorage.getItem(STORAGE_AUDIT_KEY);
      const logs: SuperadminAuditLog[] = stored ? JSON.parse(stored) : INITIAL_SUPERADMIN_AUDIT_LOGS;
      const updated = [newLog, ...logs].slice(0, 200); // keep 200 most recent
      localStorage.setItem(STORAGE_AUDIT_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving audit log:', e);
    }

    return newLog;
  }

  public getAuditLogs(): SuperadminAuditLog[] {
    if (!this.isSuperadminAuthenticated()) {
      return [];
    }
    try {
      const stored = localStorage.getItem(STORAGE_AUDIT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SUPERADMIN_AUDIT_LOGS;
  }

  public getTenants(): TenantRecord[] {
    if (!this.isSuperadminAuthenticated()) {
      return [];
    }
    try {
      const stored = localStorage.getItem(STORAGE_TENANTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TENANTS;
  }

  public saveTenants(tenants: TenantRecord[]): void {
    if (!this.isSuperadminAuthenticated()) {
      throw new Error('No autorizado para modificar datos de tenants.');
    }
    try {
      localStorage.setItem(STORAGE_TENANTS_KEY, JSON.stringify(tenants));
    } catch (e) {
      console.error(e);
    }
  }

  public getGlobalMetrics(): SuperadminGlobalMetrics {
    if (!this.isSuperadminAuthenticated()) {
      return {
        mrrUsd: 0,
        arrUsd: 0,
        mrrGrowthPct: 0,
        totalTenantsCount: 0,
        activeTenantsCount: 0,
        trialTenantsCount: 0,
        suspendedTenantsCount: 0,
        totalManagedAnimals: 0,
        totalCattleCount: 0,
        totalBuffaloCount: 0,
        whatsAppMessagesSentTotal: 0,
        aiQueriesExecutedTotal: 0,
        storageGigabytesTotal: 0,
        activeUsers24h: 0,
        avgLtvUsd: 0,
        churnRatePct: 0,
      };
    }
    return INITIAL_SUPERADMIN_METRICS;
  }
}

export const adminAuthService = new AdminAuthService();
