import { Sidebar } from "@/components/layout/Sidebar";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex bg-slate-50 dark:bg-[#090D16] min-h-[calc(100vh-4rem)] transition-colors">
      <Sidebar role="DOCTOR" />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-6xl mx-auto w-full">
        {children}
      </div>
    </div>
  );
}
