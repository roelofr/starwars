# Star Wars

[![Build status][shield-build]][link-build]
[![PHP 5.6+][shield-php5]][php]
[![AGPL-3.0 license][shield-license]][license]

This is the project for [gaanwealnaarstarwars.nl][sw].

It's dumb, I know.

## License

[Affero General Public License v3][license]. Background photo's are from Google.
See #1.

## Installing

Requires [NPM][nodejs] and [Grunt][grunt] to be installed.

```shell
npm install
grunt prod
```

## Developing

Developing is the same, but you can keep watch on your code.

```shell
npm install
grunt dev watch
```

## Configuring nginx

Just point the users to the `index.php` file. An example is provided below.

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name example.com;

    # Security
    add_header X-Frame-Options              deny;
    add_header X-Content-Type-Options       nosniff;
    add_header Strict-Transport-Security    max-age=31536000;

    # CSP
    add_header Content-Security-Policy      "default-src 'none'; script-src 'self' https://ajax.googleapis.com https://maxcdn.bootstrapcdn.com; style-src 'self' https://maxcdn.bootstrapcdn.com; img-src 'self'";

    root /usr/share/nginx/starwars;
    index index.php;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    gzip on;
    gzip_proxied any;

    location ~ /\. {
        deny all;
    }

    location / {
        try_files $uri $uri/ /index.php;
    }

    location ~ [^/]\.php(/|$) {
        fastcgi_split_path_info ^(.+?\.php)(/.*)$;

        if (!-f $document_root$fastcgi_script_name) {
            return 404;
        }

        include fastcgi_params;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_pass unix:/var/run/php7.0-fpm.sock;
    }
}
```

## Configuring Apache

Eh.

<!-- Shield images -->
[shield-build]: https://img.shields.io/travis/roelofr/starwars.svg
[shield-license]: https://img.shields.io/github/license/roelofr/starwars.svg
[shield-php5]: https://img.shields.io/badge/PHP-5.6%2B-8892BF.svg

<!-- Shield links -->
[link-build]: https://travis-ci.org/roelofr/starwars

<!-- Local files -->
[license]: LICENSE

<!-- Other links -->
[grunt]: http://gruntjs.com
[nodejs]: https://nodejs.org/
[php]: https://secure.php.net/supported-versions.php
[sw]: https://gaanwealnaarstarwars.nl/
