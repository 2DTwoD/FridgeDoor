import {
  AfterContentInit, AfterViewInit,
  Component,
  ComponentRef,
  ElementRef,
  OnInit,
  ViewChild,
  ViewContainerRef,
  ViewRef
} from '@angular/core';
import {NoteComponent} from "./components/note/note/note.component";
import {NoteParameters} from "./models/NoteParameters";
import {NoteService} from "./services/note/note.service";
import {logCumulativeDurations} from "@angular-devkit/build-angular/src/builders/browser-esbuild/profiling";
import {NoteWebsocketService} from "./services/note_websocket/note-websocket.service";
import {map} from "rxjs";
import {AddAction, DeleteAction} from "./utils/AddDeleteAction";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [NoteService]
})
export class AppComponent implements AfterViewInit{

  title: string = 'Дверца холодильника';

  @ViewChild("noteContainer", {read: ViewContainerRef})
  noteContainer!: ViewContainerRef;

  components: Array<ComponentRef<NoteComponent>> = [];
  id_count!: number;

  constructor(private noteService: NoteWebsocketService,
              private addAction: AddAction,
              private deleteAction: DeleteAction) { }

  ngAfterViewInit(): void {
    this.noteService.getNotes().subscribe((data: any) => {
      for(let noteParameters of data["notes"]){
        this.noteService.allDataPush(noteParameters);
        this.newNote(noteParameters);
      }
    });
    this.addAction.subscribe((noteParameters) => {
      this.createNote(noteParameters);
    });
    this.deleteAction.subscribe((num) => {
        this.deleteNote(num);
    });
  }

  private newNote(noteParameters: NoteParameters): void{
    const newComponentRef = this.noteContainer.createComponent(NoteComponent);
    newComponentRef.instance.noteParameters = noteParameters;
    this.components.push(newComponentRef);
  }

  public addNote(): void{
    this.id_count = 0;
    const ids = this.noteService.allData.map(val => val.id);
    while(ids.length !== 0){
      if(ids.indexOf(this.id_count) == -1) break;
      this.id_count++;
    }
    this.noteService.createNote(new NoteParameters(this.id_count, {x: 0, y: 0}, "", false, this.getRandomColor(), false))
  }
  private createNote(noteParameters: NoteParameters): void{
    const newComponentRef = this.noteContainer.createComponent(NoteComponent);
    newComponentRef.instance.noteParameters = noteParameters;
    this.components.push(newComponentRef);
  }

  public deleteNote(id:number): void{
    let componentRef: ComponentRef<NoteComponent> = this.components.filter(cf => cf.instance.id === id)[0];
    let indexOfViewRef: number = this.noteContainer.indexOf(componentRef.hostView);
    componentRef.instance.clearBlurTimer();
    this.noteContainer.detach(indexOfViewRef);
    componentRef.destroy();
    this.components = this.components.filter(cf => cf.instance.id !== id);
  }
  getRandomColor(): string{
    let rndHEXStr = () => {
      let res = Math.floor(Math.random() * 256).toString(16);
      return res.length == 2? res: "0" + res;
    }
    return "#" + rndHEXStr() + rndHEXStr() + rndHEXStr();
  }
}
