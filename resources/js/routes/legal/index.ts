import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\LegalController::show
* @see app/Http/Controllers/LegalController.php:14
* @route '/legal/{doc}'
*/
export const show = (args: { doc: string | number } | [doc: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/legal/{doc}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LegalController::show
* @see app/Http/Controllers/LegalController.php:14
* @route '/legal/{doc}'
*/
show.url = (args: { doc: string | number } | [doc: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { doc: args }
    }

    if (Array.isArray(args)) {
        args = {
            doc: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        doc: args.doc,
    }

    return show.definition.url
            .replace('{doc}', parsedArgs.doc.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LegalController::show
* @see app/Http/Controllers/LegalController.php:14
* @route '/legal/{doc}'
*/
show.get = (args: { doc: string | number } | [doc: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\LegalController::show
* @see app/Http/Controllers/LegalController.php:14
* @route '/legal/{doc}'
*/
show.head = (args: { doc: string | number } | [doc: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\LegalController::show
* @see app/Http/Controllers/LegalController.php:14
* @route '/legal/{doc}'
*/
const showForm = (args: { doc: string | number } | [doc: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\LegalController::show
* @see app/Http/Controllers/LegalController.php:14
* @route '/legal/{doc}'
*/
showForm.get = (args: { doc: string | number } | [doc: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\LegalController::show
* @see app/Http/Controllers/LegalController.php:14
* @route '/legal/{doc}'
*/
showForm.head = (args: { doc: string | number } | [doc: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

const legal = {
    show: Object.assign(show, show),
}

export default legal