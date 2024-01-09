{}:
let
  # Pin the deployment package-set to a specific version of nixpkgs
  pkgs = import
    (builtins.fetchTarball {
      url = "https://github.com/NixOS/nixpkgs/archive/933d7dc155096e7575d207be6fb7792bc9f34f6d.tar.gz";
      sha256 = "1gcqpm7v42wfmq0wrl4dym9kg4y7n4f5wsgvisq52zr90vjvylwx";
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
