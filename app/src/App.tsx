import {useForm} from 'react-ts-form'
import z from 'zod'


const validator = z.object({
  test: z.number()
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
        <input type="number" id="test" {...register('test', 0)} />
      </div>
      {errors.test?.message}
      {/* <div className="flex gap-4 items-center">
        <label htmlFor="test" className="text-lg">Test</label>
        <input id="test" {...register('sub.child', 'default hui')} type="text"/>
      </div>
      {errors.sub.child?.message}
      <div className="flex gap-4 items-center">
        <label htmlFor="selection">Selection</label>
        <select id="selection" {...register('selection')}>
          <option value="">Options</option>
          <option value="option 1">Option 1</option>
          <option value="option 2">Option 2</option>
          <option value="option 3">Option 3</option>
        </select>
      </div>
      {errors.selection && errors.selection.message} */}
      <div className="flex gap-2">
        <button>Submit</button>
        <button type="reset">Reset</button>
      </div>
    </form>
  </main>
}

export default App