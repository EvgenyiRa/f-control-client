#!/bin/bash
usr=$(who -s)
echo "usrBeg: $usr"
usrFull=$usr;
function killWaste {
  usrFull=$usr;
  if [[ -n $usr ]]; then
      IFS=$'\n'; usrAcount=($usr); unset IFS;
      while [[ ${#usrAcount[*]}>1 ]]
        do
          #в живых должен остаться только один!
          IFS=' ' read -r -a usrA <<< "${usrAcount[0]}";
          killall -w -u ${usrA[0]};
          #echo "killall -w -u ${usrA[0]};"
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
}
killWaste;
usrRun=$usr;
nodePID=-777;
function runNode {
  usrRun=$usr;
  echo "pre exex user: $usrRun"
  IFS=':'; usrD=($usrFull); unset IFS;
  IFS=' ' read -r -a dispE <<< "${usrD[1]}"
  echo "DISPLAY=${dispE[0]}"
  export DISPLAY=:${dispE[0]}
  sudo -u $usrRun -g root /bin/sh node . &
  nodePID=$!;
  echo "nodePID: $nodePID"
  #echo "sudo -u $usrRun -g root /bin/sh node ."
}
runNode;
#мониторим кол-во пользователей
#всегда оставляем последнего
while true ; do
  usr=$(who -s)
  killWaste;
  if [ "$usr" != "$usrRun" ]; then
    runNode;
  else
    #проверяем наличие процесса
    psRes=$(ps -p $nodePID);
    IFS=$'\n'; psResCount=($psRes); unset IFS;
    if [ ${#psResCount[*]} -eq 1 ]; then
      #если упал, поднимаем
      runNode;
    fi
  fi
  sleep 10;
done
