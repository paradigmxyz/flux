play:
    nix-env -iA nixpkgs.devenv
    devenv shell

docker:
    docker run -it --platform=linux/amd64 -v "$(pwd)":/plurigrid nixos/nix bash -c "cd /plurigrid;nix-shell"
