export const fakeApi = async ({ parentId = null, cursor = 0, limit = 10 }) => {
    await new Promise((r) => setTimeout(r, 500));
  
    const start = cursor;
    const end = cursor + limit;
  
    const data = Array.from({ length: limit }).map((_, i) => {
      const id = `${parentId ?? 'root'}-${start + i}`;
  
      return {
        id,
        name: `Node ${id}`,
        hasChildren: Math.random() > 0.5,
      };
    });
  
    return {
      data,
      nextCursor: end,
      hasMore: end < 100, // giả lập max 100 item
    };
  };