import React, {useState, useRef, useCallback} from 'react'

interface RenderProps {
  items: Array<{
    id: string,
    remove: () => void
    append: () => void,
    prepend: () => void
  }>,
  append: () => void,
  prepend: () => void,
  remove: (id: number | string) => void
}

interface NestedArrayProps {
  render: (props: RenderProps) => JSX.Element | JSX.Element[]
}

export const FieldArray = (props: NestedArrayProps) => {
  const ids = useRef(new Set<string>())
  const [items, setItems] = useState<RenderProps['items']>([])

  const createItem = useCallback((): RenderProps['items'][number] => {
    const id = createId(ids.current)
    return {
      id,
      remove: () => {
        setItems(prev => {
          return prev.filter(item => item.id !== id)
        })
      },
      append: () => {
        setItems(prev => {
          const index = prev.findIndex(item => item.id === id)
          return [...prev.slice(0, index + 1), createItem(), ...prev.slice(index + 1)]
        })
      },
      prepend: () => {
        setItems(prev => {
          const index = prev.findIndex(item => item.id === id)
          return [...prev.slice(0, index), createItem(), ...prev.slice(index)]
        })
      }
    }
  }, [ids.current])

  const append: RenderProps['append'] = useCallback(() => {
    setItems(prev => {
      return [...prev, createItem()]
    })
  }, [])

  const prepend: RenderProps['prepend'] = useCallback(() => {
    setItems(prev => {
      return [createItem(), ...prev]
    })
  }, [])

  const remove: RenderProps['remove'] = useCallback(id => {
    if (typeof id === 'number') {
      return setItems(prev => {
        return [...prev.slice(0, id), ...prev.slice(id + 1)]
      })
    }
    setItems(prev => {
      return prev.filter(item => item.id !== id)
    })
  }, [])

  return <>
    {props.render({
      items,
      append,
      prepend,
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