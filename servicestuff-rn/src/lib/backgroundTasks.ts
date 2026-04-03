import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import NetInfo from '@react-native-community/netinfo';
import { OfflineService } from './offline';

// Task Name
export const BACKGROUND_SYNC_TASK = 'background-sync-task';

/**
 * Define the headless task that runs in the background.
 * This task will:
 * 1. Check if the device is online.
 * 2. If online, trigger the offline sync queue.
 * 3. Fetch fresh jobs to warm up the cache for the next time the app opens.
 */
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  const now = new Date();
  console.log(`[BACKGROUND_FETCH] Triggered at ${now.toLocaleTimeString()}`);

  try {
    const netState = await NetInfo.fetch();
    const isOnline = netState.isConnected && netState.isInternetReachable !== false;

    if (!isOnline) {
      console.log('[BACKGROUND_FETCH] Offline, skipping sync.');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const offlineService = OfflineService.getInstance();

    // 1. Sync pending mutations
    const syncSuccess = await offlineService.syncQueue();

    // 2. Refresh cache
    await offlineService.fetchAndCacheLatestJobs();

    console.log(`[BACKGROUND_FETCH] Sync completed. Status: ${syncSuccess ? 'Success' : 'Partial'}`);

    return syncSuccess
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.Failed;
  } catch (error) {
    console.error('[BACKGROUND_FETCH] Task failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/**
 * Registers the background fetch task with the OS.
 * Decided by the OS when to run (usually 15-30 min intervals).
 */
export async function registerBackgroundSync() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    if (isRegistered) {
      console.log('[BACKGROUND_FETCH] Task already registered.');
      return;
    }

    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 15 * 60, // 15 minutes (minimum allowed by OS)
      stopOnTerminate: false,   // Continue running after app is closed
      startOnBoot: true,        // Start after device reboot
    });

    console.log('[BACKGROUND_FETCH] Task registered successfully.');
  } catch (err) {
    console.error('[BACKGROUND_FETCH] Registration failed:', err);
  }
}

/**
 * Unregisters the background fetch task.
 */
export async function unregisterBackgroundSync() {
  if (await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK)) {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
  }
}
