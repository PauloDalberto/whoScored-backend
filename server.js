import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import leagueRoutes from './routes/leagueRoutes.js';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configuração CORS
app.use(cors({
  origin: '*', // Permitir qualquer origem para desenvolvimento, ajuste conforme necessário para produção
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve arquivos estáticos da pasta 'public'

// Usar as rotas de liga
app.use('/api', leagueRoutes);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
