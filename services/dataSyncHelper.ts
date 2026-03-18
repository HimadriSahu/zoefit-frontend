// Helper utility to integrate data sync into existing components
import { dataSyncService } from './dataSyncService';

export const useDataSync = () => {
  const verifyAndSync = async () => {
    try {
      // Verify current sync status
      const syncStatus = await dataSyncService.getSyncStatus();
      console.log('📊 Current sync status:', syncStatus);

      // If not fully synced, attempt to sync
      if (!syncStatus.backendProfile || !syncStatus.backendHealthMetrics) {
        console.log('🔄 Attempting to sync missing data...');
        const syncResult = await dataSyncService.forceSyncToBackend();
        
        if (syncResult.success) {
          console.log('✅ Data sync completed successfully');
        } else {
          console.warn('⚠️ Data sync completed with errors:', syncResult.errors);
        }
      } else {
        console.log('✅ All data already synced');
      }

      // Final verification
      const finalVerification = await dataSyncService.verifyBackendSync();
      return finalVerification;
    } catch (error) {
      console.error('❌ Data sync verification failed:', error);
      return { synced: false, missing: ['sync_verification_failed'] };
    }
  };

  return {
    verifyAndSync,
    getSyncStatus: () => dataSyncService.getSyncStatus(),
    forceSync: () => dataSyncService.forceSyncToBackend(),
  };
};
