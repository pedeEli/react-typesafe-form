import React from 'react'
import {useForm, FieldArray} from 'react-ts-form'
import z from 'zod'


const validator = z.object({
  test: z.array(z.object({
    name: z.string(),
    hobbys: z.array(z.string())
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

  // useEffect(() => {
  //   console.log('errors', errors)
  // }, [errors])

  return <main>
    <h1 className="text-3xl">Input Testing</h1>
    <div className="p-3"/>
    <form onSubmit={handleSubmit} onReset={reset} className="flex flex-col items-start gap-4">
      {errors.test.message}
      <FieldArray render={test => {
        return <>
          {test.items.map((item, index) => {
            return <React.Fragment key={item.id}>
              <div className="flex gap-4 items-center">
                <label htmlFor={`test.${index}.name`} className="test-lg">Name</label>
                <input type="text" id={`test.${index}.name`} {...register(`test.${index}.name`)}/>
              </div>
              {errors.test.items[index]?.name?.message}
              <div className="flex gap-2 flex-col">
                <div className="text-xl">Hobbys</div>
                <FieldArray render={hobbys => {
                  return <>
                    {hobbys.items.map((item, i) => {
                      return <React.Fragment key={item.id}>
                        <div className="flex gap-2">
                          <input type="text" id={`test.${index}.hobbys.${i}`} {...register(`test.${index}.hobbys.${i}`, 'Gaming')}/>
                          <button type="button" onClick={() => item.remove()}>Remove</button>
                        </div>
                        {errors.test.items[index]?.hobbys.items[i]?.message}
                      </React.Fragment>
                    })}
                    <div className="flex gap-2">
                      <button type="button" onClick={() => hobbys.append()}>Add Hobby</button>
                      <button type="button" onClick={() => item.remove()}>Remove Person</button>
                    </div>
                  </>
                }}/>
              </div>
            </React.Fragment>
          })}
        <button type="button" onClick={() => test.append()}>Add Person</button>
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