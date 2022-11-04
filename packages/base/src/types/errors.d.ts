import type {TFormValue, KeyOf, BrowserNativeObject, IsTuple} from './common'
import type {ZodIssueCode} from 'zod'

export type FormError = {
  message: string,
  code: ZodIssueCode
}

export type FormErrors<
  FormValue extends TFormValue,
  ObjectKeys extends keyof FormValue = GetObjectValueKeys<FormValue>  
> = {
  [K in ObjectKeys]: ErrorImpl<FormValue[K]>
} & {
  [K in Exclude<keyof FormValue, ObjectKeys | symbol>]?: FormError
}

type ErrorImpl<V> = V extends TFormValue
  ? V extends ReadonlyArray<infer A>
    ? IsTuple<V> extends false
      ? {
        items: Array<(A extends TFormValue ? FormErrors<A> : FormError) | undefined>
      } & Partial<FormError>
      : TupleErrors<V>
    : FormErrors<V>
  : never

type TupleErrors<Arr extends ReadonlyArray<any>> = Arr extends [infer A, ...infer Rest]
  ? [A extends TFormValue ? FormErrors<A> : FormError | undefined, ...TupleErrors<Rest>]
  : []

type GetObjectValueKeys<FormValue extends TFormValue> = {
  [K in KeyOf<FormValue>]: FormValue[K] extends BrowserNativeObject | Blob
    ? never
    : FormValue[K] extends TFormValue | undefined
      ? FormValue[K] extends undefined
        ? never
        : K
      : FormValue[K] extends TFormValue
        ? K
        : never
}[KeyOf<FormValue>]