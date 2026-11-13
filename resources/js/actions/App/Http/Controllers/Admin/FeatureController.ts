import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\FeatureController::index
* @see app/Http/Controllers/Admin/FeatureController.php:19
* @route '/admin/features'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/features',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\FeatureController::index
* @see app/Http/Controllers/Admin/FeatureController.php:19
* @route '/admin/features'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FeatureController::index
* @see app/Http/Controllers/Admin/FeatureController.php:19
* @route '/admin/features'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\FeatureController::index
* @see app/Http/Controllers/Admin/FeatureController.php:19
* @route '/admin/features'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\FeatureController::index
* @see app/Http/Controllers/Admin/FeatureController.php:19
* @route '/admin/features'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\FeatureController::index
* @see app/Http/Controllers/Admin/FeatureController.php:19
* @route '/admin/features'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\FeatureController::index
* @see app/Http/Controllers/Admin/FeatureController.php:19
* @route '/admin/features'
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
* @see \App\Http\Controllers\Admin\FeatureController::update
* @see app/Http/Controllers/Admin/FeatureController.php:51
* @route '/admin/features/{key}'
*/
export const update = (args: { key: string | number } | [key: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/features/{key}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\FeatureController::update
* @see app/Http/Controllers/Admin/FeatureController.php:51
* @route '/admin/features/{key}'
*/
update.url = (args: { key: string | number } | [key: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { key: args }
    }

    if (Array.isArray(args)) {
        args = {
            key: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        key: args.key,
    }

    return update.definition.url
            .replace('{key}', parsedArgs.key.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FeatureController::update
* @see app/Http/Controllers/Admin/FeatureController.php:51
* @route '/admin/features/{key}'
*/
update.put = (args: { key: string | number } | [key: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\FeatureController::update
* @see app/Http/Controllers/Admin/FeatureController.php:51
* @route '/admin/features/{key}'
*/
const updateForm = (args: { key: string | number } | [key: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/Admin/FeatureController.php:51
* @route '/admin/features/{key}'
*/
updateForm.put = (args: { key: string | number } | [key: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Admin\FeatureController::updateTheme
* @see app/Http/Controllers/Admin/FeatureController.php:37
* @route '/admin/themes/{theme}'
*/
export const updateTheme = (args: { theme: string | number } | [theme: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateTheme.url(args, options),
    method: 'put',
})

updateTheme.definition = {
    methods: ["put"],
    url: '/admin/themes/{theme}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\FeatureController::updateTheme
* @see app/Http/Controllers/Admin/FeatureController.php:37
* @route '/admin/themes/{theme}'
*/
updateTheme.url = (args: { theme: string | number } | [theme: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateTheme.definition.url
            .replace('{theme}', parsedArgs.theme.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\FeatureController::updateTheme
* @see app/Http/Controllers/Admin/FeatureController.php:37
* @route '/admin/themes/{theme}'
*/
updateTheme.put = (args: { theme: string | number } | [theme: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateTheme.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\FeatureController::updateTheme
* @see app/Http/Controllers/Admin/FeatureController.php:37
* @route '/admin/themes/{theme}'
*/
const updateThemeForm = (args: { theme: string | number } | [theme: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateTheme.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\FeatureController::updateTheme
* @see app/Http/Controllers/Admin/FeatureController.php:37
* @route '/admin/themes/{theme}'
*/
updateThemeForm.put = (args: { theme: string | number } | [theme: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateTheme.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateTheme.form = updateThemeForm

const FeatureController = { index, update, updateTheme }

export default FeatureController