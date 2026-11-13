import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\ThemeController::update
* @see app/Http/Controllers/Settings/ThemeController.php:28
* @route '/settings/theme'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/settings/theme',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Settings\ThemeController::update
* @see app/Http/Controllers/Settings/ThemeController.php:28
* @route '/settings/theme'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\ThemeController::update
* @see app/Http/Controllers/Settings/ThemeController.php:28
* @route '/settings/theme'
*/
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Settings\ThemeController::update
* @see app/Http/Controllers/Settings/ThemeController.php:28
* @route '/settings/theme'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\ThemeController::update
* @see app/Http/Controllers/Settings/ThemeController.php:28
* @route '/settings/theme'
*/
updateForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

const theme = {
    update: Object.assign(update, update),
}

export default theme