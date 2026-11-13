import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\SpaceEventController::store
* @see app/Http/Controllers/SpaceEventController.php:17
* @route '/s/{space}/events'
*/
export const store = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/s/{space}/events',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SpaceEventController::store
* @see app/Http/Controllers/SpaceEventController.php:17
* @route '/s/{space}/events'
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
* @see \App\Http\Controllers\SpaceEventController::store
* @see app/Http/Controllers/SpaceEventController.php:17
* @route '/s/{space}/events'
*/
store.post = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SpaceEventController::store
* @see app/Http/Controllers/SpaceEventController.php:17
* @route '/s/{space}/events'
*/
const storeForm = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SpaceEventController::store
* @see app/Http/Controllers/SpaceEventController.php:17
* @route '/s/{space}/events'
*/
storeForm.post = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\SpaceEventController::update
* @see app/Http/Controllers/SpaceEventController.php:27
* @route '/s/{space}/events/{event}'
*/
export const update = (args: { space: string | { ulid: string }, event: number | { id: number } } | [space: string | { ulid: string }, event: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/s/{space}/events/{event}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\SpaceEventController::update
* @see app/Http/Controllers/SpaceEventController.php:27
* @route '/s/{space}/events/{event}'
*/
update.url = (args: { space: string | { ulid: string }, event: number | { id: number } } | [space: string | { ulid: string }, event: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            space: args[0],
            event: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        space: typeof args.space === 'object'
        ? args.space.ulid
        : args.space,
        event: typeof args.event === 'object'
        ? args.event.id
        : args.event,
    }

    return update.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace('{event}', parsedArgs.event.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SpaceEventController::update
* @see app/Http/Controllers/SpaceEventController.php:27
* @route '/s/{space}/events/{event}'
*/
update.patch = (args: { space: string | { ulid: string }, event: number | { id: number } } | [space: string | { ulid: string }, event: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\SpaceEventController::update
* @see app/Http/Controllers/SpaceEventController.php:27
* @route '/s/{space}/events/{event}'
*/
const updateForm = (args: { space: string | { ulid: string }, event: number | { id: number } } | [space: string | { ulid: string }, event: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SpaceEventController::update
* @see app/Http/Controllers/SpaceEventController.php:27
* @route '/s/{space}/events/{event}'
*/
updateForm.patch = (args: { space: string | { ulid: string }, event: number | { id: number } } | [space: string | { ulid: string }, event: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\SpaceEventController::destroy
* @see app/Http/Controllers/SpaceEventController.php:35
* @route '/s/{space}/events/{event}'
*/
export const destroy = (args: { space: string | { ulid: string }, event: number | { id: number } } | [space: string | { ulid: string }, event: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/s/{space}/events/{event}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\SpaceEventController::destroy
* @see app/Http/Controllers/SpaceEventController.php:35
* @route '/s/{space}/events/{event}'
*/
destroy.url = (args: { space: string | { ulid: string }, event: number | { id: number } } | [space: string | { ulid: string }, event: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            space: args[0],
            event: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        space: typeof args.space === 'object'
        ? args.space.ulid
        : args.space,
        event: typeof args.event === 'object'
        ? args.event.id
        : args.event,
    }

    return destroy.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace('{event}', parsedArgs.event.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SpaceEventController::destroy
* @see app/Http/Controllers/SpaceEventController.php:35
* @route '/s/{space}/events/{event}'
*/
destroy.delete = (args: { space: string | { ulid: string }, event: number | { id: number } } | [space: string | { ulid: string }, event: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\SpaceEventController::destroy
* @see app/Http/Controllers/SpaceEventController.php:35
* @route '/s/{space}/events/{event}'
*/
const destroyForm = (args: { space: string | { ulid: string }, event: number | { id: number } } | [space: string | { ulid: string }, event: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SpaceEventController::destroy
* @see app/Http/Controllers/SpaceEventController.php:35
* @route '/s/{space}/events/{event}'
*/
destroyForm.delete = (args: { space: string | { ulid: string }, event: number | { id: number } } | [space: string | { ulid: string }, event: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const SpaceEventController = { store, update, destroy }

export default SpaceEventController