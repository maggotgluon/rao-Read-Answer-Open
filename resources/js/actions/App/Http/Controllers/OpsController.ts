import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\OpsController::__invoke
* @see app/Http/Controllers/OpsController.php:27
* @route '/_ops/{action}'
*/
const OpsController = (args: { action: string | number } | [action: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: OpsController.url(args, options),
    method: 'get',
})

OpsController.definition = {
    methods: ["get","head"],
    url: '/_ops/{action}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::__invoke
* @see app/Http/Controllers/OpsController.php:27
* @route '/_ops/{action}'
*/
OpsController.url = (args: { action: string | number } | [action: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { action: args }
    }

    if (Array.isArray(args)) {
        args = {
            action: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        action: args.action,
    }

    return OpsController.definition.url
            .replace('{action}', parsedArgs.action.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::__invoke
* @see app/Http/Controllers/OpsController.php:27
* @route '/_ops/{action}'
*/
OpsController.get = (args: { action: string | number } | [action: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: OpsController.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OpsController::__invoke
* @see app/Http/Controllers/OpsController.php:27
* @route '/_ops/{action}'
*/
OpsController.head = (args: { action: string | number } | [action: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: OpsController.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\OpsController::__invoke
* @see app/Http/Controllers/OpsController.php:27
* @route '/_ops/{action}'
*/
const OpsControllerForm = (args: { action: string | number } | [action: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: OpsController.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OpsController::__invoke
* @see app/Http/Controllers/OpsController.php:27
* @route '/_ops/{action}'
*/
OpsControllerForm.get = (args: { action: string | number } | [action: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: OpsController.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OpsController::__invoke
* @see app/Http/Controllers/OpsController.php:27
* @route '/_ops/{action}'
*/
OpsControllerForm.head = (args: { action: string | number } | [action: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: OpsController.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

OpsController.form = OpsControllerForm

export default OpsController