-- ─────────────────────────────────────────────────────────────────────────
-- pgTAP RLS-testmal — tenant/bruker-isolasjon for Supabase Row Level Security
-- ─────────────────────────────────────────────────────────────────────────
-- Generisk mal. Kopier til supabase/tests/rls/test_{{TABELL}}_rls.sql og bytt ut
-- alle {{PLASSHOLDERE}}. Genereres normalt automatisk av RLS-TESTER-eksperten
-- (se Agenter/agenter/ekspert/RLS-TESTER-ekspert.md).
--
-- Forutsetning:  CREATE EXTENSION IF NOT EXISTS pgtap;
-- Kjør med:      supabase test db   (ELLER pg_prove mot en TEST-database)
-- ADVARSEL:      Kjør ALDRI mot produksjonsdatabase. Alt rulles tilbake (ROLLBACK).
--
-- Plassholdere:
--   {{TABELL}}        tabellen som har RLS, f.eks. user_data
--   {{EIER_KOLONNE}}  kolonnen som binder rad til bruker, f.eks. user_id
--   {{BRUKER_A}}      UUID for testbruker A (eier av en rad)
--   {{BRUKER_B}}      UUID for testbruker B (skal ikke se A sine data)
-- ─────────────────────────────────────────────────────────────────────────

BEGIN;
SELECT plan(6);

-- Test 1: Autentisert bruker ser egne rader
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub": "{{BRUKER_A}}"}';

SELECT results_eq(
  $$ SELECT count(*)::int FROM {{TABELL}} WHERE {{EIER_KOLONNE}} = '{{BRUKER_A}}' $$,
  $$ VALUES (1) $$,
  'Bruker A ser sine egne rader'
);

-- Test 2: Autentisert bruker ser IKKE andres rader
SELECT results_eq(
  $$ SELECT count(*)::int FROM {{TABELL}} WHERE {{EIER_KOLONNE}} = '{{BRUKER_B}}' $$,
  $$ VALUES (0) $$,
  'Bruker A ser ikke bruker B sine rader'
);

-- Test 3: Insert til egne data er tillatt
SELECT lives_ok(
  $$ INSERT INTO {{TABELL}} ({{EIER_KOLONNE}}, content) VALUES ('{{BRUKER_A}}', 'test') $$,
  'Bruker kan skrive egne data'
);

-- Test 4: Insert til andres data er blokkert
SELECT throws_ok(
  $$ INSERT INTO {{TABELL}} ({{EIER_KOLONNE}}, content) VALUES ('{{BRUKER_B}}', 'hacking') $$,
  '42501',
  'new row violates row-level security policy',
  'Bruker kan ikke skrive til andres data'
);

-- Test 5: Anonym bruker ser ingenting
SET LOCAL role = anon;
SELECT results_eq(
  $$ SELECT count(*)::int FROM {{TABELL}} $$,
  $$ VALUES (0) $$,
  'Anonym bruker ser ingen rader'
);

-- Test 6: service_role ser alt (forventet, dokumentert oppførsel)
SET LOCAL role = service_role;
SELECT results_ne(
  $$ SELECT count(*)::int FROM {{TABELL}} $$,
  $$ VALUES (0) $$,
  'service_role omgår RLS (dokumentert oppførsel)'
);

SELECT * FROM finish();
ROLLBACK;
