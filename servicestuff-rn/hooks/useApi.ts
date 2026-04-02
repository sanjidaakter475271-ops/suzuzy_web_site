import { useState, useEffect, useCallback, useRef } from 'react';
import { AxiosResponse, AxiosRequestConfig } from 'axios';

interface UseApiOptions {
  manual?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useApi<T = any>(
  apiFn: (config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>,
  deps: any[] = [],
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!options.manual);
  const [error, setError] = useState<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (...args: any[]) => {
    // Abort previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await apiFn({
        signal: abortControllerRef.current.signal,
      });

      const result = response.data;
      setData(result);

      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    } catch (err: any) {
      // Don't set error state if request was aborted
      if (err.name === 'AbortError' || err.message === 'canceled') {
        return;
      }

      setError(err);
      if (options.onError) {
        options.onError(err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFn, ...deps]);

  useEffect(() => {
    if (!options.manual) {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData
  };
}
