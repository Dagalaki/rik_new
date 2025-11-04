#!/bin/sh
TODAY=`date +"%d%b%Y"`
dst="/var/www/html/app-images/${TODAY}$1"
echo "Copying $1 to app-images"
if [ -e $1 ]
then
        scp $1 root@skai.smart-tv-data.com:$dst
else
        echo "File not found: $1"
fi

