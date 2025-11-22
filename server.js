require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const feedbackRouter = require('./routes/feedback');
const todosRouter = require('./routes/todos');
const authRouter = require('./routes/auth');

console.log('🔄 1. Loading authMiddleware...');
const authMiddleware = require('./middleware/auth');
console.log('✅ 2. AuthMiddleware loaded, type:', typeof authMiddleware);

const app = express();
const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

console.log('🔄 3. Connecting to MongoDB...');
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => {
        console.log('MongoDB connection error:', err.message);
        process.exit(1);
    });

// Настройка CORS для продакшена и разработки
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://my-todo-list-g9k0rzu85-egorvot2007-3398s-projects.vercel.app']
        : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Убираем проблемный options handler - CORS middleware сам обработает OPTIONS

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Подключаем роутеры
console.log('🔄 5. Setting up routes...');
app.use('/api', feedbackRouter);

console.log('🔄 6. Applying authMiddleware to /api/v1/todos...');
app.use('/api/v1/todos', authMiddleware, todosRouter);
console.log('✅ 7. AuthMiddleware applied to /api/v1/todos');

app.use('/api/auth', authRouter);
console.log('✅ 8. All routes configured');

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'Привет, мир!',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Обработка несуществующих маршрутов - ИСПРАВЛЕНО: используем строку вместо *
app.use((req, res) => {
    res.status(404).json({ error: 'Маршрут не найден' });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error('❌ Global error handler:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

app.listen(PORT, () => {
    console.log(`🚀 9. Сервер запущен на порту ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});