import React, {useState, useRef, useCallback, useEffect} from 'react'
import {NestedArrayProps, RenderProps} from './types/FieldArray'

export const FieldArray = (props: NestedArrayProps) => {
  const ids = useRef(new Set<string>())
  const [items, setItems] = useState<RenderProps['items']>([])

  useEffect(() => {
    props.element(() => setItems(prev => []))
    return () => props.element()
  }, [])

  useEffect(() => {
    props.onChange()
  }, [items])

  const removeItem = useCallback((id: string) => () => {
    setItems(prev => {
      return prev.filter(item => item.id !== id)
    })
  }, [])

  const appendItem = useCallback((id: string) => () => {
    setItems(prev => {
      const index = prev.findIndex(item => item.id === id)
      return [...prev.slice(0, index + 1), createItem(), ...prev.slice(index + 1)]
    })
  }, [])

  const prependItem = useCallback((id: string) => () => {
    setItems(prev => {
      const index = prev.findIndex(item => item.id === id)
      return [...prev.slice(0, index), createItem(), ...prev.slice(index)]
    })
  }, [])

  const createItem = useCallback((): RenderProps['items'][number] => {
    const id = createId(ids.current)
    return {
      id,
      remove: removeItem(id),
      append: appendItem(id),
      prepend: prependItem(id)
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

  const swap: RenderProps['swap'] = useCallback((id1, id2) => {
    setItems(prev => {
      const index1 = typeof id1 === 'number' ? id1 : items.findIndex(item => item.id === id1)
      const index2 = typeof id2 === 'number' ? id2 : items.findIndex(item => item.id === id2)
      
      const temp = prev[index1]
      prev[index1] = prev[index2]
      prev[index2] = temp

      return [...prev]
    })
  }, [])

  const insert: RenderProps['insert'] = useCallback(index => {
    setItems(prev => {
      return [...prev.slice(0, index), createItem(), ...prev.slice(index)]
    })
  }, [])


  return <>
    {props.render({
      items,
      append,
      prepend,
      remove,
      insert,
      swap
    })}
  </>
}


const createId = (ids: Set<string>): string => {
  const id = Math.random().toString(36)
  if (ids.has(id))
    return createId(ids)
  return id
}