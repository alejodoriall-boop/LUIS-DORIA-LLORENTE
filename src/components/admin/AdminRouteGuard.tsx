import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SuperadminDashboardView } from '../SuperadminDashboardView';
import { AdminLoginPage } from './AdminLoginPage';
import { adminAuthService } from '../../services/adminAuthService';
import { AdminUser, TenantRecord } from '../../types';
import { Loader2 } from 'lucide-react';

export interface AdminRouteGuardProps {
  activeOperationalUser: AdminUser | null;
  onStartImpersonation: (tenant: TenantRecord) => void;
  onExitToOperationalApp: () => void;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({
  activeOperationalUser,
  onStartImpersonation,
  onExitToOperationalApp,
}) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    adminAuthService.isSuperadminAuthenticated()
  );
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // If a regular farm user (non-superadmin) tries to access /admin directly:
    if (activeOperationalUser && activeOperationalUser.roleType !== 'propietario') {
      // If the user has a restricted farm role and is not a superadmin:
      if (!adminAuthService.isSuperadminAuthenticated()) {
        adminAuthService.logAuditEvent(
          'security_alert',
          `Intento de acceso denegado a /admin por usuario operativo '${activeOperationalUser.fullName}' (Rol: ${activeOperationalUser.roleType})`,
          undefined,
          undefined,
          'failed'
        );
        navigate('/403', { replace: true });
        return;
      }
    }

    setIsAuthenticated(adminAuthService.isSuperadminAuthenticated());
  }, [activeOperationalUser, navigate]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    adminAuthService.logoutSuperadmin();
    setIsAuthenticated(false);
  };

  const handleStartImpersonationAndNavigate = (tenant: TenantRecord) => {
    adminAuthService.logAuditEvent(
      'impersonation_session_start',
      `Inicio de sesión en Modo Soporte para el tenant ${tenant.farmName} (${tenant.tenantCode})`,
      tenant.id,
      tenant.farmName,
      'warning'
    );
    onStartImpersonation(tenant);
    navigate('/app');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen w-full bg-[#0D1A13] flex flex-col items-center justify-center text-[#FFFFFF] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4A94E]" />
        <p className="text-xs text-[#A5B8AC]">Verificando credenciales de administración global...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLoginPage
        onLoginSuccess={handleLoginSuccess}
        onNavigateHome={() => navigate('/')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1A13] text-[#FFFFFF] p-3 sm:p-6 selection:bg-[#D4A94E]/30 selection:text-[#FFFFFF]">
      <SuperadminDashboardView
        onStartImpersonation={handleStartImpersonationAndNavigate}
        onExitToMyFarms={onExitToOperationalApp}
        onLogout={handleLogout}
      />
    </div>
  );
};
