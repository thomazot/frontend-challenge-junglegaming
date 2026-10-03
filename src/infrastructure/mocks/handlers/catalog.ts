import { http, HttpResponse } from 'msw';
import nfts from '../data/nfts.json';

export const catalogHandlers = [
  http.get('/api/nfts', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const limit = Number(url.searchParams.get('limit') || '9');
    
    // Filtering logic (price, network, collections)
    const collections = url.searchParams.getAll('collection');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const networks = url.searchParams.getAll('network');
    
    let filtered = nfts;
    if (collections.length > 0) {
      filtered = filtered.filter(nft => collections.includes(nft.collection));
    }
    if (networks.length > 0) {
      filtered = filtered.filter(nft => networks.includes(nft.network));
    }
    if (minPrice) {
      filtered = filtered.filter(nft => nft.price >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(nft => nft.price <= Number(maxPrice));
    }
    
    // Pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const items = filtered.slice(start, end);
    
    return HttpResponse.json({
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages
      }
    });
  }),
];
