-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.contact (
  contact_id integer NOT NULL DEFAULT nextval('contact_contact_id_seq'::regclass),
  phone_number character varying NOT NULL,
  email_address text,
  name text,
  dob date,
  gender USER-DEFINED,
  nationality text,
  marital_status text,
  category text,
  secondary_email text,
  secondary_phone_number text,
  created_by integer,
  emergency_contact_name text,
  emergency_contact_phone_number text,
  emergency_contact_relationship text,
  skills text,
  logger text,
  linkedin_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT contact_pkey PRIMARY KEY (contact_id),
  CONSTRAINT contact_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.login(id)
);
CREATE TABLE public.contact_address (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  street text,
  city text,
  state text,
  country text,
  zipcode text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  contact_id integer UNIQUE,
  latitude double precision,
  longitude double precision,
  geocoded_at timestamp with time zone,
  geocode_confidence double precision,
  geocode_status text DEFAULT 'pending'::text,
  address_hash text,
  updated_at timestamp with time zone,
  CONSTRAINT contact_address_pkey PRIMARY KEY (id),
  CONSTRAINT contact_address_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contact(contact_id)
);
CREATE TABLE public.contact_education (
  id integer NOT NULL DEFAULT nextval('contact_education_id_seq'::regclass),
  pg_course_name text,
  pg_college text,
  pg_university text,
  pg_from_date text,
  pg_to_date text,
  ug_course_name text,
  ug_college text,
  ug_university text,
  ug_from_date text,
  ug_to_date text,
  contact_id integer UNIQUE,
  updated_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT contact_education_pkey PRIMARY KEY (id),
  CONSTRAINT contact_education_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contact(contact_id)
);
CREATE TABLE public.contact_experience (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  job_title text,
  company text,
  department text,
  from_date date,
  to_date date,
  contact_id integer,
  company_skills text,
  updated_at timestamp with time zone,
  CONSTRAINT contact_experience_pkey PRIMARY KEY (id),
  CONSTRAINT contact_experience_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contact(contact_id)
);
CREATE TABLE public.contact_history (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  contact_id integer,
  last_contacted date,
  contacted_by integer,
  CONSTRAINT contact_history_pkey PRIMARY KEY (id),
  CONSTRAINT contact_history_contacted_by_fkey FOREIGN KEY (contacted_by) REFERENCES public.login(id),
  CONSTRAINT contact_history_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.login(id)
);
CREATE TABLE public.contact_modification_history (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  modified_by integer,
  modification_type text,
  contact_id integer,
  updated_at timestamp with time zone,
  assigned_to integer,
  CONSTRAINT contact_modification_history_pkey PRIMARY KEY (id),
  CONSTRAINT contact_modification_history_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.login(id),
  CONSTRAINT contact_modification_history_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contact(contact_id),
  CONSTRAINT contact_modification_history_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.login(id)
);
CREATE TABLE public.event (
  event_id integer NOT NULL DEFAULT nextval('event_event_id_seq'::regclass),
  contact_id integer,
  event_name character varying NOT NULL,
  event_role character varying NOT NULL,
  event_date date NOT NULL,
  event_held_organization character varying,
  event_location character varying,
  verified boolean DEFAULT false,
  contact_status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by integer DEFAULT 1,
  CONSTRAINT event_pkey PRIMARY KEY (event_id),
  CONSTRAINT event_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.login(id),
  CONSTRAINT event_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contact(contact_id)
);
CREATE TABLE public.login (
  id integer NOT NULL DEFAULT nextval('login_id_seq'::regclass),
  email text NOT NULL,
  password text NOT NULL,
  role text DEFAULT 'user'::text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  username text,
  last_seen timestamp with time zone,
  is_online boolean DEFAULT false,
  referred_by text,
  CONSTRAINT login_pkey PRIMARY KEY (id)
);
CREATE TABLE public.photos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_by integer NOT NULL,
  file_path text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  verified boolean DEFAULT false,
  status text DEFAULT 'pending'::text,
  CONSTRAINT photos_pkey PRIMARY KEY (id),
  CONSTRAINT photos_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.login(id)
);
CREATE TABLE public.referral_invitations (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  referrer_email text,
  invitee_email text,
  token text,
  is_used boolean DEFAULT false,
  expires_at timestamp with time zone,
  used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_activity timestamp with time zone DEFAULT now(),
  CONSTRAINT referral_invitations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tasks (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  task_title text,
  task_description text,
  task_deadline date,
  task_completion boolean DEFAULT false,
  task_type USER-DEFINED,
  updated_at timestamp with time zone,
  task_assigned_category text,
  contact_id integer,
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contact(contact_id)
);
CREATE TABLE public.user_assignments (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  assigned_by integer,
  assigned_to integer,
  event_id integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  completed boolean DEFAULT false,
  CONSTRAINT user_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT user_assignments_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.login(id),
  CONSTRAINT user_assignments_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.event(event_id),
  CONSTRAINT user_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.login(id)
);