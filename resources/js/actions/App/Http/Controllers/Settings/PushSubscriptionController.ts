import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::store
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:15
* @route '/settings/push-subscriptions'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/settings/push-subscriptions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::store
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:15
* @route '/settings/push-subscriptions'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::store
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:15
* @route '/settings/push-subscriptions'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::store
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:15
* @route '/settings/push-subscriptions'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::store
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:15
* @route '/settings/push-subscriptions'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::destroy
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:40
* @route '/settings/push-subscriptions'
*/
export const destroy = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/settings/push-subscriptions',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::destroy
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:40
* @route '/settings/push-subscriptions'
*/
destroy.url = (options?: RouteQueryOptions) => {
    return destroy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::destroy
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:40
* @route '/settings/push-subscriptions'
*/
destroy.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::destroy
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:40
* @route '/settings/push-subscriptions'
*/
const destroyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::destroy
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:40
* @route '/settings/push-subscriptions'
*/
destroyForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::test
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:49
* @route '/settings/push-test'
*/
export const test = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(options),
    method: 'post',
})

test.definition = {
    methods: ["post"],
    url: '/settings/push-test',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::test
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:49
* @route '/settings/push-test'
*/
test.url = (options?: RouteQueryOptions) => {
    return test.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::test
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:49
* @route '/settings/push-test'
*/
test.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::test
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:49
* @route '/settings/push-test'
*/
const testForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: test.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::test
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:49
* @route '/settings/push-test'
*/
testForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: test.url(options),
    method: 'post',
})

test.form = testForm

const PushSubscriptionController = { store, destroy, test }

export default PushSubscriptionController