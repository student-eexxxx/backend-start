const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email и пароль обязательны' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
        }

        const user = new User({ email, password });
        await user.save();

        res.status(201).json({ id: user._id, email: user.email });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка при регистрации' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email и пароль обязательны' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Неверные данные для входа' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Неверные данные для входа' });
        }

        // Access token (15 минут)
        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Refresh token (7 дней)
        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Сохраняем refresh token в базу
        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            accessToken,
            refreshToken,
            userId: user._id
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка при входе' });
    }
});

router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token обязателен' });
        }

        // Проверяем refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

        // Находим пользователя и проверяем refresh token
        const user = await User.findOne({
            _id: decoded.userId,
            refreshToken: refreshToken
        });

        if (!user) {
            return res.status(403).json({ error: 'Неверный refresh token' });
        }

        // ✅ Генерируем НОВЫЙ refresh token (ротация токенов)
        const newRefreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Сохраняем новый refresh token
        user.refreshToken = newRefreshToken;
        await user.save();

        // Выдаём новый access token
        const newAccessToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken // ✅ Отправляем новый refresh token
        });
    } catch (err) {
        console.error(err);
        res.status(403).json({ error: 'Неверный или просроченный refresh token' });
    }
});

module.exports = router;