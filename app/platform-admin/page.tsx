'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  TenantRecord,
  TenantInvitationRecord,
  SubscriptionOrderRecord,
  UserProfile,
} from '@/lib/types/database';
import SuperConsoleHeader, { SuperConsoleTab } from '@/components/platform-admin/SuperConsoleHeader';
import OverviewTab from '@/components/platform-admin/OverviewTab';
import ClientsTab from '@/components/platform-admin/ClientsTab';
import OrdersTab from '@/components/platform-admin/OrdersTab';
import FinancialsTab from '@/components/platform-admin/FinancialsTab';
import RenewalPipelineTab from '@/components/platform-admin/RenewalPipelineTab';
import ActivationsTab from '@/components/platform-admin/ActivationsTab';
import ClientDetailsModal from '@/components/platform-admin/ClientDetailsModal';
import NewOrderModal from '@/components/platform-admin/NewOrderModal';
import InvoiceModal from '@/components/platform-admin/InvoiceModal';
import NewActivationModal from '@/components/platform-admin/NewActivationModal';
import { exportToCSV } from '@/lib/utils/csvExport';
import { ShieldAlert, Lock, ArrowLeft, RefreshCw } from 'lucide-react';
import HumAiLogo from '@/components/common/HumAiLogo';

const DEFAULT_APP_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'https://system.humai-hr.com';

