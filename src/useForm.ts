import {useRef, useState, useMemo} from 'react'
import {ZodObject, ZodRawShape, ZodTypeAny, ZodTuple, ZodArray, AnyZodTuple, ZodOptional} from 'zod'
import {
  TFormValue,
  UseFormProps,
  UseFormReturn,
  FormErrors,
  UseFormRegister,
  FormError
} from './types'

export const useForm = <FormValue extends TFormValue>(props: UseFormProps<FormValue>): UseFormReturn<FormValue> => { 
  const initialError = getInitialError<FormValue>(props.validator)

  const analisis = useMemo(() => analyzeValidator(props.validator), [props.validator])

  const inputMap = useRef(new Map<string, {element: HTMLInputElement | HTMLSelectElement | null, value?: string | number}>())
  const [errors, setErrors] = useState<FormErrors<FormValue>>(initialError)
  const submitFailed = useRef(false)
  const fieldArrays = useRef(new Set<string>())

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const obj = Array.from(inputMap.current.entries()).reduce<object>((acc, [path, {element}]) => {
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
      setValueAt(acc, path, {message, code}, analisis)
      return acc
    }, {} as any)
    setErrors(newErrors)
  }

  const register: UseFormRegister<FormValue> = (name, value?) => {
    const path = (name as string).split('.')

    return {
      ref: element => inputMap.current.set(name as string, {element, value}),
      name: name as string,
      defaultValue: value,
      onChange: event => {
        if (!submitFailed.current)
          return
        
        const {currentTarget: {value, type}} = event
        const subValidator = getValidator(props.validator, [...path])
        const result = subValidator.safeParse(value === '' ? undefined : type === 'number' ? parseInt(value) : value)
        if (!result.success) {
          const {message, code} = result.error.errors[0]
          setErrors(prev => {
            setValueAt(prev, [...path], {message, code}, analisis)
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

  //   
  // _registerFieldArray:
  // (name:
  //   string
  //  ,
  //  FormErrors ) => {
  //     fieldArrays.current.add(name)
  //   },
  //   _unregisterFieldArray: (name: string) => {
  //     fieldArrays.current.delete(name)
  //   }
  // })

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
    errors,
    // context: context.current
  }
}



const setValueAt = (obj: Record<string, any>, path: Array<string | number>, value: any, analisis: Array<[RegExp, 'object' | 'array']>, totalPath: string[] = []): void => {
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

const getErrorAt = (obj: Record<string, any>, path: Array<string>): FormError => {
  if (path.length === 0)
    throw new Error('path length cannot be zero')

  const key = path.shift()!
  const error = obj[key] as FormError | undefined
  if (!error)
    throw new Error(`unknown key: ${key}`)

  if (path.length === 0)
    return error

  return getErrorAt(obj[key], path)
}

const deleteErrorAt = (obj: Record<string, any>, path: Array<string>): void => {
  if (path.length === 0)
    throw new Error('path length cannot be zero')

  const key = path.shift()!
  if (path.length === 0) {
    delete obj[key]
    return
  }

  deleteErrorAt(obj[key], path)
}

const getValidator = <Object extends object>(validator: ZodObject<ZodRawShape, any, any, Object>, path: Array<string>): ZodTypeAny => {
  if (path.length === 0)
    throw new Error('path length cannot be zero')

  const key = path.shift()!
  const subValidator = validator.shape[key]

  if (!subValidator)
    throw new Error(`unknown key: ${key}`)

  if (path.length === 0)
    return subValidator

  if (subValidator instanceof ZodObject)
    return getValidator(subValidator, path)

  throw new Error(`key is not a object validator: ${key}`)
}


const getInitialError = <FormValue extends TFormValue>(validator: ZodObject<ZodRawShape, any, any, Object>) => {
  return Object.entries(validator.shape).reduce<FormErrors<FormValue>>((acc, [key, value]) => {
    if (value instanceof ZodObject) {
      (acc as any)[key] = getInitialError(value)
    }
    return acc
  }, {} as any)
}


const analyzeValidator = (
  validator: ZodTypeAny,
  map: Array<[RegExp, 'object' | 'array']> = [],
  path?: string
) => {
  if (validator instanceof ZodOptional) {
    analyzeValidator(validator.unwrap(), map, path)
  } else if (validator instanceof ZodObject) {
    if (path)
      map.push([new RegExp(`^${path}$`), 'object'])
    Object.entries((validator as ZodObject<ZodRawShape, any, any, TFormValue>).shape).forEach(([key, val]) => {
      const newPath = path ? `${path}\.${key}` : `${key}`
      analyzeValidator(val, map, newPath)
    })
  } else if (validator instanceof ZodArray) {
    if (path)
      map.push([new RegExp(`^${path}$`), 'array'])
    const newPath = path ? `${path}\.[0-9]+` : '[0-9]+'
    analyzeValidator((validator as ZodArray<ZodTypeAny>).element, map, newPath)
  } else if (validator instanceof ZodTuple) {
    if (path)
      map.push([new RegExp(`^${path}$`), 'array'])
    const newPath = path ? `${path}\.[0-9]+` : '[0-9]+'
    ;(validator as AnyZodTuple).items.forEach(item => {
      analyzeValidator(item, map, newPath)
    })
  }
  return map
}