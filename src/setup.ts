import {
  ZodObject,
  ZodOptional,
  ZodArray,
  ZodTuple
} from 'zod'

import type {
  AnyZodTuple,
  ZodRawShape,
  ZodTypeAny
} from 'zod'

import type {Analisis} from './types/setup'
import type {FormErrors} from './types/errors'
import type {TFormValue} from './types/common'


export const getInitialError = <FormValue extends TFormValue>(validator: ZodObject<ZodRawShape, any, any, FormValue>) => {
  return getInitialErrorImpl(validator) as FormErrors<FormValue>
}

const getInitialErrorImpl = (validator: ZodTypeAny): object | undefined => {
  if (validator instanceof ZodOptional)
    return undefined

  if (validator instanceof ZodObject) {
    return Object.entries((validator as ZodObject<ZodRawShape, any, any, TFormValue>).shape).reduce((acc, [key, val]) => {
      const err = getInitialErrorImpl(val)
      if (err)
        acc[key] = err
      return acc
    }, {} as TFormValue)
  }
  
  if (validator instanceof ZodArray) {
    return {items: []} as any
  }
  
  if (validator instanceof ZodTuple) {
    return (validator.items as ZodTypeAny[]).reduce((acc, item, index) => {
      const err = getInitialErrorImpl(item)
      if (err)
        acc[index] = err
      return acc
    }, [] as any)
  }

  return undefined
}


export const analyzeValidator = (
  validator: ZodTypeAny,
  map: Analisis = [],
  path?: string
): Analisis => {
  if (validator instanceof ZodOptional) {
    analyzeValidator(validator.unwrap(), map, path)
  } else if (validator instanceof ZodObject) {
    if (path)
      map.push([new RegExp(`^${path}$`), 'object'])
    Object.entries((validator as ZodObject<ZodRawShape, any, any, TFormValue>).shape).forEach(([key, val]) => {
      const newPath = path ? `${path}\.${key}` : key
      analyzeValidator(val, map, newPath)
    })
  } else if (validator instanceof ZodArray) {
    if (path)
      map.push([new RegExp(`^${path}$`), 'array'])
    const newPath = path ? `${path}\.[0-9]+` : '[0-9]+'
    analyzeValidator((validator as ZodArray<ZodTypeAny>).element, map, newPath)
  } else if (validator instanceof ZodTuple) {
    if (path)
      map.push([new RegExp(`^${path}$`), 'tuple'])
    const newPath = path ? `${path}\.[0-9]+` : '[0-9]+'
    ;(validator as AnyZodTuple).items.forEach(item => {
      analyzeValidator(item, map, newPath)
    })
  }
  return map
}