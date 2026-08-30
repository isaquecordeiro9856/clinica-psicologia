-- CreateEnum
CREATE TYPE "Role" AS ENUM ('patient', 'psychologist', 'secretary', 'admin');

-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('active', 'inactive', 'discharged');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('pending_payment', 'confirmed', 'cancelled', 'no_show', 'completed');

-- CreateEnum
CREATE TYPE "Modality" AS ENUM ('presential', 'online');

-- CreateEnum
CREATE TYPE "BillingMethod" AS ENUM ('pix', 'card', 'boleto', 'cash', 'transfer');

-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('pending', 'paid', 'overdue', 'cancelled', 'refunded');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('email', 'whatsapp', 'sms', 'push');

-- CreateEnum
CREATE TYPE "NotificationTemplate" AS ENUM ('confirmation', 'reminder24h', 'payment', 'receipt', 'waitlist_available');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('queued', 'sent', 'delivered', 'failed');

-- CreateEnum
CREATE TYPE "ClinicalRecordType" AS ENUM ('evolution', 'anamnesis', 'assessment');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('consent', 'receipt', 'certificate', 'attachment');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('lgpd', 'treatment', 'teleconsult', 'image');

-- CreateEnum
CREATE TYPE "WaitlistStatus" AS ENUM ('waiting', 'notified', 'converted', 'expired');

-- CreateEnum
CREATE TYPE "WebhookSource" AS ENUM ('efi', 'mercado_pago', 'stripe');

