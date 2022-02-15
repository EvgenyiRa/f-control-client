#!/bin/bash
export DISPLAY=:0
cd /var/www/nodejs/f-control-client
exec sudo -u test_ra -g root /bin/sh - << eof
node .
