play:
    npm run dev

docker:
    docker run -it --platform=linux/amd64 -v "$(pwd)":/plurigrid nixos/nix bash -c "cd /plurigrid; sleep 5"
    nix-env -iA cachix -f https://cachix.org/api/v1/install
    cachix use devenv
    nix-env -if https://github.com/cachix/devenv/tarball/latest
    devenv shell


shell:
	devenv shell
