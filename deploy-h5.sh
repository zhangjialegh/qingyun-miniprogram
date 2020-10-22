#!/bin/bash

set -e
echo "+++++上传静态文件+++++"
scp -r dist/build/h5 root@123.57.1.92:/tmp
echo "+++++登录远程服务器+++++"
ssh root@123.57.1.92 <<EOF
cp -rf /tmp/h5 /srv/websecret-uni-app
rm -rf /tmp/h5

exit
EOF
echo "+++++部署完成+++++"