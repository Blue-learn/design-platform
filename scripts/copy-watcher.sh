#!/usr/bin/env sh

# Trigger on rebuild of lib
# Copy to BlueLearn App ->  only for dev use
APP_PATH="../bluelearn-app/node_modules/@blue-learn/platform"
[ -d $APP_PATH ] && cp -R $1 $APP_PATH/$1 && echo "👉 Watcher Copy @blue-learn/platform -> BlueLearn-App ✅ "
