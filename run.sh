#!/bin/bash
export DISPLAY=:0
usr=$(who -s)
echo "usr=$usr"
if [[ -n $usr ]]; then
    IFS=' ' read -r -a usrA <<< "$usr"
    usr=${usrA[0]}
fi
echo "usr=$usr"
while [[ -z $usr ]]
  do
    sleep 3
    usr=$(who -s)
    echo "usrW1=$usr"
    if [[ -n $usr ]]; then
        IFS=' ' read -r -a usrA <<< "$usr"
        usr=${usrA[0]}
    fi
    echo "usrW2=$usr"
  done
echo "end $usr"
exec sudo -u $usr -g root /bin/sh - << eof
node .
