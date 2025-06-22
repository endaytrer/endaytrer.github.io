#!/bin/bash

# =============================================================================
#
#           AUTOMATED BUILD & DEPLOYMENT SCRIPT
#
# This script automates the process of building a web project and deploying
# the output to a separate, clean branch. It also pushes the latest
# source code.
#
# WHAT IT DOES:
# 1. Checks that you are on the correct source branch and have no pending changes.
# 2. Pushes the latest commits on your source branch to the remote repository.
# 3. Runs the `npm run build` command to generate production-ready assets.
# 4. Commits the contents of the build folder (e.g., `dist`) to the deployment
#    branch, overwriting its history for a clean deployment.
# 5. Cleans up the build folder.
#
# HOW TO USE:
# 1. Save this script as `deploy.sh` in the root of your project.
# 2. Make it executable by running: `chmod +x deploy.sh`
# 3. Customize the variables in the "Configuration" section below.
# 4. Run the script from your terminal: `./deploy.sh`
#
# =============================================================================

# --- Script Configuration ---

# Set the branch you are working on. The script will push this branch.
SOURCE_BRANCH="danielgu"

# Set the branch to deploy the build output to.
# Common names are `gh-pages` (for GitHub Pages), `prod`, or `deployment`.
DEPLOY_BRANCH="deployment"

# Set the folder that contains your build output.
BUILD_FOLDER="dist"

# --- End of Configuration ---


# Exit immediately if a command exits with a non-zero status.
set -e

echo "🚀 Starting deployment from '$SOURCE_BRANCH' to '$DEPLOY_BRANCH'..."

# --- Pre-flight Checks ---

# 1. Check if we are on the correct source branch.
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$SOURCE_BRANCH" ]; then
  echo "❌ Error: You are on branch '$CURRENT_BRANCH', but this script is configured to deploy from '$SOURCE_BRANCH'."
  echo "Please switch to the '$SOURCE_BRANCH' branch and commit your changes before running this script."
  exit 1
fi

# 2. Check for uncommitted changes in the source branch.
if ! git diff-index --quiet HEAD --; then
  echo "❌ Error: Your working directory is not clean. Please commit or stash your changes before deploying."
  exit 1
fi

echo "✅ Pre-flight checks passed."

# --- Step 1: Push Source Code ---
echo "🔄 Pushing latest commits on '$SOURCE_BRANCH' to remote..."
git push origin $SOURCE_BRANCH

# --- Step 2: Build the Project ---
echo "📦 Running the build command ('npm run build')..."
npm run build
cd mkcontent && cargo run --release

# Check if the build folder exists after the build command.
if [ ! -d "$BUILD_FOLDER" ]; then
  echo "❌ Error: Build folder '$BUILD_FOLDER' not found. The 'npm run build' process may have failed."
  exit 1
fi

# --- Step 3: Deploy Build Folder to the Deployment Branch ---
echo "🚚 Deploying '$BUILD_FOLDER' to the '$DEPLOY_BRANCH' branch..."

# Navigate into the build output directory.
cd $BUILD_FOLDER

# Initialize a new temporary Git repository inside the build folder.
# The output is redirected to /dev/null to keep the console clean.
git init > /dev/null


# Create the deployment commit.
git add .
# The output is redirected to /dev/null to keep the console clean.
git commit -m "Deploy: $(date +"%Y-%m-%d %H:%M:%S")" > /dev/null

# Get the remote repository URL from the parent repository.
REMOTE_URL=$(cd .. && git config --get remote.origin.url)
if [ -z "$REMOTE_URL" ]; then
  echo "❌ Error: Could not find remote 'origin' URL in the parent repository."
  # Clean up before exiting
  cd ..
  rm -rf $BUILD_FOLDER
  exit 1
fi

# Force push from the temporary repo's `main` branch to the remote `deployment` branch.
# This creates the deployment branch if it doesn't exist and overwrites its history.
# The output is redirected to hide noisy git output about the push.
git push --force "$REMOTE_URL" main:$DEPLOY_BRANCH > /dev/null 2>&1

# --- Step 4: Clean Up ---
# Navigate back to the project root and remove the build folder.
cd ..
rm -rf $BUILD_FOLDER

# --- All Done! ---
echo "🎉 Deployment successful!"
echo "✅ Your latest changes have been pushed to the '$SOURCE_BRANCH' branch."
echo "✅ The contents of '$BUILD_FOLDER' have been deployed to the '$DEPLOY_BRANCH' branch."
