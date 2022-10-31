import {useRef, useState, useMemo, useCallback} from 'react'
import {
  ZodObject,
  ZodRawShape,
  ZodTypeAny,
  ZodTuple,
  ZodArray,
  ZodOptional
} from 'zod'
import {getInitialError, analyzeValidator} from './setup'
import {setError, deleteIfExists} from './errors'

import type {TFormValue} from './types/common'
import type {
  UseFormHandleSubmit,
  UseFormProps,
  UseFormRegister,
  UseFormReset,
  UseFormReturn,
  UseFormRegisterArray
} from './types/useForm'
import type {Analisis} from './types/setup'
import type {FormErrors} from './types/errors'


export const useForm = <FormValue extends TFormValue>(props: UseFormProps<FormValue>): UseFormReturn<FormValue> => { 
  const initialError = useMemo(() => getInitialError<FormValue>(props.validator), [props.validator])
  const analisis = useMemo(() => analyzeValidator(props.validator), [props.validator])

  const inputMap = useRef(new Map<string, {element: HTMLInputElement | HTMLSelectElement | null, value?: string | number}>())
  const arrayMap = useRef(new Map<string, {reset: () => void}>())
  const [errors, setErrors] = useState<FormErrors<FormValue>>(initialError)
  const submitFailed = useRef(false)

  const handleSubmit: UseFormHandleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const obj = Array.from(inputMap.current.entries()).reduce<TFormValue>((acc, [path, {element}]) => {
      if (!element)
        return acc

      const value = element.type === 'number' ? parseInt(element.value) : element.value
      setValueAt(acc, path.split('.'), value, analisis)
      return acc
    }, {})

    const result = props.validator.safeParse(obj)
    if (result.success) {
      submitFailed.current = false
      return props.onSubmit(result.data)
    }
    
    submitFailed.current = true
    const newErrors = result.error.errors.reduce<typeof errors>((acc, issue) => {
      const {message, code, path} = issue
      setError(acc, path, {message, code}, analisis)
      return acc
    }, clone(initialError))
    setErrors(newErrors)
  }, [props.validator])

  const register: UseFormRegister<FormValue> = useCallback((name, value?) => {
    const path = name.split('.')
    const val = getValidator(props.validator, path) 

    return {
      ref: element => inputMap.current.set(name as string, {element, value}),
      name: name as string,
      defaultValue: value,
      onChange: event => {
        if (!submitFailed.current)
          return
        
        const {currentTarget: {value, type}} = event
        const result = val.safeParse(value === '' ? undefined : type === 'number' ? parseInt(value) : value)
        if (!result.success) {
          const {message, code} = result.error.errors[0]
          setErrors(prev => {
            setError(prev, path, {message, code}, analisis)
            return {...prev}
          })
          return
        }

        deleteIfExists(errors, path, analisis, setErrors)
      }
    }
  }, [props.validator, errors])

  const reset: UseFormReset = useCallback(() => {
    submitFailed.current = false
    inputMap.current.forEach(({element, value}) => {
      if (element)
        element.value = (value ?? '').toString()
    })
    arrayMap.current.forEach(array => array.reset())
    setErrors(prev => initialError)
  }, [])

  const registerArray: UseFormRegisterArray<FormValue> = useCallback(name => {
    const path = name.split('.')
    const val = getValidator(props.validator, path)
    if (!(val instanceof ZodArray))
      throw new Error(`${name} is not an array`)

    return {
      element: reset => {
        if (reset) {
          arrayMap.current.set(name, {reset})
          return
        }
        arrayMap.current.delete(name)
      },
      onChange: () => {
        if (!submitFailed.current)
          return
        
        const obj = Array.from(inputMap.current.entries()).reduce<TFormValue>((acc, [path, {element}]) => {
          if (!element || !path.startsWith(name))
            return acc
    
          const value = element.type === 'number' ? parseInt(element.value) : element.value
          setValueAt(acc, path.split('.'), value, analisis)
          return acc
        }, {})
        
        const value = getValueAt(obj, path)
        const result = val.safeParse(value)
        if (result.success) {
          deleteIfExists(errors, path, analisis, setErrors)
          return
        }
        
        const error = result.error.errors.find(issue => issue.path.length === 0)
        if (error) {
          setErrors(prev => {
            const {message, code} = error
            setError(prev, path, {message, code}, analisis)
            return {...prev}
          })
          return
        }
        
        deleteIfExists(errors, path, analisis, setErrors)
      }
    }
  }, [props.validator, errors])

  return {
    handleSubmit,
    register,
    reset,
    errors,
    registerArray
  }
}



const setValueAt = (obj: TFormValue, path: Array<string | number>, value: any, analisis: Analisis, totalPath: string[] = []): void => {
  if (path.length === 0)
    throw new Error('paths length cannot be zero')

  const key = path.shift()!
  if (path.length === 0) {
    if (value === '')
      return
    return obj[key] = value
  }

  const newTotalPath = [...totalPath, `${key}`]
  const type = analisis.find(([regex]) => regex.test(newTotalPath.join('.')))![1]
  const subObj = obj[key] ?? (type === 'array' ? [] : {})
  obj[key] = subObj
  setValueAt(subObj, path, value, analisis, newTotalPath)
}

const getValueAt = (obj: TFormValue, path: string[]) => {
  for (let i = 0; i < path.length; i++) {
    const key = path[i]
    obj = obj[key]
  }
  return obj
}

const getValidator = (validator: ZodObject<ZodRawShape, any, any, TFormValue>, path: Array<string>): ZodTypeAny => {
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

const clone = <T>(value: T): T => {
  if (Array.isArray(value))
    return value.map(clone) as T
  if (typeof value === 'object')
    return Object.keys(value as object).reduce<TFormValue>((acc, key) => {
      acc[key] = clone((value as any)[key])
      return acc
    }, {} as TFormValue) as T
  return value
}