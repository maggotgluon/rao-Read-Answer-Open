import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\MomentCommentController::store
* @see app/Http/Controllers/MomentCommentController.php:15
* @route '/s/{space}/moments/{moment}/comments'
*/
export const store = (args: { space: string | { ulid: string }, moment: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/s/{space}/moments/{moment}/comments',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MomentCommentController::store
* @see app/Http/Controllers/MomentCommentController.php:15
* @route '/s/{space}/moments/{moment}/comments'
*/
store.url = (args: { space: string | { ulid: string }, moment: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            space: args[0],
            moment: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        space: typeof args.space === 'object'
        ? args.space.ulid
        : args.space,
        moment: typeof args.moment === 'object'
        ? args.moment.ulid
        : args.moment,
    }

    return store.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace('{moment}', parsedArgs.moment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MomentCommentController::store
* @see app/Http/Controllers/MomentCommentController.php:15
* @route '/s/{space}/moments/{moment}/comments'
*/
store.post = (args: { space: string | { ulid: string }, moment: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MomentCommentController::store
* @see app/Http/Controllers/MomentCommentController.php:15
* @route '/s/{space}/moments/{moment}/comments'
*/
const storeForm = (args: { space: string | { ulid: string }, moment: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MomentCommentController::store
* @see app/Http/Controllers/MomentCommentController.php:15
* @route '/s/{space}/moments/{moment}/comments'
*/
storeForm.post = (args: { space: string | { ulid: string }, moment: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\MomentCommentController::destroy
* @see app/Http/Controllers/MomentCommentController.php:31
* @route '/s/{space}/moments/{moment}/comments/{comment}'
*/
export const destroy = (args: { space: string | { ulid: string }, moment: string | { ulid: string }, comment: number | { id: number } } | [space: string | { ulid: string }, moment: string | { ulid: string }, comment: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/s/{space}/moments/{moment}/comments/{comment}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\MomentCommentController::destroy
* @see app/Http/Controllers/MomentCommentController.php:31
* @route '/s/{space}/moments/{moment}/comments/{comment}'
*/
destroy.url = (args: { space: string | { ulid: string }, moment: string | { ulid: string }, comment: number | { id: number } } | [space: string | { ulid: string }, moment: string | { ulid: string }, comment: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            space: args[0],
            moment: args[1],
            comment: args[2],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        space: typeof args.space === 'object'
        ? args.space.ulid
        : args.space,
        moment: typeof args.moment === 'object'
        ? args.moment.ulid
        : args.moment,
        comment: typeof args.comment === 'object'
        ? args.comment.id
        : args.comment,
    }

    return destroy.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace('{moment}', parsedArgs.moment.toString())
            .replace('{comment}', parsedArgs.comment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MomentCommentController::destroy
* @see app/Http/Controllers/MomentCommentController.php:31
* @route '/s/{space}/moments/{moment}/comments/{comment}'
*/
destroy.delete = (args: { space: string | { ulid: string }, moment: string | { ulid: string }, comment: number | { id: number } } | [space: string | { ulid: string }, moment: string | { ulid: string }, comment: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\MomentCommentController::destroy
* @see app/Http/Controllers/MomentCommentController.php:31
* @route '/s/{space}/moments/{moment}/comments/{comment}'
*/
const destroyForm = (args: { space: string | { ulid: string }, moment: string | { ulid: string }, comment: number | { id: number } } | [space: string | { ulid: string }, moment: string | { ulid: string }, comment: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MomentCommentController::destroy
* @see app/Http/Controllers/MomentCommentController.php:31
* @route '/s/{space}/moments/{moment}/comments/{comment}'
*/
destroyForm.delete = (args: { space: string | { ulid: string }, moment: string | { ulid: string }, comment: number | { id: number } } | [space: string | { ulid: string }, moment: string | { ulid: string }, comment: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const comments = {
    store: Object.assign(store, store),
    destroy: Object.assign(destroy, destroy),
}

export default comments