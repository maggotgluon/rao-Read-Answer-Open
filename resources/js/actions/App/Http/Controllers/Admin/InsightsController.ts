import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\InsightsController::__invoke
* @see app/Http/Controllers/Admin/InsightsController.php:12
* @route '/admin/insights'
*/
const InsightsController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: InsightsController.url(options),
    method: 'get',
})

InsightsController.definition = {
    methods: ["get","head"],
    url: '/admin/insights',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\InsightsController::__invoke
* @see app/Http/Controllers/Admin/InsightsController.php:12
* @route '/admin/insights'
*/
InsightsController.url = (options?: RouteQueryOptions) => {
    return InsightsController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InsightsController::__invoke
* @see app/Http/Controllers/Admin/InsightsController.php:12
* @route '/admin/insights'
*/
InsightsController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: InsightsController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InsightsController::__invoke
* @see app/Http/Controllers/Admin/InsightsController.php:12
* @route '/admin/insights'
*/
InsightsController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: InsightsController.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\InsightsController::__invoke
* @see app/Http/Controllers/Admin/InsightsController.php:12
* @route '/admin/insights'
*/
const InsightsControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: InsightsController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InsightsController::__invoke
* @see app/Http/Controllers/Admin/InsightsController.php:12
* @route '/admin/insights'
*/
InsightsControllerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: InsightsController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InsightsController::__invoke
* @see app/Http/Controllers/Admin/InsightsController.php:12
* @route '/admin/insights'
*/
InsightsControllerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: InsightsController.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

InsightsController.form = InsightsControllerForm

export default InsightsController