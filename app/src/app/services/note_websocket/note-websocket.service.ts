import {Injectable, OnDestroy} from "@angular/core";
import {retry, Subject} from "rxjs";
import {webSocket} from "rxjs/webSocket";
import {NoteParameters} from "../../models/NoteParameters";
import {HttpClient} from "@angular/common/http";
import {AddAction, DeleteAction, UpdateAction} from "../../utils/AddDeleteAction";
import {NoteComponent} from "../../components/note/note/note.component";

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
  private _allData: Array<NoteParameters> = [];

  constructor(private http: HttpClient,
              private deleteAction: DeleteAction,
              private addAction: AddAction,
              private updateAction: UpdateAction) {
    this.connect();
  }
  public getNotes(){
    return this.http.get(this.httpURL);
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
    console.log("Websocket connection start");
    this.ioLine = this.getNewWebSocket();
    this.ioLine.pipe(retry({delay: 1000})).subscribe({
      next: (data: any) => {
        let dataNoteParameters: NoteParameters = data.noteParameters;
        switch(data.action){
          case Action.update:
            const noteForUpdating = this._allData.filter(note => note.id === dataNoteParameters.id);
            if(noteForUpdating.length === 0){
              console.log("Note for updating not found. Note id: " + dataNoteParameters.id);
              return;
            }
            this.updateAction.next(dataNoteParameters.id);
            this.copyAllPropertiesForNote(noteForUpdating[0], dataNoteParameters);
            break;
          case Action.create:
            this._allData.push(dataNoteParameters);
            this.addAction.next(dataNoteParameters);
            break;
          case Action.drop:
            this._allData = this._allData.filter(np => np.id !== dataNoteParameters.id);
            this.deleteAction.next(dataNoteParameters.id);
            break;
        }
      },
      error: (error: ErrorEvent) => {
        console.log("Websocket error come: " + error.message)
      },
      complete: () => {
        console.log("Websocket connection complete");
      }
    });
  }
  copyAllPropertiesForNote(note1: NoteParameters, note2: NoteParameters){
    note1.id = note2.id;
    note1.point = note2.point;
    note1.text = note2.text;
    note1.done = note2.done;
    note1.color = note2.color;
    note1.busy = note2.busy;
  }
  public allDataPush(noteComponent: NoteComponent): void{
    this._allData.push(noteComponent);
  }
  get allData(): Array<NoteParameters>{
    return Object.assign([], this._allData);
  }
  ngOnDestroy(): void {
    console.log("Destroy service");
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
  update,
  create,
  drop
}
