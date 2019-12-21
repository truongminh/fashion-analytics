
## Install certbot
```sh
curl -O https://dl.eff.org/certbot-auto
mv certbot-auto /usr/local/bin/certbot-auto
chown root /usr/local/bin/certbot-auto
chmod 0755 /usr/local/bin/certbot-auto
/usr/local/bin/certbot-auto certonly --standalone
```
Enter domains 
`example.com`

Combine `fullchain.pem` and `privkey.pem` into one file.
SSL Termination: https://www.haproxy.com/blog/haproxy-ssl-termination/
This certificate should contain both the public certificate and private key.
```
mkdir -p /etc/haproxy/certs
DOMAIN='example.com' sudo -E bash -c 'cat /etc/letsencrypt/live/$DOMAIN/fullchain.pem /etc/letsencrypt/live/$DOMAIN/privkey.pem > /etc/haproxy/certs/$DOMAIN.pem'
```


## Install keepalived
`yum install -y keepalived`
`vim /etc/keepalived/keepalived.conf`

```conf
# /etc/keepalived/keepalived.conf
vrrp_script chk_haproxy {
  script "killall -0 haproxy" # check the haproxy process
  interval 2 # every 2 seconds
  weight 2 # add 2 points if OK
}

vrrp_instance VI_1 {
  interface eth0 # interface to monitor
  state MASTER # MASTER on haproxy, BACKUP on haproxy2
  virtual_router_id 51
  priority 101 # 101 on haproxy, 100 on haproxy2
  virtual_ipaddress {
    192.168.0.100 # virtual ip address
  }
  track_script {
    chk_haproxy
  }
}
```

## Install haproxy
`yum install haproxy`

**HTTP**
`vim /etc/firewalld/services/haproxy-http.xml`

```xml
<!-- /etc/firewalld/services/haproxy-http.xml -->
<?xml version="1.0" encoding="utf-8"?>
<service>
<short>HAProxy-HTTP</short>
<description>HAProxy load-balancer</description>
<port protocol="tcp" port="80"/>
</service>
```
```sh
cd /etc/firewalld/services
restorecon haproxy-http.xml
chmod 640 haproxy-http.xml
```

**HTTPS**
`vim /etc/firewalld/services/haproxy-https.xml`

```xml
<!-- /etc/firewalld/services/haproxy-https.xml -->
<?xml version="1.0" encoding="utf-8"?>
<service>
<short>HAProxy-HTTPS</short>
<description>HAProxy load-balancer</description>
<port protocol="tcp" port="443"/>
</service>
```
```sh
cd /etc/firewalld/services
restorecon haproxy-https.xml
chmod 640 haproxy-https.xml
```

## Open port
Note: view cloud provider open port policy before continue

```sh
firewall-cmd --zone=public --add-port 80/tcp --permanent
firewall-cmd --reload

firewall-cmd --zone=public --add-port 443/tcp --permanent
firewall-cmd --reload
```

## Configure

`vim /etc/haproxy/haproxy.cfg`

```cfg
frontend http_web *:80
    mode http
    default_backend rgw

frontend rgw­-https
  bind <insert vip ipv4>:443 ssl crt /etc/ssl/private/example.com.pem
  default_backend rgw

backend rgw
    balance roundrobin
    mode http
    server  rgw1 10.0.0.71:80 check
    server  rgw2 10.0.0.80:80 check
```
```sh
systemctl enable haproxy
systemctl start haproxy
```
