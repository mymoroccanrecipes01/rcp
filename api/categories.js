// functions/api/categories.js
// Cette function sera automatiquement déployée avec votre site Pages

export async function onRequestGet(context) {
  // GET /api/categories
  return new Response(JSON.stringify({
    success: true,
    data: [
      {
        id: 1,
        name: 'Électronique',
        description: 'Produits électroniques',
        image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop&auto=format&fm=webp'
      }
    ],
    pagination: { page: 1, limit: 20, total: 1, pages: 1 }
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export async function onRequestPost(context) {
  // POST /api/categories
  const data = await context.request.json();
  
  return new Response(JSON.stringify({
    success: true,
    data: {
      id: Date.now(),
      name: data.name,
      description: data.description,
      image_url: data.image_url,
      created_at: new Date().toISOString()
    },
    message: 'Catégorie créée'
  }), {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export async function onRequestOptions(context) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}