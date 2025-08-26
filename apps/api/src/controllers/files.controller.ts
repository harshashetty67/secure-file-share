import { listUserObjects } from "../services/storage.service";

export async function listFilesController(req, res) {
  const userId = req.user!.id;
  const limit = Math.min(Number(req.query.limit ?? 5), 20);
  const offset = Math.max(Number(req.query.offset ?? 0), 0);

  const { items, hasMore } = await listUserObjects(userId, { limit, offset });
  const shaped = items.filter(i => i.name) // skip directories/placeholders
                .map(i => ({
                            objectKey: `u/${userId}/${i.name}`,
                            fileName: i.name.split('-').slice(1).join('-') || i.name,
                            size: i.metadata?.size ?? null,
                            lastModified: i.updated_at ?? null,
                }));

  res.json({ items: shaped, nextOffset: hasMore ? offset + limit : null });
}
