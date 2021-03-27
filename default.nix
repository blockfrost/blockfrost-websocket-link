{ pkgs ? import <nixpkgs> { } }:
let
  src = pkgs.lib.cleanSource ./.;

  project = pkgs.callPackage ./yarn-project.nix {
    nodejs = pkgs.nodejs-14_x;
  } src;
in project.overrideAttrs (oldAttrs: rec {

  name = "blockfrost-websocket-link";

  buildPhase = ''
    yarn build

    mkdir -p $out/bin
    cat <<EOF > $out/bin/${name}
    #!${pkgs.runtimeShell}
    ${pkgs.nodejs}/bin/node $out/libexec/source/packages/websocket-server/dist/server.js
    EOF
    chmod +x $out/bin/${name}

    mkdir -p $out/share/${name}
    cp -rv packages/ui/dist/* $out/share/${name}
  '';

})
