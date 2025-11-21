const express = require('express');
const feedbackRouter = require('./routes/feedback');
const app = express();
const PORT = 3000;

// Middleware для логирования
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Подключаем роутер
app.use('/api', feedbackRouter);

// Главная страница
app.get('/', (req, res) => {
    res.send('Привет, мир!');
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});