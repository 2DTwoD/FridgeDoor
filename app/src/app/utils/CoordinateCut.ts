export class CoordinateCut{
  public static cut(noteDim: number, shift: number, windowDim: number, currentPos: number): number{
    let repair: number = noteDim - shift;
    currentPos = currentPos > (windowDim - repair)? windowDim - repair: currentPos;
    currentPos = currentPos < shift? shift: currentPos;
    return currentPos;
  }
}
