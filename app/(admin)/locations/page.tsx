import { createClient } from "@/utils/supabase/server";
import AddLocationForm from "@/components/locations/AddLocationForm";
import LocationRow from "@/components/locations/LocationRow";
import { MapPinned, Settings2, Globe } from "lucide-react";

export default async function LocationsPage() {
  const supabase = await createClient();
  const { data: locations } = await supabase
    .from("allowed_locations")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden transition-colors duration-300">
      
      {/* Background Decorative Glow - Adaptive */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-600/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 dark:primary-btn/5 blur-[100px] rounded-full -z-10" />

      <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-12 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-500 border border-emerald-500/20">
                <Globe size={20} />
              </div>
              <span className="text-[10px]  uppercase  text-gray-700 dark:text-zinc-500">
                Geofencing Active
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl  text-foreground er leading-none">
              Region <span className="text-emerald-600 dark:text-emerald-500">Settings</span>
            </h1>
            <p className="text-gray-500 dark:text-zinc-500 font-semibold max-w-lg leading-relaxed">
              Define allowed service zones. Incoming leads will be auto-verified based on these locations.
            </p>
          </div>

          <div className="flex bg-card dark:bg-zinc-900/40 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-5 md:p-6 rounded-sm items-center gap-6 shadow-xl shadow-black/5">
            <div className="text-right">
              <p className="text-[10px]  uppercase  text-gray-700 dark:text-zinc-500">Active Zones</p>
              <p className="text-3xl  text-foreground">{locations?.length || 0}</p>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-white/5 rounded-sm shadow-inner">
              <MapPinned size={28} className="text-emerald-600 dark:text-emerald-500" />
            </div>
          </div>
        </div>

        {/* 1. Add Form Section */}
        <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-700">
          <AddLocationForm />
        </div>

        {/* 2. Locations Table */}
        <div className="space-y-6">
           <div className="flex items-center gap-3 px-4">
              <div className="p-1.5 bg-gray-100 dark:bg-white/5 rounded-lg">
                <Settings2 size={16} className="text-gray-700 dark:text-zinc-600" />
              </div>
              <h2 className="text-[11px]  uppercase  text-gray-700 dark:text-zinc-600">
                Live Zone Directory
              </h2>
           </div>

           <div className="bg-card dark:bg-zinc-900/20 backdrop-blur-xl rounded-[2rem] md:rounded-sm border border-gray-200 dark:border-white/5 overflow-hidden shadow-2xl shadow-black/5">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-white/[0.02] border-b border-gray-200 dark:border-white/5">
                    <th className="p-8 text-[11px]  text-gray-700 dark:text-zinc-400 uppercase ">City Name</th>
                    <th className="p-8 text-[11px]  text-gray-700 dark:text-zinc-400 uppercase ">Zip Code</th>
                    <th className="p-8 text-[11px]  text-gray-700 dark:text-zinc-400 uppercase  text-center">Serving Status</th>
                    <th className="p-8 text-[11px]  text-gray-700 dark:text-zinc-400 uppercase  text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {locations && locations.length > 0 ? (
                    locations.map((loc) => (
                      <LocationRow key={loc.id} loc={loc} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-24 text-center">
                        <div className="flex flex-col items-center gap-6">
                          <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-full border border-gray-100 dark:border-white/5">
                            <MapPinned size={56} className="text-gray-200 dark:text-zinc-800" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-foreground  text-xl ">No active zones found</p>
                            <p className="text-gray-700 dark:text-zinc-500 text-sm font-medium">Add your first service location to start verifying leads.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}