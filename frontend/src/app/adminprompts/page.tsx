import AdminMenu from "@/components/AdminMenu";
import AdminCard from "@/components/AdminCard";
import ADD_admin from "@/components/ADD_admin";
import { UserPen } from 'lucide-react';

export default function Page() {
  return (
    <div className="p-6">
      <div className="my-4">
        <AdminMenu />
      </div>

      <div className="w-full px-8 sm:px-12 lg:px-16">
        <div className="text-xl sm:text-2xl font-semibold flex items-center gap-2 text-violet-600 mb-4">
          <UserPen className="w-10 h-10" />
          <span>Song Approved</span>
        </div>


        <div className="flex flex-wrap justify-center gap-6 mb-6">
          <AdminCard name="Tikpop" role="Admin" initials="TP" />
          <AdminCard name="Tikpop" role="Admin" initials="TP" />
          <AdminCard name="Tikpop" role="Admin" initials="TP" />
        </div>

        
        <div className="flex flex-wrap justify-center gap-6 mb-6">
            <ADD_admin />
        </div>


    </div>
    </div>
  );
}