import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const { loadAllData } = await import('../src/utils/dataLoader.js');
  const data = await loadAllData();
  console.log('DEBUG loadAllData result:');
  console.log('source:', data?.source);
  console.log('requests:', (data?.requests || []).length);
  console.log('admins:', (data?.admins || []).length);
  console.log('departments:', (data?.departments || []).length);
  console.log('requestTypes:', (data?.requestTypes || []).length);
  console.log('workloadLog:', (data?.workloadLog || []).length);
  console.log('dailySummary:', (data?.dailySummary || []).length);
} catch (e) {
  console.error('Error running debug loader:', e);
  process.exit(1);
}
