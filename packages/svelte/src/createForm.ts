import {writable, get} from 'svelte/store'

import {setup} from '@typesafe-form/base/setup'
import {getValidator, setValueAt, clone} from '@typesafe-form/base/utils'
import {setError, deleteIfExists} from '@typesafe-form/base/errors'

import type {ActionReturn} from 'svelte/action'
import type {Readable} from 'svelte/store'

import type {TFormValue} from '@typesafe-form/base/types/common'
import type {FormProps} from '@typesafe-form/base/types/form'
import type {FormPath} from '@typesafe-form/base/types/path'
import type {FormErrors} from '@typesafe-form/base/types/errors'


export const createForm = <
  FormValue extends TFormValue
>(props: FormProps<FormValue>): CreateFormReturn<FormValue> => {
  const {analisis, initialError} = setup(props.validator)

  const inputMap = new Map<string, {element: HTMLInputElement | HTMLSelectElement, value?: string | number}>()
  const errors = writable(initialError)
  let submitFailed = false

  const handleSubmit: CreateFormHandleSubmit = event => {
    event.preventDefault()

    const obj = Array.from(inputMap.entries()).reduce<TFormValue>((acc, [path, {element}]) => {
      const value = element.type === 'number' ? parseInt(element.value) : element.value
      setValueAt(acc, path.split('.'), value, analisis)
      return acc
    }, {})

    const result = props.validator.safeParse(obj)
    if (result.success) {
      submitFailed = false
      return props.onSubmit(result.data)
    }

    submitFailed = true
    const newErrors = result.error.errors.reduce<FormErrors<FormValue>>((acc, issue) => {
      const {message, code, path} = issue
      setError(acc, path, {message, code}, analisis)
      return acc
    }, clone(initialError))
    errors.set(newErrors)
  }

  const register: CreateFormRegister<FormValue> = (element, {name, value}) => {
    let path = name.split('.')
    let val = getValidator(props.validator, path)

    inputMap.set(name, {element, value})
    element.name = name
    if (value !== undefined)
      element.value = `${value}`

    const handleInput = (event: Event) => {
      if (!submitFailed)
        return

      const {value, type} = element
      const result = val.safeParse(value === '' ? undefined : type === 'number' ? parseInt(value) : value)
      if (!result.success) {
        const {message, code} = result.error.errors[0]
        errors.update(prev => {
          setError(prev, path, {message, code}, analisis)
          return prev
        })
        return
      }

      deleteIfExists(get(errors), path, analisis, errors.set)
    }
    element.addEventListener('input', handleInput)

    return {
      update: parameter => {
        inputMap.delete(name)
        inputMap.set(parameter.name, {element, value: parameter.value})
        element.name = parameter.name
        if (parameter.value !== undefined)
          element.value = `${parameter.value}`
        path = parameter.name.split('.')
        val = getValidator(props.validator, path)
      },
      destroy: () => {
        inputMap.delete(name)
        element.removeEventListener('input', handleInput)
      }
    }
  }

  const reset: CreateFormReset = () => {
    submitFailed = false
    inputMap.forEach(({element, value}) => {
      element.value = (value ?? '').toString()
    })
    errors.set(initialError)
  }

  return {
    handleSubmit,
    register,
    reset,
    errors: {
      subscribe: errors.subscribe
    }
  }
}

type CreateFormReturn<FormValue extends TFormValue> = {
  handleSubmit: CreateFormHandleSubmit,
  reset: CreateFormReset,
  register: CreateFormRegister<FormValue>,
  errors: Readable<FormErrors<FormValue>>
}

type CreateFormHandleSubmit = (event: SubmitEvent) => void

type CreateFormReset = () => void

type CreateFormRegister<
  FormValue extends TFormValue
> = (
  element: HTMLInputElement | HTMLSelectElement,
  parameter: {
    name: FormPath<FormValue>,
    value?: string | number
  }
) => ActionReturn<{
  name: FormPath<FormValue>,
  value?: string | number
}>