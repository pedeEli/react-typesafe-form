import React, {useState, useRef} from 'react'

interface RenderProps {
  items: Array<{
    id: string,
    remove: () => void
  }>,
  append: () => void,
  remove: (id: number | string) => void
}

interface NestedArrayProps {
  render: (props: RenderProps) => JSX.Element | JSX.Element[]
}

export const FieldArray = (props: NestedArrayProps) => {
  const ids = useRef(new Set<string>())
  const [items, setItems] = useState<RenderProps['items']>([])

  const append: RenderProps['append'] = () => {
    setItems(prev => {
      const id = createId(ids.current)
      return [...prev, {
        id,
        remove: () => {
          setItems(prev => {
            return prev.filter(item => item.id !== id)
          })
        }
      }]
    })
  }

  const remove: RenderProps['remove'] = (id) => {
    if (typeof id === 'number') {
      return setItems(prev => {
        return [...prev.slice(0, id), ...prev.slice(id + 1)]
      })
    }
    setItems(prev => {
      return prev.filter(item => item.id !== id)
    })
  }

  return <>
    {props.render({
      items,
      append,
      remove
    })}
  </>
}


const createId = (ids: Set<string>): string => {
  const id = Math.random().toString(36)
  if (ids.has(id))
    return createId(ids)
  return id
}