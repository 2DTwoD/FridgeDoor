import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {NoteParameters} from "../models/NoteParameters";

@Injectable({
  providedIn: 'root'
})
export class AddAction extends Subject<NoteParameters>{
}

@Injectable({
  providedIn: 'root'
})
export class DeleteAction extends Subject<number>{
}
