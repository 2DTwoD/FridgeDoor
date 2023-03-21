const mongoose = require("mongoose");
const express = require("express");
const Schema = mongoose.Schema;
const app = express();
const jsonParser = express.json();

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

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Cache-Control');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});
app.get("/note_crud", async (request, response) =>{
    const notes = await Note.find({});
    response.send({notes: notes});
});
app.post("/note_crud", jsonParser, async (request, response) =>{
    if(!request.body) return request.sendStatus(400);
    const id = request.body.id;
    const point = request.body.point;
    const text = request.body.text;
    const done = request.body.done;
    const color = request.body.color;
    const busy = request.body.busy;
    const note = new Note({id: id, point: point, text: text, done: done, color: color, busy: busy});
    await note.save();
    response.send({added: note});
});
app.patch("/note_crud", jsonParser, async (request, response) =>{
    if(!request.body) return request.sendStatus(400);
    const note = await Note.findOne({id: request.body.id});
    note.point = request.body.point;
    note.text = request.body.text;
    note.done = request.body.done;
    note.color = request.body.color;
    note.busy = request.body.busy;
    await note.save();
    response.send({updated: note});
});
app.delete("/note_crud/:id", jsonParser, async (request, response) =>{
    if(!request.body) return request.sendStatus(400);
    const note = await Note.deleteOne({id: request.params.id});
    response.send({deleted: note});
});

app.get("/", (_, response) =>{
    response.send("Нод - комод!");
});

async function main() {
    try{
        await mongoose.connect("mongodb://127.0.0.1:27017/FridgeDoor");
        app.listen(3001);
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