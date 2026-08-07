import { getDb, getMongoClient } from "../lib/db";
import { childLogger } from "../lib/logger";
import { POST_CATEGORIES } from "../lib/posts-taxonomy";
import { CONTENT_SECTIONS } from "../lib/content-items";

const log = childLogger("seed-schema");

const postsValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["slug", "titleEs", "titleEn", "postType", "status", "publishedAt", "createdAt"],
    properties: {
      slug: { bsonType: "string" },
      templateId: { bsonType: ["objectId", "null"] },
      postType: { enum: ["articulo", "nota"] },
      category: { enum: [...POST_CATEGORIES, null] },
      tags: { bsonType: "array", items: { bsonType: "string" } },
      titleEs: { bsonType: "string" },
      titleEn: { bsonType: "string" },
      summaryEs: { bsonType: ["string", "null"] },
      summaryEn: { bsonType: ["string", "null"] },
      blocksEs: { bsonType: ["array", "null"] },
      blocksEn: { bsonType: ["array", "null"] },
      thumbnailUrl: { bsonType: ["string", "null"] },
      pdfUrl: { bsonType: ["string", "null"] },
      externalUrl: { bsonType: ["string", "null"] },
      status: { enum: ["draft", "published"] },
      publishedAt: { bsonType: ["date", "null"] },
      createdAt: { bsonType: "date" },
      source: { bsonType: ["string", "null"] },
    },
  },
};

async function run() {
  const db = await getDb();
  const existing = await db.listCollections().toArray();
  const existingNames = new Set(existing.map((c) => c.name));

  async function createIfMissing(name: string, validator?: Record<string, unknown>) {
    if (existingNames.has(name)) {
      log.info({ collection: name }, "Colección ya existe, se omite creación");
      return;
    }
    await db.createCollection(name, validator ? { validator } : undefined);
    log.info({ collection: name }, "Colección creada");
  }

  await createIfMissing("site_texts", {
    $jsonSchema: {
      bsonType: "object",
      required: ["key", "es", "en", "updatedAt"],
      properties: {
        key: { bsonType: "string" },
        es: { bsonType: "string" },
        en: { bsonType: "string" },
        updatedAt: { bsonType: "date" },
        updatedBy: { bsonType: ["string", "null"] },
      },
    },
  });
  await db.collection("site_texts").createIndex({ key: 1 }, { unique: true });

  await createIfMissing("posts", postsValidator);
  if (existingNames.has("posts")) {
    await db.command({ collMod: "posts", validator: postsValidator });
    log.info("Validator de 'posts' actualizado al esquema de plantillas/bloques");
  }
  await db.collection("posts").createIndex({ slug: 1 }, { unique: true });
  await db.collection("posts").createIndex({ status: 1, publishedAt: -1 });
  await db.collection("posts").createIndex({ postType: 1 });
  await db.collection("posts").createIndex({ category: 1 });
  await db.collection("posts").createIndex({ tags: 1 });
  await db.collection("posts").createIndex({ titleEs: "text", titleEn: "text" });

  await createIfMissing("templates", {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "blocks", "createdAt"],
      properties: {
        name: { bsonType: "string" },
        blocks: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["id", "type"],
            properties: {
              id: { bsonType: "string" },
              type: { enum: ["hero", "richtext", "twoColumn", "chart"] },
            },
          },
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: ["date", "null"] },
        createdBy: { bsonType: ["string", "null"] },
      },
    },
  });
  await db.collection("templates").createIndex({ name: 1 });

  await createIfMissing("admin_users", {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "role", "createdAt"],
      properties: {
        email: { bsonType: "string" },
        role: { enum: ["admin"] },
        createdAt: { bsonType: "date" },
      },
    },
  });
  await db.collection("admin_users").createIndex({ email: 1 }, { unique: true });

  await createIfMissing("auth_codes");
  await db.collection("auth_codes").createIndex({ email: 1, createdAt: -1 });
  await db.collection("auth_codes").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  await createIfMissing("contact_submissions");
  await db.collection("contact_submissions").createIndex({ createdAt: -1 });

  await createIfMissing("circuit_breaker_state");

  await createIfMissing("ai_config", {
    $jsonSchema: {
      bsonType: "object",
      required: ["encryptedApiKey", "iv", "authTag", "updatedAt"],
      properties: {
        encryptedApiKey: { bsonType: "string" },
        iv: { bsonType: "string" },
        authTag: { bsonType: "string" },
        model: { bsonType: ["string", "null"] },
        updatedAt: { bsonType: "date" },
        updatedBy: { bsonType: ["string", "null"] },
      },
    },
  });

  await createIfMissing("uploaded_files", {
    $jsonSchema: {
      bsonType: "object",
      required: ["url", "kind", "sizeBytes", "createdAt"],
      properties: {
        url: { bsonType: "string" },
        kind: { enum: ["image", "document"] },
        originalName: { bsonType: ["string", "null"] },
        sizeBytes: { bsonType: "number" },
        createdAt: { bsonType: "date" },
        createdBy: { bsonType: ["string", "null"] },
      },
    },
  });
  await db.collection("uploaded_files").createIndex({ createdAt: -1 });
  await db.collection("uploaded_files").createIndex({ url: 1 }, { unique: true });

  const contentItemsValidator = {
    $jsonSchema: {
      bsonType: "object",
      required: ["section", "order", "titleEs", "titleEn", "createdAt", "updatedAt"],
      properties: {
        section: { enum: [...CONTENT_SECTIONS] },
        order: { bsonType: "number" },
        titleEs: { bsonType: "string" },
        titleEn: { bsonType: "string" },
        summaryEs: { bsonType: "string" },
        summaryEn: { bsonType: "string" },
        detailEs: { bsonType: "string" },
        detailEn: { bsonType: "string" },
        imageUrl: { bsonType: ["string", "null"] },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
      },
    },
  };
  await createIfMissing("content_items", contentItemsValidator);
  if (existingNames.has("content_items")) {
    await db.command({ collMod: "content_items", validator: contentItemsValidator });
  }
  await db.collection("content_items").createIndex({ section: 1, order: 1 });

  log.info("Seed de esquema completada");
}

run()
  .then(async () => {
    const client = await getMongoClient();
    await client.close();
    process.exit(0);
  })
  .catch((error) => {
    log.error({ error }, "Fallo en seed de esquema");
    process.exit(1);
  });
