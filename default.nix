{ pkgs ? import
    (builtins.fetchTarball {
      url = "https://github.com/NixOS/nixpkgs/archive/933d7dc155096e7575d207be6fb7792bc9f34f6d.tar.gz";
      sha256 = "1gcqpm7v42wfmq0wrl4dym9kg4y7n4f5wsgvisq52zr90vjvylwx";
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
