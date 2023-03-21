import {Injectable, OnDestroy} from "@angular/core";
import {retry, Subject} from "rxjs";
import {webSocket} from "rxjs/webSocket";
import {NoteParameters} from "../../models/NoteParameters";
import {HttpClient} from "@angular/common/http";
import {AddAction, DeleteAction} from "../../utils/AddAction";

@Injectable({
  providedIn: 'root'
})
export class NoteWebsocketService implements OnDestroy{
  readonly ip = "127.0.0.1";
  readonly wsPort = "3001";
  readonly httpPort = "3002";
  readonly webSocketURL = `ws://${this.ip}:${this.wsPort}/`;
  readonly httpURL = `http://${this.ip}:${this.httpPort}/`;
  private ioLine!: Subject<Message>;

  constructor(private http: HttpClient, private deleteAction: DeleteAction, private addAction: AddAction) {
    this.connect();
  }

  public allData: Array<NoteParameters> = [];

  public getNotes(){
    return this.http.get(this.httpURL + "note_crud");
  }
  public updateNote(noteParameters: NoteParameters){
    this.ioLine.next(new MessageStruct(Action.update, noteParameters));
  }
  public createNote(noteParameters: NoteParameters){
    this.ioLine.next(new MessageStruct(Action.create, noteParameters));
  }
  public dropNote(noteParameters: NoteParameters){
    this.ioLine.next(new MessageStruct(Action.drop, noteParameters));
  }

  private getNewWebSocket(): Subject<Message> {
    return webSocket({
      url: this.webSocketURL,
      closeObserver: {
        next: () => {
          console.log('WebSocket connection closed');
          this.ioLine.unsubscribe();
        }
      },
    });
  }
  public connect(){
    console.log("Connection start");
    this.ioLine = this.getNewWebSocket();
    this.ioLine.pipe(retry()).subscribe({
      next: (data: any) => {
        let dataNoteParameters: NoteParameters = data.noteParameters;
        switch(data.action){
          case Action.update:
            this.copyAlPropertiesForNote(this.allData[dataNoteParameters.id], dataNoteParameters);
            break;
          case Action.create:
            this.allData.push(dataNoteParameters);
            this.addAction.next(dataNoteParameters);
            break;
          case Action.drop:
            this.allData = this.allData.filter(np => np.id !== dataNoteParameters.id);
            this.deleteAction.next(dataNoteParameters.id);
            break;
        }
      },
      error: (error: ErrorEvent) => {
        console.log("Websocket error come: " + error.message)
      },
      complete: () => {
        console.log("Connection complete");
      }
    });
  }
  copyAlPropertiesForNote(note1: NoteParameters, note2: NoteParameters){
    note1.point = note2.point;
    note1.text = note2.text;
    note1.done = note2.done;
    note1.color = note2.color;
    note1.busy = note2.busy;
  }
  ngOnDestroy(): void {
    console.log("destroy");
    this.ioLine.unsubscribe();
  }
}

export interface Message {
  action: number;
  noteParameters: NoteParameters| null;
}

class MessageStruct implements Message{
  constructor(public action: number, public noteParameters: NoteParameters| null) { }
}

enum Action {
  getAll,
  update,
  create,
  drop
}
