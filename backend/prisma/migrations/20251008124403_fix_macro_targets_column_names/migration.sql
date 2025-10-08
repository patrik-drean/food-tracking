-- Rename columns from snake_case to camelCase to match database pattern
ALTER TABLE "macro_targets" RENAME COLUMN "user_id" TO "userId";
ALTER TABLE "macro_targets" RENAME COLUMN "created_at" TO "createdAt";
ALTER TABLE "macro_targets" RENAME COLUMN "updated_at" TO "updatedAt";

-- Drop old indexes
DROP INDEX IF EXISTS "macro_targets_user_id_key";
DROP INDEX IF EXISTS "macro_targets_user_id_idx";

-- Recreate indexes with new column name
CREATE UNIQUE INDEX "macro_targets_userId_key" ON "macro_targets"("userId");
CREATE INDEX "macro_targets_userId_idx" ON "macro_targets"("userId");

-- Drop and recreate foreign key with new column name
ALTER TABLE "macro_targets" DROP CONSTRAINT IF EXISTS "macro_targets_user_id_fkey";
ALTER TABLE "macro_targets" ADD CONSTRAINT "macro_targets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
