import { useEffect, useState } from "react";
import { fetchSudburyData } from "../utils/apiProxy";

export function useAutoFetch(url, refreshMs = 120000) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let timer;

    async function load() {
      try {
        setError(null);
        setLoading(true);
        const json = await fetchSudburyData(url);
        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) {
          setError(e.message || "Failed to load");
          setLoading(false);
        }
      }
    }

    load();
    timer = setInterval(load, refreshMs);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [url, refreshMs]);

  return { data, error, loading };
}

