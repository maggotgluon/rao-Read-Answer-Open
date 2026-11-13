import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\AnalyticsController::open
* @see app/Http/Controllers/AnalyticsController.php:15
* @route '/a/open'
*/
export const open = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: open.url(options),
    method: 'post',
})

open.definition = {
    methods: ["post"],
    url: '/a/open',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AnalyticsController::open
* @see app/Http/Controllers/AnalyticsController.php:15
* @route '/a/open'
*/
open.url = (options?: RouteQueryOptions) => {
    return open.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AnalyticsController::open
* @see app/Http/Controllers/AnalyticsController.php:15
* @route '/a/open'
*/
open.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: open.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AnalyticsController::open
* @see app/Http/Controllers/AnalyticsController.php:15
* @route '/a/open'
*/
const openForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: open.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AnalyticsController::open
* @see app/Http/Controllers/AnalyticsController.php:15
* @route '/a/open'
*/
openForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: open.url(options),
    method: 'post',
})

open.form = openForm

const AnalyticsController = { open }

export default AnalyticsController