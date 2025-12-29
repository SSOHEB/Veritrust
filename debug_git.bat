@echo off
echo --- STATUS --- > git_debug.txt
git status >> git_debug.txt
echo --- BRANCH --- >> git_debug.txt
git branch -vv >> git_debug.txt
echo --- REMOTE --- >> git_debug.txt
git remote -v >> git_debug.txt
echo --- DIFF README --- >> git_debug.txt
git diff README.md >> git_debug.txt
echo --- LOG README --- >> git_debug.txt
git log -n 1 README.md >> git_debug.txt
echo DONE >> git_debug.txt
