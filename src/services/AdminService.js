import api from '../config/api';

export const adminService = {
  getRealms() {
    return api.get('/api/admin/realms');
  },
  createRealm(data) {
    return api.post('/api/admin/realms', data);
  },
  updateRealm(id, data) {
    return api.put(`/api/admin/realms/${id}`, data);
  },
  deleteRealm(id) {
    return api.delete(`/api/admin/realms/${id}`);
  },

  getResources() {
    return api.get('/api/admin/resources');
  },
  createResource(data) {
    return api.post('/api/admin/resources', data);
  },
  updateResource(id, data) {
    return api.put(`/api/admin/resources/${id}`, data);
  },
  deleteResource(id) {
    return api.delete(`/api/admin/resources/${id}`);
  },

  getFactories() {
    return api.get('/api/admin/factories');
  },
  createFactory(data) {
    return api.post('/api/admin/factories', data);
  },
  updateFactory(id, data) {
    return api.put(`/api/admin/factories/${id}`, data);
  },
  deleteFactory(id) {
    return api.delete(`/api/admin/factories/${id}`);
  },

  getSkills() {
    return api.get('/api/admin/skills');
  },
  createSkill(data) {
    return api.post('/api/admin/skills', data);
  },
  updateSkill(id, data) {
    return api.put(`/api/admin/skills/${id}`, data);
  },
  deleteSkill(id) {
    return api.delete(`/api/admin/skills/${id}`);
  },

  getPlayers({ search = '', limit = 50 } = {}) {
    const params = new URLSearchParams();
    if (search) params.set('search', String(search));
    if (limit != null) params.set('limit', String(limit));
    return api.get(`/api/admin/players?${params.toString()}`);
  },
  getPlayerResources(userId) {
    return api.get(`/api/admin/players/${userId}/resources`);
  },
  grantPlayerResource(userId, { resourceId, amount }) {
    return api.post(`/api/admin/players/${userId}/resources/grant`, {
      resourceId,
      amount,
    });
  },
  setPlayerResource(userId, { resourceId, amount }) {
    return api.post(`/api/admin/players/${userId}/resources/set`, {
      resourceId,
      amount,
    });
  },

  unlockPlayerRealm(userId, { realmCode }) {
    return api.post(`/api/admin/players/${userId}/realms/unlock`, { realmCode });
  },
  activatePlayerRealm(userId, { realmId }) {
    return api.post(`/api/admin/players/${userId}/realms/activate`, { realmId });
  },
  setPlayerFactoryLevel(userId, { factoryId, level }) {
    return api.post(`/api/admin/players/${userId}/factories/set-level`, {
      factoryId,
      level,
    });
  },
  setPlayerSkillLevel(userId, { skillId, level }) {
    return api.post(`/api/admin/players/${userId}/skills/set-level`, {
      skillId,
      level,
    });
  },
  resetPlayer(userId) {
    return api.post(`/api/admin/players/${userId}/reset`);
  },
  deletePlayer(userId) {
    return api.delete(`/api/admin/players/${userId}`);
  },

  // Support & Logs
  getSupportTickets({ status = '', search = '', limit = 100, offset = 0 } = {}) {
    const params = new URLSearchParams();
    if (status) params.set('status', String(status));
    if (search) params.set('search', String(search));
    if (limit != null) params.set('limit', String(limit));
    if (offset != null) params.set('offset', String(offset));
    const qs = params.toString();
    return api.get(`/api/admin/support/tickets${qs ? `?${qs}` : ''}`);
  },
  updateSupportTicketStatus(ticketId, status) {
    return api.put(`/api/admin/support/tickets/${ticketId}/status`, { status });
  },
  getAdminLogs({
    limit = 200,
    offset = 0,
    actionType = '',
    targetTable = '',
    userId = '',
  } = {}) {
    const params = new URLSearchParams();
    if (limit != null) params.set('limit', String(limit));
    if (offset != null) params.set('offset', String(offset));
    if (actionType) params.set('actionType', String(actionType));
    if (targetTable) params.set('targetTable', String(targetTable));
    if (userId) params.set('userId', String(userId));
    const qs = params.toString();
    return api.get(`/api/admin/logs${qs ? `?${qs}` : ''}`);
  },

  // Endgame (read-only pour l'instant)
  getEndgameRequirements() {
    return api.get('/api/admin/endgame/requirements');
  },
  createEndgameRequirement(data) {
    return api.post('/api/admin/endgame/requirements', data);
  },
  updateEndgameRequirement(id, data) {
    return api.put(`/api/admin/endgame/requirements/${id}`, data);
  },
  deleteEndgameRequirement(id) {
    return api.delete(`/api/admin/endgame/requirements/${id}`);
  },
  getEndgameRankings() {
    return api.get('/api/admin/endgame/rankings');
  },

  // Balance - coûts de déblocage royaumes
  getRealmUnlockCosts({ targetRealmId = '', limit = 500, offset = 0 } = {}) {
    const params = new URLSearchParams();
    if (targetRealmId) params.set('targetRealmId', String(targetRealmId));
    if (limit != null) params.set('limit', String(limit));
    if (offset != null) params.set('offset', String(offset));
    const qs = params.toString();
    return api.get(`/api/admin/realm-unlock-costs${qs ? `?${qs}` : ''}`);
  },
  createRealmUnlockCost(data) {
    return api.post('/api/admin/realm-unlock-costs', data);
  },
  updateRealmUnlockCost(id, data) {
    return api.put(`/api/admin/realm-unlock-costs/${id}`, data);
  },
  deleteRealmUnlockCost(id) {
    return api.delete(`/api/admin/realm-unlock-costs/${id}`);
  },
};
