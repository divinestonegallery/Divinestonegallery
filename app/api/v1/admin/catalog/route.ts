import { authorizeStaff } from "@/auth/authorization";
import {
  CatalogEntityKind,
  CatalogEntityPatch,
  createAdminCatalogEntity,
  listAdminCatalogStructure,
  updateAdminCatalogEntity,
} from "@/catalog/taxonomy-repository";
import {
  enumValue,
  optionalInteger,
  optionalString,
  readJsonObject,
  requiredString,
} from "@/catalog/input";

export const dynamic = "force-dynamic";

async function authorize(request: Request) {
  const result = await authorizeStaff(request);
  if (result.authorized) return result;
  return Response.json(
    { error: { code: "STAFF_REQUIRED", message: "Staff access is required." } },
    { status: result.status },
  );
}

function entityKind(value: unknown): CatalogEntityKind | null {
  return enumValue(value, ["category", "deity", "collection"] as const);
}

export async function GET(request: Request) {
  const authorization = await authorize(request);
  if (authorization instanceof Response) return authorization;
  try {
    return Response.json({ data: await listAdminCatalogStructure() });
  } catch {
    return Response.json(
      { error: { code: "CATALOG_STRUCTURE_UNAVAILABLE", message: "Catalogue organization could not be loaded." } },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const authorization = await authorize(request);
  if (authorization instanceof Response) return authorization;
  const body = await readJsonObject(request);
  if (!body) return Response.json({ error: { code: "INVALID_JSON", message: "Valid catalogue details are required." } }, { status: 400 });

  const kind = entityKind(body.kind);
  const name = requiredString(body.name, 180);
  const description = optionalString(body.description, 1000);
  const sortOrder = optionalInteger(body.sortOrder, 0) ?? 0;
  const isActive = typeof body.isActive === "boolean" ? body.isActive : true;
  const isFeatured = typeof body.isFeatured === "boolean" ? body.isFeatured : false;
  if (!kind || !name || description === undefined || sortOrder === undefined) {
    return Response.json({ error: { code: "INVALID_CATALOG_ENTITY", message: "A name and valid catalogue details are required." } }, { status: 400 });
  }

  try {
    const data = await createAdminCatalogEntity(kind, { name, description, sortOrder, isActive, isFeatured }, authorization.userId);
    return Response.json({ data }, { status: 201 });
  } catch {
    return Response.json({ error: { code: "CATALOG_ENTITY_CONFLICT", message: "That catalogue item could not be created." } }, { status: 409 });
  }
}

export async function PATCH(request: Request) {
  const authorization = await authorize(request);
  if (authorization instanceof Response) return authorization;
  const body = await readJsonObject(request);
  if (!body) return Response.json({ error: { code: "INVALID_JSON", message: "A valid catalogue update is required." } }, { status: 400 });

  const kind = entityKind(body.kind);
  const id = requiredString(body.id, 120);
  if (!kind || !id) return Response.json({ error: { code: "INVALID_TARGET", message: "A valid catalogue item is required." } }, { status: 400 });

  const patch: CatalogEntityPatch = {};
  if ("name" in body) { const value = requiredString(body.name, 180); if (!value) return Response.json({ error: { code: "INVALID_NAME", message: "Name is invalid." } }, { status: 400 }); patch.name = value; }
  if ("description" in body) { const value = optionalString(body.description, 1000); if (value === undefined) return Response.json({ error: { code: "INVALID_DESCRIPTION", message: "Description is too long." } }, { status: 400 }); patch.description = value; }
  if ("sortOrder" in body) { const value = optionalInteger(body.sortOrder, 0); if (value === undefined || value === null) return Response.json({ error: { code: "INVALID_SORT_ORDER", message: "Display order must be zero or greater." } }, { status: 400 }); patch.sortOrder = value; }
  if ("isActive" in body) { if (typeof body.isActive !== "boolean") return Response.json({ error: { code: "INVALID_STATUS", message: "Active status must be true or false." } }, { status: 400 }); patch.isActive = body.isActive; }
  if ("isFeatured" in body) { if (kind !== "collection" || typeof body.isFeatured !== "boolean") return Response.json({ error: { code: "INVALID_FEATURED", message: "Featured status is only available for collections." } }, { status: 400 }); patch.isFeatured = body.isFeatured; }
  if (!Object.keys(patch).length) return Response.json({ error: { code: "EMPTY_UPDATE", message: "No valid changes were supplied." } }, { status: 400 });

  try {
    return Response.json({ data: await updateAdminCatalogEntity(kind, id, patch, authorization.userId) });
  } catch {
    return Response.json({ error: { code: "CATALOG_UPDATE_FAILED", message: "The catalogue item could not be updated." } }, { status: 409 });
  }
}
