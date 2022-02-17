#!/bin/bash
export DISPLAY=:0
userstr=$(last -1)
IFS=' ' read -r -a usera <<< "$userstr"
exec sudo -u ${usera[0]} -g root /bin/sh - << eof
node .
