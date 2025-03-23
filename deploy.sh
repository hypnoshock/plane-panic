#!/bin/bash
rsync -av dist/ ~/Projects/jimmy/hypnoshock.github.io/plane-panic
cd ~/Projects/jimmy/hypnoshock.github.io/plane-panic
git add -A
git commit -m "update to plane-panic"
git push 