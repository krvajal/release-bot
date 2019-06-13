#!/bin/bash

number=$RANDOM

git checkout master
git pull
git checkout -b feature/$number
echo "Feature $number" >> $number.txt
git add $number.txt
git commit -m "Implement feature $number"
git push --set-upstream origin feature/$number
hub pull-request -m "Feature $number"
git checkout master
