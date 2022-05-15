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
    perenos=$'\x10';
    wDisStr="WaylandEnable = false$perenos";
    while IFS= read -r line
    do
      if [[ "$line" == *"WaylandEnable"* ]]; then
        line=$wDisStr;
        prSearch=true;
      fi
      daemonConfVal="${daemonConfVal}$line";
    done < "$dirDaemonConf"
    if [ "$prSearch" = false ] ; then
      daemonConfVal="${daemonConfVal}$wDisStr";
    fi
    echo "$daemonConfVal" > "$dirDaemonConf";
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
