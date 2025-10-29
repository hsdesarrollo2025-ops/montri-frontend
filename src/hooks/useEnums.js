import { useEffect, useState } from "react";
import { fetchEnums } from "../services/enums";

let cache = null;

export function useEnums(apiBase, token) {
  const [data, setData] = useState(cache);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (!cache) {
      setLoading(true);
      fetchEnums(apiBase, token)
        .then((d) => {
          cache = d;
          if (mounted) setData(d);
        })
        .catch((e) => mounted && setError(e))
        .finally(() => mounted && setLoading(false));
    }
    return () => {
      mounted = false;
    };
  }, [apiBase, token]);

  return { data, loading, error };
}

