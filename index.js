import express from 'express';
import cookieParser from 'cookie-parser';
import { router } from './routes.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

app.use('/', router);

app.listen(PORT, () => {
  console.log("\n=======================================================");
  console.log("   REPLICADOR DE COORDINACIÓN ELECTORAL (MODULAR)");
  console.log("=======================================================");
  console.log(`💻 Aplicación disponible en: http://localhost:${PORT}`);
  console.log("📂 Base de datos portable sincronizada en: db.json");
  console.log("=======================================================\n");
});