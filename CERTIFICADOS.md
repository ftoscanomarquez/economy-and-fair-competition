# CERTIFICADOS.md

> Este proyecto **no tiene Traefik/SSL activo** en el MVP (ver `AGENTS.md` §1 y `INFRA.md`). Este archivo es la guía completa para activarlo en el futuro cuando se decida el dominio y modalidad de despliegue de producción, según lo exige la gobernanza de `toscaprompt` aunque la funcionalidad no sea bloqueante hoy.

## 1. Solicitud formal a Autoridad Certificadora (CA) — sin Traefik

Si se opta por gestión manual de certificados (fuera de Let's Encrypt automatizado):

```bash
# 1. Generar clave privada RSA 2048
openssl genrsa -out economyandfaircompetition.key 2048

# 2. Generar CSR (Certificate Signing Request)
openssl req -new -key economyandfaircompetition.key -out economyandfaircompetition.csr \
  -subj "/C=MX/ST=Ciudad de Mexico/L=Ciudad de Mexico/O=Economy and Fair Competition/CN=economyandfaircompetition.com"

# 3. Verificar el contenido del CSR antes de enviarlo a la CA
openssl req -text -noout -verify -in economyandfaircompetition.csr
```

Enviar `economyandfaircompetition.csr` a la CA elegida (ej. DigiCert, Sectigo). La CA devuelve el certificado firmado (`.crt`) y, normalmente, una cadena intermedia (`.ca-bundle` o similar).

## 2. Instalación manual del certificado

En un servidor Linux con Nginx como frontal (alternativa sin Traefik):

```bash
sudo mkdir -p /etc/ssl/economyandfaircompetition
sudo cp economyandfaircompetition.crt /etc/ssl/economyandfaircompetition/
sudo cp economyandfaircompetition.key /etc/ssl/economyandfaircompetition/
sudo chmod 600 /etc/ssl/economyandfaircompetition/economyandfaircompetition.key

# Verificar que el certificado y la llave privada coinciden
openssl x509 -noout -modulus -in economyandfaircompetition.crt | openssl md5
openssl rsa -noout -modulus -in economyandfaircompetition.key | openssl md5
# Ambos hashes MD5 deben coincidir
```

Configurar el bloque `ssl_certificate` / `ssl_certificate_key` en Nginx y recargar (`sudo nginx -s reload`).

## 3. Entornos locales (desarrollo seguro) — `mkcert`

Para HTTPS local sin advertencias del navegador, sin poseer un dominio real:

```bash
# Instalar mkcert (Windows, vía Chocolatey)
choco install mkcert

# Instalar mkcert (macOS)
brew install mkcert

# Instalar mkcert (Linux)
sudo apt install libnss3-tools
# luego descargar el binario de https://github.com/FiloSottile/mkcert/releases

# 1. Crear e instalar la CA local (una sola vez por máquina)
mkcert -install

# 2. Emitir certificado para el dominio ficticio local del proyecto
mkcert app.economyandfaircompetition.localhost localhost 127.0.0.1 ::1

# Esto genera:
#   app.economyandfaircompetition.localhost+3.pem       (certificado)
#   app.economyandfaircompetition.localhost+3-key.pem   (llave privada)
```

Agregar al `hosts` local (`C:\Windows\System32\drivers\etc\hosts` en Windows, `/etc/hosts` en Unix):

```
127.0.0.1  app.economyandfaircompetition.localhost
```

### Integración con Traefik (dinámica) — cuando se active

```yaml
# traefik/dynamic/tls.yml
tls:
  certificates:
    - certFile: /certs/app.economyandfaircompetition.localhost+3.pem
      keyFile: /certs/app.economyandfaircompetition.localhost+3-key.pem
```

Montar la carpeta de certificados en el contenedor de Traefik:

```yaml
# fragmento a agregar al servicio "traefik" de docker-compose.yml cuando se active
volumes:
  - ./traefik/dynamic:/dynamic
  - ./traefik/certs:/certs
command:
  - "--providers.file.directory=/dynamic"
  - "--providers.file.watch=true"
```

## 4. Producción automatizada (Let's Encrypt + Traefik)

El servicio `traefik` en `docker-compose.yml` (profile `traefik`, no activo por defecto) ya incluye la configuración base:

```yaml
command:
  - "--certificatesresolvers.letsencrypt.acme.httpchallenge=true"
  - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
  - "--certificatesresolvers.letsencrypt.acme.email=${TRAEFIK_ACME_EMAIL}"
  - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
```

Para activarlo con el dominio real de producción:

1. Definir `TRAEFIK_ACME_EMAIL` en `.env` (correo de contacto para avisos de Let's Encrypt).
2. Etiquetar el servicio de la app Next.js con labels de Traefik:
   ```yaml
   labels:
     - "traefik.enable=true"
     - "traefik.http.routers.efc.rule=Host(`economyandfaircompetition.com`)"
     - "traefik.http.routers.efc.entrypoints=websecure"
     - "traefik.http.routers.efc.tls.certresolver=letsencrypt"
   ```
3. Levantar: `docker compose --profile traefik up -d`.
4. Traefik solicita el certificado automáticamente vía HTTP-01 challenge la primera vez que llega tráfico al dominio, lo almacena cifrado en el volumen `efc_traefik_acme` (archivo `acme.json` dentro del contenedor) y **renueva automáticamente** ~30 días antes del vencimiento, sin interrumpir el servicio (Traefik recarga el certificado en caliente).

### Verificación de renovación automática

```bash
# Ver logs de Traefik para confirmar la renovación
docker logs economy-fair-competition-traefik | grep -i "acme\|certificate"

# Inspeccionar el certificado activo en el dominio
openssl s_client -connect economyandfaircompetition.com:443 -servername economyandfaircompetition.com < /dev/null | openssl x509 -noout -dates
```

## Estado de esta guía

Documentada por completo, **no implementada** en el MVP. Se activa cuando el usuario confirme dominio real de producción y modalidad de despliegue (Fase 11 / `DEPLOYMENT.md`).
