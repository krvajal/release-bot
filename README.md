## GEt Gihub certificate

```
openssl s_client -showcerts -connect api.github.com:443 < /dev/null | openssl x509 -outform PEM > github.crt
```
