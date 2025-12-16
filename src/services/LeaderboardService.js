import api from '../config/api';

export const leaderboardService = {
  getCompletions({ limit = 100 } = {}) {
    const params = new URLSearchParams();
    if (limit != null) params.set('limit', String(limit));
    return api.get(`/api/leaderboard/completions?${params.toString()}`);
  },
};

