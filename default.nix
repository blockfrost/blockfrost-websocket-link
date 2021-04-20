{ pkgs ? import <nixpkgs> { } }:
rec {
  blockfrost-websocket-link =
  let
    src = pkgs.lib.cleanSource ./.;

    project = pkgs.callPackage ./yarn-project.nix {
      nodejs = pkgs.nodejs-14_x;
    } src;
  in project.overrideAttrs (oldAttrs: rec {

    name = "blockfrost-websocket-link";

    HOME = "/build";

    buildPhase = ''
      yarn build

      mkdir -p $out/bin
      cat <<EOF > $out/bin/${name}
      #!${pkgs.runtimeShell}
      ${pkgs.nodejs}/bin/node --require "$out/libexec/source/.pnp.cjs" $out/libexec/source/dist/src/server.js
      EOF
      chmod +x $out/bin/${name}
    '';

  });
}