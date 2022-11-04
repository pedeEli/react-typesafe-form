import React, {useState} from 'react'
import {useForm, FieldArray} from '@typesafe-form/react'
import z from 'zod'


const validator = z.object({
  persons: z.array(z.object({
    name: z.string()
  })),
  meta: z.string()
})

const App = () => {
  const {handleSubmit, register, errors, reset, registerArray} = useForm({
    onSubmit: (value) => {
      reset()
      console.log(value)
    },
    validator
  })

  const [selection, setSelection] = useState<number>()

  const select = (index: number, swap: (id1: number, id2: number) => void) => () => {
    if (selection === undefined) {
      setSelection(index)
      return
    }
    swap(selection, index)
    setSelection(undefined)
  }

  return <main>
    <h1 className="text-3xl">Input Testing</h1>
    <div className="p-3"/>
    <form onSubmit={handleSubmit} onReset={reset} className="flex flex-col items-start gap-4">
      {errors.persons.message}
      <FieldArray {...registerArray('persons')} render={persons => {
        return <>
          <div className="flex gap-2">
            <button type="button" onClick={() => persons.append()}>Append Person</button>
            <button type="button" onClick={() => persons.prepend()}>Prepend Person</button>
          </div>
          {persons.items.map((person, index) => {
            return <React.Fragment key={person.id}>
              <div className="flex gap-4 items-center">
                <label htmlFor={`persons.${index}.name`} className="text-lg">Name</label>
                <input type="text" id={`persons.${index}.name`} {...register(`persons.${index}.name`)}/>
                <button type="button" onClick={() => person.remove()}>Delete</button>
                <button type="button" onClick={() => person.append()}>Append</button>
                <button type="button" onClick={() => person.prepend()}>Prepend</button>
                <button type="button" onClick={() => persons.insert(index)}>Insert</button>
                <button type="button" className={`${selection === index ? '!bg-green-700' : ''}`} onClick={select(index, persons.swap)}>Select</button>
              </div>
              {errors.persons.items[index]?.name?.message}
            </React.Fragment>
          })}
        </>
      }}/>
      <input type="text" {...register('meta')}/>
      {errors.meta?.message}
      <div className="flex gap-2">
        <button>Submit</button>
        <button type="reset">Reset</button>
      </div>
    </form>
  </main>
}

export default App