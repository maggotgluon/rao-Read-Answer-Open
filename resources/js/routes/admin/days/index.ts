import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ScheduleController::store
* @see app/Http/Controllers/Admin/ScheduleController.php:88
* @route '/admin/special-days'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/special-days',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ScheduleController::store
* @see app/Http/Controllers/Admin/ScheduleController.php:88
* @route '/admin/special-days'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ScheduleController::store
* @see app/Http/Controllers/Admin/ScheduleController.php:88
* @route '/admin/special-days'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ScheduleController::store
* @see app/Http/Controllers/Admin/ScheduleController.php:88
* @route '/admin/special-days'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ScheduleController::store
* @see app/Http/Controllers/Admin/ScheduleController.php:88
* @route '/admin/special-days'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Admin\ScheduleController::update
* @see app/Http/Controllers/Admin/ScheduleController.php:96
* @route '/admin/special-days/{day}'
*/
export const update = (args: { day: number | { id: number } } | [day: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/admin/special-days/{day}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\ScheduleController::update
* @see app/Http/Controllers/Admin/ScheduleController.php:96
* @route '/admin/special-days/{day}'
*/
update.url = (args: { day: number | { id: number } } | [day: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { day: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { day: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            day: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        day: typeof args.day === 'object'
        ? args.day.id
        : args.day,
    }

    return update.definition.url
            .replace('{day}', parsedArgs.day.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ScheduleController::update
* @see app/Http/Controllers/Admin/ScheduleController.php:96
* @route '/admin/special-days/{day}'
*/
update.patch = (args: { day: number | { id: number } } | [day: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\ScheduleController::update
* @see app/Http/Controllers/Admin/ScheduleController.php:96
* @route '/admin/special-days/{day}'
*/
const updateForm = (args: { day: number | { id: number } } | [day: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ScheduleController::update
* @see app/Http/Controllers/Admin/ScheduleController.php:96
* @route '/admin/special-days/{day}'
*/
updateForm.patch = (args: { day: number | { id: number } } | [day: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\ScheduleController::destroy
* @see app/Http/Controllers/Admin/ScheduleController.php:103
* @route '/admin/special-days/{day}'
*/
export const destroy = (args: { day: number | { id: number } } | [day: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/special-days/{day}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\ScheduleController::destroy
* @see app/Http/Controllers/Admin/ScheduleController.php:103
* @route '/admin/special-days/{day}'
*/
destroy.url = (args: { day: number | { id: number } } | [day: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { day: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { day: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            day: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        day: typeof args.day === 'object'
        ? args.day.id
        : args.day,
    }

    return destroy.definition.url
            .replace('{day}', parsedArgs.day.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ScheduleController::destroy
* @see app/Http/Controllers/Admin/ScheduleController.php:103
* @route '/admin/special-days/{day}'
*/
destroy.delete = (args: { day: number | { id: number } } | [day: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\ScheduleController::destroy
* @see app/Http/Controllers/Admin/ScheduleController.php:103
* @route '/admin/special-days/{day}'
*/
const destroyForm = (args: { day: number | { id: number } } | [day: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ScheduleController::destroy
* @see app/Http/Controllers/Admin/ScheduleController.php:103
* @route '/admin/special-days/{day}'
*/
destroyForm.delete = (args: { day: number | { id: number } } | [day: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const days = {
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default days