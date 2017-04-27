#!/bin/bash -e

rev=$(git rev-parse --short HEAD)

pushd client
yarn --production
yarn build
cp -R assets/* dist/
pushd dist

git init

git config user.name "Travis CI"
git config user.email "$COMMIT_AUTHOR_EMAIL"

git add .
git commit -m "Auto-deploy GitHub pages: $rev"

git push --force --quiet "https://$GH_TOKEN@github.com/$TRAVIS_REPO_SLUG" master:gh-pages
