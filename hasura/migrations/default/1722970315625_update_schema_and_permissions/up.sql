SET check_function_bodies = false;
CREATE TABLE public.userrr (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text
);
ALTER TABLE ONLY public.userrr
    ADD CONSTRAINT userrr_pkey PRIMARY KEY (id);
