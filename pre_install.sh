#!/bin/bash
#установка node.js, git
#получаем тип ОС
osID=$(grep ^ID= /etc/os-release);
osID=${osID/"ID="/""};
echo "osID=$osID";
case $osID in
  ubuntu)
    #echo "yes ubuntu!"
    #удаляем firefox
    apt-get purge firefox
    snap remove --purge firefox
    #устанавливаем chrome
    wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
    sudo dpkg -i --force-depends google-chrome-stable_current_amd64.deb
    
    #отключаем wayland и перезапускаем графику
    daemonConfVal="";
    prSearch=false;
    dirDaemonConf="/etc/gdm3/daemon.conf";
    dirСustomConf="/etc/gdm3/custom.conf";
    perenos="\n";
    wDisStr="WaylandEnable = false";

    while IFS= read -r line
    do
      if [[ "$line" == *"WaylandEnable"* ]]; then
        line=$wDisStr;
        prSearch=true;
      fi
      daemonConfVal="${daemonConfVal}${perenos}$line";
    done < "$dirDaemonConf"
    if [ "$prSearch" = false ] ; then
      daemonConfVal="${daemonConfVal}$wDisStr";
    fi
    echo -e "$daemonConfVal" > "$dirDaemonConf";

    daemonConfVal="";
    prSearch=false;
    while IFS= read -r line
    do
      if [[ "$line" == *"WaylandEnable"* ]]; then
        line=$wDisStr;
        prSearch=true;
      fi
      daemonConfVal="${daemonConfVal}${perenos}$line";
    done < "$dirСustomConf"
    if [ "$prSearch" = false ] ; then
      daemonConfVal="${daemonConfVal}$wDisStr";
    fi
    echo -e "$daemonConfVal" > "$dirСustomConf";

    if [ "$XDG_SESSION_TYPE" != "x11" ]; then
        service gdm3 restart;
    fi
  ;;
  debian)

  ;;
  *)
    #
  ;;
esac
