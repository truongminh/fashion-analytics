folder=$HOME/local
mkdir $folder
profile=.bash_profile
version=v12.13.0

curl https://nodejs.org/dist/$version/node-$version-linux-x64.tar.xz -O
tar -xvf node-$version-linux-x64.tar.xz
mv node-$version-linux-x64 $folder/node
rm node-$version-linux-x64.tar.xz
echo "PATH=\$PATH:\$HOME/local/node/bin" >> $profile
. ~/$profile
npm i -g pm2@latest
echo "NodeJS setup done"
