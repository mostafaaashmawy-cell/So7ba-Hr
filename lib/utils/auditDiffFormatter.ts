// Utility to format raw audit log records, old_values/new_values diffs, and details payloads
// into clear, human-readable summaries and visual change cards in Arabic & English.

export interface FieldChange {
  key: string;
  label: string;
  oldVal: string;
  newVal: string;
  type: 'modified' | 'added' | 'removed';
}

const FIELD_LABELS: Record<string, { ar: string; en: string }> = {
  role: { ar: 'الدور الوظيفي والصلاحيات', en: 'User Role & Permissions' },
  status: { ar: 'الحالة التشغيلية', en: 'Status' },
  approval_status: { ar: 'حالة الاعتماد', en: 'Approval Status' },
  amount: { ar: 'المبلغ المالي', en: 'Amount' },
  basic_salary: { ar: 'الراتب الأساسي', en: 'Basic Salary' },
  base_salary: { ar: 'الراتب الأساسي', en: 'Base Salary' },
  salary: { ar: 'الراتب', en: 'Salary' },
  department_id: { ar: 'القسم التابع له', en: 'Department' },
  department: { ar: 'القسم', en: 'Department' },
  job_title: { ar: 'المسمى الوظيفي', en: 'Job Title' },
  full_name: { ar: 'الاسم بالكامل', en: 'Full Name' },
  name: { ar: 'الاسم', en: 'Name' },
  email: { ar: 'البريد الإلكتروني', en: 'Email' },
  phone: { ar: 'رقم الهاتف', en: 'Phone' },
  is_active: { ar: 'الحساب نشط', en: 'Active Account' },
  is_remote: { ar: 'العمل عن بعد', en: 'Remote Work' },
  annual_leave_allowance: { ar: 'رصيد الإجازات السنوية', en: 'Annual Leave Allowance' },
  shift_id: { ar: 'الوردية المحددة', en: 'Assigned Shift' },
  type: { ar: 'النوع / التصنيف', en: 'Type' },
  leave_type: { ar: 'نوع الإجازة', en: 'Leave Type' },
  start_date: { ar: 'تاريخ البدء', en: 'Start Date' },
  end_date: { ar: 'تاريخ الانتهاء', en: 'End Date' },
  date: { ar: 'التاريخ', en: 'Date' },
  reason: { ar: 'السبب / المبرر', en: 'Reason' },
  notes: { ar: 'الملاحظات', en: 'Notes' },
  geofence_radius: { ar: 'نطاق الموقع الجغرافي (متر)', en: 'Geofence Radius (meters)' },
  work_days: { ar: 'أيام العمل الرسمية', en: 'Official Work Days' },
  late_grace_minutes: { ar: 'مهلة التأخير المسموح بها (دقائق)', en: 'Late Grace Period (mins)' },
  income_tax_rate: { ar: 'نسبة ضريبة الدخل', en: 'Income Tax Rate' },
  social_insurance_rate: { ar: 'نسبة التأمين الاجتماعي', en: 'Social Insurance Rate' },
  commission_rate: { ar: 'نسبة العمولة البيعية', en: 'Commission Rate' },
  overtime_rate: { ar: 'معامل احتساب الوقت الإضافي', en: 'Overtime Multiplier' },
  leave_approval_mode: { ar: 'نظام اعتماد طلبات الإجازة', en: 'Leave Approval Mode' },
};

function formatValue(val: unknown, isRtl: boolean): string {
  if (val === null || val === undefined) {
    return isRtl ? '(فارغ)' : '(none)';
  }
  if (typeof val === 'boolean') {
    return val ? (isRtl ? 'نعم' : 'Yes') : (isRtl ? 'لا' : 'No');
  }
  if (typeof val === 'number') {
    return val.toLocaleString();
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return isRtl ? '(قائمة فارغة)' : '(empty list)';
    return val.join(', ');
  }
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }
  return String(val);
}

export function parseAuditChanges(
  oldValues?: Record<string, unknown> | null,
  newValues?: Record<string, unknown> | null,
  details?: Record<string, unknown> | null,
  isRtl: boolean = false
): FieldChange[] {
  const changes: FieldChange[] = [];
  const oldObj = oldValues || {};
  const newObj = newValues || {};

  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  allKeys.forEach((key) => {
    // Ignore internal keys like id, created_at, updated_at, tenant_id
    if (['id', 'created_at', 'updated_at', 'tenant_id', 'password', 'password_hash'].includes(key)) {
      return;
    }

    const hasOld = key in oldObj;
    const hasNew = key in newObj;
    const oldValRaw = oldObj[key];
    const newValRaw = newObj[key];

    // If both exist and match, skip
    if (hasOld && hasNew && JSON.stringify(oldValRaw) === JSON.stringify(newValRaw)) {
      return;
    }

    const labelEntry = FIELD_LABELS[key];
    const label = labelEntry ? (isRtl ? labelEntry.ar : labelEntry.en) : key.replace(/_/g, ' ');

    if (hasOld && hasNew) {
      changes.push({
        key,
        label,
        oldVal: formatValue(oldValRaw, isRtl),
        newVal: formatValue(newValRaw, isRtl),
        type: 'modified',
      });
    } else if (hasNew) {
      changes.push({
        key,
        label,
        oldVal: isRtl ? '(غير معين)' : '(unset)',
        newVal: formatValue(newValRaw, isRtl),
        type: 'added',
      });
    } else if (hasOld) {
      changes.push({
        key,
        label,
        oldVal: formatValue(oldValRaw, isRtl),
        newVal: isRtl ? '(تم الحذف)' : '(removed)',
        type: 'removed',
      });
    }
  });

  // If no old/new diff but details payload exists
  if (changes.length === 0 && details && Object.keys(details).length > 0) {
    Object.entries(details).forEach(([key, val]) => {
      if (['id', 'tenant_id', 'created_at'].includes(key)) return;
      const labelEntry = FIELD_LABELS[key];
      const label = labelEntry ? (isRtl ? labelEntry.ar : labelEntry.en) : key.replace(/_/g, ' ');
      changes.push({
        key,
        label,
        oldVal: '',
        newVal: formatValue(val, isRtl),
        type: 'added',
      });
    });
  }

  return changes;
}

export function formatAuditSummary(
  log: {
    old_values?: Record<string, unknown> | null;
    new_values?: Record<string, unknown> | null;
    details?: Record<string, unknown> | null;
    action_type?: string;
  },
  isRtl: boolean = false
): string {
  const changes = parseAuditChanges(log.old_values, log.new_values, log.details, isRtl);

  if (changes.length === 0) {
    if (log.action_type) {
      return log.action_type.replace(/_/g, ' ');
    }
    return isRtl ? 'لا توجد تفاصيل إضافية' : 'No extra details';
  }

  // Format up to 2 key changes into a neat phrase
  const statements = changes.slice(0, 2).map((c) => {
    if (c.type === 'modified') {
      return `${c.label}: ${c.oldVal} → ${c.newVal}`;
    }
    if (c.type === 'added' && c.oldVal) {
      return `${c.label}: +${c.newVal}`;
    }
    return `${c.label}: ${c.newVal}`;
  });

  const remaining = changes.length - 2;
  if (remaining > 0) {
    return `${statements.join(' • ')} (+${remaining} ${isRtl ? 'تغييرات أخرى' : 'more'})`;
  }

  return statements.join(' • ');
}
