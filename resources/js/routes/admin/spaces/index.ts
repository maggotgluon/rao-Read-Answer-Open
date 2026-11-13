import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\UserController::premium
* @see app/Http/Controllers/Admin/UserController.php:54
* @route '/admin/spaces/{space}/premium'
*/
export const premium = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: premium.url(args, options),
    method: 'put',
})

premium.definition = {
    methods: ["put"],
    url: '/admin/spaces/{space}/premium',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\UserController::premium
* @see app/Http/Controllers/Admin/UserController.php:54
* @route '/admin/spaces/{space}/premium'
*/
premium.url = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { space: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'ulid' in args) {
        args = { space: args.ulid }
    }

    if (Array.isArray(args)) {
        args = {
            space: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        space: typeof args.space === 'object'
        ? args.space.ulid
        : args.space,
    }

    return premium.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\UserController::premium
* @see app/Http/Controllers/Admin/UserController.php:54
* @route '/admin/spaces/{space}/premium'
*/
premium.put = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: premium.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\UserController::premium
* @see app/Http/Controllers/Admin/UserController.php:54
* @route '/admin/spaces/{space}/premium'
*/
const premiumForm = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: premium.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\UserController::premium
* @see app/Http/Controllers/Admin/UserController.php:54
* @route '/admin/spaces/{space}/premium'
*/
premiumForm.put = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: premium.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

premium.form = premiumForm

const spaces = {
    premium: Object.assign(premium, premium),
}

export default spaces