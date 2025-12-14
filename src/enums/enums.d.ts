export interface EnumItem {
  readonly value: number;
  readonly member: string;
  readonly name: string;
  readonly text: string;
  readonly class: string;
  readonly guidId: string;
}

export interface EnumCategory {
  get(value: number): EnumItem | null;
  list: EnumItem[];
}

export interface Enums {
  readonly dataStatus: DataStatusEnumCategory;
  readonly resultCode: ResultCodeEnumCategory;
}

export interface DataStatusEnumCategory extends EnumCategory {
  readonly active: EnumItem;
  readonly inactive: EnumItem;
  readonly deleted: EnumItem;
}

export type DataStatusValue = 0 | 1 | 2;

export interface ResultCodeEnumCategory extends EnumCategory {
  readonly sUCCESS: EnumItem;
  readonly pARAMS_ERROR: EnumItem;
  readonly eRROR: EnumItem;
  readonly uSER_NOT_FOUND: EnumItem;
  readonly uSER_SESSION_EXPIRED: EnumItem;
  readonly uSER_PERMISSION_ERROR: EnumItem;
  readonly pRODUCT_NOT_FOUND: EnumItem;
  readonly pRODUCT_ERROR: EnumItem;
  readonly rATE_LIMIT_ERROR: EnumItem;
}

export type ResultCodeValue = 200 | 4002 | 400 | 20002 | 20004 | 20005 | 11001 | 11002 | 1003;

declare const enumType: Enums;
export default enumType;
