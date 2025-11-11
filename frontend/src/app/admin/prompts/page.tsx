import AdminMenu from "@/components/AdminMenu";
import { FileText } from 'lucide-react';

export default function Page() {
  return (
    <AdminMenu>
      <div className="w-full">
        <div className="text-xl sm:text-2xl font-semibold flex items-center gap-2 text-violet-600 mb-4 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10">
          <FileText className="w-10 h-10" />
          <span>Prompts</span>
        </div>

        <div className="flex items-center justify-center py-12 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10">
          <p className="text-gray-500">Prompts management coming soon...</p>
        </div>
      </div>
    </AdminMenu>
  );
}
