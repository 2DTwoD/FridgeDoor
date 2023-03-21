import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  Renderer2,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {NoteComponent} from "../components/note/note/note.component";
import {NoteService} from "../services/note/note.service";
import {CoordinateCut} from "../utils/CoordinateCut";
import {NoteWebsocketService} from "../services/note_websocket/note-websocket.service";

@Directive({
  selector: '[move]',
  providers: [NoteService]
})
export class MoveDirective implements AfterViewInit{
  private noteElement!: HTMLElement;
  private mouseDown: boolean = false;
  private shift: {x: number, y: number} = {x: 0, y: 0};

  constructor(private element: ElementRef,
              private renderer: Renderer2,
              private noteComponentRef: NoteComponent,
              private noteService: NoteWebsocketService){
  }
  ngAfterViewInit(): void {
    this.noteElement = this.noteComponentRef.noteBodyRef.element.nativeElement;
    this.renderer.setStyle(this.element.nativeElement, "cursor", "grab");
  }

  @HostListener("mousedown", ['$event'])
  onMouseDown(e: MouseEvent) {
    this.mouseDown = true;
    this.shift.x = e.x - this.noteElement.offsetLeft;
    this.shift.y = e.y - this.noteElement.offsetTop;
    this.noteComponentRef.busy = true;
    this.renderer.setStyle(this.element.nativeElement, "cursor", "grabbing");
  }

  @HostListener("window:mouseup")
  onMouseUp() {
    this.noteComponentRef.placeNoteOnWindow();
    if(!this.mouseDown) return;
    this.noteComponentRef.busy = false;
    this.mouseDown = false;
    this.renderer.setStyle(this.element.nativeElement, "cursor", "grab");
    this.noteService.updateNote(this.noteComponentRef.noteParameters);
  }

  @HostListener("window:mousemove", ['$event'])
  onMouseMove(e: MouseEvent) {
    if(this.mouseDown) {
      this.setPos(e.x, e.y);
    }
  }
  @HostListener("window:resize")
  onWindowResize() {
    this.shift.x = 0;
    this.shift.y = 0;
    this.setPos(this.noteComponentRef.point.x, this.noteComponentRef.point.y);
    this.noteService.updateNote(this.noteComponentRef.noteParameters);
  }
  private setPos(xPos: number, yPos: number) {
    xPos = CoordinateCut.cut(this.noteElement.offsetWidth, this.shift.x, window.innerWidth, xPos) - this.shift.x;
    yPos = CoordinateCut.cut(this.noteElement.offsetHeight, this.shift.y, window.innerHeight, yPos) - this.shift.y;
    this.noteComponentRef.point = {x: xPos, y: yPos};
  }
}