-- CreateEnum
CREATE TYPE "WebhookStatus" AS ENUM ('received', 'processed', 'failed');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psychologists" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "crp" TEXT NOT NULL,
    "phone" TEXT,
    "pix_key" TEXT,
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "psychologists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secretaries" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "psychologist_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "secretaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "psychologist_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT,
    "cpf_hash" TEXT,
    "birth_date" DATE,
    "phone" TEXT,
    "phone_hash" TEXT,
    "email" TEXT,
    "status" "PatientStatus" NOT NULL DEFAULT 'active',
    "anamnesis" JSONB,
    "lgpd_consent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_psychologists" (
    "patient_id" UUID NOT NULL,
    "psychologist_id" UUID NOT NULL,
    "relation" TEXT NOT NULL DEFAULT 'primary',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_psychologists_pkey" PRIMARY KEY ("patient_id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" UUID NOT NULL,
    "psychologist_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability_rules" (
    "id" UUID NOT NULL,
    "psychologist_id" UUID NOT NULL,
    "weekday" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "slot_duration" INTEGER NOT NULL,

    CONSTRAINT "availability_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_blocks" (
    "id" UUID NOT NULL,
    "psychologist_id" UUID NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "time_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "psychologist_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'pending_payment',
    "modality" "Modality" NOT NULL DEFAULT 'presential',
    "room" TEXT,
    "cancel_reason" TEXT,
    "cancel_fee" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "psychologist_id" UUID NOT NULL,
    "desired_date" DATE NOT NULL,
    "time_preference" TEXT,
    "status" "WaitlistStatus" NOT NULL DEFAULT 'waiting',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_records" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "psychologist_id" UUID NOT NULL,
    "appointment_id" UUID,
    "type" "ClinicalRecordType" NOT NULL DEFAULT 'evolution',
    "content_encrypted" TEXT NOT NULL,
    "content_hash" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "s3_key" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "is_clinical" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consents" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "type" "ConsentType" NOT NULL,
    "version" TEXT NOT NULL,
    "text_snapshot" TEXT NOT NULL,
    "signature_s3_key" TEXT,
    "signed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,

    CONSTRAINT "consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_templates" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "schema" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_responses" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "answers_encrypted" TEXT NOT NULL,
    "score" INTEGER,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billings" (
    "id" UUID NOT NULL,
    "appointment_id" UUID,
    "patient_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "method" "BillingMethod" NOT NULL,
    "status" "BillingStatus" NOT NULL DEFAULT 'pending',
    "psp_tx_id" TEXT,
    "pix_qr_code" TEXT,
    "pix_copy_paste" TEXT,
    "due_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "appointment_id" UUID,
    "patient_id" UUID NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "template" "NotificationTemplate" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'queued',
    "provider_message_id" TEXT,
    "payload" JSONB,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_user_id" UUID,
    "actor_role" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID,
    "ip" TEXT,
    "user_agent" TEXT,
    "before_after_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "event_id" TEXT NOT NULL,
    "source" "WebhookSource" NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "WebhookStatus" NOT NULL DEFAULT 'received',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("event_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "psychologists_user_id_key" ON "psychologists"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "psychologists_crp_key" ON "psychologists"("crp");

-- CreateIndex
CREATE UNIQUE INDEX "secretaries_user_id_key" ON "secretaries"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "patients_user_id_key" ON "patients"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "patients_cpf_hash_key" ON "patients"("cpf_hash");

-- CreateIndex
CREATE INDEX "patients_psychologist_id_status_idx" ON "patients"("psychologist_id", "status");

-- CreateIndex
CREATE INDEX "patients_created_at_idx" ON "patients"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "patient_psychologists_patient_id_psychologist_id_key" ON "patient_psychologists"("patient_id", "psychologist_id");

-- CreateIndex
CREATE UNIQUE INDEX "availability_rules_psychologist_id_weekday_start_time_key" ON "availability_rules"("psychologist_id", "weekday", "start_time");

-- CreateIndex
CREATE INDEX "time_blocks_psychologist_id_start_at_idx" ON "time_blocks"("psychologist_id", "start_at");

-- CreateIndex
CREATE INDEX "appointments_psychologist_id_start_at_idx" ON "appointments"("psychologist_id", "start_at");

-- CreateIndex
CREATE INDEX "appointments_patient_id_start_at_idx" ON "appointments"("patient_id", "start_at");

-- CreateIndex
CREATE INDEX "appointments_status_idx" ON "appointments"("status");

-- CreateIndex
CREATE INDEX "waitlist_psychologist_id_desired_date_status_idx" ON "waitlist"("psychologist_id", "desired_date", "status");

-- CreateIndex
CREATE UNIQUE INDEX "clinical_records_appointment_id_key" ON "clinical_records"("appointment_id");

-- CreateIndex
CREATE INDEX "clinical_records_patient_id_created_at_idx" ON "clinical_records"("patient_id", "created_at");

-- CreateIndex
CREATE INDEX "documents_patient_id_category_idx" ON "documents"("patient_id", "category");

-- CreateIndex
CREATE INDEX "consents_patient_id_type_idx" ON "consents"("patient_id", "type");

-- CreateIndex
CREATE INDEX "form_responses_patient_id_template_id_idx" ON "form_responses"("patient_id", "template_id");

-- CreateIndex
CREATE UNIQUE INDEX "billings_appointment_id_key" ON "billings"("appointment_id");

-- CreateIndex
CREATE INDEX "billings_status_due_at_idx" ON "billings"("status", "due_at");

-- CreateIndex
CREATE INDEX "billings_patient_id_idx" ON "billings"("patient_id");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_created_at_idx" ON "audit_logs"("entity_type", "entity_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_id_created_at_idx" ON "audit_logs"("actor_user_id", "created_at");

-- AddForeignKey
ALTER TABLE "psychologists" ADD CONSTRAINT "psychologists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secretaries" ADD CONSTRAINT "secretaries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secretaries" ADD CONSTRAINT "secretaries_psychologist_id_fkey" FOREIGN KEY ("psychologist_id") REFERENCES "psychologists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_psychologist_id_fkey" FOREIGN KEY ("psychologist_id") REFERENCES "psychologists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_psychologists" ADD CONSTRAINT "patient_psychologists_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_psychologists" ADD CONSTRAINT "patient_psychologists_psychologist_id_fkey" FOREIGN KEY ("psychologist_id") REFERENCES "psychologists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_psychologist_id_fkey" FOREIGN KEY ("psychologist_id") REFERENCES "psychologists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_rules" ADD CONSTRAINT "availability_rules_psychologist_id_fkey" FOREIGN KEY ("psychologist_id") REFERENCES "psychologists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_blocks" ADD CONSTRAINT "time_blocks_psychologist_id_fkey" FOREIGN KEY ("psychologist_id") REFERENCES "psychologists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_psychologist_id_fkey" FOREIGN KEY ("psychologist_id") REFERENCES "psychologists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlist" ADD CONSTRAINT "waitlist_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_records" ADD CONSTRAINT "clinical_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_records" ADD CONSTRAINT "clinical_records_psychologist_id_fkey" FOREIGN KEY ("psychologist_id") REFERENCES "psychologists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_records" ADD CONSTRAINT "clinical_records_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consents" ADD CONSTRAINT "consents_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_responses" ADD CONSTRAINT "form_responses_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_responses" ADD CONSTRAINT "form_responses_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "form_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billings" ADD CONSTRAINT "billings_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billings" ADD CONSTRAINT "billings_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
