import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\AnswerController::store
* @see app/Http/Controllers/AnswerController.php:18
* @route '/s/{space}/today/{dailyPrompt}/answer'
*/
export const store = (args: { space: string | { ulid: string }, dailyPrompt: number | { id: number } } | [space: string | { ulid: string }, dailyPrompt: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/s/{space}/today/{dailyPrompt}/answer',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AnswerController::store
* @see app/Http/Controllers/AnswerController.php:18
* @route '/s/{space}/today/{dailyPrompt}/answer'
*/
store.url = (args: { space: string | { ulid: string }, dailyPrompt: number | { id: number } } | [space: string | { ulid: string }, dailyPrompt: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            space: args[0],
            dailyPrompt: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        space: typeof args.space === 'object'
        ? args.space.ulid
        : args.space,
        dailyPrompt: typeof args.dailyPrompt === 'object'
        ? args.dailyPrompt.id
        : args.dailyPrompt,
    }

    return store.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace('{dailyPrompt}', parsedArgs.dailyPrompt.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AnswerController::store
* @see app/Http/Controllers/AnswerController.php:18
* @route '/s/{space}/today/{dailyPrompt}/answer'
*/
store.post = (args: { space: string | { ulid: string }, dailyPrompt: number | { id: number } } | [space: string | { ulid: string }, dailyPrompt: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AnswerController::store
* @see app/Http/Controllers/AnswerController.php:18
* @route '/s/{space}/today/{dailyPrompt}/answer'
*/
const storeForm = (args: { space: string | { ulid: string }, dailyPrompt: number | { id: number } } | [space: string | { ulid: string }, dailyPrompt: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AnswerController::store
* @see app/Http/Controllers/AnswerController.php:18
* @route '/s/{space}/today/{dailyPrompt}/answer'
*/
storeForm.post = (args: { space: string | { ulid: string }, dailyPrompt: number | { id: number } } | [space: string | { ulid: string }, dailyPrompt: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

const AnswerController = { store }

export default AnswerController