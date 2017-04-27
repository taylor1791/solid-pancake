#!/bin/bash -e

rev=$(git rev-parse --short HEAD)

pushd client
yarn build
cp -R assets/* dist/
pushd dist

git config --global user.name "Travis CI"
git config --global user.email "$COMMIT_AUTHOR_EMAIL"
git init

git add .
git commit -m "Auto-deploy GitHub pages: $rev"

git push --force --quiet "https://$GH_TOKEN@github.com/$TRAVIS_REPO_SLUG" master:gh-pages
