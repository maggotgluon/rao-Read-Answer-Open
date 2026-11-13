import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import links from './links'
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

const share = {
    ask: Object.assign(ask, ask),
    decide: Object.assign(decide, decide),
    links: Object.assign(links, links),
}

export default share