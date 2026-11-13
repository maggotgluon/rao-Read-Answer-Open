import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ChangelogController::__invoke
* @see app/Http/Controllers/ChangelogController.php:13
* @route '/changelog'
*/
const ChangelogController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ChangelogController.url(options),
    method: 'get',
})

ChangelogController.definition = {
    methods: ["get","head"],
    url: '/changelog',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChangelogController::__invoke
* @see app/Http/Controllers/ChangelogController.php:13
* @route '/changelog'
*/
ChangelogController.url = (options?: RouteQueryOptions) => {
    return ChangelogController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChangelogController::__invoke
* @see app/Http/Controllers/ChangelogController.php:13
* @route '/changelog'
*/
ChangelogController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ChangelogController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChangelogController::__invoke
* @see app/Http/Controllers/ChangelogController.php:13
* @route '/changelog'
*/
ChangelogController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ChangelogController.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChangelogController::__invoke
* @see app/Http/Controllers/ChangelogController.php:13
* @route '/changelog'
*/
const ChangelogControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ChangelogController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChangelogController::__invoke
* @see app/Http/Controllers/ChangelogController.php:13
* @route '/changelog'
*/
ChangelogControllerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ChangelogController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChangelogController::__invoke
* @see app/Http/Controllers/ChangelogController.php:13
* @route '/changelog'
*/
ChangelogControllerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ChangelogController.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

ChangelogController.form = ChangelogControllerForm

export default ChangelogController