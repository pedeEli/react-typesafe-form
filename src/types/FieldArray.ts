import {UseFormRegisterArrayReturn} from './useForm'

export interface RenderProps {
  items: Array<{
    id: string,
    remove: () => void
    append: () => void,
    prepend: () => void
  }>,
  append: () => void,
  prepend: () => void,
  remove: (id: number | string) => void,
  insert: (index: number) => void,
  swap: (id1: number | string, id2: number | string) => void
}

export type NestedArrayProps = {
  render: (props: RenderProps) => JSX.Element | JSX.Element[],
} & UseFormRegisterArrayReturn