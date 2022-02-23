{
  pkgs ? import
    (builtins.fetchTarball {
      url = "https://github.com/NixOS/nixpkgs/archive/9fe53aefc9eece8c3deba9da68d47539100a3360.tar.gz";
      sha256 = "0vzjj0n6xqs2asc0769q0abj1xs3b0s3hqb4almmdr6cp1fgdpp1";
    })
    { }
}:
rec {
  blockfrost-websocket-link =
  let
    project = pkgs.callPackage ./yarn-project.nix {
      nodejs = pkgs.nodejs-16_x;
    }{
      src = pkgs.lib.cleanSource ./.;
    };
  in project.overrideAttrs (oldAttrs: rec {

    name = "blockfrost-websocket-link";

    HOME = "/build";

    buildPhase = ''
      yarn build

      mkdir -p $out/bin
      cat <<EOF > $out/bin/${name}
      #!${pkgs.runtimeShell}
      ${pkgs.nodejs-16_x}/bin/node --require "$out/libexec/source/.pnp.cjs" $out/libexec/source/dist/src/server.js
      EOF
      chmod +x $out/bin/${name}
    '';

  });
}
