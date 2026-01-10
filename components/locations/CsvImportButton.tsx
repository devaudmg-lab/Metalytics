"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, FileSpreadsheet, AlertCircle } from "lucide-react";
import Papa from "papaparse";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function CsvImportButton() {
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset file input so same file can be selected again if needed
        e.target.value = "";

        handleImport(file);
    };

    const handleImport = (file: File) => {
        setIsImporting(true);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const data = results.data as any[];

                    if (!data || data.length === 0) {
                        alert("CSV is empty");
                        setIsImporting(false);
                        return;
                    }

                    // Validate headers (looking for 'postcode' or 'zip')
                    const firstRow = data[0];
                    const postcodeKey = Object.keys(firstRow).find(
                        (k) => k.toLowerCase().includes("postcode") || k.toLowerCase().includes("zip")
                    );

                    if (!postcodeKey) {
                        alert("Could not find 'postcode' column in CSV. Please ensure the CSV has a header row with a 'postcode' column.");
                        setIsImporting(false);
                        return;
                    }

                    // Transform data
                    const rowsToInsert = data
                        .filter((row) => row[postcodeKey])
                        .map((row) => ({
                            postal_code: String(row[postcodeKey]).trim(),
                            city_name: row["city"] || "VIC", // Default to VIC or try to find city
                            is_serving: true,
                        }));

                    // Batch Insert
                    const { error } = await supabase
                        .from("allowed_locations")
                        .insert(rowsToInsert); // Note: If duplicates exist, this might fail unless we ignore/upsert. 
                    // For now, assuming simple insert. If duplicate constraints exist, we might need a different strategy.

                    if (error) {
                        console.error(error);
                        alert(`Error importing: ${error.message} (Check constraints or duplicates)`);
                    } else {
                        alert(`Successfully imported ${rowsToInsert.length} locations.`);
                        router.refresh();
                    }

                } catch (err) {
                    console.error(err);
                    alert("An unexpected error occurred during import.");
                } finally {
                    setIsImporting(false);
                }
            },
            error: (error) => {
                console.error(error);
                alert("Failed to parse CSV file.");
                setIsImporting(false);
            }
        });
    };

    return (
        <>
            <input
                type="file"
                accept=".csv"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
                {isImporting ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : (
                    <FileSpreadsheet size={16} />
                )}
                {isImporting ? "Importing..." : "Import CSV"}
            </button>
        </>
    );
}
