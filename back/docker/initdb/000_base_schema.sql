--
-- PostgreSQL database dump
--

\restrict v7jYobDyrIxqjIWfg0UnFpwMz98kKbLbO6MLYf9qHo8JHiID7YwKLBv4HeBPWBt

-- Dumped from database version 17.11 (9045acd)
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS public;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journal_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    session_date date NOT NULL,
    duration_minutes integer,
    intensity integer,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT journal_entries_intensity_check CHECK (((intensity >= 1) AND (intensity <= 5)))
);


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    stripe_subscription_id text,
    status text,
    current_period_end timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: techniques; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.techniques (
    id text NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    subcategory text NOT NULL,
    description text NOT NULL,
    difficulty text NOT NULL,
    tags text[] DEFAULT '{}'::text[] NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password_hash text,
    stripe_customer_id text,
    subscription_status text DEFAULT 'free'::text,
    created_at timestamp with time zone DEFAULT now(),
    username text,
    avatar_url text,
    belt_level text DEFAULT 'white'::text,
    techniques_studied integer DEFAULT 0
);


--
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_stripe_subscription_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_stripe_subscription_id_key UNIQUE (stripe_subscription_id);


--
-- Name: techniques techniques_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.techniques
    ADD CONSTRAINT techniques_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_journal_entries_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_journal_entries_user_id ON public.journal_entries USING btree (user_id);


--
-- Name: users_username_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_username_unique ON public.users USING btree (username) WHERE (username IS NOT NULL);


--
-- Name: journal_entries journal_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict v7jYobDyrIxqjIWfg0UnFpwMz98kKbLbO6MLYf9qHo8JHiID7YwKLBv4HeBPWBt

