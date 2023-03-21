import { TestBed } from '@angular/core/testing';

import { NoteWebsocketService } from './note-websocket.service';

describe('NoteWebsocketService', () => {
  let service: NoteWebsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoteWebsocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
