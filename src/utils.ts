import {ZodObject, ZodArray, ZodTuple, ZodOptional} from 'zod'

import type {ZodRawShape, ZodTypeAny} from 'zod'

import type {TFormValue} from './types/common'
import type {Analisis} from './types/setup'


export const setValueAt = (obj: TFormValue, path: Array<string | number>, value: any, analisis: Analisis): void => {
  const totalPath: string[] = []
  for (let i = 0; i < path.length; i++) {
    const key = path[i]
    if (i === path.length - 1) {
      if (value === '')
        return
      obj[key] = value
      return
    }

    totalPath.push(`${key}`)
    const type = analisis.find(([regex]) => regex.test(totalPath.join('.')))?.[1]
    const subObj = obj[key] ?? (type === 'object' ? {} : [])
    obj[key] = subObj
    obj = subObj
  }
}

export const getValueAt = (obj: TFormValue, path: string[]) => {
  for (let i = 0; i < path.length; i++) {
    const key = path[i]
    obj = obj[key]
  }
  return obj
}

export const getValidator = (validator: ZodObject<ZodRawShape, any, any, TFormValue>, path: Array<string>): ZodTypeAny => {
  let val: ZodTypeAny = validator

  for (let i = 0; i < path.length; i++) {
    const key = path[i]

    if (val instanceof ZodOptional)
      val = val.unwrap()

    if (val instanceof ZodObject) {
      val = val.shape[key]
    } else if (val instanceof ZodArray) {
      val = val.element
    } else if (val instanceof ZodTuple) {
      val = val.items[key]
    }

  }

  return val
}

export const clone = <T>(value: T): T => {
  if (Array.isArray(value))
    return value.map(clone) as T
  if (typeof value === 'object')
    return Object.keys(value as object).reduce<TFormValue>((acc, key) => {
      acc[key] = clone((value as any)[key])
      return acc
    }, {} as TFormValue) as T
  return value
}