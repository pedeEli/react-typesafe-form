import {
  TFormValue,
  BrowserNativeObject,
  IsTuple,
  KeyOf,
  Primitive,
  TupleKeys
} from './common'

export type FormPath<FormValue extends TFormValue> = Path<FormValue>

type Path<T> = T extends ReadonlyArray<infer A>
  ? IsTuple<T> extends true
    ? {
      [K in TupleKeys<T>]: PathImpl<K, T[K]>
    }[TupleKeys<T>]
    : PathImpl<number, A>
  : {
    [K in KeyOf<T>]: PathImpl<K, T[K]>
  }[KeyOf<T>]

type PathImpl<K extends string | number, V> =
  V extends Primitive | BrowserNativeObject
  ? `${K}`
  : `${K}.${Path<V>}`