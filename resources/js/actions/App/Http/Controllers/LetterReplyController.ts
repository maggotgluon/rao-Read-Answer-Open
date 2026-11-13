import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\LetterReplyController::store
* @see app/Http/Controllers/LetterReplyController.php:16
* @route '/s/{space}/today/{dailyPrompt}/replies'
*/
export const store = (args: { space: string | { ulid: string }, dailyPrompt: number | { id: number } } | [space: string | { ulid: string }, dailyPrompt: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/s/{space}/today/{dailyPrompt}/replies',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LetterReplyController::store
* @see app/Http/Controllers/LetterReplyController.php:16
* @route '/s/{space}/today/{dailyPrompt}/replies'
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
* @see \App\Http\Controllers\LetterReplyController::store
* @see app/Http/Controllers/LetterReplyController.php:16
* @route '/s/{space}/today/{dailyPrompt}/replies'
*/
store.post = (args: { space: string | { ulid: string }, dailyPrompt: number | { id: number } } | [space: string | { ulid: string }, dailyPrompt: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\LetterReplyController::store
* @see app/Http/Controllers/LetterReplyController.php:16
* @route '/s/{space}/today/{dailyPrompt}/replies'
*/
const storeForm = (args: { space: string | { ulid: string }, dailyPrompt: number | { id: number } } | [space: string | { ulid: string }, dailyPrompt: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\LetterReplyController::store
* @see app/Http/Controllers/LetterReplyController.php:16
* @route '/s/{space}/today/{dailyPrompt}/replies'
*/
storeForm.post = (args: { space: string | { ulid: string }, dailyPrompt: number | { id: number } } | [space: string | { ulid: string }, dailyPrompt: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\LetterReplyController::destroy
* @see app/Http/Controllers/LetterReplyController.php:34
* @route '/s/{space}/today/{dailyPrompt}/replies/{reply}'
*/
export const destroy = (args: { space: string | { ulid: string }, dailyPrompt: number | { id: number }, reply: string | number | { id: string | number } } | [space: string | { ulid: string }, dailyPrompt: number | { id: number }, reply: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/s/{space}/today/{dailyPrompt}/replies/{reply}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\LetterReplyController::destroy
* @see app/Http/Controllers/LetterReplyController.php:34
* @route '/s/{space}/today/{dailyPrompt}/replies/{reply}'
*/
destroy.url = (args: { space: string | { ulid: string }, dailyPrompt: number | { id: number }, reply: string | number | { id: string | number } } | [space: string | { ulid: string }, dailyPrompt: number | { id: number }, reply: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            space: args[0],
            dailyPrompt: args[1],
            reply: args[2],
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
        reply: typeof args.reply === 'object'
        ? args.reply.id
        : args.reply,
    }

    return destroy.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace('{dailyPrompt}', parsedArgs.dailyPrompt.toString())
            .replace('{reply}', parsedArgs.reply.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LetterReplyController::destroy
* @see app/Http/Controllers/LetterReplyController.php:34
* @route '/s/{space}/today/{dailyPrompt}/replies/{reply}'
*/
destroy.delete = (args: { space: string | { ulid: string }, dailyPrompt: number | { id: number }, reply: string | number | { id: string | number } } | [space: string | { ulid: string }, dailyPrompt: number | { id: number }, reply: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\LetterReplyController::destroy
* @see app/Http/Controllers/LetterReplyController.php:34
* @route '/s/{space}/today/{dailyPrompt}/replies/{reply}'
*/
const destroyForm = (args: { space: string | { ulid: string }, dailyPrompt: number | { id: number }, reply: string | number | { id: string | number } } | [space: string | { ulid: string }, dailyPrompt: number | { id: number }, reply: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\LetterReplyController::destroy
* @see app/Http/Controllers/LetterReplyController.php:34
* @route '/s/{space}/today/{dailyPrompt}/replies/{reply}'
*/
destroyForm.delete = (args: { space: string | { ulid: string }, dailyPrompt: number | { id: number }, reply: string | number | { id: string | number } } | [space: string | { ulid: string }, dailyPrompt: number | { id: number }, reply: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const LetterReplyController = { store, destroy }

export default LetterReplyController