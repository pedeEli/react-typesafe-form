import type {ZodObject, ZodRawShape} from 'zod'

import type {TFormValue} from './common'

export type FormProps<
  FormValue extends TFormValue
> = {
  onSubmit: (values: FormValue) => void,
  validator: ZodObject<ZodRawShape, any, any, FormValue>
}