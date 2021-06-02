#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

IMAGE_TAG=${IMAGE_TAG:-latest}
IMAGE_REPOSITORY=${IMAGE_REPOSITORY:-quay.io/evanshortiss/shipwars-visualisations}

cd ${DIR}/..
rm -rf .parcel-cache
rm -rf ./dist

npm install
npm run build

# Copy nginx conf into the build dir. Enables GZIP compression
cp nginx.conf ./dist/nginx.conf

# Use the local build/ folder as the source
s2i build ./dist registry.access.redhat.com/ubi8/nginx-118 ${IMAGE_REPOSITORY}:${IMAGE_TAG}
