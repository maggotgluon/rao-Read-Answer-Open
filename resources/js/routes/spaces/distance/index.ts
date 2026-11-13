import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\SpaceController::forget
* @see app/Http/Controllers/SpaceController.php:207
* @route '/s/{space}/distance'
*/
export const forget = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: forget.url(args, options),
    method: 'delete',
})

forget.definition = {
    methods: ["delete"],
    url: '/s/{space}/distance',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\SpaceController::forget
* @see app/Http/Controllers/SpaceController.php:207
* @route '/s/{space}/distance'
*/
forget.url = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions) => {
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

    return forget.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SpaceController::forget
* @see app/Http/Controllers/SpaceController.php:207
* @route '/s/{space}/distance'
*/
forget.delete = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: forget.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\SpaceController::forget
* @see app/Http/Controllers/SpaceController.php:207
* @route '/s/{space}/distance'
*/
const forgetForm = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: forget.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SpaceController::forget
* @see app/Http/Controllers/SpaceController.php:207
* @route '/s/{space}/distance'
*/
forgetForm.delete = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: forget.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

forget.form = forgetForm

const distance = {
    forget: Object.assign(forget, forget),
}

export default distance