import React, {useState} from 'react'

interface RenderProps {
  items: Array<{id: string}>,
  append: () => void
}

interface NestedArrayProps {
  render: (props: RenderProps) => JSX.Element | JSX.Element[]
}

export const FieldArray = (props: NestedArrayProps) => {
  const [items, setItems] = useState<RenderProps['items']>([])

  const append: RenderProps['append'] = () => {
    setItems(prev => {
      return [...prev, {id: Math.random().toString(36)}]
    })
  }

  return <>
    {props.render({
      items,
      append
    })}
  </>
}