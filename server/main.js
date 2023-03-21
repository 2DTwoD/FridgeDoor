const Message = require("./models/Message");
const Action = require("./models/ActionEnum");
const express = require("express");
const http = require("http");
const WebSocket = require( "ws");

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const noteScheme = new Schema(
    {
        id: Number,
        point: {x: Number, y: Number},
        text: String,
        done: Boolean,
        color: String,
        busy: Boolean
    },
    {versionKey: false}
);
const Note = mongoose.model("Note", noteScheme);

const app = express();
const server = http.createServer(app);
const webSocketServer = new WebSocket.Server({ server });

webSocketServer.on('connection', async ws => {
    ws.on('message', async m => {
        const iMessage = JSON.parse(m.toString());
        switch (iMessage.action) {
            case Action.update:
                wsUpdate(iMessage);
                break;
            case Action.create:
                wsCreate(iMessage);
                break;
            case Action.drop:
                wsDelete(iMessage);
                break;
            default:
                console.log("WebSocket unknown action!");
                break;
        }
        webSocketServer.clients.forEach(
            client => {
                client.send(JSON.stringify(iMessage));
            }
        );
    });
    ws.on("error", e => ws.send(e));
});

async function wsUpdate(iMessage){
    const iNoteParameters = iMessage.noteParameters;
    const note = await Note.findOne({id: iNoteParameters.id});
    note.point = iNoteParameters.point;
    note.text = iNoteParameters.text;
    note.done = iNoteParameters.done;
    note.color = iNoteParameters.color;
    note.busy = iNoteParameters.busy;
    await note.save();
}
async function wsCreate(iMessage){
    const iNoteParameters = iMessage.noteParameters;
    const id = iNoteParameters.id;
    const point = iNoteParameters.point;
    const text = iNoteParameters.text;
    const done = iNoteParameters.done;
    const color = iNoteParameters.color;
    const busy = iNoteParameters.busy;
    const note = new Note({id: id, point: point, text: text, done: done, color: color, busy: busy});
    await note.save();
}
async function wsDelete(iMessage){
    await Note.deleteOne({id: iMessage.noteParameters.id});
}

async function main() {
    try{
        await mongoose.connect("mongodb://127.0.0.1:27017/FridgeDoor");
        server.listen(3001);
        app.listen(3002);
        console.log("Сервер ожидает подключения...");
    }
    catch(err) {
        return console.log(err);
    }
}
main();
process.on("SIGINT", async() => {
    await mongoose.disconnect();
    console.log("Приложение завершило работу");
    process.exit();
});

app.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Cache-Control');
    if (request.method === 'OPTIONS') {
        response.sendStatus(200);
    } else {
        next();
    }
});
app.get("/note_crud", async (request, response) =>{
    const notes = await Note.find({});
    response.send({notes: notes});
});
// app.delete("/note_crud/:id", jsonParser, async (request, response) =>{
//     if(!request.body) return request.sendStatus(400);
//     const note = await Note.deleteOne({id: request.params.id});
//     response.send({deleted: note});
// });