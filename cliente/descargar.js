const path = require('node:path');
module.exports = function descargar(nombreArchivo) {
  // Only allow known exam basenames; never interpret user input as a path.
  if (typeof nombreArchivo !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(nombreArchivo)) {
    throw new Error('Nombre de examen no válido');
  }
  return path.join(__dirname, 'public', 'examenes', nombreArchivo + '.pdf');
};
