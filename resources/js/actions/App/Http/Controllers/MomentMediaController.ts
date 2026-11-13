import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\MomentMediaController::show
* @see app/Http/Controllers/MomentMediaController.php:24
* @route '/s/{space}/moments/{moment}/media/{media}'
*/
export const show = (args: { space: string | { ulid: string }, moment: string | { ulid: string }, media: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string }, media: string | { ulid: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/s/{space}/moments/{moment}/media/{media}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MomentMediaController::show
* @see app/Http/Controllers/MomentMediaController.php:24
* @route '/s/{space}/moments/{moment}/media/{media}'
*/
show.url = (args: { space: string | { ulid: string }, moment: string | { ulid: string }, media: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string }, media: string | { ulid: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            space: args[0],
            moment: args[1],
            media: args[2],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        space: typeof args.space === 'object'
        ? args.space.ulid
        : args.space,
        moment: typeof args.moment === 'object'
        ? args.moment.ulid
        : args.moment,
        media: typeof args.media === 'object'
        ? args.media.ulid
        : args.media,
    }

    return show.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace('{moment}', parsedArgs.moment.toString())
            .replace('{media}', parsedArgs.media.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MomentMediaController::show
* @see app/Http/Controllers/MomentMediaController.php:24
* @route '/s/{space}/moments/{moment}/media/{media}'
*/
show.get = (args: { space: string | { ulid: string }, moment: string | { ulid: string }, media: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string }, media: string | { ulid: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MomentMediaController::show
* @see app/Http/Controllers/MomentMediaController.php:24
* @route '/s/{space}/moments/{moment}/media/{media}'
*/
show.head = (args: { space: string | { ulid: string }, moment: string | { ulid: string }, media: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string }, media: string | { ulid: string } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MomentMediaController::show
* @see app/Http/Controllers/MomentMediaController.php:24
* @route '/s/{space}/moments/{moment}/media/{media}'
*/
const showForm = (args: { space: string | { ulid: string }, moment: string | { ulid: string }, media: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string }, media: string | { ulid: string } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MomentMediaController::show
* @see app/Http/Controllers/MomentMediaController.php:24
* @route '/s/{space}/moments/{moment}/media/{media}'
*/
showForm.get = (args: { space: string | { ulid: string }, moment: string | { ulid: string }, media: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string }, media: string | { ulid: string } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MomentMediaController::show
* @see app/Http/Controllers/MomentMediaController.php:24
* @route '/s/{space}/moments/{moment}/media/{media}'
*/
showForm.head = (args: { space: string | { ulid: string }, moment: string | { ulid: string }, media: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string }, media: string | { ulid: string } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

const MomentMediaController = { show }

export default MomentMediaController