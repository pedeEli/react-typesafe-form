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


export type FormArrayPath<FormValue extends TFormValue> = ArrayPath<FormValue>

type ArrayPath<T> = T extends ReadonlyArray<infer A>
  ? IsTuple<T> extends true
    ? {
      [K in TupleKeys<T>]: ArrayPathImpl<K, T[K]>
    }[TupleKeys<T>]
    : ArrayPathImpl<number, A>
  : {
    [K in KeyOf<T>]: ArrayPathImpl<K, T[K]>
  }[KeyOf<T>]

type ArrayPathImpl<K extends number | string, V> =
  V extends Primitive | BrowserNativeObject
  ? never
  : V extends ReadonlyArray<any>
    ? IsTuple<V> extends true
      ? `${K}.${ArrayPath<V>}`
      : K | `${K}.${ArrayPath<V>}`
    : `${K}.${ArrayPath<V>}`