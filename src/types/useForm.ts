import {TFormValue} from './common'
import {ZodObject, ZodRawShape} from 'zod'
import {FormPath} from './path'
import {FormErrors} from './errors'

export type UseFormProps<
  FormValue extends TFormValue
> = {
  onSubmit: (values: Object) => void,
  validator: ZodObject<ZodRawShape, any, any, FormValue>
}

export type UseFormReturn<
  FormValue extends TFormValue
> = {
  handleSubmit: UseFormHandleSubmit,
  register: UseFormRegister<FormValue>,
  errors: FormErrors<FormValue>,
  reset: () => void
}


type UseFormHandleSubmit = (event: React.FormEvent<HTMLFormElement>) => void

export type UseFormRegister<
  FormValue extends TFormValue
> = (name: FormPath<FormValue>, value?: string | number) => {
  ref: (element: HTMLInputElement | HTMLSelectElement | null) => void,
  name: string,
  defaultValue: string | number | undefined,
  onChange: (event: React.SyntheticEvent<HTMLInputElement | HTMLSelectElement>) => void
}