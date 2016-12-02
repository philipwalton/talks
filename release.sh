# Create a tempory directory and
# checkout the existing gh-pages branch.
rm -rf ./.tmp
mkdir ./.tmp
cd ./.tmp
git init
git remote add origin git@github.com:philipwalton/talks.git
git pull origin gh-pages

# Delete all the existing files and add
# the new ones from the parent directory.
rm -rf *
cp -rf ../* ./
rm -rf ./*/node_modules
git add -A

# Commit and push the changes to
# the gh-pages branch.
git commit -m 'Deploy talks'
git branch -m gh-pages
git push origin gh-pages

# Clean up.
cd ..
rm -rf ./.tmp
