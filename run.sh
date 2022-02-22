#!/bin/bash
export DISPLAY=:0
usr=$(who -s)
echo "usrBeg: $usr"
if [[ -n $usr ]]; then
    IFS=$'\n'; usrAcount=($usr); unset IFS;
    while [[ ${#usrAcount[*]}>1 ]]
      do
        echo "reading kill"
        sleep 3
        usr=$(who -s)
        IFS=$'\n'; usrAcount=($usr); unset IFS;
      done
    IFS=' ' read -r -a usrA <<< "$usr"
    usr=${usrA[0]}
else
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
fi
echo "pre exex user: $usr"
exec sudo -u $usr -g root /bin/sh - << eof
node .
