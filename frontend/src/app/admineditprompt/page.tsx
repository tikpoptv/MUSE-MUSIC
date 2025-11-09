import AdminMenu from "@/components/AdminMenu";
import EditPromptPanel from "@/components/AdminEditPrompt";


export default function Page() {
  return (
    <div className="p-6">
      <div className="my-4">
        <AdminMenu />
      </div>

  
        <div className="w-full px-8 sm:px-12 lg:px-16">
            <div className="w-full px-8 sm:px-12 lg:px-16 min-h-screen bg-white flex justify-center items-start py-10">
            <EditPromptPanel />
            </div>
        </div>
    </div>
  );
}
