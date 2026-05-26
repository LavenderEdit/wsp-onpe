# Replicador de Coordinación Electoral ONPE 🗳️

Sistema local de mensajería masiva automatizada y asíncrona para la ONPE, utilizando `whatsapp-web.js` y `puppeteer-extra` con evasión de detección de bots.  

Ahora dockerizado para un despliegue rápido y seguro en cualquier máquina.

---

# 🚀 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- Docker
- Docker Compose

Además, debes tener el archivo `db.json` creado en la raíz del proyecto (**MUY IMPORTANTE**).

---

# ⚠️ Paso CRÍTICO antes de ejecutar Docker

Docker tiene un comportamiento peculiar con los volúmenes de archivos sueltos.  

Si el archivo `db.json` no existe físicamente en tu carpeta antes de arrancar el contenedor, Docker creará una carpeta llamada `db.json` en su lugar y la aplicación fallará.

Asegúrate de que el archivo `db.json` exista.  

Si está vacío o no lo tienes, créalo con este contenido base:

```json
{
  "users": [],
  "members": []
}
```

---

# 🐳 Levantar el sistema con Docker

Abre tu terminal en la carpeta del proyecto y ejecuta:

```bash
docker compose up -d --build
```

## Esto hará lo siguiente:

* Construirá la imagen instalando:

  * Node.js
  * pnpm
  * Chromium interno

* Mapeará el puerto `3000`.

* Sincronizará:

  * La base de datos
  * Las sesiones de WhatsApp (`.wwebjs_auth`)
  * La carpeta `uploads`

Con tu computadora para que no pierdas ningún dato ni tengas que volver a escanear el QR si apagas el contenedor.

---

# 🌐 Uso del sistema

1. Abre tu navegador y ve a:

```text
http://localhost:3000
```

2. Regístrate o inicia sesión.

3. Configura tu plantilla, añade miembros de mesa y sube imágenes (si las requieres).

4. Dale clic a **Conectar WhatsApp**.

> Al estar en Docker, el navegador Chrome no se abrirá visualmente en tu pantalla (correrá en modo headless), pero el código QR aparecerá en la página web.

5. Escanea el código QR desde la app de WhatsApp en tu celular.

6. Inicia el envío masivo.

---

# 🛑 Detener el sistema

Para apagar el contenedor sin perder los datos:

```bash
docker compose down
```

---

# 📄 Ver logs en tiempo real

Si necesitas depurar problemas o monitorear el sistema:

```bash
docker compose logs -f
```
