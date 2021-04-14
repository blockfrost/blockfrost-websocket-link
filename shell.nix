with import <nixpkgs> {};

stdenv.mkDerivation {
  name = "blockfrost-websocket-link";
  buildInputs = [
    nodejs-14_x
    (yarn.override { nodejs = nodejs-14_x; })
  ];
}
