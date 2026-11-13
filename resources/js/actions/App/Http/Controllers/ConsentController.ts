import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ConsentController::show
* @see app/Http/Controllers/ConsentController.php:13
* @route '/consent'
*/
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/consent',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ConsentController::show
* @see app/Http/Controllers/ConsentController.php:13
* @route '/consent'
*/
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConsentController::show
* @see app/Http/Controllers/ConsentController.php:13
* @route '/consent'
*/
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ConsentController::show
* @see app/Http/Controllers/ConsentController.php:13
* @route '/consent'
*/
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ConsentController::show
* @see app/Http/Controllers/ConsentController.php:13
* @route '/consent'
*/
const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ConsentController::show
* @see app/Http/Controllers/ConsentController.php:13
* @route '/consent'
*/
showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ConsentController::show
* @see app/Http/Controllers/ConsentController.php:13
* @route '/consent'
*/
showForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\ConsentController::store
* @see app/Http/Controllers/ConsentController.php:22
* @route '/consent'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/consent',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ConsentController::store
* @see app/Http/Controllers/ConsentController.php:22
* @route '/consent'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConsentController::store
* @see app/Http/Controllers/ConsentController.php:22
* @route '/consent'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ConsentController::store
* @see app/Http/Controllers/ConsentController.php:22
* @route '/consent'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ConsentController::store
* @see app/Http/Controllers/ConsentController.php:22
* @route '/consent'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\ConsentController::withdraw
* @see app/Http/Controllers/ConsentController.php:30
* @route '/consent'
*/
export const withdraw = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: withdraw.url(options),
    method: 'delete',
})

withdraw.definition = {
    methods: ["delete"],
    url: '/consent',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ConsentController::withdraw
* @see app/Http/Controllers/ConsentController.php:30
* @route '/consent'
*/
withdraw.url = (options?: RouteQueryOptions) => {
    return withdraw.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConsentController::withdraw
* @see app/Http/Controllers/ConsentController.php:30
* @route '/consent'
*/
withdraw.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: withdraw.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ConsentController::withdraw
* @see app/Http/Controllers/ConsentController.php:30
* @route '/consent'
*/
const withdrawForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: withdraw.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ConsentController::withdraw
* @see app/Http/Controllers/ConsentController.php:30
* @route '/consent'
*/
withdrawForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: withdraw.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

withdraw.form = withdrawForm

const ConsentController = { show, store, withdraw }

export default ConsentController