export class NoteParameters{
  constructor(public id: number,
              public point: {x: number, y: number},
              public text: string,
              public done: boolean,
              public color: string,
              public busy: boolean) {}
}
