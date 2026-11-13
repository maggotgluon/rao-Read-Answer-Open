import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\LocationController::toggle
* @see app/Http/Controllers/Settings/LocationController.php:18
* @route '/settings/location'
*/
export const toggle = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: toggle.url(options),
    method: 'put',
})

toggle.definition = {
    methods: ["put"],
    url: '/settings/location',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Settings\LocationController::toggle
* @see app/Http/Controllers/Settings/LocationController.php:18
* @route '/settings/location'
*/
toggle.url = (options?: RouteQueryOptions) => {
    return toggle.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\LocationController::toggle
* @see app/Http/Controllers/Settings/LocationController.php:18
* @route '/settings/location'
*/
toggle.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: toggle.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Settings\LocationController::toggle
* @see app/Http/Controllers/Settings/LocationController.php:18
* @route '/settings/location'
*/
const toggleForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggle.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\LocationController::toggle
* @see app/Http/Controllers/Settings/LocationController.php:18
* @route '/settings/location'
*/
toggleForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggle.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

toggle.form = toggleForm

/**
* @see \App\Http\Controllers\Settings\LocationController::history
* @see app/Http/Controllers/Settings/LocationController.php:35
* @route '/settings/location/history'
*/
export const history = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: history.url(options),
    method: 'put',
})

history.definition = {
    methods: ["put"],
    url: '/settings/location/history',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Settings\LocationController::history
* @see app/Http/Controllers/Settings/LocationController.php:35
* @route '/settings/location/history'
*/
history.url = (options?: RouteQueryOptions) => {
    return history.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\LocationController::history
* @see app/Http/Controllers/Settings/LocationController.php:35
* @route '/settings/location/history'
*/
history.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: history.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Settings\LocationController::history
* @see app/Http/Controllers/Settings/LocationController.php:35
* @route '/settings/location/history'
*/
const historyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: history.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\LocationController::history
* @see app/Http/Controllers/Settings/LocationController.php:35
* @route '/settings/location/history'
*/
historyForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: history.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

history.form = historyForm

/**
* @see \App\Http\Controllers\Settings\LocationController::update
* @see app/Http/Controllers/Settings/LocationController.php:50
* @route '/location'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

update.definition = {
    methods: ["post"],
    url: '/location',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\LocationController::update
* @see app/Http/Controllers/Settings/LocationController.php:50
* @route '/location'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\LocationController::update
* @see app/Http/Controllers/Settings/LocationController.php:50
* @route '/location'
*/
update.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\LocationController::update
* @see app/Http/Controllers/Settings/LocationController.php:50
* @route '/location'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\LocationController::update
* @see app/Http/Controllers/Settings/LocationController.php:50
* @route '/location'
*/
updateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

update.form = updateForm

const location = {
    toggle: Object.assign(toggle, toggle),
    history: Object.assign(history, history),
    update: Object.assign(update, update),
}

export default location