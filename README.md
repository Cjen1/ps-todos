# Yjs and react based todo list

Run and serve files with `npm run serve -- server/config.json`

## Nix

This repository provides a flake package and NixOS module for running the app as
a systemd service. See [nix/README.md](nix/README.md).

# Features or task list

- [x] Multi-project
- [x] Completed tasks are separate
- [x] dockerize
- [x] local store
- [x] more persistent remote store
- [x] multi-line task descriptions
- [x] context menu
- [x] recurring tasks
  - [ ] Fix days selector
- [x] Auth
- [x] Feedback from failed auth (connection status into spinner?)
  - [ ] Actually nice feedback
- [ ] delete project

# Assumptions
App is accessible under `https://<host>/`
Hocuspocus websocket is accessible under `ws://<host>/api/doc`
