import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getContainer } from "@/lib/container";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  q: z.string().trim().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  // paging cursor, e.g. ?afterSort=3&afterId=<uuid>
  afterSort: z.coerce.number().int().optional(),
  afterId: z.string().uuid().optional(),
});

// public project list and search
export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }
  const { q, limit, afterSort, afterId } = parsed.data;
  const { projectService } = getContainer();

  const items = q
    ? await projectService.search(q, limit)
    : await projectService.listPublished(
        limit,
        afterSort !== undefined && afterId ? { sortOrder: afterSort, id: afterId } : undefined,
      );

  const last = items.at(-1);
  return NextResponse.json({
    items,
    nextCursor: !q && last ? { afterSort: last.sortOrder, afterId: last.id } : null,
  });
}
