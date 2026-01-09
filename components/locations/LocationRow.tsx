"use client";

import { useState } from "react";
import { Trash2, Edit2, Check, X, Loader2, MapPin, Hash } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LocationRow({ loc }: { loc: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({ city: loc.city_name, zip: loc.postal_code });
  const supabase = createClient();
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    await supabase.from("allowed_locations").update({ is_serving: !loc.is_serving }).eq("id", loc.id);
    router.refresh();
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this region?")) return;
    setLoading(true);
    await supabase.from("allowed_locations").delete().eq("id", loc.id);
    router.refresh();
  };

  const handleUpdate = async () => {
    setLoading(true);
    await supabase.from("allowed_locations").update({ 
      city_name: editData.city, 
      postal_code: editData.zip 
    }).eq("id", loc.id);
    setIsEditing(false);
    router.refresh();
    setLoading(false);
  };

  return (
    <tr className="group transition-all duration-300 border-b border-gray-100 dark:border-white/[0.03] hover:bg-gray-50 dark:hover:bg-white/[0.02]">
      {/* City Name Column */}
      <td className="p-8">
        {isEditing ? (
          <div className="relative group/input max-w-[200px]">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-500" />
            <input 
              value={editData.city} 
              onChange={(e) => setEditData({...editData, city: e.target.value})}
              className="bg-white dark:bg-zinc-950 border border-emerald-500/30 rounded-xl py-2 pl-9 pr-4 text-foreground outline-none w-full focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm font-bold shadow-sm"
            />
          </div>
        ) : (
          <div className="flex flex-col">
            <p className="text-foreground  text-xl er uppercase group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {loc.city_name}
            </p>
            <span className="text-[9px]  text-gray-700 dark:text-zinc-600 uppercase ">Service City</span>
          </div>
        )}
      </td>

      {/* Zip Code Column */}
      <td className="p-8">
        {isEditing ? (
          <div className="relative group/input max-w-[150px]">
            <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-500" />
            <input 
              value={editData.zip} 
              onChange={(e) => setEditData({...editData, zip: e.target.value})}
              className="bg-white dark:bg-zinc-950 border border-emerald-500/30 rounded-xl py-2 pl-9 pr-4 text-foreground outline-none w-full font-mono text-sm shadow-sm"
            />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-zinc-800 group-hover:bg-emerald-500 transition-colors" />
            <span className="text-gray-500 dark:text-zinc-400 font-mono text-sm  font-bold">
              {loc.postal_code}
            </span>
          </div>
        )}
      </td>

      {/* Toggle Status Column */}
      <td className="p-8 text-center">
        <div className="flex justify-center">
          <button 
            onClick={handleToggle}
            disabled={loading}
            className={`flex flex-col items-center gap-2 transition-all ${loading ? 'opacity-30 pointer-events-none' : ''}`}
          >
            <div className={`w-14 h-7 rounded-full relative p-1 transition-all duration-500 ${loc.is_serving ? 'bg-emerald-500/10 dark:bg-emerald-600/20 border border-emerald-500/30' : 'bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-white/5'}`}>
              <div className={`w-5 h-5 rounded-full transition-all duration-500 shadow-lg ${loc.is_serving ? 'translate-x-7 bg-emerald-600 dark:bg-emerald-500 shadow-emerald-500/50' : 'translate-x-0 bg-gray-400 dark:bg-zinc-600'}`} />
            </div>
            <span className={`text-[9px]  uppercase  transition-colors ${loc.is_serving ? 'text-emerald-600 dark:text-emerald-500' : 'text-gray-700 dark:text-zinc-600'}`}>
              {loc.is_serving ? 'Active' : 'Paused'}
            </span>
          </button>
        </div>
      </td>

      {/* Actions Column */}
      <td className="p-8 text-right">
        <div className="flex justify-end items-center gap-2">
          {loading && !isEditing ? (
            <Loader2 className="animate-spin text-gray-700 dark:text-zinc-600" size={18} />
          ) : isEditing ? (
            <div className="flex gap-2 animate-in fade-in zoom-in duration-200">
              <button onClick={handleUpdate} className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all">
                <Check size={18}/>
              </button>
              <button onClick={() => setIsEditing(false)} className="p-2.5 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-zinc-500 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
                <X size={18}/>
              </button>
            </div>
          ) : (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
              <button 
                onClick={() => setIsEditing(true)} 
                className="p-3 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-zinc-500 hover:text-emerald-600 dark:hover:text-white hover:bg-emerald-50 dark:hover:bg-white/10 rounded-xl transition-all"
                title="Edit Location"
              >
                <Edit2 size={16}/>
              </button>
              <button 
                onClick={handleDelete} 
                className="p-3 bg-red-500/5 text-red-500/40 hover:bg-red-600 hover:text-white rounded-xl transition-all"
                title="Delete Location"
              >
                <Trash2 size={16}/>
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}