# Nix packaging

This repository exposes a flake package and a NixOS module.

Build the combined package:

```sh
nix build .#ps-todos
```

Run the server directly with a JSON config:

```sh
nix run . -- /path/to/config.json /var/lib/ps-todos
```

The package provides:

- `bin/ps-todos-server`
- `share/ps-todos/application`, the built static frontend

Example NixOS configuration:

```nix
{
  inputs.ps-todos.url = "github:Cjen1/ps-todos";

  outputs = { nixpkgs, ps-todos, ... }: {
    nixosConfigurations.my-host = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      modules = [
        ps-todos.nixosModules.default
        {
          services.ps-todos = {
            enable = true;
            port = 5000;
            openFirewall = true;
            dashboards = {
              "automerge:2ezdQGspSBhzs9BcfKkcbsiAsj9V" = "personal";
            };
          };
        }
      ];
    };
  };
}
```

The NixOS module writes a server config containing the packaged frontend path and
starts `ps-todos-server` as a systemd service.
