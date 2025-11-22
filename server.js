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
const PORT = 5000;

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

console.log('🔄 3. Connecting to MongoDB...');
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ 4. MongoDB подключена'))
    .catch(err => console.error('❌ 4. Ошибка подключения:', err));

app.use(cors());
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

app.get('/', (req, res) => {
    res.send('Привет, мир!');
});

app.listen(PORT, () => {
    console.log(`🚀 9. Сервер запущен на http://localhost:${PORT}`);
});