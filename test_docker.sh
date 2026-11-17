#!/bin/bash
# A script to test the build locally before submitting.

# Revert package.json changes
git restore package.json

# Check if there are mismatched versions in package.json and pnpm-lock.yaml
echo "package.json dependencies:"
grep "react-router-dom" package.json
grep "vite" package.json

echo "pnpm-lock.yaml dependencies:"
grep -A 1 "react-router-dom:" pnpm-lock.yaml | grep version || grep "react-router-dom:" pnpm-lock.yaml -A 1
grep "vite:" pnpm-lock.yaml -A 1 | grep version || grep "vite:" pnpm-lock.yaml -A 1

# I will align package.json to the lockfile versions
sed -i 's/"react-router-dom": "\^6.30.3"/"react-router-dom": "\^6.30.1"/g' package.json
sed -i 's/"vite": "\^8.0.10"/"vite": "\^5.4.19"/g' package.json
