CREATE TABLE "project_overview" (
	"project_id" uuid PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"image_url" text NOT NULL,
	"description" text NOT NULL
);
