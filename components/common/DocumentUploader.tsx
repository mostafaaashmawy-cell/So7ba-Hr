'use client';

import React, { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  Eye,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

interface DocumentUploaderProps {
  tenantId?: string | null;
  userId?: string | null;
  documentType: string;
  labelEn: string;
  labelAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  currentUrl?: string | null;
  onUrlChange: (url: string | null) => void;
  readOnly?: boolean;
}

export default function DocumentUploader({
  tenantId,
  userId,
  documentType,
  labelEn,
  labelAr,
  descriptionEn,
  descriptionAr,
  currentUrl,
  onUrlChange,
  readOnly = false,
}: DocumentUploaderProps) {
  const { isRtl } = useLanguage();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url) || url.includes('image');
  };

  const handleUpload = async (file: File) => {
    if (!file) return;

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(isRtl ? 'حجم الملف يجب ألا يتجاوز 10 ميجابايت' : 'File size must not exceed 10MB');
      return;
    }

    setUploading(true);
    setErrorMsg(null);

    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const cleanTenant = tenantId || 'default-org';
      const cleanUser = userId || 'unassigned';
      const timestamp = Date.now();
      const filePath = `${cleanTenant}/${cleanUser}/${documentType}_${timestamp}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('employee-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) throw error;

      // Obtain public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('employee-documents').getPublicUrl(data.path);

      onUrlChange(publicUrl);
    } catch (err: unknown) {
      console.error('Storage upload error:', err);
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setErrorMsg(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (readOnly) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
      {/* Header Info */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h5 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {isRtl ? labelAr : labelEn}
          </h5>
          {(descriptionAr || descriptionEn) && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {isRtl ? descriptionAr : descriptionEn}
            </p>
          )}
        </div>

        {/* Status Badge */}
        {currentUrl ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 shrink-0">
            <CheckCircle2 className="w-3 h-3" />
            {isRtl ? 'مرفوع' : 'Uploaded'}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 shrink-0">
            <AlertCircle className="w-3 h-3" />
            {isRtl ? 'غير متوفر' : 'Missing'}
          </span>
        )}
      </div>

      {/* Preview / Action Area */}
      {currentUrl ? (
        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {isImage(currentUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentUrl}
                alt={labelEn}
                className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                {documentType}.pdf / img
              </span>
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-emerald-600 hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <Eye className="w-3 h-3" /> {isRtl ? 'عرض الملف' : 'View full file'}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={currentUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Download"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
            {!readOnly && (
              <button
                type="button"
                onClick={() => onUrlChange(null)}
                className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-800 cursor-pointer"
                title="Remove file"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        !readOnly && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
              isDragOver
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-white/50 dark:bg-slate-900/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />

            {uploading ? (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{isRtl ? 'جاري الرفع إلى التخزين...' : 'Uploading to vault...'}</span>
              </div>
            ) : (
              <>
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isRtl ? 'اسحب الملف هنا أو انقر للرفع' : 'Drag & drop file or browse'}
                </span>
                <span className="text-[10px] text-slate-400">
                  PNG, JPG, PDF up to 10MB
                </span>
              </>
            )}
          </div>
        )
      )}

      {errorMsg && (
        <p className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {errorMsg}
        </p>
      )}
    </div>
  );
}
