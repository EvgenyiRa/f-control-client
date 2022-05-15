#!/bin/bash
usr=$(who -s)
echo "usrBeg: $usr"
usrFull=$usr;
function searchUsr {
  if [[ -n $usr ]]; then
      #IFS=$'\n'; usrAcount=($usr); unset IFS;
      countUsr=$(echo "$usr"|wc -l);
      echo "countUsr=$countUsr";
      if [ $countUsr -gt 1 ]; then
        #ищем подходящего пользователя
        #пользователь должен быть только один
        #но команда who может вернуть несколько вариантов одного и того же пользователя
        #echo "for uaOne in";
        while read line
        do
          #echo "usr=$usr"
          IFS=' ' read -r -a usrA <<< "$line";
          if [[ "${usrA[1]}" == *":"* ]]; then
            usr=$line;
            usrFull=$line;
            break;
          fi
        done <<< "$usr"
      fi

      IFS=' ' read -r -a usrA <<< "$usr"
      usr=${usrA[0]};
      echo "pre exex user: $usr"
      IFS=':'; usrD=($usrFull); unset IFS;
      IFS=' ' read -r -a dispE <<< "${usrD[1]}"
      echo "DISPLAY=${dispE[0]}"
      export DISPLAY=:${dispE[0]}
      exec sudo -u $usr -g root node .
  fi
}
if [[ -n $usr ]]; then
  searchUsr;
else
  while [[ -z $usr ]]
    do
      sleep 3
      usr=$(who -s)
      usrFull=$usr;
      #echo "usrW1=$usr"
      searchUsr;
      #echo "usrW2=$usr"
    done
fi
