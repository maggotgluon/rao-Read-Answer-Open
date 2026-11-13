import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ShareController::show
* @see app/Http/Controllers/ShareController.php:116
* @route '/p/{token}'
*/
export const show = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/p/{token}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ShareController::show
* @see app/Http/Controllers/ShareController.php:116
* @route '/p/{token}'
*/
show.url = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { token: args }
    }

    if (Array.isArray(args)) {
        args = {
            token: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        token: args.token,
    }

    return show.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShareController::show
* @see app/Http/Controllers/ShareController.php:116
* @route '/p/{token}'
*/
show.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ShareController::show
* @see app/Http/Controllers/ShareController.php:116
* @route '/p/{token}'
*/
show.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ShareController::show
* @see app/Http/Controllers/ShareController.php:116
* @route '/p/{token}'
*/
const showForm = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ShareController::show
* @see app/Http/Controllers/ShareController.php:116
* @route '/p/{token}'
*/
showForm.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ShareController::show
* @see app/Http/Controllers/ShareController.php:116
* @route '/p/{token}'
*/
showForm.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\ShareController::image
* @see app/Http/Controllers/ShareController.php:130
* @route '/p/{token}/card.png'
*/
export const image = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: image.url(args, options),
    method: 'get',
})

image.definition = {
    methods: ["get","head"],
    url: '/p/{token}/card.png',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ShareController::image
* @see app/Http/Controllers/ShareController.php:130
* @route '/p/{token}/card.png'
*/
image.url = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { token: args }
    }

    if (Array.isArray(args)) {
        args = {
            token: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        token: args.token,
    }

    return image.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShareController::image
* @see app/Http/Controllers/ShareController.php:130
* @route '/p/{token}/card.png'
*/
image.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: image.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ShareController::image
* @see app/Http/Controllers/ShareController.php:130
* @route '/p/{token}/card.png'
*/
image.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: image.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ShareController::image
* @see app/Http/Controllers/ShareController.php:130
* @route '/p/{token}/card.png'
*/
const imageForm = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: image.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ShareController::image
* @see app/Http/Controllers/ShareController.php:130
* @route '/p/{token}/card.png'
*/
imageForm.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: image.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ShareController::image
* @see app/Http/Controllers/ShareController.php:130
* @route '/p/{token}/card.png'
*/
imageForm.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: image.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

image.form = imageForm

/**
* @see \App\Http\Controllers\ShareController::ask
* @see app/Http/Controllers/ShareController.php:30
* @route '/s/{space}/share/ask'
*/
export const ask = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: ask.url(args, options),
    method: 'post',
})

ask.definition = {
    methods: ["post"],
    url: '/s/{space}/share/ask',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ShareController::ask
* @see app/Http/Controllers/ShareController.php:30
* @route '/s/{space}/share/ask'
*/
ask.url = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions) => {
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

    return ask.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShareController::ask
* @see app/Http/Controllers/ShareController.php:30
* @route '/s/{space}/share/ask'
*/
ask.post = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: ask.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ShareController::ask
* @see app/Http/Controllers/ShareController.php:30
* @route '/s/{space}/share/ask'
*/
const askForm = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: ask.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ShareController::ask
* @see app/Http/Controllers/ShareController.php:30
* @route '/s/{space}/share/ask'
*/
askForm.post = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: ask.url(args, options),
    method: 'post',
})

ask.form = askForm

/**
* @see \App\Http\Controllers\ShareController::decide
* @see app/Http/Controllers/ShareController.php:58
* @route '/s/{space}/share/requests/{shareRequest}'
*/
export const decide = (args: { space: string | { ulid: string }, shareRequest: string | number | { id: string | number } } | [space: string | { ulid: string }, shareRequest: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: decide.url(args, options),
    method: 'put',
})

decide.definition = {
    methods: ["put"],
    url: '/s/{space}/share/requests/{shareRequest}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ShareController::decide
* @see app/Http/Controllers/ShareController.php:58
* @route '/s/{space}/share/requests/{shareRequest}'
*/
decide.url = (args: { space: string | { ulid: string }, shareRequest: string | number | { id: string | number } } | [space: string | { ulid: string }, shareRequest: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            space: args[0],
            shareRequest: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        space: typeof args.space === 'object'
        ? args.space.ulid
        : args.space,
        shareRequest: typeof args.shareRequest === 'object'
        ? args.shareRequest.id
        : args.shareRequest,
    }

    return decide.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace('{shareRequest}', parsedArgs.shareRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShareController::decide
* @see app/Http/Controllers/ShareController.php:58
* @route '/s/{space}/share/requests/{shareRequest}'
*/
decide.put = (args: { space: string | { ulid: string }, shareRequest: string | number | { id: string | number } } | [space: string | { ulid: string }, shareRequest: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: decide.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ShareController::decide
* @see app/Http/Controllers/ShareController.php:58
* @route '/s/{space}/share/requests/{shareRequest}'
*/
const decideForm = (args: { space: string | { ulid: string }, shareRequest: string | number | { id: string | number } } | [space: string | { ulid: string }, shareRequest: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: decide.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ShareController::decide
* @see app/Http/Controllers/ShareController.php:58
* @route '/s/{space}/share/requests/{shareRequest}'
*/
decideForm.put = (args: { space: string | { ulid: string }, shareRequest: string | number | { id: string | number } } | [space: string | { ulid: string }, shareRequest: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: decide.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

decide.form = decideForm

/**
* @see \App\Http\Controllers\ShareController::store
* @see app/Http/Controllers/ShareController.php:82
* @route '/s/{space}/share/links'
*/
export const store = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/s/{space}/share/links',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ShareController::store
* @see app/Http/Controllers/ShareController.php:82
* @route '/s/{space}/share/links'
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
* @see \App\Http\Controllers\ShareController::store
* @see app/Http/Controllers/ShareController.php:82
* @route '/s/{space}/share/links'
*/
store.post = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ShareController::store
* @see app/Http/Controllers/ShareController.php:82
* @route '/s/{space}/share/links'
*/
const storeForm = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ShareController::store
* @see app/Http/Controllers/ShareController.php:82
* @route '/s/{space}/share/links'
*/
storeForm.post = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

const ShareController = { show, image, ask, decide, store }

export default ShareController