profile=.bash_profile
folder=$HOME/local
version=rhel80-4.2.1
file=mongodb-linux-x86_64-$version
port=48018

curl -O https://fastdl.mongodb.org/linux/$file.tgz
tar -xf $file.tgz
mv $file $HOME/local/mongo
echo "PATH=\$PATH:\$HOME/local/mongo/bin" >> $profile
. ~/$profile
echo "Mongodb setup done"

mkdir -p ~/config/mongo
mkdir -p ~/data/mongo
mkdir -p ~/log/mongo

mongod --config /home/dev/fa/platform/dev/config/mongo/mongo.dev.yaml

################# MANUAL STEPS ##################
# Test connection
mongo mongodb://127.0.0.1:$port/test
mongo mongodb://127.0.0.1:$port/admin --eval 'db.createUser(
  {
    user: "admin",
    pwd: "g7FBe2NpCi9LRjWTZgECgMUo3jo4bBpl",
    roles: [ { role: "root", db: "admin" } ]
  }
)'
mongo mongodb://127.0.0.1:$port/admin --eval 'db.createUser(
  {
    user: "fas",
    pwd: "fas2019",
    roles: [ { role: "readWriteAnyDatabase", db: "admin" } ]
  }
)'

# Enable security.authorization: "enabled"

# Open port in cloud and firewall
firewall-cmd --zone=public --add-port $port/tcp --permanent
firewall-cmd --reload
