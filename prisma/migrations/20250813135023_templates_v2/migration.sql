/*
  Warnings:

  - You are about to drop the `MediaAsset` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[key]` on the table `Template` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."FieldType" ADD VALUE 'BOOLEAN';
ALTER TYPE "public"."FieldType" ADD VALUE 'SELECT';
ALTER TYPE "public"."FieldType" ADD VALUE 'COLOR';

-- AlterTable
ALTER TABLE "public"."Template" ADD COLUMN     "description" TEXT,
ADD COLUMN     "key" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."TemplateField" ADD COLUMN     "config" JSONB,
ADD COLUMN     "isArray" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "public"."MediaAsset";

-- CreateIndex
CREATE UNIQUE INDEX "Template_key_key" ON "public"."Template"("key");
