import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\PrivacyController::destroy
* @see app/Http/Controllers/Settings/PrivacyController.php:59
* @route '/settings/profile'
*/
export const destroy = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/settings/profile',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Settings\PrivacyController::destroy
* @see app/Http/Controllers/Settings/PrivacyController.php:59
* @route '/settings/profile'
*/
destroy.url = (options?: RouteQueryOptions) => {
    return destroy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\PrivacyController::destroy
* @see app/Http/Controllers/Settings/PrivacyController.php:59
* @route '/settings/profile'
*/
destroy.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Settings\PrivacyController::destroy
* @see app/Http/Controllers/Settings/PrivacyController.php:59
* @route '/settings/profile'
*/
const destroyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\PrivacyController::destroy
* @see app/Http/Controllers/Settings/PrivacyController.php:59
* @route '/settings/profile'
*/
destroyForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

/**
* @see \App\Http\Controllers\Settings\PrivacyController::edit
* @see app/Http/Controllers/Settings/PrivacyController.php:20
* @route '/settings/privacy'
*/
export const edit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/settings/privacy',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\PrivacyController::edit
* @see app/Http/Controllers/Settings/PrivacyController.php:20
* @route '/settings/privacy'
*/
edit.url = (options?: RouteQueryOptions) => {
    return edit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\PrivacyController::edit
* @see app/Http/Controllers/Settings/PrivacyController.php:20
* @route '/settings/privacy'
*/
edit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\PrivacyController::edit
* @see app/Http/Controllers/Settings/PrivacyController.php:20
* @route '/settings/privacy'
*/
edit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\PrivacyController::edit
* @see app/Http/Controllers/Settings/PrivacyController.php:20
* @route '/settings/privacy'
*/
const editForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\PrivacyController::edit
* @see app/Http/Controllers/Settings/PrivacyController.php:20
* @route '/settings/privacy'
*/
editForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\PrivacyController::edit
* @see app/Http/Controllers/Settings/PrivacyController.php:20
* @route '/settings/privacy'
*/
editForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

edit.form = editForm

/**
* @see \App\Http\Controllers\Settings\PrivacyController::analytics
* @see app/Http/Controllers/Settings/PrivacyController.php:29
* @route '/settings/privacy/analytics'
*/
export const analytics = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: analytics.url(options),
    method: 'put',
})

analytics.definition = {
    methods: ["put"],
    url: '/settings/privacy/analytics',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Settings\PrivacyController::analytics
* @see app/Http/Controllers/Settings/PrivacyController.php:29
* @route '/settings/privacy/analytics'
*/
analytics.url = (options?: RouteQueryOptions) => {
    return analytics.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\PrivacyController::analytics
* @see app/Http/Controllers/Settings/PrivacyController.php:29
* @route '/settings/privacy/analytics'
*/
analytics.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: analytics.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Settings\PrivacyController::analytics
* @see app/Http/Controllers/Settings/PrivacyController.php:29
* @route '/settings/privacy/analytics'
*/
const analyticsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: analytics.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\PrivacyController::analytics
* @see app/Http/Controllers/Settings/PrivacyController.php:29
* @route '/settings/privacy/analytics'
*/
analyticsForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: analytics.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

analytics.form = analyticsForm

/**
* @see \App\Http\Controllers\Settings\PrivacyController::exportMethod
* @see app/Http/Controllers/Settings/PrivacyController.php:46
* @route '/settings/privacy/export'
*/
export const exportMethod = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/settings/privacy/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\PrivacyController::exportMethod
* @see app/Http/Controllers/Settings/PrivacyController.php:46
* @route '/settings/privacy/export'
*/
exportMethod.url = (options?: RouteQueryOptions) => {
    return exportMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\PrivacyController::exportMethod
* @see app/Http/Controllers/Settings/PrivacyController.php:46
* @route '/settings/privacy/export'
*/
exportMethod.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\PrivacyController::exportMethod
* @see app/Http/Controllers/Settings/PrivacyController.php:46
* @route '/settings/privacy/export'
*/
exportMethod.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\PrivacyController::exportMethod
* @see app/Http/Controllers/Settings/PrivacyController.php:46
* @route '/settings/privacy/export'
*/
const exportMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\PrivacyController::exportMethod
* @see app/Http/Controllers/Settings/PrivacyController.php:46
* @route '/settings/privacy/export'
*/
exportMethodForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\PrivacyController::exportMethod
* @see app/Http/Controllers/Settings/PrivacyController.php:46
* @route '/settings/privacy/export'
*/
exportMethodForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

exportMethod.form = exportMethodForm

const PrivacyController = { destroy, edit, analytics, exportMethod, export: exportMethod }

export default PrivacyController