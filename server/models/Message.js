class Message{
    constructor(message) {
        this.action = message.action;
        this.noteParameters = message.noteParameters;
    }
}
module.exports = Message;