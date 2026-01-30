#! /usr/bin/env bash
docker build \
	--tag onquadro-frontend:$(git describe --all --tags --contains | tr -c '[0-9A-Za-z_.]' - | tr -s - | sed -e 's/^-//g' -e 's/-$//g') \
	--tag onquadro-frontend:latest \
	.
