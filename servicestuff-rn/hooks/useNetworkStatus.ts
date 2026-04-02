import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [networkState, setNetworkState] = useState<NetInfoState | null>(null);

  useEffect(() => {
    // Initial fetch
    NetInfo.fetch().then(state => {
      setIsOnline(!!state.isConnected && state.isInternetReachable !== false);
      setNetworkState(state);
    });

    // Subscribe to changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(!!state.isConnected && state.isInternetReachable !== false);
      setNetworkState(state);
    });

    return () => unsubscribe();
  }, []);

  return { isOnline, networkState };
}
