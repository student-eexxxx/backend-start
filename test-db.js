const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/lab9')
    .then(async () => {
        console.log('✅ Подключение к MongoDB успешно!');

        const Todo = require('./models/Todo');

        // Добавляем тестовую задачу
        const testTodo = new Todo({
            title: 'Тест из test-db.js',
            completed: false
        });
        await testTodo.save();
        console.log('✅ Тестовая задача добавлена!');

        // Проверяем
        const todos = await Todo.find();
        console.log('📝 Задач в базе:', todos.length);
        console.log('Задачи:', todos);

        process.exit();
    })
    .catch(err => console.error('❌ Ошибка:', err));