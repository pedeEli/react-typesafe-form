import {ZodIssueCode} from 'zod'

export type GetPaths<
  O extends object,
  Prefix extends string = '',
  Keys extends Exclude<keyof O, symbol> = Exclude<keyof O, symbol>
> = {
  [K in Keys]: ExtractPath<O[K], K, Prefix>
}[Keys]

type ExtractPath<
  A extends any,
  K extends number | string,
  Prefix extends string
> = A extends object
  ? A extends any[]
  ? ExtractPath<A[number], number, Prefix extends '' ? `${K}` : `${Prefix}.${K}`>
  : GetPaths<A, Prefix extends '' ? `${K}` : `${Prefix}.${K}`>
  : Prefix extends '' ? `${K}` : `${Prefix}.${K}`


export interface FormError {
  message: string,
  code: ZodIssueCode
}

export type Errors<
  O extends object,
  ObjectValueKeys extends keyof O = GetObjectValueKeys<O>,
  RestKeys extends keyof O = Exclude<keyof O, ObjectValueKeys | symbol>
> = {
  [K in ObjectValueKeys]: O[K] extends object ? Errors<O[K]> : never
} & {
  [K in RestKeys]?: FormError 
}


type GetObjectValueKeys<
  O extends Object,
  Keys extends Exclude<keyof O, symbol> = Exclude<keyof O, symbol>
> = {
  [K in Keys]: O[K] extends object ? K : never
}[Keys]



export interface FormContext {
  _registerFieldArray: (name: string) => void,
  _unregisterFieldArray: (name: string) => void
}