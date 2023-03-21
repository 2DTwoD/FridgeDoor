import {
  AfterContentInit,
  AfterViewInit,
  Component,
  Renderer2,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {NoteParameters} from "../../../models/NoteParameters";
import {AppComponent} from "../../../app.component";
import {NoteService} from "../../../services/note/note.service";
import {CoordinateCut} from "../../../utils/CoordinateCut";
import {NoteWebsocketService} from "../../../services/note_websocket/note-websocket.service";
import {AddAction, DeleteAction, UpdateAction} from "../../../utils/AddDeleteAction";

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.css'],
  providers: [NoteService]
})
export class NoteComponent implements AfterViewInit{
  private _noteParameters: NoteParameters = new NoteParameters(0, {x: 0, y: 0}, "", false, "#000000", false);
  private internalAction: boolean = false;
  noteElement!: HTMLElement;
  textAreaElement!: HTMLTextAreaElement | null;
  delConVis: boolean = false;
  clrConVis: boolean = false;
  static readonly black: string = "#000000";
  static readonly white: string = "#FFFFFF";

  @ViewChild("noteBody", {read: ViewContainerRef})
  noteBodyRef!: ViewContainerRef;
  @ViewChild("textArea", {read: ViewContainerRef})
  textAreaRef!: ViewContainerRef;

  constructor(private parentComponent: AppComponent,
              private noteService: NoteWebsocketService,
              private renderer: Renderer2,
              private updateAction: UpdateAction) {
  }

  ngAfterViewInit(): void {
    this.noteElement = this.noteBodyRef.element.nativeElement;
    this.textAreaElement = <HTMLTextAreaElement>this.textAreaRef.element.nativeElement;
    setTimeout(() => this.placeNoteOnWindow(), 0);
    this.updateAction.subscribe(id => {
      if(id !== this.id){
        return;
      }
      this.textAreaAutoSize();
    });
    this.textAreaAutoSize();
  }
  public placeNoteOnWindow(): void{
    this.point = {x: CoordinateCut.cut(this.noteElement.offsetWidth, 0, window.innerWidth, this.point.x),
                  y: CoordinateCut.cut(this.noteElement.offsetHeight, 0, window.innerHeight, this.point.y)}
  }
  public clearNote(): void{
    this.text = "";
    this.textAreaAutoSize();
    this.toggleClrConVis();
  }
  public deleteNote(): void{
    this.noteService.dropNote(this._noteParameters);
  }
  textFocusOut(e: FocusEvent): void{
    this.text = (<any>e.target).value;
    this.busy = false;
  }
  textFocusIn(): void{
    this.busy = true;
    setTimeout(() => {
      this.textAreaElement?.blur();
      this.busy = false;
    }, 5000);
  }
  toggleDone(e: MouseEvent): void{
    this.done = (<HTMLInputElement>e.target).checked;
  }
  getTextDecoration(): string{
    return this.done? "line-through": "none";
  }
  textAreaAutoSize(): void{
    setTimeout(() => {
      this.renderer.setStyle(this.textAreaElement, "height", "auto");
      this.renderer.setStyle(this.textAreaElement, "height", this.textAreaElement?.scrollHeight + "px");
    }, 0);
  }
  changeColor(e: Event): void{
    this.color = (<HTMLInputElement>e.target).value;
  }
  getAdditionalColor(): string{
    let r: number = parseInt(this.color.substring(1, 3), 16);
    let g: number = parseInt(this.color.substring(3, 5), 16);
    let b: number = parseInt(this.color.substring(5), 16);
    return r + g + b > 382? NoteComponent.black: NoteComponent.white;
  }
  isBlack(): boolean{
    return this.getAdditionalColor() === NoteComponent.black;
  }
  toggleDelConVis(): void{
    this.delConVis = !this.delConVis;
    this.busy = this.delConVis;
  }
  toggleClrConVis(): void{
    this.clrConVis = !this.clrConVis;
    this.busy = this.clrConVis;
  }
  //get/set
  get id(): number{
    return this._noteParameters.id;
  }
  set id(value: number) {
    this._noteParameters.id = value;
  }
  get point(): {x: number, y: number}{
    return {x: this._noteParameters.point.x, y: this._noteParameters.point.y}
  }
  set point(value: {x: number, y: number}){
    this._noteParameters.point = value;
  }
  get text(): string{
    return this._noteParameters.text;
  }
  set text(value: string){
    this._noteParameters.text = value;
    this.textAreaAutoSize();
    this.noteService.updateNote(this._noteParameters);
  }
  get done(): boolean{
    return this._noteParameters.done;
  }
  set done(value: boolean){
    this._noteParameters.done = value;
    this.noteService.updateNote(this._noteParameters);
  }
  get color(): string{
    return this._noteParameters.color;
  }
  set color(value: string){
    this._noteParameters.color = value;
    this.noteService.updateNote(this._noteParameters);
  }
  get busy(): boolean{
    return !this.internalAction && this._noteParameters.busy;
  }
  set busy(value: boolean){
    this.internalAction = value;
    this._noteParameters.busy = value;
    this.noteService.updateNote(this._noteParameters);
  }
  get noteParameters(): NoteParameters{
    return this._noteParameters;
  }
  set noteParameters(value: NoteParameters){
    this._noteParameters = value;
  }
}
