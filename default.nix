{ pkgs ? import
    (builtins.fetchTarball {
      url = "https://github.com/NixOS/nixpkgs/archive/45c9736ed69800a6ff2164fb4538c9e40dad25d6.tar.gz";
      sha256 = "0q84mvh4liacqv8fdxpkm28233mfm5x1s36wwxhwdq01jivk58xn";
    })
    { }
}:
with pkgs;
rec {
  blockfrost-websocket-link =
    let
      project = pkgs.callPackage ./yarn-project.nix
        {
          nodejs = pkgs.nodejs-16_x;
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
        echo "Starting ${name} ...";
        ${nodePackages.pm2}/bin/pm2 delete all; \
          ${nodePackages.pm2}/bin/pm2 start \
          $out/libexec/source/dist/src/server.js \
          --interpreter=${nodejs-16_x}/bin/node --node-args="--require $out/libexec/source/.pnp.cjs --max-http-header-size=32768" \
          --max-memory-restart 1500M \
          -i max --time --no-daemon
        EOF
        chmod +x $out/bin/${name}
      '';

    });
}
