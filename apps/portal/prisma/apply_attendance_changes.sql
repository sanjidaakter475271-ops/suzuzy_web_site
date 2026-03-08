-- AlterTable
ALTER TABLE "public"."technician_attendance" ADD COLUMN IF NOT EXISTS "clock_in_qr_code" VARCHAR(200);
ALTER TABLE "public"."technician_attendance" ADD COLUMN IF NOT EXISTS "clock_out_gps_lat" DECIMAL(10,8);
ALTER TABLE "public"."technician_attendance" ADD COLUMN IF NOT EXISTS "clock_out_gps_lng" DECIMAL(11,8);
ALTER TABLE "public"."technician_attendance" ADD COLUMN IF NOT EXISTS "clock_out_qr_code" VARCHAR(200);

-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."attendance_shifts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "attendance_id" UUID NOT NULL,
    "start_time" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."workshop_qr_codes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dealer_id" UUID NOT NULL,
    "qr_secret" VARCHAR(100) NOT NULL,
    "label" VARCHAR(100) DEFAULT 'Main Workshop',
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workshop_qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "attendance_shifts_attendance_id_idx" ON "public"."attendance_shifts"("attendance_id");
CREATE INDEX IF NOT EXISTS "attendance_shifts_start_time_idx" ON "public"."attendance_shifts"("start_time");
CREATE INDEX IF NOT EXISTS "workshop_qr_codes_dealer_id_idx" ON "public"."workshop_qr_codes"("dealer_id");

-- CreateUniqueIndex
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'workshop_qr_codes_dealer_id_qr_secret_key') THEN
        CREATE UNIQUE INDEX "workshop_qr_codes_dealer_id_qr_secret_key" ON "public"."workshop_qr_codes"("dealer_id", "qr_secret");
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendance_shifts_attendance_id_fkey') THEN
        ALTER TABLE "public"."attendance_shifts" ADD CONSTRAINT "attendance_shifts_attendance_id_fkey" FOREIGN KEY ("attendance_id") REFERENCES "public"."technician_attendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workshop_qr_codes_dealer_id_fkey') THEN
        ALTER TABLE "public"."workshop_qr_codes" ADD CONSTRAINT "workshop_qr_codes_dealer_id_fkey" FOREIGN KEY ("dealer_id") REFERENCES "public"."dealers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
