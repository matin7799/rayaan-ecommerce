// Re-export the canonical API client from services
// All service modules use apps/frontend/src/services/api-client.ts
// This file exists for backwards compatibility with any old imports
export { apiClient } from '@/services/api-client';
