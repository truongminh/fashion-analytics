folder=$HOME/local
mkdir $folder
profile=.bash_profile
version=1.12.14
filename=go$version.linux-amd64

curl https://dl.google.com/go/$filename.tar.gz -O
tar -xvf $filename.tar.gz
mv go $folder/go
rm $filename.tar.gz
echo "PATH=\$PATH:\$HOME/local/go/bin" >> $profile
. ~/$profile

