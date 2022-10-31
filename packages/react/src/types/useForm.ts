import type {TFormValue} from 'typesave-form/types/common'
import type {ZodObject, ZodRawShape} from 'zod'
import type {FormPath, FormArrayPath} from 'typesave-form/types/path'
import type {FormErrors} from 'typesave-form/types/errors'

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
  reset: UseFormReset,
  registerArray: UseFormRegisterArray<FormValue>
}

export type UseFormHandleSubmit = (event: React.FormEvent<HTMLFormElement>) => void

export type UseFormReset = () => void

export type UseFormRegister<
  FormValue extends TFormValue
> = (name: FormPath<FormValue>, value?: string | number) => UseFormRegisterReturn

type UseFormRegisterReturn = {
  ref: (element: HTMLInputElement | HTMLSelectElement | null) => void,
  name: string,
  defaultValue: string | number | undefined,
  onChange: (event: React.SyntheticEvent<HTMLInputElement | HTMLSelectElement>) => void
}


export type UseFormRegisterArray<
  FormValue extends TFormValue
> = (name: FormArrayPath<FormValue>) => UseFormRegisterArrayReturn

export type UseFormRegisterArrayReturn = {
  element: (reset?: (() => void) | null) => void,
  onChange: () => void
}