#!/bin/bash

# Check if there are any changes
if [[ -z $(git status -s) ]]; then
    echo "No changes to commit."
    exit 0
fi

# Add all changes
git add .

# Commit changes
git commit -m "Finalize deployment configuration for DigitalOcean"

# Push to GitHub
git push origin main

echo "Changes have been committed and pushed to GitHub."