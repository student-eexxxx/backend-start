require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Добавляем эту строку
const feedbackRouter = require('./routes/feedback');
const todosRouter = require('./routes/todos');

const app = express();
const PORT = 5000;

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB подключена'))
    .catch(err => console.error('❌ Ошибка подключения:', err));

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api', feedbackRouter);
app.use('/api/v1/todos', todosRouter);

app.get('/', (req, res) => {
    res.send('Привет, мир!');
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});