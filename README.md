# ProofHire
Hiring platform (ETHGlobal rebuild) with candidate/company portals, application tracking, and ZK-proof verification.

## Repo layout
- client/ - React + TypeScript frontend (manually reconstructed from GitHub)
- server/ - Node/Express backend (PDF handling + prove/verify endpoints)
- docs/ - notes/design

## Manual rebuild workflow (frontend)
1. Copy `.tsx` files from the GitHub repo into matching paths under `client/src/`.
2. Fix imports until `client` compiles.
3. Add missing shared components under `client/src/components`, `client/src/ui`, etc.

## Next steps
- Scaffold client build tooling (Vite/React/TS + Tailwind + shadcn/ui)
- Add server endpoints:
  - POST /prove
  - POST /verify
  - GET /application/:id
"# Veritrust" 
