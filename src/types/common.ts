export type TFormValue = Record<string, any>

export type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint

export type BrowserNativeObject = Date | FileList | File

export type IsTuple<Arr extends ReadonlyArray<any>> =
  number extends Arr['length'] ? false : true

export type TupleKeys<Arr extends ReadonlyArray<any>> = Exclude<keyof Arr, keyof any[] | symbol>

export type KeyOf<T> = Exclude<keyof T, symbol>