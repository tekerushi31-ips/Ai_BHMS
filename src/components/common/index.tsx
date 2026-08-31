import React from "react";
import { AlertCircle, CheckCircle, Info, ShieldAlert } from "lucide-react";

export function DemoModeBanner() {
  return (
    <div className="bg-clinical-950 dark:bg-[#070c14] text-teal-100 dark:text-teal-200 text-xs px-4 py-2 flex items-center justify-between border-b border-clinical-900 dark:border-slate-800/80 shadow-xs transition-colors">
      <div className="flex items-center gap-2">
        <span className="bg-teal-500/20 text-teal-300 font-semibold px-2 py-0.5 rounded border border-teal-500/30 flex items-center gap-1.5 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          DEMO MODE ACTIVE
        </span>
        <span className="hidden sm:inline text-teal-200/90 text-xs">
          Running with verified classical homoeopathic reasoning engine & seed dataset.
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-teal-300/80 text-[11px] font-mono">Zero External API Keys Needed</span>
      </div>
    </div>
  );
}

export function ClinicalDisclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs transition-colors">
        <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <span>
          <strong>Clinical Decision Support:</strong> AI recommendations require qualified homeopathic practitioner review.
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-amber-950 dark:text-amber-200 text-xs flex gap-3 shadow-soft transition-colors">
      <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
      <div className="space-y-1">
        <h4 className="font-semibold text-amber-900 dark:text-amber-300">Medical AI Guardrails & Statutory Disclaimer</h4>
        <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed">
          BHMS AI is an educational and clinical decision-support copilot. AI output must never replace independent clinical judgment. All diagnoses, remedy selections, potencies, and posology require review and authorization by a registered homoeopathic medical practitioner.
        </p>
      </div>
    </div>
  );
}

export function LoadingSpinner({ label = "Loading data..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="w-8 h-8 border-3 border-clinical-600/30 dark:border-clinical-400/20 border-t-clinical-600 dark:border-t-clinical-400 rounded-full animate-spin" />
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = Info,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: any;
}) {
  return (
    <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 flex flex-col items-center justify-center transition-colors">
      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-clinical-600 hover:bg-clinical-700 dark:bg-clinical-600 dark:hover:bg-clinical-500 rounded-lg shadow-sm transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 text-xs flex items-center justify-between transition-colors">
      <div className="flex items-center gap-2.5">
        <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-2.5 py-1 bg-rose-100 dark:bg-rose-900/60 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-200 rounded font-medium transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
