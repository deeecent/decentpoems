#!/usr/bin/env bash

pnpm build --mode production
cp ./dist/index.html ./dist/faq.html
rm -rf ../../www-decentpoems/*
cp -r ./dist/* ../../www-decentpoems
cd ../../www-decentpoems
git add .
git commit -m 'bump'
git push -f