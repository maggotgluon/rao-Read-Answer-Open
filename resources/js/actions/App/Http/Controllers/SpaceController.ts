import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\SpaceController::index
* @see app/Http/Controllers/SpaceController.php:35
* @route '/dashboard'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SpaceController::index
* @see app/Http/Controllers/SpaceController.php:35
* @route '/dashboard'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SpaceController::index
* @see app/Http/Controllers/SpaceController.php:35
* @route '/dashboard'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SpaceController::index
* @see app/Http/Controllers/SpaceController.php:35
* @route '/dashboard'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SpaceController::index
* @see app/Http/Controllers/SpaceController.php:35
* @route '/dashboard'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SpaceController::index
* @see app/Http/Controllers/SpaceController.php:35
* @route '/dashboard'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SpaceController::index
* @see app/Http/Controllers/SpaceController.php:35
* @route '/dashboard'
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
* @see \App\Http\Controllers\SpaceController::store
* @see app/Http/Controllers/SpaceController.php:56
* @route '/spaces'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/spaces',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SpaceController::store
* @see app/Http/Controllers/SpaceController.php:56
* @route '/spaces'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SpaceController::store
* @see app/Http/Controllers/SpaceController.php:56
* @route '/spaces'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SpaceController::store
* @see app/Http/Controllers/SpaceController.php:56
* @route '/spaces'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SpaceController::store
* @see app/Http/Controllers/SpaceController.php:56
* @route '/spaces'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\SpaceController::show
* @see app/Http/Controllers/SpaceController.php:88
* @route '/s/{space}'
*/
export const show = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/s/{space}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SpaceController::show
* @see app/Http/Controllers/SpaceController.php:88
* @route '/s/{space}'
*/
show.url = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SpaceController::show
* @see app/Http/Controllers/SpaceController.php:88
* @route '/s/{space}'
*/
show.get = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SpaceController::show
* @see app/Http/Controllers/SpaceController.php:88
* @route '/s/{space}'
*/
show.head = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SpaceController::show
* @see app/Http/Controllers/SpaceController.php:88
* @route '/s/{space}'
*/
const showForm = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SpaceController::show
* @see app/Http/Controllers/SpaceController.php:88
* @route '/s/{space}'
*/
showForm.get = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SpaceController::show
* @see app/Http/Controllers/SpaceController.php:88
* @route '/s/{space}'
*/
showForm.head = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\SpaceController::daily
* @see app/Http/Controllers/SpaceController.php:129
* @route '/s/{space}/daily'
*/
export const daily = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: daily.url(args, options),
    method: 'get',
})

daily.definition = {
    methods: ["get","head"],
    url: '/s/{space}/daily',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SpaceController::daily
* @see app/Http/Controllers/SpaceController.php:129
* @route '/s/{space}/daily'
*/
daily.url = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions) => {
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

    return daily.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SpaceController::daily
* @see app/Http/Controllers/SpaceController.php:129
* @route '/s/{space}/daily'
*/
daily.get = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: daily.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SpaceController::daily
* @see app/Http/Controllers/SpaceController.php:129
* @route '/s/{space}/daily'
*/
daily.head = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: daily.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SpaceController::daily
* @see app/Http/Controllers/SpaceController.php:129
* @route '/s/{space}/daily'
*/
const dailyForm = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: daily.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SpaceController::daily
* @see app/Http/Controllers/SpaceController.php:129
* @route '/s/{space}/daily'
*/
dailyForm.get = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: daily.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SpaceController::daily
* @see app/Http/Controllers/SpaceController.php:129
* @route '/s/{space}/daily'
*/
dailyForm.head = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: daily.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

daily.form = dailyForm

/**
* @see \App\Http\Controllers\SpaceController::moments
* @see app/Http/Controllers/SpaceController.php:151
* @route '/s/{space}/moments'
*/
export const moments = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: moments.url(args, options),
    method: 'get',
})

