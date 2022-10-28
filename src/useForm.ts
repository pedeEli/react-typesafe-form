import {useRef, useState, useMemo} from 'react'
import {
  ZodObject,
  ZodRawShape,
  ZodTypeAny,
  ZodTuple,
  ZodArray,
  ZodOptional
} from 'zod'
import {
  TFormValue,
  UseFormProps,
  UseFormReturn,
  FormErrors,
  UseFormRegister,
  Analisis
} from './types'
import {getInitialError, analyzeValidator} from './setup'
import {setError, deleteIfExists} from './errors'


export const useForm = <FormValue extends TFormValue>(props: UseFormProps<FormValue>): UseFormReturn<FormValue> => { 
  const initialError = getInitialError<FormValue>(props.validator)

  const analisis = useMemo(() => analyzeValidator(props.validator), [props.validator])

  const inputMap = useRef(new Map<string, {element: HTMLInputElement | HTMLSelectElement | null, value?: string | number}>())
  const [errors, setErrors] = useState<FormErrors<FormValue>>(initialError)
  const submitFailed = useRef(false)

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
      setError(acc, path, {message, code}, analisis)
      return acc
    }, {} as any)
    setErrors(newErrors)
  }

  const register: UseFormRegister<FormValue> = (name, value?) => {
    const path = (name as string).split('.')
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



const setValueAt = (obj: Record<string, any>, path: Array<string | number>, value: any, analisis: Analisis, totalPath: string[] = []): void => {
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