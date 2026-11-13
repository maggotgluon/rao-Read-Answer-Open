import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ScheduleController::index
* @see app/Http/Controllers/Admin/ScheduleController.php:22
* @route '/admin/schedule'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/schedule',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ScheduleController::index
* @see app/Http/Controllers/Admin/ScheduleController.php:22
* @route '/admin/schedule'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ScheduleController::index
* @see app/Http/Controllers/Admin/ScheduleController.php:22
* @route '/admin/schedule'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ScheduleController::index
* @see app/Http/Controllers/Admin/ScheduleController.php:22
* @route '/admin/schedule'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\ScheduleController::index
* @see app/Http/Controllers/Admin/ScheduleController.php:22
* @route '/admin/schedule'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ScheduleController::index
* @see app/Http/Controllers/Admin/ScheduleController.php:22
* @route '/admin/schedule'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ScheduleController::index
* @see app/Http/Controllers/Admin/ScheduleController.php:22
* @route '/admin/schedule'
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
* @see \App\Http\Controllers\Admin\ScheduleController::store
* @see app/Http/Controllers/Admin/ScheduleController.php:49
* @route '/admin/schedule'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/schedule',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ScheduleController::store
* @see app/Http/Controllers/Admin/ScheduleController.php:49
* @route '/admin/schedule'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ScheduleController::store
* @see app/Http/Controllers/Admin/ScheduleController.php:49
* @route '/admin/schedule'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ScheduleController::store
* @see app/Http/Controllers/Admin/ScheduleController.php:49
* @route '/admin/schedule'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ScheduleController::store
* @see app/Http/Controllers/Admin/ScheduleController.php:49
* @route '/admin/schedule'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Admin\ScheduleController::destroy
* @see app/Http/Controllers/Admin/ScheduleController.php:81
* @route '/admin/schedule/{scheduled}'
*/
export const destroy = (args: { scheduled: number | { id: number } } | [scheduled: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/schedule/{scheduled}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\ScheduleController::destroy
* @see app/Http/Controllers/Admin/ScheduleController.php:81
* @route '/admin/schedule/{scheduled}'
*/
destroy.url = (args: { scheduled: number | { id: number } } | [scheduled: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { scheduled: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { scheduled: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            scheduled: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        scheduled: typeof args.scheduled === 'object'
        ? args.scheduled.id
        : args.scheduled,
    }

    return destroy.definition.url
            .replace('{scheduled}', parsedArgs.scheduled.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ScheduleController::destroy
* @see app/Http/Controllers/Admin/ScheduleController.php:81
* @route '/admin/schedule/{scheduled}'
*/
destroy.delete = (args: { scheduled: number | { id: number } } | [scheduled: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\ScheduleController::destroy
* @see app/Http/Controllers/Admin/ScheduleController.php:81
* @route '/admin/schedule/{scheduled}'
*/
const destroyForm = (args: { scheduled: number | { id: number } } | [scheduled: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/Admin/ScheduleController.php:81
* @route '/admin/schedule/{scheduled}'
*/
destroyForm.delete = (args: { scheduled: number | { id: number } } | [scheduled: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

/**
* @see \App\Http\Controllers\Admin\ScheduleController::storeDay
* @see app/Http/Controllers/Admin/ScheduleController.php:88
* @route '/admin/special-days'
*/
export const storeDay = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeDay.url(options),
    method: 'post',
})

storeDay.definition = {
    methods: ["post"],
    url: '/admin/special-days',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ScheduleController::storeDay
* @see app/Http/Controllers/Admin/ScheduleController.php:88
* @route '/admin/special-days'
*/
storeDay.url = (options?: RouteQueryOptions) => {
    return storeDay.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ScheduleController::storeDay
* @see app/Http/Controllers/Admin/ScheduleController.php:88
* @route '/admin/special-days'
*/
storeDay.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeDay.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ScheduleController::storeDay
* @see app/Http/Controllers/Admin/ScheduleController.php:88
* @route '/admin/special-days'
*/
const storeDayForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeDay.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ScheduleController::storeDay
* @see app/Http/Controllers/Admin/ScheduleController.php:88
* @route '/admin/special-days'
*/
storeDayForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeDay.url(options),
    method: 'post',
})

storeDay.form = storeDayForm

/**
* @see \App\Http\Controllers\Admin\ScheduleController::updateDay
* @see app/Http/Controllers/Admin/ScheduleController.php:96
* @route '/admin/special-days/{day}'
*/
export const updateDay = (args: { day: number | { id: number } } | [day: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateDay.url(args, options),
    method: 'patch',
})

updateDay.definition = {
    methods: ["patch"],
    url: '/admin/special-days/{day}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\ScheduleController::updateDay
* @see app/Http/Controllers/Admin/ScheduleController.php:96
* @route '/admin/special-days/{day}'
*/
updateDay.url = (args: { day: number | { id: number } } | [day: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return updateDay.definition.url
            .replace('{day}', parsedArgs.day.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ScheduleController::updateDay
* @see app/Http/Controllers/Admin/ScheduleController.php:96
* @route '/admin/special-days/{day}'
*/
updateDay.patch = (args: { day: number | { id: number } } | [day: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateDay.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\ScheduleController::updateDay
* @see app/Http/Controllers/Admin/ScheduleController.php:96
* @route '/admin/special-days/{day}'
*/
const updateDayForm = (args: { day: number | { id: number } } | [day: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateDay.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ScheduleController::updateDay
* @see app/Http/Controllers/Admin/ScheduleController.php:96
* @route '/admin/special-days/{day}'
*/
updateDayForm.patch = (args: { day: number | { id: number } } | [day: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateDay.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateDay.form = updateDayForm

/**
* @see \App\Http\Controllers\Admin\ScheduleController::destroyDay
* @see app/Http/Controllers/Admin/ScheduleController.php:103
* @route '/admin/special-days/{day}'
*/
export const destroyDay = (args: { day: number | { id: number } } | [day: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyDay.url(args, options),
    method: 'delete',
})

destroyDay.definition = {
    methods: ["delete"],
    url: '/admin/special-days/{day}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\ScheduleController::destroyDay
* @see app/Http/Controllers/Admin/ScheduleController.php:103
* @route '/admin/special-days/{day}'
*/
destroyDay.url = (args: { day: number | { id: number } } | [day: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return destroyDay.definition.url
            .replace('{day}', parsedArgs.day.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ScheduleController::destroyDay
* @see app/Http/Controllers/Admin/ScheduleController.php:103
* @route '/admin/special-days/{day}'
*/
destroyDay.delete = (args: { day: number | { id: number } } | [day: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyDay.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\ScheduleController::destroyDay
* @see app/Http/Controllers/Admin/ScheduleController.php:103
* @route '/admin/special-days/{day}'
*/
const destroyDayForm = (args: { day: number | { id: number } } | [day: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyDay.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ScheduleController::destroyDay
* @see app/Http/Controllers/Admin/ScheduleController.php:103
* @route '/admin/special-days/{day}'
*/
destroyDayForm.delete = (args: { day: number | { id: number } } | [day: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyDay.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyDay.form = destroyDayForm

const ScheduleController = { index, store, destroy, storeDay, updateDay, destroyDay }

export default ScheduleController