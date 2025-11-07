import AdminMenu from "@/components/AdminMenu";
import AdminCard from "@/components/AdminCard";

export default function Page() {
  return (
    <div className="p-6">
      <div className="my-4">
        <AdminMenu />
      </div>

    <div className="flex flex-wrap justify-center gap-6 mb-6">
        <AdminCard name="Tikpop" role="Admin" initials="TP" />
        <AdminCard name="Tikpop" role="Admin" initials="TP" />
        <AdminCard name="Tikpop" role="Admin" initials="TP" />
      </div>
    </div>
  );
}
