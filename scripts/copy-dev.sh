BUILD_PATH="lib"
echo "Copy @blue-learn/platform ⏳ "

# 1.Copy to BlueLearn App ->  only for dev use
APP_PATH="../bluelearn-app/node_modules/@blue-learn/platform"


[ -d $APP_PATH ] && rm -rf $APP_PATH/"lib" && echo "👉 Clear -> $APP_PATH/lib ✅ "
mkdir -p $APP_PATH/"lib" && echo "👉 Link -> $APP_PATH/lib ✅ " #&& cd .. #uncomment when run local
[ -d $APP_PATH ] && cp -R $BUILD_PATH $APP_PATH && echo "👉 Copy @blue-learn/platform -> BlueLearn-App ✅ "


NO_CODE_PATH="../no-code-platform/node_modules/@blue-learn/platform"
[ -d $NO_CODE_PATH ] && rm -rf $NO_CODE_PATH/"lib" && echo "👉 Clear -> $NO_CODE_PATH/lib ✅ "
mkdir -p $NO_CODE_PATH/"lib" && echo "👉 Link -> $NO_CODE_PATH/lib ✅ " #&& cd .. #uncomment when run local
[ -d $NO_CODE_PATH ] && cp -R $BUILD_PATH $NO_CODE_PATH && echo "👉 Copy @blue-learn/platform -> NO_CODE_PATH ✅ "
