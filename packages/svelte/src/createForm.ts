import {setup} from '@typesafe-form/base/setup'

import type {TFormValue} from '@typesafe-form/base/types/common'
import type {FormProps} from '@typesafe-form/base/types/form'


export const createForm = <FormValue extends TFormValue>(props: FormProps<FormValue>): Test => {
  const {analisis, initialError} = setup(props.validator)

  return {
    register: () => {
      return {
        'on:submit': event => {
          event.preventDefault()
          console.log('on:submit')
        }
      }
    }
  }
}

type Test = {
  register: () => {
    'on:submit': (event: Event) => void
  }
}