import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center p-6 transition-colors">
      <div className="max-w-md w-full text-center space-y-4 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto">
          <FileQuestion className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">404 — Page Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          The requested clinical module or learning resource does not exist or has been moved.
        </p>

        <div className="pt-4 flex justify-center">
          <Link
            href="/"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-clinical-600 hover:bg-clinical-700 dark:bg-clinical-600 dark:hover:bg-clinical-500 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
