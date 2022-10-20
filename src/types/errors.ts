import {TFormValue, KeyOf, BrowserNativeObject} from './common'
import {ZodIssueCode} from 'zod'

export type FormError = {
  message: string,
  code: ZodIssueCode
}

export type FormErrors<
  FormValue extends TFormValue,
  ObjectKeys extends keyof FormValue = GetObjectValueKeys<FormValue>  
> = {
  [K in ObjectKeys]: FormValue[K] extends TFormValue ? FormErrors<FormValue[K]> : never
} & {
  [K in Exclude<keyof FormValue, ObjectKeys | symbol>]?: FormValue[K] extends Array<any>
    ? FormError & FormErrors<FormValue[K]>
    : FormError
}

type GetObjectValueKeys<FormValue extends TFormValue> = {
  [K in KeyOf<FormValue>]: FormValue[K] extends BrowserNativeObject | Blob
    ? never
    : FormValue[K] extends ReadonlyArray<infer A>
    ? FormValue[K] extends Array<A>
      ? never
      : K
    : FormValue[K] extends TFormValue
    ? K
    : never
}[KeyOf<FormValue>]