import api from '../config/api';

export const supportService = {
  createTicket(payload) {
    return api.post('/api/support/tickets', payload);
  },
};

