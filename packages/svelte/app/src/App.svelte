<script lang="ts">
  import {createForm} from '@typesafe-form/svelte'
  import z from 'zod'

  const {handleSubmit, register, reset, errors} = createForm({
    validator: z.object({
      test: z.string(),
      lol: z.object({
        house: z.string()
      })
    }),
    onSubmit: value => {
      console.log(value)
      reset()
    }
  })
</script>

<main>
  <h1 class="text-3xl">Input Testing</h1>
  <div class="p-3"/>
  <form novalidate on:submit={handleSubmit} on:reset={reset} class="flex flex-col items-start gap-4">
    <div class="flex items-center gap-2">
      <label for="test" class="text-lg">Test</label>
      <input type="text" id="test" use:register={{name: 'test'}}>
    </div>
    {#if $errors.test}
      {$errors.test.message}
    {/if}
    <div class="flex items-center gap-2">
      <label for="lol" class="text-lg">Lol</label>
      <input type="text" id="lol" use:register={{name: 'lol.house'}}>
    </div>
    {#if $errors.lol.house}
      {$errors.lol.house.message}
    {/if}
    <button>Submit</button>
  </form>
</main>