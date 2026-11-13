import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\PlaceController::store
* @see app/Http/Controllers/PlaceController.php:24
* @route '/s/{space}/places'
*/
export const store = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/s/{space}/places',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PlaceController::store
* @see app/Http/Controllers/PlaceController.php:24
* @route '/s/{space}/places'
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
* @see \App\Http\Controllers\PlaceController::store
* @see app/Http/Controllers/PlaceController.php:24
* @route '/s/{space}/places'
*/
store.post = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaceController::store
* @see app/Http/Controllers/PlaceController.php:24
* @route '/s/{space}/places'
*/
const storeForm = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaceController::store
* @see app/Http/Controllers/PlaceController.php:24
* @route '/s/{space}/places'
*/
storeForm.post = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\PlaceController::update
* @see app/Http/Controllers/PlaceController.php:37
* @route '/s/{space}/places/{place}'
*/
export const update = (args: { space: string | { ulid: string }, place: string | number | { id: string | number } } | [space: string | { ulid: string }, place: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/s/{space}/places/{place}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\PlaceController::update
* @see app/Http/Controllers/PlaceController.php:37
* @route '/s/{space}/places/{place}'
*/
update.url = (args: { space: string | { ulid: string }, place: string | number | { id: string | number } } | [space: string | { ulid: string }, place: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            space: args[0],
            place: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        space: typeof args.space === 'object'
        ? args.space.ulid
        : args.space,
        place: typeof args.place === 'object'
        ? args.place.id
        : args.place,
    }

    return update.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace('{place}', parsedArgs.place.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlaceController::update
* @see app/Http/Controllers/PlaceController.php:37
* @route '/s/{space}/places/{place}'
*/
update.patch = (args: { space: string | { ulid: string }, place: string | number | { id: string | number } } | [space: string | { ulid: string }, place: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\PlaceController::update
* @see app/Http/Controllers/PlaceController.php:37
* @route '/s/{space}/places/{place}'
*/
const updateForm = (args: { space: string | { ulid: string }, place: string | number | { id: string | number } } | [space: string | { ulid: string }, place: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaceController::update
* @see app/Http/Controllers/PlaceController.php:37
* @route '/s/{space}/places/{place}'
*/
updateForm.patch = (args: { space: string | { ulid: string }, place: string | number | { id: string | number } } | [space: string | { ulid: string }, place: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\PlaceController::destroy
* @see app/Http/Controllers/PlaceController.php:45
* @route '/s/{space}/places/{place}'
*/
export const destroy = (args: { space: string | { ulid: string }, place: string | number | { id: string | number } } | [space: string | { ulid: string }, place: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/s/{space}/places/{place}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\PlaceController::destroy
* @see app/Http/Controllers/PlaceController.php:45
* @route '/s/{space}/places/{place}'
*/
destroy.url = (args: { space: string | { ulid: string }, place: string | number | { id: string | number } } | [space: string | { ulid: string }, place: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            space: args[0],
            place: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        space: typeof args.space === 'object'
        ? args.space.ulid
        : args.space,
        place: typeof args.place === 'object'
        ? args.place.id
        : args.place,
    }

    return destroy.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace('{place}', parsedArgs.place.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlaceController::destroy
* @see app/Http/Controllers/PlaceController.php:45
* @route '/s/{space}/places/{place}'
*/
destroy.delete = (args: { space: string | { ulid: string }, place: string | number | { id: string | number } } | [space: string | { ulid: string }, place: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\PlaceController::destroy
* @see app/Http/Controllers/PlaceController.php:45
* @route '/s/{space}/places/{place}'
*/
const destroyForm = (args: { space: string | { ulid: string }, place: string | number | { id: string | number } } | [space: string | { ulid: string }, place: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaceController::destroy
* @see app/Http/Controllers/PlaceController.php:45
* @route '/s/{space}/places/{place}'
*/
destroyForm.delete = (args: { space: string | { ulid: string }, place: string | number | { id: string | number } } | [space: string | { ulid: string }, place: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

/**
* @see \App\Http\Controllers\PlaceController::here
* @see app/Http/Controllers/PlaceController.php:86
* @route '/s/{space}/places/here'
*/
export const here = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: here.url(args, options),
    method: 'post',
})

here.definition = {
    methods: ["post"],
    url: '/s/{space}/places/here',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PlaceController::here
* @see app/Http/Controllers/PlaceController.php:86
* @route '/s/{space}/places/here'
*/
here.url = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions) => {
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

    return here.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlaceController::here
* @see app/Http/Controllers/PlaceController.php:86
* @route '/s/{space}/places/here'
*/
here.post = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: here.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaceController::here
* @see app/Http/Controllers/PlaceController.php:86
* @route '/s/{space}/places/here'
*/
const hereForm = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: here.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PlaceController::here
* @see app/Http/Controllers/PlaceController.php:86
* @route '/s/{space}/places/here'
*/
hereForm.post = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: here.url(args, options),
    method: 'post',
})

here.form = hereForm

const places = {
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    here: Object.assign(here, here),
}

export default places