-- AlterTable
ALTER TABLE "artists" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "shops" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(3);

-- CreateIndex
CREATE INDEX "artist_shops_shop_id_idx" ON "artist_shops"("shop_id");

-- CreateIndex
CREATE INDEX "artist_styles_style_id_idx" ON "artist_styles"("style_id");

-- Hand-written: invariants Prisma's schema language cannot express.

-- An artist has at most one primary shop.
CREATE UNIQUE INDEX "artist_shops_one_primary_idx"
    ON "artist_shops" ("artist_id") WHERE "is_primary";

-- Catch sign/typo errors before they place a shop on the wrong continent.
ALTER TABLE "shops" ADD CONSTRAINT "shops_lat_range_check"
    CHECK ("lat" BETWEEN -90 AND 90);
ALTER TABLE "shops" ADD CONSTRAINT "shops_lng_range_check"
    CHECK ("lng" BETWEEN -180 AND 180);