moments.definition = {
    methods: ["get","head"],
    url: '/s/{space}/moments',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SpaceController::moments
* @see app/Http/Controllers/SpaceController.php:151
* @route '/s/{space}/moments'
*/
moments.url = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions) => {
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

    return moments.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SpaceController::moments
* @see app/Http/Controllers/SpaceController.php:151
* @route '/s/{space}/moments'
*/
moments.get = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: moments.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SpaceController::moments
* @see app/Http/Controllers/SpaceController.php:151
* @route '/s/{space}/moments'
*/
moments.head = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: moments.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SpaceController::moments
* @see app/Http/Controllers/SpaceController.php:151
* @route '/s/{space}/moments'
*/
const momentsForm = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: moments.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SpaceController::moments
* @see app/Http/Controllers/SpaceController.php:151
* @route '/s/{space}/moments'
*/
momentsForm.get = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: moments.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SpaceController::moments
* @see app/Http/Controllers/SpaceController.php:151
* @route '/s/{space}/moments'
*/
momentsForm.head = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: moments.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

moments.form = momentsForm

/**
* @see \App\Http\Controllers\SpaceController::restore
* @see app/Http/Controllers/SpaceController.php:224
* @route '/s/{space}/restore'
*/
export const restore = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restore.url(args, options),
    method: 'post',
})

restore.definition = {
    methods: ["post"],
    url: '/s/{space}/restore',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SpaceController::restore
* @see app/Http/Controllers/SpaceController.php:224
* @route '/s/{space}/restore'
*/
restore.url = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions) => {
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

    return restore.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SpaceController::restore
* @see app/Http/Controllers/SpaceController.php:224
* @route '/s/{space}/restore'
*/
restore.post = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restore.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SpaceController::restore
* @see app/Http/Controllers/SpaceController.php:224
* @route '/s/{space}/restore'
*/
const restoreForm = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: restore.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SpaceController::restore
* @see app/Http/Controllers/SpaceController.php:224
* @route '/s/{space}/restore'
*/
restoreForm.post = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: restore.url(args, options),
    method: 'post',
})

restore.form = restoreForm

/**
* @see \App\Http\Controllers\SpaceController::seenAchievements
* @see app/Http/Controllers/SpaceController.php:314
* @route '/s/{space}/achievements/seen'
*/
export const seenAchievements = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: seenAchievements.url(args, options),
    method: 'post',
})

seenAchievements.definition = {
    methods: ["post"],
    url: '/s/{space}/achievements/seen',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SpaceController::seenAchievements
* @see app/Http/Controllers/SpaceController.php:314
* @route '/s/{space}/achievements/seen'
*/
seenAchievements.url = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions) => {
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

    return seenAchievements.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SpaceController::seenAchievements
* @see app/Http/Controllers/SpaceController.php:314
* @route '/s/{space}/achievements/seen'
*/
seenAchievements.post = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: seenAchievements.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SpaceController::seenAchievements
* @see app/Http/Controllers/SpaceController.php:314
* @route '/s/{space}/achievements/seen'
*/
const seenAchievementsForm = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: seenAchievements.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SpaceController::seenAchievements
* @see app/Http/Controllers/SpaceController.php:314
* @route '/s/{space}/achievements/seen'
*/
seenAchievementsForm.post = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: seenAchievements.url(args, options),
    method: 'post',
})

seenAchievements.form = seenAchievementsForm

/**
* @see \App\Http\Controllers\SpaceController::update
* @see app/Http/Controllers/SpaceController.php:165
* @route '/s/{space}'
*/
export const update = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/s/{space}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\SpaceController::update
* @see app/Http/Controllers/SpaceController.php:165
* @route '/s/{space}'
*/
update.url = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SpaceController::update
* @see app/Http/Controllers/SpaceController.php:165
* @route '/s/{space}'
*/
update.patch = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\SpaceController::update
* @see app/Http/Controllers/SpaceController.php:165
* @route '/s/{space}'
*/
const updateForm = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SpaceController::update
* @see app/Http/Controllers/SpaceController.php:165
* @route '/s/{space}'
*/
updateForm.patch = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\SpaceController::freeze
* @see app/Http/Controllers/SpaceController.php:216
* @route '/s/{space}/freeze'
*/
export const freeze = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: freeze.url(args, options),
    method: 'post',
})

freeze.definition = {
    methods: ["post"],
    url: '/s/{space}/freeze',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SpaceController::freeze
* @see app/Http/Controllers/SpaceController.php:216
* @route '/s/{space}/freeze'
*/
freeze.url = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions) => {
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

    return freeze.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SpaceController::freeze
* @see app/Http/Controllers/SpaceController.php:216
* @route '/s/{space}/freeze'
*/
freeze.post = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: freeze.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SpaceController::freeze
* @see app/Http/Controllers/SpaceController.php:216
* @route '/s/{space}/freeze'
*/
const freezeForm = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: freeze.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SpaceController::freeze
* @see app/Http/Controllers/SpaceController.php:216
* @route '/s/{space}/freeze'
*/
freezeForm.post = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: freeze.url(args, options),
    method: 'post',
})

