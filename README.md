# Univea-r-syty

Proyecto final de Desarrollo de Aplicaciones Web: plataforma educativa desarrollada con Node.js, Express, Handlebars, Bootstrap y Firebase.

## Tecnologías

- **Backend:** Node.js, Express y Firebase Admin SDK (Cloud Firestore).
- **Frontend:** Express, Handlebars (HBS) y HTML/CSS. Bootstrap para la interfaz.
- **Autenticación:** sesiones para el cliente y JWT para las peticiones a la API.

## Estructura

- `cliente/`: aplicación web y vistas Handlebars.
- `restAPI/`: API REST y acceso a Firestore.

## Ejecución local

1. Instala Node.js y npm.
2. Configura un proyecto Firebase con Cloud Firestore y descarga una **nueva** clave de cuenta de servicio. Guárdala fuera del repositorio.
3. Define las variables de entorno necesarias (consulta `.env.example`). Node.js no carga automáticamente este archivo; exporta las variables en tu terminal o utiliza un gestor de entorno.
4. En dos terminales distintas ejecuta:

   ```bash
   cd restAPI
   npm ci
   npm run dev
   ```

   ```bash
   cd cliente
   npm ci
   npm run dev
   ```

5. Abre http://localhost:8081. La API utiliza http://localhost:2005.

> Se necesitan datos de prueba en Firestore para utilizar las funciones. El proyecto no incluye una base de datos preparada ni credenciales.

## Configuración

- `GOOGLE_APPLICATION_CREDENTIALS`: ruta absoluta al JSON de la cuenta de servicio de Firebase (fuera del repositorio).
- `JWT_SECRET`: clave aleatoria y privada para firmar/verificar tokens. Debe estar configurada en el proceso de la API.
- `SESSION_SECRET`: clave aleatoria y privada para las sesiones del cliente.
- `PORT`: puerto opcional del cliente (predeterminado: 8081).

## Seguridad y limitaciones

Este proyecto es académico y **no está listo para producción**. La autenticación existente compara contraseñas en texto plano; debe migrarse a un algoritmo de hash adaptativo (por ejemplo, Argon2id o bcrypt), sin perder la compatibilidad con los usuarios existentes. Las sesiones usan el almacén en memoria predeterminado de Express, no apto para producción. Se recomienda añadir validación de entradas, protección CSRF, pruebas automatizadas, límites de peticiones y control de acceso granular.

Se han retirado los JSON de credenciales de la versión actual del repositorio, pero **siguen presentes en el historial de Git**. Es imprescindible revocar/rotar las claves en Google Cloud y, posteriormente, limpiar el historial de forma coordinada. No reutilices ninguna clave antigua.

## Estado

Proyecto académico conservado como muestra de arquitectura cliente/API. Hay tareas de seguridad y pruebas pendientes antes de considerarlo una aplicación desplegable.
