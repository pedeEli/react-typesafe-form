import React, {useRef, useState} from 'react'
import {ZodObject, ZodRawShape, AnyZodObject, ZodNumber, ZodString} from 'zod'
import {GetPaths, Errors, FormError} from './types'


interface UseForm<Object extends object> {
  onSubmit: (values: Object) => void,
  validator: ZodObject<ZodRawShape, any, any, Object>
}

export const useForm = <Object extends object>({onSubmit, validator}: UseForm<Object>) => { 
  type Paths = GetPaths<Object>

  const initialError = getInitialError(validator)

  const inputMap = useRef(new Map<string, {element: HTMLInputElement | HTMLSelectElement | null, value?: string | number}>())
  const [errors, setErrors] = useState<Errors<Object>>(initialError)
  const submitFailed = useRef(false)

  const getValidator = (o: AnyZodObject, path: Array<string | number>): ZodNumber | ZodString => {
    for (let i = 0; i < path.length; i++) {
      const key = path[i]
      if (i === path.length - 1)
        return o.shape[key]
      o = o.shape[key]
    }
    throw new Error('wrong name')
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const obj = Array.from(inputMap.current.entries()).reduce<object>((acc, [path, {element}]) => {
      if (!element)
        return acc

      const value = element.type === 'number' ? parseInt(element.value) : element.value
      setValueAt(acc, path.split('.'), value)
      return acc
    }, {})

    const result = validator.safeParse(obj)
    if (result.success) {
      submitFailed.current = false
      return onSubmit(result.data)
    }
    
    submitFailed.current = true
    const newErrors = result.error.errors.reduce<typeof errors>((acc, issue) => {
      const {message, code, path} = issue
      setValueAt(acc, path, {message, code})
      return acc
    }, {} as any)
    setErrors(newErrors)
  }

  const register = (name: Paths, value?: string | number) => {
    const path = (name as string).split('.')

    return {
      ref: (element: HTMLInputElement | HTMLSelectElement | null) => inputMap.current.set(name as string, {element, value}),
      name,
      defaultValue: value,
      onChange: (event: React.FormEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!submitFailed.current)
          return
        
        const {currentTarget: {value, type}} = event
        const v = getValidator(validator, [...path])
        const result = v.safeParse(value === '' ? undefined : type === 'number' ? parseInt(value) : value)
        if (!result.success) {
          const {message, code} = result.error.errors[0]
          setErrors(prev => {
            setValueAt(prev, [...path], {message, code})
            return {...prev}
          })
          return
        }

        if (getErrorAt(errors, [...path])) {
          setErrors(prev => {
            deleteErrorAt(prev, [...path])
            return {...prev}
          })
        }
      }
    }
  }

  const reset = () => {
    inputMap.current.forEach(({element, value}) => {
      if (element)
        element.value = (value ?? '').toString()
    })
    setErrors(initialError)
  }

  return {
    handleSubmit,
    register,
    reset,
    errors
  }
}



const setValueAt = (obj: Record<string | number, any>, path: Array<string | number>, value: any): void => {
  if (path.length === 0)
    throw new Error('paths length cannot be zero')

  const key = path.shift()!
  if (path.length === 0) {
    if (value === '')
      return
    return obj[key] = value
  }

  const subObj = obj[key] ?? {}
  obj[key] = subObj
  setValueAt(subObj, path, value)
}

const getErrorAt = (obj: Record<string | number, any>, path: Array<string | number>): FormError => {
  if (path.length === 0)
    throw new Error('path length cannot be zero')

  const key = path.shift()!
  if (path.length === 0)
    return obj[key] as FormError

  return getErrorAt(obj[key], path)
}

const deleteErrorAt = (obj: Record<string | number, any>, path: Array<string | number>): void => {
  if (path.length === 0)
    throw new Error('path length cannot be zero')

  const key = path.shift()!
  if (path.length === 0) {
    delete obj[key]
    return
  }

  deleteErrorAt(obj[key], path)
}


const getInitialError = <Object extends object, E extends Errors<Object>>(validator: ZodObject<ZodRawShape, any, any, Object>) => {
  return Object.entries(validator.shape).reduce<E>((acc, [key, value]) => {
    if (value instanceof ZodObject) {
      (acc as any)[key] = getInitialError(value)
    }
    return acc
  }, {} as any)
}