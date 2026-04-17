import { Condition } from "./condition";

export interface RowElements {
  attrID: string;
  attrName: string;
  attrType: string;
  isOperator: boolean;
  conditions: Array<Condition>;
  rowType: string;
  maxCondCount: number;
  initialSelections?: string[];
}
