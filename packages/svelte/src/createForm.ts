import {setup} from 'typesafe-form/setup'

import type {TFormValue} from 'typesafe-form/types/common'
import type {FormProps} from 'typesafe-form/types/form'


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