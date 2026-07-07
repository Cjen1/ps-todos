{
  description = "A small Automerge-backed todo application";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    systems.url = "github:nix-systems/default";
  };

  outputs = { self, nixpkgs, systems }:
    let
      eachSystem = nixpkgs.lib.genAttrs (import systems);
    in
    {
      packages = eachSystem (system:
        let
          pkgs = import nixpkgs { inherit system; };
          lib = pkgs.lib;
          nodejs = pkgs.nodejs_22;
          pnpm = pkgs.pnpm;

          cleanSrc = lib.cleanSourceWith {
            src = ./.;
            filter = path: type:
              let
                name = baseNameOf path;
              in
              !(name == ".git"
                || name == "node_modules"
                || name == "dist"
                || name == "result"
                || name == "test-results");
          };

          serverSrc = lib.cleanSourceWith {
            src = ./server_automerge;
            filter = path: type:
              let
                name = baseNameOf path;
              in
              !(name == "node_modules" || name == "result");
          };

          frontend = pkgs.stdenv.mkDerivation (finalAttrs: {
            pname = "ps-todos-frontend";
            version = "0.0.0";
            src = cleanSrc;

            pnpmDeps = pkgs.fetchPnpmDeps {
              inherit (finalAttrs) pname version src;
              fetcherVersion = 3;
              hash = "sha256-OrchET0B8/PCeIrylsF7u0aWk6Es2dDlrC42DxQEI7E=";
            };

            nativeBuildInputs = [
              nodejs
              pkgs.pnpmConfigHook
              pnpm
            ];

            buildPhase = ''
              runHook preBuild
              pnpm run build
              runHook postBuild
            '';

            installPhase = ''
              runHook preInstall
              mkdir -p $out/share/ps-todos/application
              cp -r dist/. $out/share/ps-todos/application/
              runHook postInstall
            '';
          });

          server = pkgs.stdenv.mkDerivation (finalAttrs: {
            pname = "ps-todos-server";
            version = "0.0.1";
            src = serverSrc;

            pnpmDeps = pkgs.fetchPnpmDeps {
              inherit (finalAttrs) pname version src;
              fetcherVersion = 3;
              hash = "sha256-BzyjkN57M9BU7i5/Qnd57TyOmbTgulD9IgrlIZz18OE=";
            };

            nativeBuildInputs = [
              nodejs
              pkgs.pnpmConfigHook
              pnpm
              pkgs.makeWrapper
            ];

            dontBuild = true;

            installPhase = ''
              runHook preInstall
              mkdir -p $out/lib/ps-todos/server $out/bin
              cp server.js package.json $out/lib/ps-todos/server/
              cp -r node_modules $out/lib/ps-todos/server/
              makeWrapper ${nodejs}/bin/node $out/bin/ps-todos-server \
                --add-flags "$out/lib/ps-todos/server/server.js"
              runHook postInstall
            '';
          });

          ps-todos = pkgs.symlinkJoin {
            name = "ps-todos";
            paths = [ frontend server ];
          };
        in
        {
          inherit frontend server ps-todos;
          default = ps-todos;
        });

      apps = eachSystem (system: {
        default = {
          type = "app";
          program = "${self.packages.${system}.default}/bin/ps-todos-server";
        };
      });

      nixosModules.default = { config, lib, pkgs, ... }:
        let
          cfg = config.services.ps-todos;
          publicConfig = pkgs.writeText "ps-todos-public-config.json" (builtins.toJSON (cfg.extraConfig // {
            inherit (cfg) port;
            application = "${cfg.package}/share/ps-todos/application";
            database = cfg.dataDir;
          }));
          runtimeConfig = "/run/ps-todos/config.json";
          writeRuntimeConfig = pkgs.writeShellScript "ps-todos-write-config" ''
            set -euo pipefail

            if [ ! -r "$1" ]; then
              echo "Dashboard config file is not readable: $1" >&2
              exit 1
            fi

            tmp="$(mktemp)"
            ${pkgs.jq}/bin/jq --slurp '.[0] * { dashboards: .[1] }' ${publicConfig} "$1" > "$tmp"
            install -m 0640 "$tmp" ${runtimeConfig}
            rm "$tmp"
          '';
        in
        {
          options.services.ps-todos = {
            enable = lib.mkEnableOption "ps-todos";

            package = lib.mkOption {
              type = lib.types.package;
              default = self.packages.${pkgs.stdenv.hostPlatform.system}.default;
              defaultText = lib.literalExpression "inputs.ps-todos.packages.\${pkgs.system}.default";
              description = "ps-todos package to run.";
            };

            user = lib.mkOption {
              type = lib.types.str;
              default = "ps-todos";
              description = "User account that runs the ps-todos service.";
            };

            group = lib.mkOption {
              type = lib.types.str;
              default = "ps-todos";
              description = "Group account that runs the ps-todos service.";
            };

            port = lib.mkOption {
              type = lib.types.port;
              default = 5000;
              description = "TCP port for the HTTP and WebSocket server.";
            };

            dataDir = lib.mkOption {
              type = lib.types.path;
              default = "/var/lib/ps-todos";
              description = "Directory used for Automerge document storage.";
            };

            dashboardsFile = lib.mkOption {
              type = lib.types.str;
              default = "${cfg.dataDir}/dashboards.json";
              example = "/run/credentials/ps-todos.service/dashboards.json";
              description = ''
                Path to a private JSON file containing the allowed dashboard
                Automerge URLs. The file must contain a JSON object such as:
                `{ "automerge:2ezdQGspSBhzs9BcfKkcbsiAsj9V": "personal" }`.

                This is intentionally read at service start instead of being
                written to the Nix store.
              '';
            };

            extraConfig = lib.mkOption {
              type = lib.types.attrs;
              default = { };
              description = "Additional non-secret JSON config passed to the ps-todos server.";
            };

            openFirewall = lib.mkOption {
              type = lib.types.bool;
              default = false;
              description = "Open the configured port in the firewall.";
            };
          };

          config = lib.mkIf cfg.enable {
            users.groups.${cfg.group} = { };
            users.users.${cfg.user} = {
              isSystemUser = true;
              group = cfg.group;
              home = cfg.dataDir;
            };

            systemd.tmpfiles.rules = [
              "d ${cfg.dataDir} 0750 ${cfg.user} ${cfg.group} -"
            ];

            systemd.services.ps-todos = {
              description = "ps-todos";
              after = [ "network.target" ];
              wantedBy = [ "multi-user.target" ];
              path = [ pkgs.jq ];
              serviceConfig = {
                ExecStartPre = "${writeRuntimeConfig} ${lib.escapeShellArg cfg.dashboardsFile}";
                ExecStart = "${cfg.package}/bin/ps-todos-server ${runtimeConfig} ${cfg.dataDir}";
                Restart = "on-failure";
                User = cfg.user;
                Group = cfg.group;
                WorkingDirectory = cfg.dataDir;
                RuntimeDirectory = "ps-todos";
                RuntimeDirectoryMode = "0750";
              };
            };

            networking.firewall.allowedTCPPorts = lib.mkIf cfg.openFirewall [ cfg.port ];
          };
        };
    };
}
