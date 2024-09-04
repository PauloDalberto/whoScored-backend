import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cloudinary from '../config/cloudinaryConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Configuração do multer
const upload = multer({ 
  dest: path.join(__dirname, '..', 'uploads') // Pasta onde os arquivos temporários são armazenados
});

// Função para carregar o arquivo JSON da liga
function loadLeagueData(league) {
  const filePath = path.join(__dirname, '..', 'data', `${league}.json`);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// Função para salvar o arquivo JSON da liga
function saveLeagueData(league, data) {
  const filePath = path.join(__dirname, '..', 'data', `${league}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Função para formatar a data no formato DD/MM/YYYY
function formatDate(dateString) {
  const [year, month, day] = dateString.split('-');
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

// Rota para inserir um novo jogador
router.post('/league/player', upload.single('videoFile'), async (req, res) => {
  const { league, name, nationality, club, age, position, date } = req.body;
  const videoFile = req.file;

  console.log('Recebido:', req.body);
  console.log('Arquivo de vídeo:', req.file);

  try {
    if (!videoFile) {
      return res.status(400).json({ error: 'Arquivo de vídeo não enviado.' });
    }

    const result = await cloudinary.uploader.upload(videoFile.path, {
      resource_type: 'video',
      folder: league,
    });

    const leagueData = loadLeagueData(league);

    const newPlayer = {
      id: leagueData.length + 1,
      name,
      nationality,
      club,
      age,
      position,
      date: formatDate(date),
      videoUrl: result.secure_url,
    };

    leagueData.push(newPlayer);
    saveLeagueData(league, leagueData);

    console.log('Jogador adicionado:', newPlayer);

    res.status(201).json(newPlayer);
  } catch (error) {
    console.error('Erro ao inserir o jogador:', error);
    res.status(500).json({ error: 'Erro ao inserir o jogador.' });
  }
});

// Rota para obter os jogadores por liga
router.get('/league/:league/players', (req, res) => {
  const league = req.params.league;
  try {
    const data = loadLeagueData(league);
    res.json(data);
  } catch (error) {
    console.error('Erro ao obter dados da liga:', error);
    res.status(500).json({ error: 'Erro ao obter dados da liga.' });
  }
});

export default router;
