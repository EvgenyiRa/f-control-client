#!/bin/bash
export DISPLAY=:0
exec sudo -u root -g root /bin/sh - << eof
node .
