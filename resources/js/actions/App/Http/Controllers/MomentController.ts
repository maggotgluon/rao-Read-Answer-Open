import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\MomentController::store
* @see app/Http/Controllers/MomentController.php:22
* @route '/s/{space}/moments'
*/
export const store = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/s/{space}/moments',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MomentController::store
* @see app/Http/Controllers/MomentController.php:22
* @route '/s/{space}/moments'
*/
store.url = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { space: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'ulid' in args) {
        args = { space: args.ulid }
    }

    if (Array.isArray(args)) {
        args = {
            space: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        space: typeof args.space === 'object'
        ? args.space.ulid
        : args.space,
    }

    return store.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MomentController::store
* @see app/Http/Controllers/MomentController.php:22
* @route '/s/{space}/moments'
*/
store.post = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MomentController::store
* @see app/Http/Controllers/MomentController.php:22
* @route '/s/{space}/moments'
*/
const storeForm = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MomentController::store
* @see app/Http/Controllers/MomentController.php:22
* @route '/s/{space}/moments'
*/
storeForm.post = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\MomentController::publish
* @see app/Http/Controllers/MomentController.php:77
* @route '/s/{space}/moments/{moment}/publish'
*/
export const publish = (args: { space: string | { ulid: string }, moment: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: publish.url(args, options),
    method: 'post',
})

publish.definition = {
    methods: ["post"],
    url: '/s/{space}/moments/{moment}/publish',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MomentController::publish
* @see app/Http/Controllers/MomentController.php:77
* @route '/s/{space}/moments/{moment}/publish'
*/
publish.url = (args: { space: string | { ulid: string }, moment: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string } ], options?: RouteQueryOptions) => {
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

    return publish.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace('{moment}', parsedArgs.moment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MomentController::publish
* @see app/Http/Controllers/MomentController.php:77
* @route '/s/{space}/moments/{moment}/publish'
*/
publish.post = (args: { space: string | { ulid: string }, moment: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: publish.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MomentController::publish
* @see app/Http/Controllers/MomentController.php:77
* @route '/s/{space}/moments/{moment}/publish'
*/
const publishForm = (args: { space: string | { ulid: string }, moment: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: publish.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MomentController::publish
* @see app/Http/Controllers/MomentController.php:77
* @route '/s/{space}/moments/{moment}/publish'
*/
publishForm.post = (args: { space: string | { ulid: string }, moment: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: publish.url(args, options),
    method: 'post',
})

publish.form = publishForm

/**
* @see \App\Http\Controllers\MomentController::destroy
* @see app/Http/Controllers/MomentController.php:90
* @route '/s/{space}/moments/{moment}'
*/
export const destroy = (args: { space: string | { ulid: string }, moment: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/s/{space}/moments/{moment}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\MomentController::destroy
* @see app/Http/Controllers/MomentController.php:90
* @route '/s/{space}/moments/{moment}'
*/
destroy.url = (args: { space: string | { ulid: string }, moment: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string } ], options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace('{moment}', parsedArgs.moment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MomentController::destroy
* @see app/Http/Controllers/MomentController.php:90
* @route '/s/{space}/moments/{moment}'
*/
destroy.delete = (args: { space: string | { ulid: string }, moment: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\MomentController::destroy
* @see app/Http/Controllers/MomentController.php:90
* @route '/s/{space}/moments/{moment}'
*/
const destroyForm = (args: { space: string | { ulid: string }, moment: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MomentController::destroy
* @see app/Http/Controllers/MomentController.php:90
* @route '/s/{space}/moments/{moment}'
*/
destroyForm.delete = (args: { space: string | { ulid: string }, moment: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const MomentController = { store, publish, destroy }

export default MomentController