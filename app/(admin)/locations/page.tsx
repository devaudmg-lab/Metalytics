import { createClient } from "@/utils/supabase/server";
import AddLocationForm from "@/components/locations/AddLocationForm";
import LocationRow from "@/components/locations/LocationRow";
import CsvImportButton from "@/components/locations/CsvImportButton";
import { MapPinned, Settings2, Globe } from "lucide-react";

export default async function LocationsPage() {
  const supabase = await createClient();
  const { data: locations } = await supabase
    .from("allowed_locations")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Glow - Indigo Theme */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-primary-btn/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-200/20 dark:bg-indigo-900/5 blur-[100px] rounded-full -z-10" />

      <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-12 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-primary-btn border border-indigo-500/20">
                <Globe size={20} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">
                Geofencing Active
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl text-slate-900 dark:text-slate-50 font-semibold leading-none tracking-tight">
              Region{" "}
              <span className="text-primary-btn dark:text-indigo-500">
                Settings
              </span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium max-w-lg leading-relaxed">
              Define allowed service zones. Incoming leads will be auto-verified
              based on these locations.
            </p>
          </div>

          <div className="flex bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 rounded-sm items-center gap-6 shadow-xl shadow-slate-200/50 dark:shadow-black/20">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-500">
                Active Zones
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                {locations?.length || 0}
              </p>
            </div>
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-sm shadow-inner">
              <MapPinned
                size={28}
                className="text-primary-btn dark:text-indigo-500"
              />
            </div>
            {/* CSV Import Button */}
            <CsvImportButton />
          </div>
        </div>

        {/* 1. Add Form Section */}
        <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-700">
          <AddLocationForm />
        </div>

        {/* 2. Locations Table */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-4">
            <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Settings2
                size={16}
                className="text-slate-600 dark:text-slate-400"
              />
            </div>
            <h2 className="text-[11px] uppercase font-bold tracking-widest text-slate-500">
              Live Zone Directory
            </h2>
          </div>

          <div className="bg-white dark:bg-slate-900/20 backdrop-blur-xl rounded-sm border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl shadow-slate-200/20 dark:shadow-black/40">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-8 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      City Name
                    </th>
                    <th className="p-8 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Zip Code
                    </th>
                    <th className="p-8 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
                      Serving Status
                    </th>
                    <th className="p-8 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {locations && locations.length > 0 ? (
                    locations.map((loc) => (
                      <LocationRow key={loc.id} loc={loc} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-24 text-center">
                        <div className="flex flex-col items-center gap-6">
                          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-100 dark:border-slate-800">
                            <MapPinned
                              size={56}
                              className="text-slate-300 dark:text-slate-700"
                            />
                          </div>
                          <div className="space-y-1">
                            <p className="text-slate-900 dark:text-slate-100 text-xl font-semibold">
                              No active zones found
                            </p>
                            <p className="text-slate-500 text-sm font-medium">
                              Add your first service location to start verifying
                              leads.
                            </p>
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
