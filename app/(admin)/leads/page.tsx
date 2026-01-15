import LeadsList from "@/components/leads/LeadsList";
import { createClient } from "@/utils/supabase/server";

export default async function LeadsPage() {
  const supabase = await createClient();

  // Fetching leads with their meta identities (Join)
  const { data: initialLeads, error } = await supabase
    .from("leads")
    .select(`
      *,
      meta_identities (
        meta_lead_id,
        raw_metadata
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching leads:", error);
  }

  return (
    <div className="relative min-h-[calc(100vh-120px)] transition-colors duration-300">
      

      <div className="mx-auto space-y-8 relative z-10">

        {/* Main Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <LeadsList initialLeads={initialLeads || []} />
        </div>
      </div>
    </div>
  );
}