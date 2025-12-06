import api from '../config/api';

export const playerService = {
  getProfile: () => api.get('/api/player/profile'),
  getResources: () => api.get('/api/player/resources'),
  getFactories: () => api.get('/api/player/factories'),
  getRealms: () => api.get('/api/player/realms'),
  getSkills: () => api.get('/api/player/skills'),
  getStats: () => api.get('/api/player/stats'),

  upgradeFactory: (factoryId) =>
    api.post('/api/player/factories/upgrade', { factoryId }),

  upgradeSkill: (skillId) =>
    api.post('/api/player/skills/upgrade', { skillId }),

  unlockRealm: (realmCode) =>
    api.post('/api/player/realms/unlock', { realmCode }),

  activateRealm: (realmId) =>
    api.post('/api/player/realms/activate', { realmId }),
};
