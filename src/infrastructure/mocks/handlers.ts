import { http, HttpResponse } from 'msw';

export const handlers = [
  // Placeholder inicial para não quebrar a aplicação
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok' });
  }),
];
