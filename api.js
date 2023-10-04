const express = require('express');
const cors = require('cors');
const {
  getAuthToken,
  postPatient,
  printPatientInfo,
  getPatients,
  searchPatientsByPhone,
} = require('./samples');

const app = express();
const port = 8080 || process.env.PORT; // Porta em que o servidor irá escutar

// Habilitar o middleware CORS para permitir solicitações de qualquer origem
const corsOptions = {
  origin: 'http://localhost:3000', // Permitir solicitações apenas de http://localhost:3000
  optionsSuccessStatus: 200, // Para compatibilidade com alguns navegadores mais antigos
};

app.use(cors(corsOptions));

app.use(express.json());

// Rota de exemplo para obter todos os pacientes
app.get('/patients', async (req, res) => {
  const accessToken = await getAuthToken();
  const data = await getPatients(accessToken);

  res.json(data);
});

// Rota para obter informações de um paciente específico por ID
app.get('/patients/:id', async (req, res) => {
  const patientId = req.params.id;
  const accessToken = await getAuthToken();
  const data = await printPatientInfo(patientId, accessToken);

  if (data) {
    res.json(data);
  } else {
    res.status(404).json({ error: 'Paciente não encontrado'});
  }
});

// Rota para criar um novo paciente
app.post('/patients', async (req, res) => {
  const accessToken = await getAuthToken();
  const patientId = await postPatient(accessToken, req.body);

  if (patientId) {
    res.json({ patientId });
  } else {
    res.status(500).json({ error: 'Erro ao cadastrar paciente' });
  }
});


// Rota para criar um novo paciente
app.post('/patients', async (req, res) => {
  const accessToken = await getAuthToken();
  const patientId = await postPatient(accessToken, req.body);

  res.json({ patientId });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor Express rodando na porta ${port}`);
});

