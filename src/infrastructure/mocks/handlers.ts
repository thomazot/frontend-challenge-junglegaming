import { http, HttpResponse } from 'msw';
import { catalogHandlers } from './handlers/catalog';

export const handlers = [
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok' });
  }),
  ...catalogHandlers
];
