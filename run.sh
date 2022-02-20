#!/bin/bash
export DISPLAY=:0
exec sudo -u ra -g root /bin/sh - << eof
node .
