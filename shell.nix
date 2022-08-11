with import <nixpkgs> { };

stdenv.mkDerivation {
  name = "blockfrost-websocket-link";
  buildInputs = [
    nodejs-18_x
    (yarn.override { nodejs = nodejs-18_x; })
  ];

  shellHook = ''
    yarn
  '';
}
