import AdminMenu from "@/components/AdminMenu";
import EditPromptPanel from "@/components/AdminEditPrompt";


export default function Page() {
  return (
    <AdminMenu>
      <EditPromptPanel />
    </AdminMenu>
  );
}