CREATE TABLE "accessory_operations" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(200) NOT NULL CONSTRAINT "accessory_operations_name_key" UNIQUE,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agencies" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(200) NOT NULL,
	"city" varchar(100),
	"address" varchar(500),
	"phone" varchar(20),
	"email" varchar(100),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "archival_execution_log" (
	"id" bigserial PRIMARY KEY,
	"table_name" varchar(100) NOT NULL,
	"records_archived" integer DEFAULT 0 NOT NULL,
	"cutoff_date" timestamp NOT NULL,
	"execution_status" varchar(20) NOT NULL,
	"error_message" text,
	"started_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"completed_at" timestamp,
	"triggered_by" varchar(50) NOT NULL,
	"triggered_by_user_id" bigint,
	CONSTRAINT "archival_execution_log_execution_status_check" CHECK ((execution_status)::text = ANY ((ARRAY['SUCCESS'::character varying, 'FAILED'::character varying, 'IN_PROGRESS'::character varying])::text[])),
	CONSTRAINT "archival_execution_log_triggered_by_check" CHECK ((triggered_by)::text = ANY ((ARRAY['SCHEDULED'::character varying, 'MANUAL'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "attributes" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(100) NOT NULL CONSTRAINT "attributes_name_key" UNIQUE,
	"data_type" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "attributes_data_type_check" CHECK ((data_type)::text = ANY ((ARRAY['string'::character varying, 'number'::character varying, 'date'::character varying, 'boolean'::character varying, 'decimal'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "berths" (
	"id" bigserial PRIMARY KEY,
	"port_id" bigint NOT NULL,
	"name" varchar(200) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "centers" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(200) NOT NULL,
	"agency_id" bigint,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claim_comments" (
	"id" bigserial PRIMARY KEY,
	"claim_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claim_files" (
	"id" bigserial PRIMARY KEY,
	"claim_id" bigint NOT NULL,
	"file_path" varchar(500) NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_type" varchar(100),
	"uploaded_by" bigint NOT NULL,
	"uploaded_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claim_status" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(100) NOT NULL CONSTRAINT "claim_status_name_key" UNIQUE,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claim_status_history" (
	"id" bigserial PRIMARY KEY,
	"claim_id" bigint NOT NULL,
	"status_id" bigint NOT NULL,
	"changed_by" bigint NOT NULL,
	"changed_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"comment" text
);
--> statement-breakpoint
CREATE TABLE "claim_types" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(100) NOT NULL CONSTRAINT "claim_types_name_key" UNIQUE,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"id" bigserial PRIMARY KEY,
	"customer_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"order_id" bigint,
	"operation_id" bigint,
	"type_id" bigint NOT NULL,
	"status_id" bigint NOT NULL,
	"priority" varchar(20),
	"description" text NOT NULL,
	"resolution" varchar(1000),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"closed_by" bigint,
	"closed_at" timestamp,
	CONSTRAINT "claims_priority_check" CHECK ((priority)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'urgent'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "customer_parametrization" (
	"id" bigserial PRIMARY KEY,
	"customer_code" varchar(50) NOT NULL,
	"type" varchar(50) NOT NULL,
	"port_name" varchar(50),
	"terminal_name" varchar(100),
	"supervisor" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "customer_parametrization_customer_code_type_port_name_termi_key" UNIQUE("customer_code","type","port_name","terminal_name")
);
--> statement-breakpoint
CREATE TABLE "customer_types" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(100) NOT NULL CONSTRAINT "customer_types_name_key" UNIQUE,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" bigserial PRIMARY KEY,
	"company_name" varchar(300) NOT NULL,
	"address" varchar(500),
	"city" varchar(100),
	"phone" varchar(20),
	"email" varchar(100),
	"type_id" bigint,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"customer_code" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "dispatch_types" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(50) NOT NULL CONSTRAINT "dispatch_types_name_key" UNIQUE,
	"description" varchar(200),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dtm_integration_log" (
	"id" bigserial PRIMARY KEY,
	"request_type_id" bigint NOT NULL,
	"request_payload" text,
	"response_payload" text,
	"status" varchar(20) NOT NULL,
	"http_status_code" integer,
	"error_message" text,
	"duration_ms" integer,
	"related_entity_type" varchar(50),
	"related_entity_id" bigint,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"created_by" bigint,
	"retry_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "dtm_integration_log_status_check" CHECK ((status)::text = ANY ((ARRAY['SUCCESS'::character varying, 'FAILED'::character varying, 'TIMEOUT'::character varying, 'PENDING'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "dtm_request_types" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(100) NOT NULL CONSTRAINT "dtm_request_types_name_key" UNIQUE,
	"description" varchar(500),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forecast_program_history" (
	"id" bigserial PRIMARY KEY,
	"program_id" bigint,
	"old_quantity" numeric(18,3),
	"new_quantity" numeric(18,3),
	"changed_by" bigint NOT NULL,
	"changed_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"reason" text,
	"event_type" varchar(50) NOT NULL,
	"old_status_id" bigint,
	"new_status_id" bigint,
	"old_planned_date" timestamp,
	"new_planned_date" timestamp,
	"quantity_realized" numeric(18,3),
	"completion_rate" numeric(5,2),
	"deviation_reason" text,
	"changed_by_name" varchar(200),
	CONSTRAINT "forecast_program_history_event_type_check" CHECK ((event_type)::text = ANY ((ARRAY['CREATED'::character varying, 'QUANTITY_MODIFIED'::character varying, 'DATE_MODIFIED'::character varying, 'STATUS_CHANGED'::character varying, 'EXECUTION_RECORDED'::character varying, 'DELETED'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "forecast_programs" (
	"id" bigserial PRIMARY KEY,
	"order_id" bigint NOT NULL,
	"status_id" bigint NOT NULL,
	"planned_date" timestamp NOT NULL,
	"quantity_planned" numeric(18,3) NOT NULL,
	"created_by" bigint NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"sent_to_dtm_at" timestamp,
	"quantity_realized" numeric(18,3),
	"deviation_reason" text,
	"realized_at" timestamp,
	"realized_by" bigint,
	"program_number" varchar(30) NOT NULL CONSTRAINT "forecast_programs_program_number_key" UNIQUE,
	"dtm_status" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "goods" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(200) NOT NULL,
	"goods_type_id" bigint NOT NULL,
	"goods_code" varchar(50) NOT NULL CONSTRAINT "goods_goods_code_key" UNIQUE,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goods_types" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(100) NOT NULL CONSTRAINT "goods_types_name_key" UNIQUE,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "importers" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(200) NOT NULL CONSTRAINT "importers_name_key" UNIQUE,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loading_locations" (
	"id" bigserial PRIMARY KEY,
	"port_id" bigint NOT NULL,
	"name" varchar(200) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movement_types" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(50) NOT NULL CONSTRAINT "movement_types_name_key" UNIQUE,
	"description" varchar(200),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_channels" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(50) NOT NULL CONSTRAINT "notification_channels_name_key" UNIQUE,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_types" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(100) NOT NULL CONSTRAINT "notification_types_name_key" UNIQUE,
	"description" varchar(500),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" bigserial PRIMARY KEY,
	"user_id" bigint NOT NULL,
	"type_id" bigint NOT NULL,
	"channel_id" bigint NOT NULL,
	"title" varchar(200) NOT NULL,
	"message" text NOT NULL,
	"related_entity_type" varchar(50),
	"related_entity_id" bigint,
	"status" varchar(20) NOT NULL,
	"sent_at" timestamp,
	"read_at" timestamp,
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "notifications_status_check" CHECK ((status)::text = ANY ((ARRAY['PENDING'::character varying, 'SENT'::character varying, 'FAILED'::character varying, 'READ'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "order_accessory_operations" (
	"id" bigserial PRIMARY KEY,
	"order_id" bigint NOT NULL,
	"operation_id" bigint NOT NULL,
	"status" varchar(50),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_attributes" (
	"id" bigserial PRIMARY KEY,
	"order_id" bigint NOT NULL,
	"attribute_id" bigint NOT NULL,
	"value" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "order_attributes_order_id_attribute_id_key" UNIQUE("order_id","attribute_id")
);
--> statement-breakpoint
CREATE TABLE "order_date_modifications" (
	"id" bigserial PRIMARY KEY,
	"order_id" bigint NOT NULL,
	"modified_by_id" bigint NOT NULL,
	"modified_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"old_start_date" timestamp,
	"new_start_date" timestamp,
	"comment" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "order_executions" (
	"id" bigserial PRIMARY KEY,
	"order_id" bigint NOT NULL,
	"execution_date" timestamp NOT NULL,
	"quantity_executed" numeric(18,3) NOT NULL,
	"completion_rate" numeric(5,2),
	"comment" text,
	"executed_by" bigint NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_files" (
	"file_id" bigserial PRIMARY KEY,
	"order_id" bigint NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_type" varchar(50) NOT NULL,
	"file_size" bigint NOT NULL,
	"file_path" varchar(500) NOT NULL,
	"mime_type" varchar(100),
	"uploaded_by" bigint NOT NULL,
	"uploaded_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"description" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "order_shares" (
	"id" bigserial PRIMARY KEY,
	"order_id" bigint NOT NULL,
	"agency_id" bigint NOT NULL,
	"shared_by_user_id" bigint NOT NULL,
	"shared_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"note" varchar(500),
	CONSTRAINT "order_shares_order_id_agency_id_key" UNIQUE("order_id","agency_id")
);
--> statement-breakpoint
CREATE TABLE "order_status" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(100) NOT NULL CONSTRAINT "order_status_name_key" UNIQUE,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_status_history" (
	"id" bigserial PRIMARY KEY,
	"order_id" bigint NOT NULL,
	"status_id" bigint NOT NULL,
	"changed_by_id" bigint NOT NULL,
	"changed_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"comment" text,
	"rejection_reason_id" bigint
);
--> statement-breakpoint
CREATE TABLE "order_wagons" (
	"id" bigserial PRIMARY KEY,
	"order_id" bigint NOT NULL,
	"wagon_id" bigint NOT NULL,
	"quantity_loaded" numeric(18,3),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"forecast_program_id" bigint,
	"train_id" bigint
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" bigserial PRIMARY KEY,
	"goods_id" bigint NOT NULL,
	"customer_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"status_id" bigint NOT NULL,
	"supervisor" varchar(200),
	"order_number" varchar(50) CONSTRAINT "orders_order_number_key" UNIQUE,
	"movement_type_id" bigint,
	"parent_order_id" bigint,
	"quantity_demanded" numeric(18,3) NOT NULL,
	"quantity_achieved" numeric(18,3) DEFAULT '0',
	"unit_id" bigint NOT NULL,
	"departure_station_id" bigint,
	"debtor_customer_id" bigint,
	"pickup_location_type_id" bigint,
	"dispatch_type_id" bigint,
	"destination_customer_id" bigint,
	"arrival_station_id" bigint,
	"delivery_location_type_id" bigint,
	"pickup_port_id" bigint,
	"pickup_berth_id" bigint,
	"pickup_siding_id" bigint,
	"delivery_port_id" bigint,
	"delivery_berth_id" bigint,
	"delivery_siding_id" bigint,
	"remarks" text,
	"order_date" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parametrization" (
	"id" bigserial PRIMARY KEY,
	"goods_type_id" bigint NOT NULL,
	"attribute_id" bigint NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "parametrization_goods_type_id_attribute_id_key" UNIQUE("goods_type_id","attribute_id")
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" bigserial PRIMARY KEY,
	"user_id" bigint NOT NULL,
	"token" varchar(100) NOT NULL CONSTRAINT "password_reset_tokens_token_key" UNIQUE,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(100) NOT NULL CONSTRAINT "permissions_name_key" UNIQUE,
	"description" varchar(500),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pickup_location_types" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(50) NOT NULL CONSTRAINT "pickup_location_types_name_key" UNIQUE,
	"description" varchar(200),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ports" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(200) NOT NULL CONSTRAINT "ports_name_key" UNIQUE,
	"type" varchar(20) NOT NULL,
	"city" varchar(100),
	"station_id" bigint,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "ports_type_check" CHECK ((type)::text = ANY ((ARRAY['normal'::character varying, 'sec'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "program_convoi" (
	"id" bigserial PRIMARY KEY,
	"forecast_program_id" bigint NOT NULL,
	"train_id" bigint NOT NULL,
	"convoy" varchar(100) NOT NULL,
	"status" varchar(50),
	"since" timestamp,
	"quantity" numeric(18,3),
	"unit" varchar(20),
	"wagon_count" integer,
	"eta" timestamp,
	"delay_minutes" integer,
	"last_latitude" numeric(10,8),
	"last_longitude" numeric(11,8),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "program_convoi_forecast_program_id_train_id_key" UNIQUE("forecast_program_id","train_id")
);
--> statement-breakpoint
CREATE TABLE "program_status" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(100) NOT NULL CONSTRAINT "program_status_name_key" UNIQUE,
	"description" varchar(200),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rejection_reasons" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(300) NOT NULL CONSTRAINT "rejection_reasons_name_key" UNIQUE,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "representatives" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(200) NOT NULL CONSTRAINT "representatives_name_key" UNIQUE,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" bigint,
	"permission_id" bigint,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "role_permissions_pkey" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(100) NOT NULL CONSTRAINT "roles_name_key" UNIQUE,
	"description" varchar(500),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipping_companies" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(200) NOT NULL CONSTRAINT "shipping_companies_name_key" UNIQUE,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sidings" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(200) NOT NULL CONSTRAINT "sidings_name_key" UNIQUE,
	"city" varchar(100),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "station_passages" (
	"id" bigserial PRIMARY KEY,
	"wagon_id" bigint NOT NULL,
	"station_id" bigint NOT NULL,
	"arrival_time" timestamp,
	"departure_time" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stations" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(200) NOT NULL CONSTRAINT "stations_name_key" UNIQUE,
	"address" varchar(500),
	"city" varchar(100),
	"station_code" varchar(50) NOT NULL CONSTRAINT "stations_station_code_key" UNIQUE,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "train_current_status" (
	"train_id" bigint PRIMARY KEY,
	"last_latitude" numeric(10,8),
	"last_longitude" numeric(11,8),
	"last_status" varchar(50),
	"last_update" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "train_tracking" (
	"id" bigserial PRIMARY KEY,
	"train_id" bigint NOT NULL,
	"latitude" numeric(10,8),
	"longitude" numeric(11,8),
	"status" varchar(50),
	"recorded_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "train_tracking_archive" (
	"id" bigserial PRIMARY KEY,
	"train_id" bigint NOT NULL,
	"latitude" numeric(10,8),
	"longitude" numeric(11,8),
	"tracked_at" timestamp NOT NULL,
	"archived_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "train_wagons" (
	"id" bigserial PRIMARY KEY,
	"train_id" bigint NOT NULL,
	"wagon_id" bigint NOT NULL,
	"attached_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"detached_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "trains" (
	"id" bigserial PRIMARY KEY,
	"external_id" varchar(100) CONSTRAINT "trains_external_id_key" UNIQUE,
	"train_number" varchar(50) NOT NULL CONSTRAINT "trains_train_number_key" UNIQUE,
	"status" varchar(50),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(50) NOT NULL CONSTRAINT "units_name_key" UNIQUE,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_activity_log" (
	"id" bigserial PRIMARY KEY,
	"user_id" bigint NOT NULL,
	"customer_id" bigint,
	"agency_id" bigint,
	"action_type" varchar(100) NOT NULL,
	"action_details" text,
	"ip_address" varchar(50),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_customers" (
	"user_id" bigint,
	"customer_id" bigint,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "user_customers_pkey" PRIMARY KEY("user_id","customer_id")
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" bigserial PRIMARY KEY,
	"user_id" bigint NOT NULL,
	"session_token" varchar(1700) NOT NULL CONSTRAINT "user_sessions_session_token_key" UNIQUE,
	"ip_address" varchar(50),
	"device_info" varchar(500),
	"login_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"logout_at" timestamp,
	"expired_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY,
	"email" varchar(100) NOT NULL CONSTRAINT "users_email_key" UNIQUE,
	"password" varchar(255) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"employee_id" varchar(50),
	"type" varchar(20),
	"role_id" bigint NOT NULL,
	"customer_id" bigint,
	"agency_id" bigint,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login" timestamp,
	"failed_login_attempts" integer DEFAULT 0,
	"account_locked_until" timestamp,
	"created_by" varchar(100),
	"updated_by" varchar(100),
	CONSTRAINT "users_type_check" CHECK ((type)::text = ANY ((ARRAY['internal'::character varying, 'external'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "vessels" (
	"id" bigserial PRIMARY KEY,
	"name" varchar(200) NOT NULL CONSTRAINT "vessels_name_key" UNIQUE,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wagon_current_status" (
	"wagon_id" bigint PRIMARY KEY,
	"last_latitude" numeric(10,8),
	"last_longitude" numeric(11,8),
	"last_status" varchar(50),
	"last_update" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wagon_tracking" (
	"id" bigserial PRIMARY KEY,
	"wagon_id" bigint NOT NULL,
	"latitude" numeric(10,8),
	"longitude" numeric(11,8),
	"status" varchar(50),
	"recorded_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wagon_tracking_archive" (
	"id" bigserial PRIMARY KEY,
	"wagon_id" bigint NOT NULL,
	"latitude" numeric(10,8),
	"longitude" numeric(11,8),
	"tracked_at" timestamp NOT NULL,
	"archived_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wagons" (
	"id" bigserial PRIMARY KEY,
	"external_id" varchar(100) CONSTRAINT "wagons_external_id_key" UNIQUE,
	"wagon_number" varchar(50) NOT NULL CONSTRAINT "wagons_wagon_number_key" UNIQUE,
	"type" varchar(100),
	"capacity" numeric(18,3),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_accessory_operations_name" ON "accessory_operations" ("name");--> statement-breakpoint
CREATE INDEX "idx_agencies_active" ON "agencies" ("is_active");--> statement-breakpoint
CREATE INDEX "idx_agencies_city" ON "agencies" ("city");--> statement-breakpoint
CREATE INDEX "idx_agencies_name" ON "agencies" ("name");--> statement-breakpoint
CREATE INDEX "idx_archival_log_started" ON "archival_execution_log" ("started_at");--> statement-breakpoint
CREATE INDEX "idx_archival_log_status" ON "archival_execution_log" ("execution_status");--> statement-breakpoint
CREATE INDEX "idx_archival_log_table" ON "archival_execution_log" ("table_name");--> statement-breakpoint
CREATE INDEX "idx_archival_log_triggered" ON "archival_execution_log" ("triggered_by");--> statement-breakpoint
CREATE INDEX "idx_attributes_name" ON "attributes" ("name");--> statement-breakpoint
CREATE INDEX "idx_attributes_type" ON "attributes" ("data_type");--> statement-breakpoint
CREATE INDEX "idx_berths_active" ON "berths" ("is_active");--> statement-breakpoint
CREATE INDEX "idx_berths_name" ON "berths" ("name");--> statement-breakpoint
CREATE INDEX "idx_berths_port" ON "berths" ("port_id");--> statement-breakpoint
CREATE INDEX "idx_berths_port_active" ON "berths" ("port_id") WHERE (is_active = true);--> statement-breakpoint
CREATE INDEX "idx_centers_active" ON "centers" ("is_active");--> statement-breakpoint
CREATE INDEX "idx_centers_agency" ON "centers" ("agency_id");--> statement-breakpoint
CREATE INDEX "idx_centers_name" ON "centers" ("name");--> statement-breakpoint
CREATE INDEX "idx_claim_comments_claim" ON "claim_comments" ("claim_id");--> statement-breakpoint
CREATE INDEX "idx_claim_comments_created" ON "claim_comments" ("created_at");--> statement-breakpoint
CREATE INDEX "idx_claim_comments_user" ON "claim_comments" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_claim_files_claim" ON "claim_files" ("claim_id");--> statement-breakpoint
CREATE INDEX "idx_claim_files_uploaded" ON "claim_files" ("uploaded_at");--> statement-breakpoint
CREATE INDEX "idx_claim_files_user" ON "claim_files" ("uploaded_by");--> statement-breakpoint
CREATE INDEX "idx_claim_status_name" ON "claim_status" ("name");--> statement-breakpoint
CREATE INDEX "idx_claim_status_history_claim" ON "claim_status_history" ("claim_id");--> statement-breakpoint
CREATE INDEX "idx_claim_status_history_date" ON "claim_status_history" ("changed_at");--> statement-breakpoint
CREATE INDEX "idx_claim_status_history_status" ON "claim_status_history" ("status_id");--> statement-breakpoint
CREATE INDEX "idx_claim_status_history_user" ON "claim_status_history" ("changed_by");--> statement-breakpoint
CREATE INDEX "idx_claim_types_name" ON "claim_types" ("name");--> statement-breakpoint
CREATE INDEX "idx_claims_closed" ON "claims" ("closed_at");--> statement-breakpoint
CREATE INDEX "idx_claims_created" ON "claims" ("created_at");--> statement-breakpoint
CREATE INDEX "idx_claims_customer" ON "claims" ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_claims_customer_status" ON "claims" ("customer_id","status_id","created_at" DESC);--> statement-breakpoint
CREATE INDEX "idx_claims_operation" ON "claims" ("operation_id");--> statement-breakpoint
CREATE INDEX "idx_claims_order" ON "claims" ("order_id");--> statement-breakpoint
CREATE INDEX "idx_claims_order_status" ON "claims" ("order_id","status_id") WHERE (order_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_claims_priority" ON "claims" ("priority");--> statement-breakpoint
CREATE INDEX "idx_claims_priority_status" ON "claims" ("priority","status_id","created_at" DESC);--> statement-breakpoint
CREATE INDEX "idx_claims_status" ON "claims" ("status_id");--> statement-breakpoint
CREATE INDEX "idx_claims_type" ON "claims" ("type_id");--> statement-breakpoint
CREATE INDEX "idx_claims_user" ON "claims" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_customer_parametrization_active" ON "customer_parametrization" ("is_active");--> statement-breakpoint
CREATE INDEX "idx_customer_parametrization_code" ON "customer_parametrization" ("customer_code");--> statement-breakpoint
CREATE INDEX "idx_customer_parametrization_type" ON "customer_parametrization" ("type");--> statement-breakpoint
CREATE INDEX "idx_customer_types_name" ON "customer_types" ("name");--> statement-breakpoint
CREATE INDEX "idx_customers_active" ON "customers" ("is_active");--> statement-breakpoint
CREATE INDEX "idx_customers_city" ON "customers" ("city");--> statement-breakpoint
CREATE INDEX "idx_customers_company" ON "customers" ("company_name");--> statement-breakpoint
CREATE INDEX "idx_customers_email" ON "customers" ("email");--> statement-breakpoint
CREATE INDEX "idx_customers_type" ON "customers" ("type_id");--> statement-breakpoint
CREATE INDEX "idx_dispatch_types_name" ON "dispatch_types" ("name");--> statement-breakpoint
CREATE INDEX "idx_dtm_integration_log_created" ON "dtm_integration_log" ("created_at");--> statement-breakpoint
CREATE INDEX "idx_dtm_integration_log_entity" ON "dtm_integration_log" ("related_entity_type","related_entity_id");--> statement-breakpoint
CREATE INDEX "idx_dtm_integration_log_http" ON "dtm_integration_log" ("http_status_code");--> statement-breakpoint
CREATE INDEX "idx_dtm_integration_log_status" ON "dtm_integration_log" ("status");--> statement-breakpoint
CREATE INDEX "idx_dtm_integration_log_type" ON "dtm_integration_log" ("request_type_id");--> statement-breakpoint
CREATE INDEX "idx_dtm_integration_log_user" ON "dtm_integration_log" ("created_by");--> statement-breakpoint
CREATE INDEX "idx_dtm_log_entity_date" ON "dtm_integration_log" ("related_entity_type","related_entity_id","created_at" DESC);--> statement-breakpoint
CREATE INDEX "idx_dtm_log_failed" ON "dtm_integration_log" ("status","created_at" DESC) WHERE ((status)::text = ANY ((ARRAY['FAILED'::character varying, 'TIMEOUT'::character varying])::text[]));--> statement-breakpoint
CREATE INDEX "idx_dtm_log_performance" ON "dtm_integration_log" ("request_type_id","duration_ms","created_at" DESC);--> statement-breakpoint
CREATE INDEX "idx_dtm_request_types_active" ON "dtm_request_types" ("is_active");--> statement-breakpoint
CREATE INDEX "idx_dtm_request_types_name" ON "dtm_request_types" ("name");--> statement-breakpoint
CREATE INDEX "idx_fp_history_date" ON "forecast_program_history" ("changed_at");--> statement-breakpoint
CREATE INDEX "idx_fp_history_event_type" ON "forecast_program_history" ("event_type");--> statement-breakpoint
CREATE INDEX "idx_fp_history_new_status" ON "forecast_program_history" ("new_status_id");--> statement-breakpoint
CREATE INDEX "idx_fp_history_old_status" ON "forecast_program_history" ("old_status_id");--> statement-breakpoint
CREATE INDEX "idx_fp_history_program" ON "forecast_program_history" ("program_id");--> statement-breakpoint
CREATE INDEX "idx_fp_history_user" ON "forecast_program_history" ("changed_by");--> statement-breakpoint
CREATE INDEX "idx_forecast_programs_date" ON "forecast_programs" ("planned_date");--> statement-breakpoint
CREATE INDEX "idx_forecast_programs_dtm_sync" ON "forecast_programs" ("sent_to_dtm_at","status_id") WHERE (sent_to_dtm_at IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_forecast_programs_order" ON "forecast_programs" ("order_id");--> statement-breakpoint
CREATE INDEX "idx_forecast_programs_order_date" ON "forecast_programs" ("order_id","planned_date","status_id");--> statement-breakpoint
CREATE INDEX "idx_forecast_programs_sent" ON "forecast_programs" ("sent_to_dtm_at");--> statement-breakpoint
CREATE INDEX "idx_forecast_programs_status" ON "forecast_programs" ("status_id");--> statement-breakpoint
CREATE INDEX "idx_forecast_programs_user" ON "forecast_programs" ("created_by");--> statement-breakpoint
CREATE INDEX "idx_fp_realized_at" ON "forecast_programs" ("realized_at");--> statement-breakpoint
CREATE INDEX "idx_goods_active" ON "goods" ("is_active");--> statement-breakpoint
CREATE INDEX "idx_goods_name" ON "goods" ("name");--> statement-breakpoint
CREATE INDEX "idx_goods_type" ON "goods" ("goods_type_id");--> statement-breakpoint
CREATE INDEX "idx_goods_type_active" ON "goods" ("goods_type_id") WHERE (is_active = true);--> statement-breakpoint
CREATE INDEX "idx_goods_types_name" ON "goods_types" ("name");--> statement-breakpoint
CREATE INDEX "idx_importers_active" ON "importers" ("is_active");--> statement-breakpoint
CREATE INDEX "idx_importers_name" ON "importers" ("name");--> statement-breakpoint
CREATE INDEX "idx_loading_locations_active" ON "loading_locations" ("is_active");--> statement-breakpoint
CREATE INDEX "idx_loading_locations_name" ON "loading_locations" ("name");--> statement-breakpoint
CREATE INDEX "idx_loading_locations_port" ON "loading_locations" ("port_id");--> statement-breakpoint
CREATE INDEX "idx_movement_types_name" ON "movement_types" ("name");--> statement-breakpoint
CREATE INDEX "idx_notification_channels_active" ON "notification_channels" ("is_active");--> statement-breakpoint
CREATE INDEX "idx_notification_channels_name" ON "notification_channels" ("name");--> statement-breakpoint
CREATE INDEX "idx_notification_types_active" ON "notification_types" ("is_active");--> statement-breakpoint
CREATE INDEX "idx_notification_types_name" ON "notification_types" ("name");--> statement-breakpoint
CREATE INDEX "idx_notifications_channel" ON "notifications" ("channel_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_created" ON "notifications" ("created_at");--> statement-breakpoint
CREATE INDEX "idx_notifications_entity" ON "notifications" ("related_entity_type","related_entity_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_entity_user" ON "notifications" ("related_entity_type","related_entity_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_read" ON "notifications" ("read_at");--> statement-breakpoint
CREATE INDEX "idx_notifications_retry" ON "notifications" ("status","retry_count") WHERE (((status)::text = 'FAILED'::text) AND (retry_count < 3));--> statement-breakpoint
CREATE INDEX "idx_notifications_sent" ON "notifications" ("sent_at");--> statement-breakpoint
CREATE INDEX "idx_notifications_status" ON "notifications" ("status");--> statement-breakpoint
CREATE INDEX "idx_notifications_type" ON "notifications" ("type_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_user" ON "notifications" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_read" ON "notifications" ("user_id","read_at","created_at" DESC);--> statement-breakpoint
CREATE INDEX "idx_order_operations_operation" ON "order_accessory_operations" ("operation_id");--> statement-breakpoint
CREATE INDEX "idx_order_operations_order" ON "order_accessory_operations" ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_operations_status" ON "order_accessory_operations" ("status");--> statement-breakpoint
CREATE INDEX "idx_order_attributes_attribute" ON "order_attributes" ("attribute_id");--> statement-breakpoint
CREATE INDEX "idx_order_attributes_order" ON "order_attributes" ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_date_modifications_order" ON "order_date_modifications" ("order_id");--> statement-breakpoint
CREATE INDEX "idx_executions_date_user" ON "order_executions" ("execution_date","executed_by");--> statement-breakpoint
CREATE INDEX "idx_executions_order_date" ON "order_executions" ("order_id","execution_date" DESC);--> statement-breakpoint
CREATE INDEX "idx_order_executions_created" ON "order_executions" ("created_at");--> statement-breakpoint
CREATE INDEX "idx_order_executions_date" ON "order_executions" ("execution_date");--> statement-breakpoint
CREATE INDEX "idx_order_executions_order" ON "order_executions" ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_executions_user" ON "order_executions" ("executed_by");--> statement-breakpoint
CREATE INDEX "idx_order_files_order" ON "order_files" ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_files_type" ON "order_files" ("file_type");--> statement-breakpoint
CREATE INDEX "idx_order_files_uploaded" ON "order_files" ("uploaded_at");--> statement-breakpoint
CREATE INDEX "idx_order_shares_agency" ON "order_shares" ("agency_id");--> statement-breakpoint
CREATE INDEX "idx_order_shares_order" ON "order_shares" ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_shares_user" ON "order_shares" ("shared_by_user_id");--> statement-breakpoint
CREATE INDEX "idx_order_status_name" ON "order_status" ("name");--> statement-breakpoint
CREATE INDEX "idx_order_status_history_date" ON "order_status_history" ("changed_at");--> statement-breakpoint
CREATE INDEX "idx_order_status_history_order" ON "order_status_history" ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_status_history_status" ON "order_status_history" ("status_id");--> statement-breakpoint
CREATE INDEX "idx_order_status_history_user" ON "order_status_history" ("changed_by_id");--> statement-breakpoint
CREATE INDEX "idx_order_wagons_order" ON "order_wagons" ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_wagons_program" ON "order_wagons" ("forecast_program_id");--> statement-breakpoint
CREATE INDEX "idx_order_wagons_train" ON "order_wagons" ("train_id");--> statement-breakpoint
CREATE INDEX "idx_order_wagons_wagon" ON "order_wagons" ("wagon_id");--> statement-breakpoint
CREATE INDEX "idx_orders_arrival_station" ON "orders" ("arrival_station_id");--> statement-breakpoint
CREATE INDEX "idx_orders_created" ON "orders" ("created_at");--> statement-breakpoint
CREATE INDEX "idx_orders_customer" ON "orders" ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_orders_customer_status" ON "orders" ("customer_id","status_id");--> statement-breakpoint
CREATE INDEX "idx_orders_date" ON "orders" ("order_date");--> statement-breakpoint
CREATE INDEX "idx_orders_date_range_status" ON "orders" ("start_date","end_date","status_id");--> statement-breakpoint
CREATE INDEX "idx_orders_debtor_customer" ON "orders" ("debtor_customer_id");--> statement-breakpoint
CREATE INDEX "idx_orders_delivery_location_type" ON "orders" ("delivery_location_type_id");--> statement-breakpoint
CREATE INDEX "idx_orders_departure_station" ON "orders" ("departure_station_id");--> statement-breakpoint
CREATE INDEX "idx_orders_destination_customer" ON "orders" ("destination_customer_id");--> statement-breakpoint
CREATE INDEX "idx_orders_dispatch_type" ON "orders" ("dispatch_type_id");--> statement-breakpoint
CREATE INDEX "idx_orders_dtm_sync" ON "orders" ("status_id");--> statement-breakpoint
CREATE INDEX "idx_orders_end" ON "orders" ("end_date");--> statement-breakpoint
CREATE INDEX "idx_orders_goods" ON "orders" ("goods_id");--> statement-breakpoint
CREATE INDEX "idx_orders_movement_type" ON "orders" ("movement_type_id");--> statement-breakpoint
CREATE INDEX "idx_orders_number" ON "orders" ("order_number") WHERE (order_number IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_orders_parent" ON "orders" ("parent_order_id");--> statement-breakpoint
CREATE INDEX "idx_orders_pickup_location_type" ON "orders" ("pickup_location_type_id");--> statement-breakpoint
CREATE INDEX "idx_orders_quantities" ON "orders" ("quantity_demanded","quantity_achieved","status_id");--> statement-breakpoint
CREATE INDEX "idx_orders_start" ON "orders" ("start_date");--> statement-breakpoint
CREATE INDEX "idx_orders_status" ON "orders" ("status_id");--> statement-breakpoint
CREATE INDEX "idx_orders_tc_export" ON "orders" ("goods_id","movement_type_id","status_id") WHERE (parent_order_id IS NULL);--> statement-breakpoint
CREATE INDEX "idx_orders_user" ON "orders" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_parametrization_attribute" ON "parametrization" ("attribute_id");--> statement-breakpoint
CREATE INDEX "idx_parametrization_goods_type" ON "parametrization" ("goods_type_id");--> statement-breakpoint
CREATE INDEX "idx_password_reset_tokens_token" ON "password_reset_tokens" ("token");--> statement-breakpoint
CREATE INDEX "idx_password_reset_tokens_user" ON "password_reset_tokens" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_permissions_name" ON "permissions" ("name");--> statement-breakpoint
CREATE INDEX "idx_pickup_location_types_name" ON "pickup_location_types" ("name");--> statement-breakpoint
CREATE INDEX "idx_ports_active" ON "ports" ("is_active");--> statement-breakpoint
CREATE INDEX "idx_ports_city" ON "ports" ("city");--> statement-breakpoint
CREATE INDEX "idx_ports_name" ON "ports" ("name");--> statement-breakpoint
CREATE INDEX "idx_ports_station" ON "ports" ("station_id");--> statement-breakpoint
CREATE INDEX "idx_ports_type" ON "ports" ("type");--> statement-breakpoint
CREATE INDEX "idx_program_convoi_program" ON "program_convoi" ("forecast_program_id");--> statement-breakpoint
CREATE INDEX "idx_program_convoi_train" ON "program_convoi" ("train_id");--> statement-breakpoint
CREATE INDEX "idx_program_status_name" ON "program_status" ("name");--> statement-breakpoint
CREATE INDEX "idx_rejection_reasons_name" ON "rejection_reasons" ("name");--> statement-breakpoint
CREATE INDEX "idx_representatives_active" ON "representatives" ("is_active");--> statement-breakpoint
CREATE INDEX "idx_representatives_name" ON "representatives" ("name");--> statement-breakpoint
CREATE INDEX "idx_roles_active" ON "roles" ("is_active");--> statement-breakpoint
CREATE INDEX "idx_roles_name" ON "roles" ("name");--> statement-breakpoint
CREATE INDEX "idx_shipping_companies_active" ON "shipping_companies" ("is_active");--> statement-breakpoint
CREATE INDEX "idx_shipping_companies_name" ON "shipping_companies" ("name");--> statement-breakpoint
CREATE INDEX "idx_sidings_active" ON "sidings" ("is_active");--> statement-breakpoint
CREATE INDEX "idx_sidings_city" ON "sidings" ("city");--> statement-breakpoint
CREATE INDEX "idx_sidings_name" ON "sidings" ("name");--> statement-breakpoint
CREATE INDEX "idx_station_passages_arrival" ON "station_passages" ("arrival_time");--> statement-breakpoint
CREATE INDEX "idx_station_passages_departure" ON "station_passages" ("departure_time");--> statement-breakpoint
CREATE INDEX "idx_station_passages_station" ON "station_passages" ("station_id");--> statement-breakpoint
CREATE INDEX "idx_station_passages_wagon" ON "station_passages" ("wagon_id");--> statement-breakpoint
CREATE INDEX "idx_station_passages_wagon_time" ON "station_passages" ("wagon_id","arrival_time" DESC);--> statement-breakpoint
CREATE INDEX "idx_stations_active" ON "stations" ("is_active");--> statement-breakpoint
CREATE INDEX "idx_stations_city" ON "stations" ("city");--> statement-breakpoint
CREATE INDEX "idx_stations_name" ON "stations" ("name");--> statement-breakpoint
CREATE INDEX "idx_train_current_status_location" ON "train_current_status" ("last_latitude","last_longitude");--> statement-breakpoint
CREATE INDEX "idx_train_current_status_status" ON "train_current_status" ("last_status");--> statement-breakpoint
CREATE INDEX "idx_train_current_status_update" ON "train_current_status" ("last_update");--> statement-breakpoint
CREATE INDEX "idx_train_tracking_cleanup" ON "train_tracking" ("recorded_at");--> statement-breakpoint
CREATE INDEX "idx_train_tracking_location" ON "train_tracking" ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "idx_train_tracking_recorded" ON "train_tracking" ("recorded_at");--> statement-breakpoint
CREATE INDEX "idx_train_tracking_status" ON "train_tracking" ("status");--> statement-breakpoint
CREATE INDEX "idx_train_tracking_train" ON "train_tracking" ("train_id");--> statement-breakpoint
CREATE INDEX "idx_train_tracking_train_date" ON "train_tracking" ("train_id","recorded_at" DESC);--> statement-breakpoint
CREATE INDEX "idx_train_tracking_archive_archived" ON "train_tracking_archive" ("archived_at");--> statement-breakpoint
CREATE INDEX "idx_train_tracking_archive_tracked" ON "train_tracking_archive" ("tracked_at");--> statement-breakpoint
CREATE INDEX "idx_train_tracking_archive_train" ON "train_tracking_archive" ("train_id");--> statement-breakpoint
CREATE INDEX "idx_train_wagons_attached" ON "train_wagons" ("attached_at");--> statement-breakpoint
CREATE INDEX "idx_train_wagons_detached" ON "train_wagons" ("detached_at");--> statement-breakpoint
CREATE INDEX "idx_train_wagons_train" ON "train_wagons" ("train_id");--> statement-breakpoint
CREATE INDEX "idx_train_wagons_wagon" ON "train_wagons" ("wagon_id");--> statement-breakpoint
CREATE INDEX "idx_trains_active" ON "trains" ("is_active");--> statement-breakpoint
CREATE INDEX "idx_trains_external" ON "trains" ("external_id");--> statement-breakpoint
CREATE INDEX "idx_trains_number" ON "trains" ("train_number");--> statement-breakpoint
CREATE INDEX "idx_trains_status" ON "trains" ("status");--> statement-breakpoint
CREATE INDEX "idx_units_name" ON "units" ("name");--> statement-breakpoint
CREATE INDEX "idx_user_activity_action" ON "user_activity_log" ("action_type");--> statement-breakpoint
CREATE INDEX "idx_user_activity_agency" ON "user_activity_log" ("agency_id");--> statement-breakpoint
CREATE INDEX "idx_user_activity_customer" ON "user_activity_log" ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_user_activity_date" ON "user_activity_log" ("created_at");--> statement-breakpoint
CREATE INDEX "idx_user_activity_user" ON "user_activity_log" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_sessions_expired" ON "user_sessions" ("expired_at");--> statement-breakpoint
CREATE INDEX "idx_user_sessions_expired_cleanup" ON "user_sessions" ("expired_at","logout_at") WHERE (logout_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_user_sessions_token" ON "user_sessions" ("session_token");--> statement-breakpoint
CREATE INDEX "idx_user_sessions_user" ON "user_sessions" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_sessions_user_active" ON "user_sessions" ("user_id","expired_at") WHERE (logout_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_users_active" ON "users" ("is_active");--> statement-breakpoint
CREATE INDEX "idx_users_agency" ON "users" ("agency_id");--> statement-breakpoint
CREATE INDEX "idx_users_customer" ON "users" ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" ("email");--> statement-breakpoint
CREATE INDEX "idx_users_employee" ON "users" ("employee_id");--> statement-breakpoint
CREATE INDEX "idx_users_locked" ON "users" ("account_locked_until");--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" ("role_id");--> statement-breakpoint
CREATE INDEX "idx_users_type" ON "users" ("type");--> statement-breakpoint
CREATE INDEX "idx_vessels_active" ON "vessels" ("is_active");--> statement-breakpoint
CREATE INDEX "idx_vessels_name" ON "vessels" ("name");--> statement-breakpoint
CREATE INDEX "idx_wagon_current_status_location" ON "wagon_current_status" ("last_latitude","last_longitude");--> statement-breakpoint
CREATE INDEX "idx_wagon_current_status_status" ON "wagon_current_status" ("last_status");--> statement-breakpoint
CREATE INDEX "idx_wagon_current_status_update" ON "wagon_current_status" ("last_update");--> statement-breakpoint
CREATE INDEX "idx_wagon_tracking_cleanup" ON "wagon_tracking" ("recorded_at");--> statement-breakpoint
CREATE INDEX "idx_wagon_tracking_location" ON "wagon_tracking" ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "idx_wagon_tracking_recorded" ON "wagon_tracking" ("recorded_at");--> statement-breakpoint
CREATE INDEX "idx_wagon_tracking_status" ON "wagon_tracking" ("status");--> statement-breakpoint
CREATE INDEX "idx_wagon_tracking_wagon" ON "wagon_tracking" ("wagon_id");--> statement-breakpoint
CREATE INDEX "idx_wagon_tracking_wagon_date" ON "wagon_tracking" ("wagon_id","recorded_at" DESC);--> statement-breakpoint
CREATE INDEX "idx_wagon_tracking_archive_archived" ON "wagon_tracking_archive" ("archived_at");--> statement-breakpoint
CREATE INDEX "idx_wagon_tracking_archive_tracked" ON "wagon_tracking_archive" ("tracked_at");--> statement-breakpoint
CREATE INDEX "idx_wagon_tracking_archive_wagon" ON "wagon_tracking_archive" ("wagon_id");--> statement-breakpoint
CREATE INDEX "idx_wagons_active" ON "wagons" ("is_active");--> statement-breakpoint
CREATE INDEX "idx_wagons_external" ON "wagons" ("external_id");--> statement-breakpoint
CREATE INDEX "idx_wagons_number" ON "wagons" ("wagon_number");--> statement-breakpoint
CREATE INDEX "idx_wagons_type" ON "wagons" ("type");--> statement-breakpoint
ALTER TABLE "archival_execution_log" ADD CONSTRAINT "archival_execution_log_triggered_by_user_id_fkey" FOREIGN KEY ("triggered_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "berths" ADD CONSTRAINT "berths_port_id_fkey" FOREIGN KEY ("port_id") REFERENCES "ports"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "centers" ADD CONSTRAINT "centers_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id");--> statement-breakpoint
ALTER TABLE "claim_comments" ADD CONSTRAINT "claim_comments_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "claims"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "claim_comments" ADD CONSTRAINT "claim_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "claim_files" ADD CONSTRAINT "claim_files_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "claims"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "claim_files" ADD CONSTRAINT "claim_files_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "claim_status_history" ADD CONSTRAINT "claim_status_history_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "claims"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "claim_status_history" ADD CONSTRAINT "claim_status_history_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "claim_status"("id");--> statement-breakpoint
ALTER TABLE "claim_status_history" ADD CONSTRAINT "claim_status_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id");--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_operation_id_fkey" FOREIGN KEY ("operation_id") REFERENCES "accessory_operations"("id");--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "claim_types"("id");--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "claim_status"("id");--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_closed_by_fkey" FOREIGN KEY ("closed_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "customer_types"("id");--> statement-breakpoint
ALTER TABLE "dtm_integration_log" ADD CONSTRAINT "dtm_integration_log_request_type_id_fkey" FOREIGN KEY ("request_type_id") REFERENCES "dtm_request_types"("id");--> statement-breakpoint
ALTER TABLE "dtm_integration_log" ADD CONSTRAINT "dtm_integration_log_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "forecast_program_history" ADD CONSTRAINT "forecast_program_history_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "forecast_programs"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "forecast_program_history" ADD CONSTRAINT "forecast_program_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "forecast_program_history" ADD CONSTRAINT "forecast_program_history_old_status_id_fkey" FOREIGN KEY ("old_status_id") REFERENCES "program_status"("id");--> statement-breakpoint
ALTER TABLE "forecast_program_history" ADD CONSTRAINT "forecast_program_history_new_status_id_fkey" FOREIGN KEY ("new_status_id") REFERENCES "program_status"("id");--> statement-breakpoint
ALTER TABLE "forecast_programs" ADD CONSTRAINT "forecast_programs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "forecast_programs" ADD CONSTRAINT "forecast_programs_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "program_status"("id");--> statement-breakpoint
ALTER TABLE "forecast_programs" ADD CONSTRAINT "forecast_programs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "forecast_programs" ADD CONSTRAINT "forecast_programs_realized_by_fkey" FOREIGN KEY ("realized_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "goods" ADD CONSTRAINT "goods_goods_type_id_fkey" FOREIGN KEY ("goods_type_id") REFERENCES "goods_types"("id");--> statement-breakpoint
ALTER TABLE "loading_locations" ADD CONSTRAINT "loading_locations_port_id_fkey" FOREIGN KEY ("port_id") REFERENCES "ports"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "notification_types"("id");--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "notification_channels"("id");--> statement-breakpoint
ALTER TABLE "order_accessory_operations" ADD CONSTRAINT "order_accessory_operations_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_accessory_operations" ADD CONSTRAINT "order_accessory_operations_operation_id_fkey" FOREIGN KEY ("operation_id") REFERENCES "accessory_operations"("id");--> statement-breakpoint
ALTER TABLE "order_attributes" ADD CONSTRAINT "order_attributes_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_attributes" ADD CONSTRAINT "order_attributes_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id");--> statement-breakpoint
ALTER TABLE "order_date_modifications" ADD CONSTRAINT "order_date_modifications_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id");--> statement-breakpoint
ALTER TABLE "order_date_modifications" ADD CONSTRAINT "order_date_modifications_modified_by_id_fkey" FOREIGN KEY ("modified_by_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "order_executions" ADD CONSTRAINT "order_executions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_executions" ADD CONSTRAINT "order_executions_executed_by_fkey" FOREIGN KEY ("executed_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "order_files" ADD CONSTRAINT "order_files_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_files" ADD CONSTRAINT "order_files_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "order_shares" ADD CONSTRAINT "order_shares_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_shares" ADD CONSTRAINT "order_shares_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id");--> statement-breakpoint
ALTER TABLE "order_shares" ADD CONSTRAINT "order_shares_shared_by_user_id_fkey" FOREIGN KEY ("shared_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "order_status"("id");--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_rejection_reason_id_fkey" FOREIGN KEY ("rejection_reason_id") REFERENCES "rejection_reasons"("id");--> statement-breakpoint
ALTER TABLE "order_wagons" ADD CONSTRAINT "order_wagons_wagon_id_fkey" FOREIGN KEY ("wagon_id") REFERENCES "wagons"("id");--> statement-breakpoint
ALTER TABLE "order_wagons" ADD CONSTRAINT "order_wagons_forecast_program_id_fkey" FOREIGN KEY ("forecast_program_id") REFERENCES "forecast_programs"("id");--> statement-breakpoint
ALTER TABLE "order_wagons" ADD CONSTRAINT "order_wagons_train_id_fkey" FOREIGN KEY ("train_id") REFERENCES "trains"("id");--> statement-breakpoint
ALTER TABLE "order_wagons" ADD CONSTRAINT "order_wagons_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_parent_order_id_fkey" FOREIGN KEY ("parent_order_id") REFERENCES "orders"("id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_goods_id_fkey" FOREIGN KEY ("goods_id") REFERENCES "goods"("id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "order_status"("id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_movement_type_id_fkey" FOREIGN KEY ("movement_type_id") REFERENCES "movement_types"("id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_departure_station_id_fkey" FOREIGN KEY ("departure_station_id") REFERENCES "stations"("id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_debtor_customer_id_fkey" FOREIGN KEY ("debtor_customer_id") REFERENCES "customers"("id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_pickup_location_type_id_fkey" FOREIGN KEY ("pickup_location_type_id") REFERENCES "pickup_location_types"("id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_dispatch_type_id_fkey" FOREIGN KEY ("dispatch_type_id") REFERENCES "dispatch_types"("id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_destination_customer_id_fkey" FOREIGN KEY ("destination_customer_id") REFERENCES "customers"("id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_arrival_station_id_fkey" FOREIGN KEY ("arrival_station_id") REFERENCES "stations"("id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_delivery_location_type_id_fkey" FOREIGN KEY ("delivery_location_type_id") REFERENCES "pickup_location_types"("id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_pickup_port_id_fkey" FOREIGN KEY ("pickup_port_id") REFERENCES "ports"("id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_pickup_berth_id_fkey" FOREIGN KEY ("pickup_berth_id") REFERENCES "berths"("id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_pickup_siding_id_fkey" FOREIGN KEY ("pickup_siding_id") REFERENCES "sidings"("id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_delivery_port_id_fkey" FOREIGN KEY ("delivery_port_id") REFERENCES "ports"("id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_delivery_berth_id_fkey" FOREIGN KEY ("delivery_berth_id") REFERENCES "berths"("id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_delivery_siding_id_fkey" FOREIGN KEY ("delivery_siding_id") REFERENCES "sidings"("id");--> statement-breakpoint
ALTER TABLE "parametrization" ADD CONSTRAINT "parametrization_goods_type_id_fkey" FOREIGN KEY ("goods_type_id") REFERENCES "goods_types"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "parametrization" ADD CONSTRAINT "parametrization_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ports" ADD CONSTRAINT "ports_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "stations"("id");--> statement-breakpoint
ALTER TABLE "program_convoi" ADD CONSTRAINT "program_convoi_forecast_program_id_fkey" FOREIGN KEY ("forecast_program_id") REFERENCES "forecast_programs"("id");--> statement-breakpoint
ALTER TABLE "program_convoi" ADD CONSTRAINT "program_convoi_train_id_fkey" FOREIGN KEY ("train_id") REFERENCES "trains"("id");--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "station_passages" ADD CONSTRAINT "station_passages_wagon_id_fkey" FOREIGN KEY ("wagon_id") REFERENCES "wagons"("id");--> statement-breakpoint
ALTER TABLE "station_passages" ADD CONSTRAINT "station_passages_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "stations"("id");--> statement-breakpoint
ALTER TABLE "train_current_status" ADD CONSTRAINT "train_current_status_train_id_fkey" FOREIGN KEY ("train_id") REFERENCES "trains"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "train_tracking" ADD CONSTRAINT "train_tracking_train_id_fkey" FOREIGN KEY ("train_id") REFERENCES "trains"("id");--> statement-breakpoint
ALTER TABLE "train_tracking_archive" ADD CONSTRAINT "train_tracking_archive_train_id_fkey" FOREIGN KEY ("train_id") REFERENCES "trains"("id");--> statement-breakpoint
ALTER TABLE "train_wagons" ADD CONSTRAINT "train_wagons_train_id_fkey" FOREIGN KEY ("train_id") REFERENCES "trains"("id");--> statement-breakpoint
ALTER TABLE "train_wagons" ADD CONSTRAINT "train_wagons_wagon_id_fkey" FOREIGN KEY ("wagon_id") REFERENCES "wagons"("id");--> statement-breakpoint
ALTER TABLE "user_activity_log" ADD CONSTRAINT "user_activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "user_activity_log" ADD CONSTRAINT "user_activity_log_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");--> statement-breakpoint
ALTER TABLE "user_activity_log" ADD CONSTRAINT "user_activity_log_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id");--> statement-breakpoint
ALTER TABLE "user_customers" ADD CONSTRAINT "user_customers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_customers" ADD CONSTRAINT "user_customers_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id");--> statement-breakpoint
ALTER TABLE "wagon_current_status" ADD CONSTRAINT "wagon_current_status_wagon_id_fkey" FOREIGN KEY ("wagon_id") REFERENCES "wagons"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "wagon_tracking" ADD CONSTRAINT "wagon_tracking_wagon_id_fkey" FOREIGN KEY ("wagon_id") REFERENCES "wagons"("id");--> statement-breakpoint
ALTER TABLE "wagon_tracking_archive" ADD CONSTRAINT "wagon_tracking_archive_wagon_id_fkey" FOREIGN KEY ("wagon_id") REFERENCES "wagons"("id");