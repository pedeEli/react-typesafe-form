import type {FormErrors, FormError} from './types/errors'
import type {TFormValue} from './types/common'
import type {Analisis} from './types/setup'


export const setError = (errors: FormErrors<TFormValue>, path: Array<string | number>, value: FormError, analisis: Analisis) => {
  const totalPath: string[] = []
  let obj: TFormValue = errors

  for (let i = 0; i < path.length; i++) {
    const key = path[i]
    totalPath.push(`${key}`)
    const totalPathStr = totalPath.join('.')

    const type = analisis.find(([regex]) => regex.test(totalPathStr))?.[1]
    if (!type) {
      obj[key] = value
    } else if (type === 'object') {
      obj[key] = obj[key] ?? {}
      obj = obj[key]
    } else if (type === 'tuple') {
      obj[key] = obj[key] ?? []
      obj = obj[key]
    } else {
      let items = obj[key] ?? {items: []}
      if (i === path.length - 1)
        items = {...items, ...value}
      obj[key] = items
      obj = items.items
    }
  }
}

export const deleteIfExists = <FormValue extends TFormValue>(
  errors: FormErrors<FormValue>,
  path: string[],
  analisis: Analisis,
  setErrors: (errors: FormErrors<FormValue>) => void
) => {
  const totalPath: string[] = []
  let obj: TFormValue = errors

  for (let i = 0; i < path.length; i++) {
    if (obj === undefined)
      return

    const key = path[i]
    totalPath.push(key)
    const totalPathStr = totalPath.join('.')
    const type = analisis.find(([regex]) => regex.test(totalPathStr))?.[1]

    if (!type && obj[key]) {
      delete obj[key]
      setErrors({...errors})
    } else if (type === 'object' || type === 'tuple') {
      obj = obj[key]
    } else if (i !== path.length - 1) {
      obj = obj[key]?.items
    } else if (type === 'array' && obj[key].message && obj[key].code) {
      delete obj[key].message
      delete obj[key].code
      setErrors({...errors})
    }
  }
}