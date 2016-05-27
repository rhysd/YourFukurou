#!/bin/bash

cat <<-EOS > ~/.dropbox_uploader
APPKEY=${DROPBOX_APPKEY}
APPSECRET=${DROPBOX_SECRET}
ACCESS_LEVEL=sandbox
OAUTH_ACCESS_TOKEN=${DROPBOX_ACCESS_TOKEN}
OAUTH_ACCESS_TOKEN_SECRET=${DROPBOX_ACCESS_TOKEN_SECRET}
EOS

curl "https://raw.githubusercontent.com/andreafabrizi/Dropbox-Uploader/master/dropbox_uploader.sh" -o dropbox_uploader.sh

for ss in `ls ./test/e2e/story/screenshot_*.png`; do
    bash dropbox_uploader.sh upload "${TRAVIS_REPO_SLUG}/${TRAVIS_JOB_ID}/${ss}"
done