freeze.form = freezeForm

/**
* @see \App\Http\Controllers\SpaceController::regenerateInvite
* @see app/Http/Controllers/SpaceController.php:234
* @route '/s/{space}/invite'
*/
export const regenerateInvite = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerateInvite.url(args, options),
    method: 'post',
})

regenerateInvite.definition = {
    methods: ["post"],
    url: '/s/{space}/invite',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SpaceController::regenerateInvite
* @see app/Http/Controllers/SpaceController.php:234
* @route '/s/{space}/invite'
*/
regenerateInvite.url = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions) => {
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

    return regenerateInvite.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SpaceController::regenerateInvite
* @see app/Http/Controllers/SpaceController.php:234
* @route '/s/{space}/invite'
*/
regenerateInvite.post = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerateInvite.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SpaceController::regenerateInvite
* @see app/Http/Controllers/SpaceController.php:234
* @route '/s/{space}/invite'
*/
const regenerateInviteForm = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: regenerateInvite.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SpaceController::regenerateInvite
* @see app/Http/Controllers/SpaceController.php:234
* @route '/s/{space}/invite'
*/
regenerateInviteForm.post = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: regenerateInvite.url(args, options),
    method: 'post',
})

regenerateInvite.form = regenerateInviteForm

/**
* @see \App\Http\Controllers\SpaceController::longDistance
* @see app/Http/Controllers/SpaceController.php:194
* @route '/s/{space}/long-distance'
*/
export const longDistance = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: longDistance.url(args, options),
    method: 'put',
})

longDistance.definition = {
    methods: ["put"],
    url: '/s/{space}/long-distance',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\SpaceController::longDistance
* @see app/Http/Controllers/SpaceController.php:194
* @route '/s/{space}/long-distance'
*/
longDistance.url = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions) => {
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

    return longDistance.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SpaceController::longDistance
* @see app/Http/Controllers/SpaceController.php:194
* @route '/s/{space}/long-distance'
*/
longDistance.put = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: longDistance.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\SpaceController::longDistance
* @see app/Http/Controllers/SpaceController.php:194
* @route '/s/{space}/long-distance'
*/
const longDistanceForm = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: longDistance.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SpaceController::longDistance
* @see app/Http/Controllers/SpaceController.php:194
* @route '/s/{space}/long-distance'
*/
longDistanceForm.put = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: longDistance.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

longDistance.form = longDistanceForm

/**
* @see \App\Http\Controllers\SpaceController::forgetDistance
* @see app/Http/Controllers/SpaceController.php:207
* @route '/s/{space}/distance'
*/
export const forgetDistance = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: forgetDistance.url(args, options),
    method: 'delete',
})

forgetDistance.definition = {
    methods: ["delete"],
    url: '/s/{space}/distance',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\SpaceController::forgetDistance
* @see app/Http/Controllers/SpaceController.php:207
* @route '/s/{space}/distance'
*/
forgetDistance.url = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions) => {
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

    return forgetDistance.definition.url
            .replace('{space}', parsedArgs.space.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SpaceController::forgetDistance
* @see app/Http/Controllers/SpaceController.php:207
* @route '/s/{space}/distance'
*/
forgetDistance.delete = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: forgetDistance.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\SpaceController::forgetDistance
* @see app/Http/Controllers/SpaceController.php:207
* @route '/s/{space}/distance'
*/
const forgetDistanceForm = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: forgetDistance.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SpaceController::forgetDistance
* @see app/Http/Controllers/SpaceController.php:207
* @route '/s/{space}/distance'
*/
forgetDistanceForm.delete = (args: { space: string | { ulid: string } } | [space: string | { ulid: string } ] | string | { ulid: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: forgetDistance.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

forgetDistance.form = forgetDistanceForm

const SpaceController = { index, store, show, daily, moments, restore, seenAchievements, update, freeze, regenerateInvite, longDistance, forgetDistance }

export default SpaceController