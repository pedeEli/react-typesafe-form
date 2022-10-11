import React, {useRef, useState} from 'react'
import {ZodObject, ZodRawShape} from 'zod'

interface UseForm<Object extends object> {
  onSubmit: (values: Object) => void,
  validator: ZodObject<ZodRawShape, any, any, Object>
}

export const useForm = <Object extends object>({onSubmit, validator}: UseForm<Object>) => {
  const inputMap = useRef(new Map<string | number | symbol, {element: HTMLInputElement | null, value?: string}>())
  const [errors, setErrors] = useState<Partial<Record<keyof Object, {message: string, code: string}>>>({})
  const submitFailed = useRef(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const obj = Array.from(inputMap.current.entries()).reduce<Record<string | number | symbol, string | undefined>>((acc, [name, {element}]) => {
      acc[name] = element?.value
      return acc
    }, {})

    const result = validator.safeParse(obj)
    if (result.success) {
      submitFailed.current = false
      return onSubmit(result.data)
    }
    
    submitFailed.current = true
    const newErrors = result.error.errors.reduce<typeof errors>((acc, issue) => {
      const {message, code, path: [name]} = issue
      acc[name as keyof Object] = {message, code}
      return acc
    }, {})
    setErrors(newErrors)
  }

  const register = <Key extends keyof Object>(name: Key, value?: string) => {
    return {
      ref: (element: HTMLInputElement | null) => inputMap.current.set(name, {element, value}),
      name,
      defaultValue: value,
      onChange: (event: React.FormEvent<HTMLInputElement>) => {
        if (!submitFailed.current)
          return
        const result = validator.shape[name as string].safeParse(event.currentTarget.value)
        if (!result.success) {
          const {message, code} = result.error.errors[0]
          setErrors(prev => {
            return {
              ...prev,
              [name]: { message, code }
            }
          })
          return
        }
        if (errors[name]) {
          setErrors(prev => {
            delete prev[name]
            return {...prev}
          })
        }
      }
    }
  }

  const reset = () => {
    inputMap.current.forEach(({element, value}) => {
      if (element)
        element.value = value ?? ''
    })
    setErrors({})
  }

  return {
    handleSubmit,
    register,
    reset,
    errors
  }
}