# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Current state (important)
This repository is currently a skeleton/manual rebuild:
- There is no checked-in build/test tooling yet (e.g., no `package.json`), so there are no authoritative commands for build/lint/test at the moment.
- The top-level `README.md` describes the intended stack and the manual rebuild workflow.

## Repository structure (big picture)
This is intended to be a small monorepo with two main deliverables:
- `client/`: planned React + TypeScript frontend. Source files should live under `client/src/`.
- `server/`: planned Node.js + Express API backend for PDF handling and ZK prove/verify flows.
- `docs/`: notes/design (currently empty).

## Workflow notes captured in repo docs
The root `README.md` documents a “manual rebuild workflow (frontend)” that future work should follow:
- Copy `.tsx` files from the upstream GitHub repo into matching paths under `client/src/`.
- Fix imports until the frontend compiles.
- Add missing shared components under expected folders like `client/src/components` and `client/src/ui`.

## Backend API surface (planned)
The backend README and root README both note the intended endpoints:
- `POST /prove`
- `POST /verify`
- `GET /application/:id`

## Development commands
No canonical dev commands are defined yet because the repo currently does not include scaffolding/config files for the client or server (no package manager scripts, task runner, etc.).
When scaffolding is added, prefer to document the exact commands here (build, lint, test, and how to run a single test) based on the checked-in scripts/config.