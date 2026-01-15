"use client";

import { useState } from "react";
import { Trash2, Edit2, Check, X, Loader2, MapPin, Hash } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LocationRow({ loc }: { loc: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    city: loc.city_name,
    zip: loc.postal_code,
  });
  const supabase = createClient();
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    await supabase
      .from("allowed_locations")
      .update({ is_serving: !loc.is_serving })
      .eq("id", loc.id);
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
    await supabase
      .from("allowed_locations")
      .update({
        city_name: editData.city,
        postal_code: editData.zip,
      })
      .eq("id", loc.id);
    setIsEditing(false);
    router.refresh();
    setLoading(false);
  };

  return (
    <tr className="group transition-all duration-300 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-indigo-500/5">
      {/* City Name Column */}
      <td className="p-8">
        {isEditing ? (
          <div className="relative group/input max-w-[220px]">
            <MapPin
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-btn"
            />
            <input
              value={editData.city}
              onChange={(e) =>
                setEditData({ ...editData, city: e.target.value })
              }
              className="bg-white dark:bg-slate-950 border border-indigo-500/30 rounded-xl py-2.5 pl-9 pr-4 text-slate-900 dark:text-slate-100 outline-none w-full focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm font-semibold shadow-sm"
            />
          </div>
        ) : (
          <div className="flex flex-col">
            <p className="text-slate-900 dark:text-slate-100 text-xl font-bold tracking-tight uppercase group-hover:text-primary-btn dark:group-hover:text-indigo-400 transition-colors">
              {loc.city_name}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-bold tracking-wider mt-0.5">
              Service City
            </span>
          </div>
        )}
      </td>

      {/* Zip Code Column */}
      <td className="p-8">
        {isEditing ? (
          <div className="relative group/input max-w-[150px]">
            <Hash
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-btn"
            />
            <input
              value={editData.zip}
              onChange={(e) =>
                setEditData({ ...editData, zip: e.target.value })
              }
              className="bg-white dark:bg-slate-950 border border-indigo-500/30 rounded-xl py-2.5 pl-9 pr-4 text-slate-900 dark:text-slate-100 outline-none w-full font-mono text-sm shadow-sm"
            />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-indigo-500 transition-colors" />
            <span className="text-slate-600 dark:text-slate-400 font-mono text-sm font-bold tracking-wide">
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
            className={`flex flex-col items-center gap-2 transition-all group/toggle ${
              loading ? "opacity-30 pointer-events-none" : ""
            }`}
          >
            <div
              className={`w-14 h-7 rounded-full relative p-1 transition-all duration-500 border ${
                loc.is_serving
                  ? "bg-indigo-500/10 border-indigo-500/30"
                  : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full transition-all duration-500 shadow-sm ${
                  loc.is_serving
                    ? "translate-x-7 bg-primary-btn shadow-indigo-500/40"
                    : "translate-x-0 bg-slate-400 dark:bg-slate-600"
                }`}
              />
            </div>
            <span
              className={`text-[9px] uppercase font-black tracking-widest transition-colors ${
                loc.is_serving
                  ? "text-primary-btn"
                  : "text-slate-500 dark:text-slate-600"
              }`}
            >
              {loc.is_serving ? "Active" : "Paused"}
            </span>
          </button>
        </div>
      </td>

      {/* Actions Column */}
      <td className="p-8 text-right">
        <div className="flex justify-end items-center gap-2">
          {loading && !isEditing ? (
            <Loader2 className="animate-spin text-slate-400" size={18} />
          ) : isEditing ? (
            <div className="flex gap-2 animate-in fade-in zoom-in duration-200">
              <button
                onClick={handleUpdate}
                className="p-2.5 bg-primary-btn text-white rounded-xl hover:bg-indigo-700  shadow-indigo-500/20 transition-all"
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 md:translate-x-4 md:group-hover:translate-x-0">
              <button
                onClick={() => setIsEditing(true)}
                className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary-btn dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all"
                title="Edit Location"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={handleDelete}
                className="p-3 bg-rose-500/5 text-rose-500/40 hover:bg-rose-600 hover:text-white rounded-xl transition-all"
                title="Delete Location"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
