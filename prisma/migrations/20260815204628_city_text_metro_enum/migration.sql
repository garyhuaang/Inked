-- Hand-written data-preserving version of Prisma's drop-and-recreate draft:
-- existing rows convert in place (dallas -> Dallas/dfw, austin -> Austin/austin).

CREATE TYPE "Metro" AS ENUM ('dfw', 'austin');

ALTER TABLE "shops" ADD COLUMN "metro" "Metro";
UPDATE "shops" SET "metro" = CASE "city"::text
    WHEN 'dallas' THEN 'dfw'::"Metro"
    ELSE 'austin'::"Metro"
END;
ALTER TABLE "shops" ALTER COLUMN "metro" SET NOT NULL;

ALTER TABLE "shops" ALTER COLUMN "city" TYPE TEXT USING (
    CASE "city"::text WHEN 'dallas' THEN 'Dallas' WHEN 'austin' THEN 'Austin' END
);

DROP TYPE "City";
