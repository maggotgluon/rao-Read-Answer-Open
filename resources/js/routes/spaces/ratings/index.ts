import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\RatingController::update
* @see app/Http/Controllers/RatingController.php:15
* @route '/s/{space}/today/{dailyPrompt}/rating'
*/
export const update = (args: { space: string | { ulid: string }, dailyPrompt: number | { id: number } } | [space: string | { ulid: string }, dailyPrompt: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/s/{space}/today/{dailyPrompt}/rating',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\RatingController::update
* @see app/Http/Controllers/RatingController.php:15
* @route '/s/{space}/today/{dailyPrompt}/rating'
*/
update.url = (args: { space: string | { ulid: string }, dailyPrompt: number | { id: number } } | [space: string | { ulid: string }, dailyPrompt: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            space: args[0],
            dailyPrompt: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        space: typeof args.space === 'object'
        ? args.space.ulid
        : args.space,
        dailyPrompt: typeof args.dailyPrompt === 'object'
        ? args.dailyPrompt.id
        : args.dailyPrompt,
    }

    return update.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace('{dailyPrompt}', parsedArgs.dailyPrompt.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RatingController::update
* @see app/Http/Controllers/RatingController.php:15
* @route '/s/{space}/today/{dailyPrompt}/rating'
*/
update.put = (args: { space: string | { ulid: string }, dailyPrompt: number | { id: number } } | [space: string | { ulid: string }, dailyPrompt: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\RatingController::update
* @see app/Http/Controllers/RatingController.php:15
* @route '/s/{space}/today/{dailyPrompt}/rating'
*/
const updateForm = (args: { space: string | { ulid: string }, dailyPrompt: number | { id: number } } | [space: string | { ulid: string }, dailyPrompt: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RatingController::update
* @see app/Http/Controllers/RatingController.php:15
* @route '/s/{space}/today/{dailyPrompt}/rating'
*/
updateForm.put = (args: { space: string | { ulid: string }, dailyPrompt: number | { id: number } } | [space: string | { ulid: string }, dailyPrompt: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

const ratings = {
    update: Object.assign(update, update),
}

export default ratings