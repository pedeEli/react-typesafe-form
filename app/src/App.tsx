import React from 'react'
import {useForm, FieldArray} from 'react-ts-form'
import z from 'zod'


const validator = z.object({
  persons: z.array(z.object({
    name: z.string()
  }))
})

const App = () => {
  const {handleSubmit, register, errors, reset} = useForm({
    onSubmit: (value) => {
      reset()
      console.log(value)
    },
    validator
  })

  return <main>
    <h1 className="text-3xl">Input Testing</h1>
    <div className="p-3"/>
    <form onSubmit={handleSubmit} onReset={reset} className="flex flex-col items-start gap-4">
      {errors.persons.message}
      <FieldArray render={persons => {
        return <>
          <div className="flex gap-2">
            <button type="button" onClick={() => persons.append()}>Append Person</button>
            <button type="button" onClick={() => persons.prepend()}>Prepend Person</button>
          </div>
          {persons.items.map((person, index) => {
            return <React.Fragment key={person.id}>
              <div className="flex gap-4 items-center">
                <label htmlFor={`persons.${index}.name`} className="test-lg">Name</label>
                <input type="text" id={`persons.${index}.name`} {...register(`persons.${index}.name`)}/>
                <button type="button" onClick={() => person.remove()}>Delete</button>
                <button type="button" onClick={() => person.append()}>Append</button>
                <button type="button" onClick={() => person.prepend()}>Prepend</button>
                <button type="button" onClick={() => persons.insert(index)}>Insert</button>
              </div>
              {errors.persons.items[index]?.name?.message}
            </React.Fragment>
          })}
        </>
      }}/>
      <div className="flex gap-2">
        <button>Submit</button>
        <button type="reset">Reset</button>
      </div>
    </form>
  </main>
}

export default App