import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\FeatureController::update
* @see app/Http/Controllers/Admin/FeatureController.php:37
* @route '/admin/themes/{theme}'
*/
export const update = (args: { theme: string | number } | [theme: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/themes/{theme}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\FeatureController::update
* @see app/Http/Controllers/Admin/FeatureController.php:37
* @route '/admin/themes/{theme}'
*/
update.url = (args: { theme: string | number } | [theme: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { theme: args }
    }

    if (Array.isArray(args)) {
        args = {
            theme: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        theme: args.theme,
    }

    return update.definition.url
            .replace('{theme}', parsedArgs.theme.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FeatureController::update
* @see app/Http/Controllers/Admin/FeatureController.php:37
* @route '/admin/themes/{theme}'
*/
update.put = (args: { theme: string | number } | [theme: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\FeatureController::update
* @see app/Http/Controllers/Admin/FeatureController.php:37
* @route '/admin/themes/{theme}'
*/
const updateForm = (args: { theme: string | number } | [theme: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FeatureController::update
* @see app/Http/Controllers/Admin/FeatureController.php:37
* @route '/admin/themes/{theme}'
*/
updateForm.put = (args: { theme: string | number } | [theme: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

const themes = {
    update: Object.assign(update, update),
}

export default themes