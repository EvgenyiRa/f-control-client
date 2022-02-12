#!/bin/bash
export DISPLAY=:0
cd /var/www/nodejs/f-control-client
exec sudo -u $(whoami) /bin/sh - << eof
node .
