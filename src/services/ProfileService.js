import api from '../config/api';

export const profileService = {
  updateProfile: (data) => api.patch('/api/user/me', data),
};