export default function PlatformAdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [appDomain, setAppDomain] = useState(DEFAULT_APP_DOMAIN);
  const [activeTab, setActiveTab] = useState<SuperConsoleTab>('overview');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.origin) {
      setAppDomain(window.location.origin);
    }
  }, []);

  // Authentication State
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<UserProfile | null>(null);

  // Platform Data
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<TenantRecord[]>([]);
  const [orders, setOrders] = useState<SubscriptionOrderRecord[]>([]);
  const [invitations, setInvitations] = useState<TenantInvitationRecord[]>([]);

  // Modals
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [preselectedTenantForOrder, setPreselectedTenantForOrder] = useState<TenantRecord | null>(null);
  const [selectedClientForModal, setSelectedClientForModal] = useState<TenantRecord | null>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<SubscriptionOrderRecord | null>(null);

  // Verify Master Platform Admin Authorization
  useEffect(() => {
    const verifyAuth = async () => {
      setCheckingAuth(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profiles } = await supabase.rpc('get_my_profile');
      const profile = profiles && profiles.length > 0 ? profiles[0] : null;

      // STRICT SECURITY: Authorized ONLY if email is ashmawy.ai25@gmail.com
      const userEmail = (user.email || '').toLowerCase().trim();
      const isPlatformMaster =
        userEmail === 'ashmawy.ai25@gmail.com' && profile?.is_platform_admin === true;

      if (isPlatformMaster) {
        setIsAuthorized(true);
        setCurrentAdmin(profile as UserProfile);
        await loadPlatformData();
      } else {
        setIsAuthorized(false);
        setCheckingAuth(false);
      }
    };

    verifyAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPlatformData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Tenants with Super Admin details and user counts
      const { data: tenantsData, error: tenantsErr } = await supabase
        .from('tenants')
        .select('*, users:users(id, role, full_name, mobile)')
        .order('created_at', { ascending: false });

      if (tenantsErr) {
        console.error('Error fetching tenants:', tenantsErr);
      }

      if (tenantsData) {
        const enrichedTenants: TenantRecord[] = tenantsData.map((t) => {
          const userList =
            (t.users as Array<{ id: string; role: string; full_name: string; mobile?: string }>) || [];
          const superAdminUser = userList.find((u) => u.role === 'super_admin');
          return {
            id: t.id,
            name: t.name,
            plan: t.plan || 'enterprise',
            subscription_status: (t.subscription_status as any) || 'active',
            subscription_plan: (t.subscription_plan as any) || 'annual',
            subscription_expires_at: t.subscription_expires_at || null,
            max_employees: t.max_employees || 50,
            contact_email: t.contact_email || null,
            contact_phone: t.contact_phone || null,
            created_at: t.created_at,
            user_count: userList.length,
            super_admin: superAdminUser
              ? ({
                  id: superAdminUser.id,
                  full_name: superAdminUser.full_name,
                  mobile: superAdminUser.mobile,
                  role: 'super_admin',
                } as UserProfile)
              : null,
          };
        });
        setTenants(enrichedTenants);
      }

      // 2. Fetch Subscription Orders
      const { data: ordersData, error: ordersErr } = await supabase
        .from('subscription_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersErr) {
        console.warn('Orders fetch warning:', ordersErr);
      } else if (ordersData) {
        setOrders(ordersData as SubscriptionOrderRecord[]);
      }

      // 3. Fetch Invitations / Activation Links
      const { data: invitationsData, error: invErr } = await supabase
        .from('tenant_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (invErr) {
        console.warn('Invitations fetch warning:', invErr);
      } else if (invitationsData) {
        setInvitations(invitationsData as TenantInvitationRecord[]);
      }
    } catch (err) {
      console.error('Failed to load platform admin data', err);
    } finally {
      setLoading(false);
      setCheckingAuth(false);
    }
  };

  // Actions
  const handleSaveTenant = async (updatedData: Partial<TenantRecord>) => {
    if (!updatedData.id) return;
    const { error } = await supabase
      .from('tenants')
      .update({
        name: updatedData.name,
        subscription_status: updatedData.subscription_status,
        subscription_plan: updatedData.subscription_plan,
        max_employees: updatedData.max_employees,
        subscription_expires_at: updatedData.subscription_expires_at,
        contact_email: updatedData.contact_email,
        contact_phone: updatedData.contact_phone,
      })
      .eq('id', updatedData.id);

    if (error) throw error;
    await loadPlatformData();
  };

  const handleCreateOrder = async (
    orderData: Partial<SubscriptionOrderRecord>,
    autoExtendTenant: boolean
  ) => {
    // 1. Insert Order
    const { data: newOrder, error: orderErr } = await supabase
      .from('subscription_orders')
      .insert({
        order_number: orderData.order_number,
        tenant_id: orderData.tenant_id || null,
        company_name: orderData.company_name,
        admin_email: orderData.admin_email || null,
        admin_phone: orderData.admin_phone || null,
        plan_type: orderData.plan_type || 'annual',
        billing_cycle: orderData.billing_cycle || 'annual',
        amount: orderData.amount || 0,
        currency: 'EGP',
        payment_method: orderData.payment_method || 'bank_transfer',
        payment_status: orderData.payment_status || 'paid',
        payment_reference: orderData.payment_reference || null,
        invoice_date: orderData.invoice_date,
        notes: orderData.notes || null,
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    // 2. Auto-extend Tenant Subscription if requested
    if (autoExtendTenant && orderData.tenant_id && orderData.payment_status === 'paid') {
      const tenant = tenants.find((t) => t.id === orderData.tenant_id);
      if (tenant) {
        const baseDate =
          tenant.subscription_expires_at && new Date(tenant.subscription_expires_at) > new Date()
            ? new Date(tenant.subscription_expires_at)
            : new Date();

        if (orderData.plan_type === 'monthly') {
          baseDate.setMonth(baseDate.getMonth() + 1);
        } else if (orderData.plan_type === 'semi_annual') {
          baseDate.setMonth(baseDate.getMonth() + 6);
        } else {
          baseDate.setFullYear(baseDate.getFullYear() + 1);
        }

        await supabase
          .from('tenants')
          .update({
            subscription_status: 'active',
            subscription_plan: orderData.plan_type as any,
            subscription_expires_at: baseDate.toISOString(),
          })
          .eq('id', tenant.id);
      }
    }

    await loadPlatformData();
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('subscription_orders')
      .update({ payment_status: newStatus })
      .eq('id', orderId);

    if (error) throw error;
    await loadPlatformData();
  };

  const handleGenerateActivation = async (data: {
    companyName: string;
    adminName: string;
    adminEmail: string;
    plan: 'annual' | 'semi_annual' | 'monthly' | 'custom';
    amount: number;
    paymentMethod: string;
    notes: string;
  }): Promise<string> => {
    const generatedToken = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // 1. Insert Invitation
    const { data: insertData, error: insertErr } = await supabase
      .from('tenant_invitations')
      .insert({
        token: generatedToken,
        company_name: data.companyName,
        email: data.adminEmail || null,
        role: 'super_admin',
        plan_type: data.plan,
        amount_paid: data.amount,
        payment_method: data.paymentMethod,
        notes: data.notes || null,
        expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        is_used: false,
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    // 2. Also register corresponding order in subscription_orders
    const orderNum = `ORD-${Array.from(crypto.getRandomValues(new Uint8Array(4)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()}`;

    try {
      await supabase.from('subscription_orders').insert({
        order_number: orderNum,
        company_name: data.companyName,
        admin_email: data.adminEmail || null,
        plan_type: data.plan,
        billing_cycle: data.plan,
        amount: data.amount,
        payment_method: data.paymentMethod,
        payment_status: data.amount > 0 ? 'paid' : 'pending',
        notes: data.notes || null,
        invitation_id: insertData.id,
      });
    } catch (orderErr) {
      console.warn('Failed to mirror order on invitation creation:', orderErr);
    }

    await loadPlatformData();
    return `${appDomain}/onboarding?token=${generatedToken}`;
  };

  const handleExportAll = () => {
    const exportData = tenants.map((t) => ({
      'Company Name': t.name,
      'Workspace ID': t.id,
      'Super Admin': t.super_admin?.full_name || 'N/A',
      'Mobile': t.super_admin?.mobile || 'N/A',
      'Email': t.contact_email || 'N/A',
      'Plan': t.subscription_plan || 'annual',
      'Status': t.subscription_status || 'active',
      'Active Seats': t.user_count || 0,
      'Max Seats': t.max_employees || 50,
      'Expires At': t.subscription_expires_at ? new Date(t.subscription_expires_at).toLocaleDateString() : 'N/A',
    }));
    exportToCSV(exportData, `humai-master-export-${new Date().toISOString().split('T')[0]}`);
  };

  // Expiring count for header badge
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiringCount = tenants.filter((t) => {
    if (!t.subscription_expires_at) return false;
    const exp = new Date(t.subscription_expires_at);
    return exp > now && exp <= in30Days;
  }).length;

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[--bg] flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
          <span className="font-bold">Verifying Super Console Authorization...</span>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[--bg] flex items-center justify-center p-4">
        <div className="max-w-md w-full cleariq-card p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-slate-950 dark:text-white">
            Access Restricted: SaaS Super Console
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            This executive command center is exclusively restricted to the SaaS Platform Master (
            <span className="font-bold text-slate-900 dark:text-white">ashmawy.ai25@gmail.com</span>).
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/employee"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-btn text-xs font-bold text-white shadow-md cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Workspace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--bg] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Super Console Navigation & Top Header */}
      <SuperConsoleHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={loadPlatformData}
        loading={loading}
        onOpenActivationModal={() => setIsActivationModalOpen(true)}
        onOpenOrderModal={() => {
          setPreselectedTenantForOrder(null);
          setIsOrderModalOpen(true);
        }}
        onExportAll={handleExportAll}
        totalTenants={tenants.length}
        totalOrders={orders.length}
        expiringSoonCount={expiringCount}
      />

      {/* Main Tab View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {activeTab === 'overview' && (
          <OverviewTab
            tenants={tenants}
            orders={orders}
            invitations={invitations}
            onNavigateTab={setActiveTab}
            onOpenOrderModal={() => {
              setPreselectedTenantForOrder(null);
              setIsOrderModalOpen(true);
            }}
            onOpenActivationModal={() => setIsActivationModalOpen(true)}
            onSelectClient={(tenant) => setSelectedClientForModal(tenant)}
            onSelectOrder={(order) => setSelectedOrderForInvoice(order)}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsTab
            tenants={tenants}
            onSelectClient={(tenant) => setSelectedClientForModal(tenant)}
            onOpenOrderModalForClient={(tenant) => {
              setPreselectedTenantForOrder(tenant);
              setIsOrderModalOpen(true);
            }}
            onOpenActivationModal={() => setIsActivationModalOpen(true)}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTab
            orders={orders}
            tenants={tenants}
            onOpenOrderModal={() => {
              setPreselectedTenantForOrder(null);
              setIsOrderModalOpen(true);
            }}
            onSelectOrder={(order) => setSelectedOrderForInvoice(order)}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {activeTab === 'financials' && (
          <FinancialsTab
            orders={orders}
            tenants={tenants}
            onOpenOrderModal={() => {
              setPreselectedTenantForOrder(null);
              setIsOrderModalOpen(true);
            }}
          />
        )}

        {activeTab === 'pipeline' && (
          <RenewalPipelineTab
            tenants={tenants}
            onSelectClient={(tenant) => setSelectedClientForModal(tenant)}
            onOpenOrderModalForClient={(tenant) => {
              setPreselectedTenantForOrder(tenant);
              setIsOrderModalOpen(true);
            }}
          />
        )}

        {activeTab === 'activations' && (
          <ActivationsTab
            invitations={invitations}
            appDomain={appDomain}
            onOpenActivationModal={() => setIsActivationModalOpen(true)}
          />
        )}
      </main>

      {/* Modals & Dialogs */}
      {/* 1. Edit Client Workspace Modal */}
      {selectedClientForModal && (
        <ClientDetailsModal
          tenant={selectedClientForModal}
          onClose={() => setSelectedClientForModal(null)}
          onSaveTenant={handleSaveTenant}
          onOpenOrderModal={(tenant) => {
            setPreselectedTenantForOrder(tenant);
            setIsOrderModalOpen(true);
          }}
        />
      )}

      {/* 2. New Order / Renewal Modal */}
      {isOrderModalOpen && (
        <NewOrderModal
          tenants={tenants}
          preselectedTenant={preselectedTenantForOrder}
          onClose={() => {
            setIsOrderModalOpen(false);
            setPreselectedTenantForOrder(null);
          }}
          onCreateOrder={handleCreateOrder}
        />
      )}

      {/* 3. Official Receipt / Invoice Modal */}
      {selectedOrderForInvoice && (
        <InvoiceModal
          order={selectedOrderForInvoice}
          onClose={() => setSelectedOrderForInvoice(null)}
        />
      )}

      {/* 4. New Client Activation Link Modal */}
      {isActivationModalOpen && (
        <NewActivationModal
          appDomain={appDomain}
          onClose={() => setIsActivationModalOpen(false)}
          onGenerate={handleGenerateActivation}
        />
      )}
    </div>
  );
}
