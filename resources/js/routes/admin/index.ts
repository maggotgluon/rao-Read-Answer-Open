import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import users from './users'
import spaces from './spaces'
import features from './features'
import themes from './themes'
import schedule from './schedule'
import days from './days'
import prompts from './prompts'
/**
* @see \App\Http\Controllers\Admin\DashboardController::__invoke
* @see app/Http/Controllers/Admin/DashboardController.php:12
* @route '/admin'
*/
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/admin',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\DashboardController::__invoke
* @see app/Http/Controllers/Admin/DashboardController.php:12
* @route '/admin'
*/
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\DashboardController::__invoke
* @see app/Http/Controllers/Admin/DashboardController.php:12
* @route '/admin'
*/
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\DashboardController::__invoke
* @see app/Http/Controllers/Admin/DashboardController.php:12
* @route '/admin'
*/
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\DashboardController::__invoke
* @see app/Http/Controllers/Admin/DashboardController.php:12
* @route '/admin'
*/
const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboard.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\DashboardController::__invoke
* @see app/Http/Controllers/Admin/DashboardController.php:12
* @route '/admin'
*/
dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboard.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\DashboardController::__invoke
* @see app/Http/Controllers/Admin/DashboardController.php:12
* @route '/admin'
*/
dashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboard.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

dashboard.form = dashboardForm

/**
* @see \App\Http\Controllers\Admin\InsightsController::__invoke
* @see app/Http/Controllers/Admin/InsightsController.php:12
* @route '/admin/insights'
*/
export const insights = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: insights.url(options),
    method: 'get',
})

insights.definition = {
    methods: ["get","head"],
    url: '/admin/insights',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\InsightsController::__invoke
* @see app/Http/Controllers/Admin/InsightsController.php:12
* @route '/admin/insights'
*/
insights.url = (options?: RouteQueryOptions) => {
    return insights.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\InsightsController::__invoke
* @see app/Http/Controllers/Admin/InsightsController.php:12
* @route '/admin/insights'
*/
insights.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: insights.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InsightsController::__invoke
* @see app/Http/Controllers/Admin/InsightsController.php:12
* @route '/admin/insights'
*/
insights.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: insights.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\InsightsController::__invoke
* @see app/Http/Controllers/Admin/InsightsController.php:12
* @route '/admin/insights'
*/
const insightsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: insights.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InsightsController::__invoke
* @see app/Http/Controllers/Admin/InsightsController.php:12
* @route '/admin/insights'
*/
insightsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: insights.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\InsightsController::__invoke
* @see app/Http/Controllers/Admin/InsightsController.php:12
* @route '/admin/insights'
*/
insightsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: insights.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

insights.form = insightsForm

const admin = {
    dashboard: Object.assign(dashboard, dashboard),
    insights: Object.assign(insights, insights),
    users: Object.assign(users, users),
    spaces: Object.assign(spaces, spaces),
    features: Object.assign(features, features),
    themes: Object.assign(themes, themes),
    schedule: Object.assign(schedule, schedule),
    days: Object.assign(days, days),
    prompts: Object.assign(prompts, prompts),
}

export default admin