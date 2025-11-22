const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Todo = require('../models/Todo');


router.get('/', async (req, res) => {
    try {
        const completed = req.query.completed;

        let filter = { owner: req.user.userId };
        if (completed !== undefined) {
            filter.completed = completed === 'true';
        }

        const todos = await Todo.find(filter);

        const formattedTodos = todos.map(todo => ({
            id: todo._id.toString(),
            text: todo.title,
            isCompleted: todo.completed
        }));

        res.status(200).json(formattedTodos);
    } catch (err) {
        console.error('GET Error:', err);
        res.status(500).json({ error: 'Ошибка при получении задач' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { text } = req.body;
        console.log('POST Data:', req.body);

        if (!text) {
            return res.status(400).json({ error: 'Текст задачи обязателен' });
        }

        const newTodo = new Todo({
            title: text,
            owner: req.user.userId
        });
        await newTodo.save();

        res.status(201).json({
            id: newTodo._id.toString(),
            text: newTodo.title,
            isCompleted: newTodo.completed
        });
    } catch (err) {
        console.error('POST Error:', err);
        res.status(500).json({ error: 'Ошибка при создании задачи' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { text, isCompleted } = req.body;
        console.log('PUT Data:', req.body);

        const todo = await Todo.findOne({ _id: req.params.id, owner: req.user.userId });
        if (!todo) {
            return res.status(404).json({ error: 'Задача не найдена' });
        }

        if (text !== undefined) todo.title = text;
        if (isCompleted !== undefined) todo.completed = isCompleted;

        await todo.save();

        res.status(200).json({
            id: todo._id.toString(),
            text: todo.title,
            isCompleted: todo.completed
        });
    } catch (err) {
        console.error('PUT Error:', err);
        res.status(500).json({ error: 'Ошибка при обновлении задачи' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const result = await Todo.deleteOne({ _id: req.params.id, owner: req.user.userId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Задача не найдена' });
        }
        res.status(204).send();
    } catch (err) {
        console.error('DELETE Error:', err);
        res.status(500).json({ error: 'Ошибка при удалении задачи' });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const stats = await Todo.aggregate([
            {
                $match: { owner: new mongoose.Types.ObjectId(req.user.userId) } // ← ИСПРАВЬ ЭТО
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    completed: { $sum: { $cond: ['$completed', 1, 0] } },
                    active: { $sum: { $cond: ['$completed', 0, 1] } }
                }
            }
        ]);
        res.json(stats[0] || { total: 0, completed: 0, active: 0 });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Ошибка при получении статистики' });
    }
});

module.exports = router;