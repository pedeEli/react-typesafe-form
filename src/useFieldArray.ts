// import {FormContext} from './types'
import {useEffect} from 'react'

interface UseFieldArray {
  name: string,
  context: any//FormContext
}

export const useFieldArray = ({name, context}: UseFieldArray) => {
  useEffect(() => {
    context._registerFieldArray(name)
    return () => context._unregisterFieldArray(name)
  }, [])
}