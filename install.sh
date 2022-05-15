#!/bin/bash
#установка node.js, git
#получаем тип ОС
osID=$(grep ^ID= /etc/os-release);
osID=${osID/"ID="/""};
echo "osID=$osID";
case $osID in
  ubuntu)
    #echo "yes ubuntu!"
    apt install curl;
    curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -;
    apt-get install -y nodejs;
    apt install git;
  ;;
  debian)
    apt install curl;
    curl -fsSL https://deb.nodesource.com/setup_16.x | bash -;
    apt-get install -y nodejs;
    apt install git;
  ;;
  *)
    #
  ;;
esac
npm install -g npm@8;

#создаем папку проекта
dirProject="/opt/f-control";
fccName="f-control-client";
fccChName="f-control-client-ch";
gitUrl="https://github.com/EvgenyiRa/";
mkdir -p $dirProject;
#скачиваем проекты
git clone "$gitUrl$fccName.git" "$dirProject/$fccName";
cd "$dirProject/$fccName";
npm install;
npm audit fix;
git clone "$gitUrl$fccChName.git" "$dirProject/$fccChName";

#получаем текущего пользователя
usr=$(who -s);
countUsr=$(echo "$usr"|wc -l);
if [ $countUsr -gt 1 ]; then
  while read line
  do
    #echo "usr=$usr"
    IFS=' ' read -r -a usrA <<< "$line";
    if [[ "${usrA[1]}" == *":"* ]]; then
      usr=$line;
      usrFull=$line;
      break;
    fi
  done <<< "$usr";
fi
IFS=' ' read -r -a usrA <<< "$usr"
usr=${usrA[0]}
#устанавливаем группу root на папку и добавляем права группе
chown -R $usr:root "$dirProject/$fccName";
chmod -R 771 "$dirProject/$fccName"
chmod ugo+x "$dirProject/$fccName/run.sh"

#создаем задание для демона
serviceVal=$(cat "$dirProject/$fccName/$fccName.service.template");
serviceVal=${serviceVal//\{currentPath\}/"$dirProject/$fccName"};
echo "$serviceVal" > "/etc/systemd/system/$fccName.service";
systemctl start "$fccName.service";

#установливаем принудительно расширение для chrome с блокированием режима Инкогнито
chManage="managed_policies.json";
dirChManage="/etc/opt/chrome/policies/managed";
mkdir -p $dirChManage;
cp -f "$dirProject/$fccName/$chManage" "$dirChManage/$chManage"
