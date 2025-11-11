import AdminMenu from "@/components/AdminMenu";
import EditPromptPanel from "@/components/AdminEditPrompt";
import { PenLine } from "lucide-react";


export default function Page() {
  return (
    <AdminMenu>
      <div className="w-full">
        <div className="text-xl sm:text-2xl font-semibold flex items-center gap-2 text-violet-600 mb-4">
          <PenLine className="w-5 h-5" />
          <span> Edit Prompt</span>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mb-6">
          <EditPromptPanel />
        </div>

      </div>
    </AdminMenu>
  );
}