const express = require('express');
const router = express.Router();

let todos = [
    { id: 1, text: 'Изучить REST API', isCompleted: false },
    { id: 2, text: 'Подключить фронтенд', isCompleted: true }
];
let nextId = 3;

router.get('/', (req, res) => {
    const { completed } = req.query;

    let filteredTodos = todos;

    if (completed !== undefined) {
        const isCompleted = completed === 'true';
        filteredTodos = todos.filter(todo => todo.isCompleted === isCompleted);
    }

    res.status(200).json(filteredTodos);
});

router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const todo = todos.find(t => t.id === id);
    if (!todo) {
        return res.status(404).json({ error: 'Задача не найдена' });
    }
    res.status(200).json(todo);
});

router.post('/', (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Текст задачи обязателен' });
    }
    const newTodo = { id: nextId++, text, isCompleted: false };
    todos.push(newTodo);
    res.status(201).json(newTodo);
});

router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const todoIndex = todos.findIndex(t => t.id === id);
    if (todoIndex === -1) {
        return res.status(404).json({ error: 'Задача не найдена' });
    }
    const { text, isCompleted } = req.body;
    todos[todoIndex] = { ...todos[todoIndex], text, isCompleted };
    res.status(200).json(todos[todoIndex]);
});

router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const todoIndex = todos.findIndex(t => t.id === id);
    if (todoIndex === -1) {
        return res.status(404).json({ error: 'Задача не найдена' });
    }
    todos.splice(todoIndex, 1);
    res.status(204).send();
});

module.exports = router;