const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

router.post('/submit', (req, res) => {
    const { name, email, message } = req.body;
    feedbackController.addFeedback({ name, email, message });
    res.json({ success: true, message: 'Ваш отзыв сохранён!' });
});

router.get('/feedback', (req, res) => {
    const feedback = feedbackController.getAllFeedback();

    if (feedback.length === 0) {
        return res.status(404).send('Отзывов пока нет. <a href="/">Оставить первый?</a>');
    }

    let html = '<h1>Все отзывы</h1><ul>';
    feedback.forEach(item => {
        html += `<li><strong>${item.name}</strong> (${item.email}): ${item.message} <small>${new Date(item.date).toLocaleString()}</small></li>`;
    });
    html += '</ul><a href="/">← Назад к форме</a>';
    res.send(html);
});

module.exports = router;