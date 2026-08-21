import 'exceljs';

declare module 'exceljs' {
  interface Worksheet {
    freezePanes: { row: number };
  }
}
