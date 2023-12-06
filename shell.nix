{}:
let
  # Pin the deployment package-set to a specific version of nixpkgs
  pkgs = import
    (builtins.fetchTarball {
      url = "https://github.com/NixOS/nixpkgs/archive/9790f3242da2152d5aa1976e3e4b8b414f4dd206.tar.gz";
      sha256 = "1y6zipys4803ckvnamfljb8raglgkbz1fz1fg03cxp4jqiiva5s1";
    })
    { };

in
with pkgs;

stdenv.mkDerivation {
  name = "blockfrost-websocket-link";
  buildInputs = [
    nodejs_20
    (yarn.override { nodejs = nodejs_20; })
  ];

  shellHook = ''
    yarn
  '';
}
