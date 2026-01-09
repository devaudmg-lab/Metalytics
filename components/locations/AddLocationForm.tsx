"use client";

import { useState, useRef } from "react";
import { Plus, MapPin, Globe, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function AddLocationForm({ defaultCity = "", defaultZip = "", onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const city = formData.get("city") as string;
    const zip = formData.get("zip") as string;

    const { error } = await supabase
      .from("allowed_locations")
      .insert([{ 
        city_name: city, 
        postal_code: zip, 
        is_serving: true 
      }]);
    
    if (error) {
      alert("Error adding location: " + error.message);
    } else {
      formRef.current?.reset();
      router.refresh();
      if (onSuccess) onSuccess(); // Closes the modal
    }
    setLoading(false);
  };

  return (
    <div className="relative group/form">
      
      <form 
        ref={formRef}
        onSubmit={handleSubmit} 
        className="relative grid grid-cols-1 gap-6 p-2 bg-transparent rounded-sm transition-colors duration-300"
      >
        {/* City Input */}
        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 p-1.5 bg-gray-100 dark:bg-zinc-900 rounded-lg group-focus-within:bg-emerald-500/10 transition-colors">
            <MapPin className="text-gray-700 dark:text-zinc-600 group-focus-within:text-primary-btn dark:group-focus-within:text-emerald-500 transition-colors" size={16} />
          </div>
          <input 
            name="city" 
            defaultValue={defaultCity}
            placeholder="City Name (e.g. Melbourne)" 
            className="w-full bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-white/5 rounded-sm py-5 pl-16 pr-6 text-sm text-foreground outline-none focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/5 transition-all font-semibold placeholder:text-gray-700 dark:placeholder:text-zinc-700 shadow-inner" 
            required 
          />
        </div>

        {/* Zip Code Input */}
        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 p-1.5 bg-gray-100 dark:bg-zinc-900 rounded-lg group-focus-within:bg-emerald-500/10 transition-colors">
            <Globe className="text-gray-700 dark:text-zinc-600 group-focus-within:text-primary-btn dark:group-focus-within:text-emerald-500 transition-colors" size={16} />
          </div>
          <input 
            name="zip" 
            defaultValue={defaultZip}
            placeholder="Postal Code (e.g. 3000)" 
            className="w-full bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-white/5 rounded-sm py-5 pl-16 pr-6 text-sm text-foreground outline-none focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/5 transition-all font-mono placeholder:text-gray-700 dark:placeholder:text-zinc-700  shadow-inner font-bold" 
            required 
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          className="relative overflow-hidden cursor-pointer bg-primary-btn disabled:bg-gray-200 dark:disabled:bg-zinc-800 text-white rounded-sm uppercase  text-sm transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-primtext-primary-btn/20 group h-[60px]"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18}/>
          ) : (
            <>
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              <span>Add to Region</span>
            </>
          )}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
        </button>
      </form>
    </div>
  );
}