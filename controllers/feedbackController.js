const fs = require('fs');
const path = require('path');

const feedbackFile = path.join(__dirname, '../feedback.json');

function getAllFeedback() {
    try {
        const data = fs.readFileSync(feedbackFile, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

function addFeedback(feedbackData) {
    const feedback = getAllFeedback();
    feedback.push({
        ...feedbackData,
        date: new Date().toISOString()
    });
    fs.writeFileSync(feedbackFile, JSON.stringify(feedback, null, 2));
    return feedback;
}

module.exports = {
    getAllFeedback,
    addFeedback
};