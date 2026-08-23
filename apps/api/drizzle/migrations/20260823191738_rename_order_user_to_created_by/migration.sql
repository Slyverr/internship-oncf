ALTER TABLE "orders" RENAME COLUMN "user_id" TO "created_by_user_id";--> statement-breakpoint
ALTER INDEX "idx_orders_user" RENAME TO "idx_orders_created_by_user";--> statement-breakpoint
ALTER TABLE "orders" RENAME CONSTRAINT "orders_user_id_fkey" TO "orders_created_by_user_id_fkey";