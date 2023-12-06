{ pkgs ? import
    (builtins.fetchTarball {
      url = "https://github.com/NixOS/nixpkgs/archive/9790f3242da2152d5aa1976e3e4b8b414f4dd206.tar.gz";
      sha256 = "1y6zipys4803ckvnamfljb8raglgkbz1fz1fg03cxp4jqiiva5s1";
    })
    { }
}:
rec {
  blockfrost-websocket-link =
    let
      project = pkgs.callPackage ./yarn-project.nix
        {
          nodejs = pkgs.nodejs_20;
        }
        {
          src = pkgs.lib.cleanSource ./.;
        };
    in
    project.overrideAttrs (oldAttrs: rec {

      name = "blockfrost-websocket-link";

      HOME = "/build";

      buildPhase = ''
        yarn build

        mkdir -p $out/bin
        cat <<EOF > $out/bin/${name}
        #!${pkgs.runtimeShell}
        ${pkgs.nodejs_20}/bin/node --require "$out/libexec/source/.pnp.cjs" $out/libexec/source/dist/server.js
        EOF
        chmod +x $out/bin/${name}
      '';

    });
}
