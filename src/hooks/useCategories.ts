"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

type Category = {
  id: string;
  name: string;
};

export function useCategories() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchCategories = async () => {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("categories")
        .select("id,name")
        .order("sort_order", { ascending: true });

      if (!mounted) return;

      if (fetchError) {
        setError(fetchError.message);
        setCategories([]);
      } else {
        setError(null);
        setCategories((data ?? []) as Category[]);
      }

      setLoading(false);
    };

    void fetchCategories();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  return { categories, loading, error };
}
