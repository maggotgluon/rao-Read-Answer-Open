import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\InviteController::show
* @see app/Http/Controllers/InviteController.php:27
* @route '/join/{code}'
*/
export const show = (args: { code: string | number } | [code: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/join/{code}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\InviteController::show
* @see app/Http/Controllers/InviteController.php:27
* @route '/join/{code}'
*/
show.url = (args: { code: string | number } | [code: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { code: args }
    }

    if (Array.isArray(args)) {
        args = {
            code: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        code: args.code,
    }

    return show.definition.url
            .replace('{code}', parsedArgs.code.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\InviteController::show
* @see app/Http/Controllers/InviteController.php:27
* @route '/join/{code}'
*/
show.get = (args: { code: string | number } | [code: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\InviteController::show
* @see app/Http/Controllers/InviteController.php:27
* @route '/join/{code}'
*/
show.head = (args: { code: string | number } | [code: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\InviteController::show
* @see app/Http/Controllers/InviteController.php:27
* @route '/join/{code}'
*/
const showForm = (args: { code: string | number } | [code: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\InviteController::show
* @see app/Http/Controllers/InviteController.php:27
* @route '/join/{code}'
*/
showForm.get = (args: { code: string | number } | [code: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\InviteController::show
* @see app/Http/Controllers/InviteController.php:27
* @route '/join/{code}'
*/
showForm.head = (args: { code: string | number } | [code: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\InviteController::lookup
* @see app/Http/Controllers/InviteController.php:19
* @route '/join'
*/
export const lookup = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: lookup.url(options),
    method: 'post',
})

lookup.definition = {
    methods: ["post"],
    url: '/join',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\InviteController::lookup
* @see app/Http/Controllers/InviteController.php:19
* @route '/join'
*/
lookup.url = (options?: RouteQueryOptions) => {
    return lookup.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\InviteController::lookup
* @see app/Http/Controllers/InviteController.php:19
* @route '/join'
*/
lookup.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: lookup.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\InviteController::lookup
* @see app/Http/Controllers/InviteController.php:19
* @route '/join'
*/
const lookupForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: lookup.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\InviteController::lookup
* @see app/Http/Controllers/InviteController.php:19
* @route '/join'
*/
lookupForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: lookup.url(options),
    method: 'post',
})

lookup.form = lookupForm

/**
* @see \App\Http\Controllers\InviteController::accept
* @see app/Http/Controllers/InviteController.php:50
* @route '/join/{code}'
*/
export const accept = (args: { code: string | number } | [code: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

accept.definition = {
    methods: ["post"],
    url: '/join/{code}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\InviteController::accept
* @see app/Http/Controllers/InviteController.php:50
* @route '/join/{code}'
*/
accept.url = (args: { code: string | number } | [code: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { code: args }
    }

    if (Array.isArray(args)) {
        args = {
            code: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        code: args.code,
    }

    return accept.definition.url
            .replace('{code}', parsedArgs.code.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\InviteController::accept
* @see app/Http/Controllers/InviteController.php:50
* @route '/join/{code}'
*/
accept.post = (args: { code: string | number } | [code: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\InviteController::accept
* @see app/Http/Controllers/InviteController.php:50
* @route '/join/{code}'
*/
const acceptForm = (args: { code: string | number } | [code: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: accept.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\InviteController::accept
* @see app/Http/Controllers/InviteController.php:50
* @route '/join/{code}'
*/
acceptForm.post = (args: { code: string | number } | [code: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: accept.url(args, options),
    method: 'post',
})

accept.form = acceptForm

const invites = {
    show: Object.assign(show, show),
    lookup: Object.assign(lookup, lookup),
    accept: Object.assign(accept, accept),
}

export default invites