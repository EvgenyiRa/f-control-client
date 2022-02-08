#!/bin/bash
export DISPLAY=:0
cd /var/www/nodejs/f-control-client
exec sudo -u ra /bin/sh - << eof
node .
