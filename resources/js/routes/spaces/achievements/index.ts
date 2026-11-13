import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\SpaceController::seen
* @see app/Http/Controllers/SpaceController.php:314
* @route '/s/{space}/achievements/seen'
*/
export const seen = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: seen.url(args, options),
    method: 'post',
})

seen.definition = {
    methods: ["post"],
    url: '/s/{space}/achievements/seen',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SpaceController::seen
* @see app/Http/Controllers/SpaceController.php:314
* @route '/s/{space}/achievements/seen'
*/
seen.url = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions) => {
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

    return seen.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SpaceController::seen
* @see app/Http/Controllers/SpaceController.php:314
* @route '/s/{space}/achievements/seen'
*/
seen.post = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: seen.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SpaceController::seen
* @see app/Http/Controllers/SpaceController.php:314
* @route '/s/{space}/achievements/seen'
*/
const seenForm = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: seen.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SpaceController::seen
* @see app/Http/Controllers/SpaceController.php:314
* @route '/s/{space}/achievements/seen'
*/
seenForm.post = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: seen.url(args, options),
    method: 'post',
})

seen.form = seenForm

const achievements = {
    seen: Object.assign(seen, seen),
}

export default achievements