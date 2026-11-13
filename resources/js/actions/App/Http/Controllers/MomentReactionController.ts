import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\MomentReactionController::update
* @see app/Http/Controllers/MomentReactionController.php:17
* @route '/s/{space}/moments/{moment}/reaction'
*/
export const update = (args: { space: string | { ulid: string }, moment: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/s/{space}/moments/{moment}/reaction',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\MomentReactionController::update
* @see app/Http/Controllers/MomentReactionController.php:17
* @route '/s/{space}/moments/{moment}/reaction'
*/
update.url = (args: { space: string | { ulid: string }, moment: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            space: args[0],
            moment: args[1],
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
    }

    return update.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace('{moment}', parsedArgs.moment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MomentReactionController::update
* @see app/Http/Controllers/MomentReactionController.php:17
* @route '/s/{space}/moments/{moment}/reaction'
*/
update.put = (args: { space: string | { ulid: string }, moment: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\MomentReactionController::update
* @see app/Http/Controllers/MomentReactionController.php:17
* @route '/s/{space}/moments/{moment}/reaction'
*/
const updateForm = (args: { space: string | { ulid: string }, moment: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MomentReactionController::update
* @see app/Http/Controllers/MomentReactionController.php:17
* @route '/s/{space}/moments/{moment}/reaction'
*/
updateForm.put = (args: { space: string | { ulid: string }, moment: string | { ulid: string } } | [space: string | { ulid: string }, moment: string | { ulid: string } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

const MomentReactionController = { update }

export default MomentReactionController