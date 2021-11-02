with import <nixpkgs> {};

stdenv.mkDerivation {
  name = "blockfrost-websocket-link";
  buildInputs = [
    nodejs-16_x
    (yarn.override { nodejs = nodejs-16_x; })
  ];
}
