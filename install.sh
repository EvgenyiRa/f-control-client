#!/bin/bash
#установка node.js, git
#получаем тип ОС
osID=$(grep ^ID= /etc/os-release);
osID=${osID/"ID="/""};
echo "osID=$osID";
case $osID in
  ubuntu)
    echo "yes ubuntu!"
    ;;
  *)
    #
    ;;
esac

#скачиваем проект

#устанавливаем группу root на папку и добавляем права группе

#создаем задание для демона
