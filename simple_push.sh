#! /bin/bash

# make sure in develop branch
git checkout develop

# push dev to remote
git add . && git commit -m "update" && git push origin develop:develop

# compile katex-cli
if [ ! -f .katex/release/katex_cli ]; then
    echo "katex_cli not found, building..."
    cargo build --release --target-dir .katex
fi
# make sure katex_cli is here
cp .katex/release/katex_cli katex_cli

# build site
stack build --ghc-options=-O2
stack exec chaosite build

# build index
python3 pub.py > _site/index.html

# develop to master
git checkout master
rsync -a --checksum --filter='P _site/' --filter='P _cache/' --filter='P .git/' --filter='P .stack-work/' --filter='P .gitignore' --filter='P .gitattributes' --delete-excluded _site/ .
rm -r drafts

# push master to remote
touch .nojekyll
git add . && git commit -m "update" && git push origin master:master

# return to develop branch
git checkout develop

