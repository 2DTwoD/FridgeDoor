import { Injectable } from '@angular/core';
import {NoteParameters} from "../../models/NoteParameters";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  constructor(private http: HttpClient) {
  }

  public allData: Array<NoteParameters> = [];

  public getNotes(){
    return this.http.get('http://localhost:3001/note_crud');
  }
  public updateNote(noteParameters: NoteParameters){
    this.allData[noteParameters.id] = noteParameters;
    return this.http.patch('http://localhost:3001/note_crud', noteParameters);
  }
  public createNote(noteParameters: NoteParameters){
    this.allData.push(noteParameters);
    return this.http.post('http://localhost:3001/note_crud', noteParameters);
  }
  public dropNote(noteParameters: NoteParameters){
    this.allData = this.allData.filter(np => np.id !== noteParameters.id);
    return this.http.delete('http://localhost:3001/note_crud/' + noteParameters.id);
  }
}
