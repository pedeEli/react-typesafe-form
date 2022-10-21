import {useForm, useFieldArray} from 'react-ts-form'
import z from 'zod'


const validator = z.object({
  test: z.array(z.object({
    val: z.number().min(2)
  })),
  test2: z.array(z.number()),
  tup: z.tuple([
    z.object({
      sub: z.string()
    }),
    z.number()
  ]),
  obj: z.object({
    sub: z.string()
  }).optional()
})

const App = () => {
  const {handleSubmit, register, errors, reset} = useForm({
    onSubmit: (value) => {
      reset()
      console.log(value)
    },
    validator
  })
  // useFieldArray({context, name: 'test'})

  console.log('errors', errors)

  errors.obj?.sub?.message

  return <main>
    <h1 className="text-3xl">Input Testing</h1>
    <div className="p-3"/>
    <form onSubmit={handleSubmit} onReset={reset} className="flex flex-col items-start gap-4">
      {errors.test.message}
      <div className="flex gap-4 items-center">
        <label htmlFor="test" className="text-lg">Test</label>
        <input type="number" id="test" {...register('test.0.val', 0)} />
      </div>
      {errors.test.items[0]?.val?.message}
      <div className="flex gap-2">
        <button>Submit</button>
        <button type="reset">Reset</button>
      </div>
    </form>
  </main>
}

export default App