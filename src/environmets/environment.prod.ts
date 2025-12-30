export const environment = {
  production: true,
  apiUrl: 'https://api-mes.tuempresa.com/api', // Cambia esto por la URL de tu servidor
  apiVersion: 'v1',
  timeout: 30000,
  enableDebugLogs: false,
  endpoints: {
    auth: '/auth',
    production: '/production-orders',
    maintenance: '/maintenance',
    quality: '/quality',
    inventory: '/inventory',
    masterData: '/master-data',
    traceability: '/traceability',
    reports: '/reports',
    integrations: '/integrations',
    admin: '/admin'
  }
};
