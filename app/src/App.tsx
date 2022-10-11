import {useForm} from 'react-ts-form'
import z from 'zod'

const validator = z.object({
  test: z.string().min(1)
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
      <div className="flex gap-4 items-center">
        <label htmlFor="test" className="text-lg">Test</label>
        <input id="test" {...register('test', 'default')} type="text"/>
      </div>
      {errors.test && errors.test.message}
      <div className="flex gap-2">
        <button>Submit</button>
        <button type="reset">Reset</button>
      </div>
    </form>
  </main>
}

export default App
