-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PIC', 'REVIEWER', 'MANAGEMENT');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('Required', 'Recommended', 'N/A');

-- CreateEnum
CREATE TYPE "MetricStatus" AS ENUM ('Active', 'Inactive', 'Moved');

-- CreateEnum
CREATE TYPE "DataType" AS ENUM ('Text', 'Number', 'Integer', 'Decimal', 'Currency', 'List', 'MultiSelect', 'Date', 'Year', 'Boolean', 'Percentage');

-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('Annual', 'Semi-Annual', 'Quarterly');

-- CreateEnum
CREATE TYPE "PeriodStatus" AS ENUM ('Open', 'Closed', 'Locked');

-- CreateEnum
CREATE TYPE "ValueStatus" AS ENUM ('Draft', 'Submitted', 'UnderReview', 'Approved', 'Rejected', 'NeedsRevision');

-- CreateEnum
CREATE TYPE "ReviewAction" AS ENUM ('Submit', 'StartReview', 'Approve', 'Reject', 'RequestRevision');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('Pending', 'Validating', 'Preview', 'Confirmed', 'Failed', 'Completed');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('Preview', 'Generated', 'Failed');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PIC',
    "division_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_attempts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "success" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "divisions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "divisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iso_areas" (
    "id" TEXT NOT NULL,
    "area_number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "description" TEXT,
    "description_en" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "iso_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metrics" (
    "id" TEXT NOT NULL,
    "iso_area_id" TEXT NOT NULL,
    "metric_number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "metric_type" "MetricType" NOT NULL,
    "iso_comparison" TEXT,
    "formula_description" TEXT,
    "status" "MetricStatus" NOT NULL DEFAULT 'Active',
    "moved_to_note" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metric_attributes" (
    "id" TEXT NOT NULL,
    "metric_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "data_type" "DataType" NOT NULL,
    "example_value" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "validation_rules" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metric_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metric_formulas" (
    "id" TEXT NOT NULL,
    "metric_id" TEXT NOT NULL,
    "formula" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "effective_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_to" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metric_formulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metric_validation_rules" (
    "id" TEXT NOT NULL,
    "metric_id" TEXT NOT NULL,
    "rule_type" TEXT NOT NULL,
    "rule_value" JSONB,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metric_validation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attribute_list_options" (
    "id" TEXT NOT NULL,
    "metric_attribute_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "attribute_list_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metric_pics" (
    "id" TEXT NOT NULL,
    "metric_id" TEXT NOT NULL,
    "division_id" TEXT,
    "user_id" TEXT,
    "pic_name" TEXT NOT NULL,
    "pic_year" TEXT NOT NULL,
    "is_coordinator" BOOLEAN NOT NULL DEFAULT false,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metric_pics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reporting_periods" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "period_type" "PeriodType" NOT NULL,
    "label" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "PeriodStatus" NOT NULL DEFAULT 'Open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reporting_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metric_values" (
    "id" TEXT NOT NULL,
    "metric_id" TEXT NOT NULL,
    "reporting_period_id" TEXT NOT NULL,
    "submitted_by_id" TEXT,
    "status" "ValueStatus" NOT NULL DEFAULT 'Draft',
    "attribute_values" JSONB NOT NULL,
    "calculated_result" DECIMAL(65,30),
    "formula_version" TEXT,
    "notes" TEXT,
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metric_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "metric_value_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "action" "ReviewAction" NOT NULL,
    "status_from" TEXT NOT NULL,
    "status_to" TEXT NOT NULL,
    "comment" TEXT,
    "reviewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "action" TEXT NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "metadata" JSONB,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_versions" (
    "id" TEXT NOT NULL,
    "metric_value_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "ValueStatus" NOT NULL,
    "attribute_values" JSONB NOT NULL,
    "calculated_result" DECIMAL(65,30),
    "formula_version" TEXT,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_comments" (
    "id" TEXT NOT NULL,
    "metric_value_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_jobs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "filename" TEXT NOT NULL,
    "file_size" INTEGER,
    "sheet_count" INTEGER,
    "version_number" INTEGER,
    "status" "ImportStatus" NOT NULL DEFAULT 'Pending',
    "total_areas" INTEGER,
    "total_metrics" INTEGER,
    "total_pic_records" INTEGER,
    "validation_results" JSONB,
    "import_summary" JSONB,
    "preview_data" JSONB,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "import_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "generated_by_id" TEXT,
    "reporting_period_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "ReportStatus" NOT NULL DEFAULT 'Generated',
    "report_type" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "file_path" TEXT,
    "file_size" INTEGER,
    "checksum" TEXT,
    "filters" JSONB,
    "report_data" JSONB,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_files" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "checksum" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_configurations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "default_sections" JSONB NOT NULL,
    "include_charts" BOOLEAN NOT NULL DEFAULT true,
    "include_metric_details" BOOLEAN NOT NULL DEFAULT true,
    "include_pic" BOOLEAN NOT NULL DEFAULT true,
    "include_formula" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_quality_scores" (
    "id" TEXT NOT NULL,
    "iso_area_id" TEXT,
    "reporting_period_id" TEXT NOT NULL,
    "overall_score" DECIMAL(65,30) NOT NULL,
    "completeness_score" DECIMAL(65,30) NOT NULL,
    "accuracy_score" DECIMAL(65,30) NOT NULL,
    "consistency_score" DECIMAL(65,30) NOT NULL,
    "timeliness_score" DECIMAL(65,30) NOT NULL,
    "details" JSONB,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_quality_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "login_attempts_email_created_at_idx" ON "login_attempts"("email", "created_at");

-- CreateIndex
CREATE INDEX "login_attempts_ip_address_created_at_idx" ON "login_attempts"("ip_address", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "divisions_code_key" ON "divisions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "iso_areas_area_number_key" ON "iso_areas"("area_number");

-- CreateIndex
CREATE UNIQUE INDEX "metrics_iso_area_id_metric_number_key" ON "metrics"("iso_area_id", "metric_number");

-- CreateIndex
CREATE UNIQUE INDEX "metric_formulas_metric_id_version_key" ON "metric_formulas"("metric_id", "version");

-- CreateIndex
CREATE INDEX "metric_validation_rules_metric_id_idx" ON "metric_validation_rules"("metric_id");

-- CreateIndex
CREATE UNIQUE INDEX "reporting_periods_year_period_type_key" ON "reporting_periods"("year", "period_type");

-- CreateIndex
CREATE INDEX "metric_values_reporting_period_id_status_idx" ON "metric_values"("reporting_period_id", "status");

-- CreateIndex
CREATE INDEX "metric_values_metric_id_status_idx" ON "metric_values"("metric_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "metric_values_metric_id_reporting_period_id_key" ON "metric_values"("metric_id", "reporting_period_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "submission_versions_metric_value_id_created_at_idx" ON "submission_versions"("metric_value_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "submission_versions_metric_value_id_version_key" ON "submission_versions"("metric_value_id", "version");

-- CreateIndex
CREATE INDEX "review_comments_metric_value_id_created_at_idx" ON "review_comments"("metric_value_id", "created_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_created_at_idx" ON "notifications"("user_id", "read_at", "created_at");

-- CreateIndex
CREATE INDEX "reports_reporting_period_id_created_at_idx" ON "reports"("reporting_period_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "report_files_report_id_format_key" ON "report_files"("report_id", "format");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_iso_area_id_fkey" FOREIGN KEY ("iso_area_id") REFERENCES "iso_areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metric_attributes" ADD CONSTRAINT "metric_attributes_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "metrics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metric_formulas" ADD CONSTRAINT "metric_formulas_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "metrics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metric_validation_rules" ADD CONSTRAINT "metric_validation_rules_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "metrics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_list_options" ADD CONSTRAINT "attribute_list_options_metric_attribute_id_fkey" FOREIGN KEY ("metric_attribute_id") REFERENCES "metric_attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metric_pics" ADD CONSTRAINT "metric_pics_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "metrics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metric_pics" ADD CONSTRAINT "metric_pics_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metric_pics" ADD CONSTRAINT "metric_pics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metric_values" ADD CONSTRAINT "metric_values_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "metrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metric_values" ADD CONSTRAINT "metric_values_reporting_period_id_fkey" FOREIGN KEY ("reporting_period_id") REFERENCES "reporting_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metric_values" ADD CONSTRAINT "metric_values_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_metric_value_id_fkey" FOREIGN KEY ("metric_value_id") REFERENCES "metric_values"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_versions" ADD CONSTRAINT "submission_versions_metric_value_id_fkey" FOREIGN KEY ("metric_value_id") REFERENCES "metric_values"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_versions" ADD CONSTRAINT "submission_versions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_comments" ADD CONSTRAINT "review_comments_metric_value_id_fkey" FOREIGN KEY ("metric_value_id") REFERENCES "metric_values"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_comments" ADD CONSTRAINT "review_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_jobs" ADD CONSTRAINT "import_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_generated_by_id_fkey" FOREIGN KEY ("generated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporting_period_id_fkey" FOREIGN KEY ("reporting_period_id") REFERENCES "reporting_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_files" ADD CONSTRAINT "report_files_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_configurations" ADD CONSTRAINT "report_configurations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_quality_scores" ADD CONSTRAINT "data_quality_scores_iso_area_id_fkey" FOREIGN KEY ("iso_area_id") REFERENCES "iso_areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_quality_scores" ADD CONSTRAINT "data_quality_scores_reporting_period_id_fkey" FOREIGN KEY ("reporting_period_id") REFERENCES "reporting_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
