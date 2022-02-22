#!/bin/bash
usr=$(who -s)
echo "usrBeg: $usr"
usrFull=$usr;
if [[ -n $usr ]]; then
    IFS=$'\n'; usrAcount=($usr); unset IFS;
    while [[ ${#usrAcount[*]}>1 ]]
      do
        echo "reading kill"
        sleep 3
        usr=$(who -s)
        usrFull=$usr;
        IFS=$'\n'; usrAcount=($usr); unset IFS;
      done
    IFS=' ' read -r -a usrA <<< "$usr"
    usr=${usrA[0]}
else
  while [[ -z $usr ]]
    do
      sleep 3
      usr=$(who -s)
      usrFull=$usr;
      echo "usrW1=$usr"
      if [[ -n $usr ]]; then
          IFS=' ' read -r -a usrA <<< "$usr"
          usr=${usrA[0]}
      fi
      echo "usrW2=$usr"
    done
fi
echo "pre exex user: $usr"
IFS=':'; usrD=($usrFull); unset IFS;
IFS=' ' read -r -a dispE <<< "${usrD[1]}"
echo "DISPLAY=${dispE[0]}"
export DISPLAY=:${dispE[0]}
exec sudo -u $usr -g root /bin/sh - << eof
node .
