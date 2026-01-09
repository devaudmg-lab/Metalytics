import LeadsList from "@/components/leads/LeadsList";
import { createClient } from "@/utils/supabase/server";
import { ShieldCheck } from "lucide-react";

export default async function LeadsPage() {
  const supabase = await createClient();

  // Fetching all data
  const { data: initialLeads, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching leads:", error);
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 relative overflow-hidden">
      
      {/* Background Decorative Glow (Subtle) */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary-btn/5 blur-[100px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full -z-10" />

      <div className="mx-auto lg:px-8 space-y-8">
        
        {/* Main Content Area */}
        <div className="relative">
          <LeadsList initialLeads={initialLeads || []} />
        </div>

      </div>
    </div>
  );
}