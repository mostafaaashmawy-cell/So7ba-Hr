'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TenantSettings } from '@/lib/types/database';

interface SettingsContextType {
  settings: TenantSettings | null;
  companyName: string | null;
  companyLogo: string | null;
  loading: boolean;
  isFeatureEnabled: (key: keyof TenantSettings | string) => boolean;
  refreshSettings: () => Promise<void>;
}

const defaultContext: SettingsContextType = {
  settings: null,
  companyName: null,
  companyLogo: null,
  loading: true,
  isFeatureEnabled: () => true,
  refreshSettings: async () => {},
};

const SettingsContext = createContext<SettingsContextType>(defaultContext);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSettings(null);
        setCompanyName(null);
        setCompanyLogo(null);
        setLoading(false);
        return;
      }

      // Fetch user profile to obtain tenant_id
      const { data: profile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.tenant_id) {
        const [settingsRes, tenantRes] = await Promise.all([
          supabase
            .from('tenant_settings')
            .select('*')
            .eq('tenant_id', profile.tenant_id)
            .maybeSingle(),
          supabase
            .from('tenants')
            .select('id, name, logo_url')
            .eq('id', profile.tenant_id)
            .maybeSingle(),
        ]);

        if (settingsRes.data) {
          setSettings(settingsRes.data as TenantSettings);
        }
        if (tenantRes.data) {
          setCompanyName(tenantRes.data.name || null);
          setCompanyLogo(tenantRes.data.logo_url || null);
        }
      }
    } catch (err) {
      console.error('Failed to load tenant settings in SettingsProvider:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const isFeatureEnabled = useCallback(
    (key: keyof TenantSettings | string): boolean => {
      if (!settings) return true; // Permissive default until loaded
      const val = (settings as unknown as Record<string, unknown>)[key];
      if (typeof val === 'boolean') {
        return val;
      }
      return true;
    },
    [settings]
  );

  return (
    <SettingsContext.Provider
      value={{
        settings,
        companyName,
        companyLogo,
        loading,
        isFeatureEnabled,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useTenantSettings() {
  return useContext(SettingsContext);
}

export function useFeature(key: keyof TenantSettings | string): boolean {
  const { isFeatureEnabled } = useContext(SettingsContext);
  return isFeatureEnabled(key);
}
