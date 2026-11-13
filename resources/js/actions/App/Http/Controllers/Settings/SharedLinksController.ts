import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\SharedLinksController::index
* @see app/Http/Controllers/Settings/SharedLinksController.php:22
* @route '/settings/shared-links'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/settings/shared-links',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\SharedLinksController::index
* @see app/Http/Controllers/Settings/SharedLinksController.php:22
* @route '/settings/shared-links'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\SharedLinksController::index
* @see app/Http/Controllers/Settings/SharedLinksController.php:22
* @route '/settings/shared-links'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\SharedLinksController::index
* @see app/Http/Controllers/Settings/SharedLinksController.php:22
* @route '/settings/shared-links'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\SharedLinksController::index
* @see app/Http/Controllers/Settings/SharedLinksController.php:22
* @route '/settings/shared-links'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\SharedLinksController::index
* @see app/Http/Controllers/Settings/SharedLinksController.php:22
* @route '/settings/shared-links'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\SharedLinksController::index
* @see app/Http/Controllers/Settings/SharedLinksController.php:22
* @route '/settings/shared-links'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\Settings\SharedLinksController::destroy
* @see app/Http/Controllers/Settings/SharedLinksController.php:43
* @route '/settings/shared-links/{link}'
*/
export const destroy = (args: { link: string | number | { id: string | number } } | [link: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/settings/shared-links/{link}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Settings\SharedLinksController::destroy
* @see app/Http/Controllers/Settings/SharedLinksController.php:43
* @route '/settings/shared-links/{link}'
*/
destroy.url = (args: { link: string | number | { id: string | number } } | [link: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { link: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { link: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            link: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        link: typeof args.link === 'object'
        ? args.link.id
        : args.link,
    }

    return destroy.definition.url
            .replace('{link}', parsedArgs.link.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\SharedLinksController::destroy
* @see app/Http/Controllers/Settings/SharedLinksController.php:43
* @route '/settings/shared-links/{link}'
*/
destroy.delete = (args: { link: string | number | { id: string | number } } | [link: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Settings\SharedLinksController::destroy
* @see app/Http/Controllers/Settings/SharedLinksController.php:43
* @route '/settings/shared-links/{link}'
*/
const destroyForm = (args: { link: string | number | { id: string | number } } | [link: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\SharedLinksController::destroy
* @see app/Http/Controllers/Settings/SharedLinksController.php:43
* @route '/settings/shared-links/{link}'
*/
destroyForm.delete = (args: { link: string | number | { id: string | number } } | [link: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const SharedLinksController = { index, destroy }

export default SharedLinksController