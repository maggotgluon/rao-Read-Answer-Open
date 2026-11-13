import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::subscribe
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:15
* @route '/settings/push-subscriptions'
*/
export const subscribe = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: subscribe.url(options),
    method: 'post',
})

subscribe.definition = {
    methods: ["post"],
    url: '/settings/push-subscriptions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::subscribe
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:15
* @route '/settings/push-subscriptions'
*/
subscribe.url = (options?: RouteQueryOptions) => {
    return subscribe.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::subscribe
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:15
* @route '/settings/push-subscriptions'
*/
subscribe.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: subscribe.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::subscribe
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:15
* @route '/settings/push-subscriptions'
*/
const subscribeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: subscribe.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::subscribe
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:15
* @route '/settings/push-subscriptions'
*/
subscribeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: subscribe.url(options),
    method: 'post',
})

subscribe.form = subscribeForm

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::unsubscribe
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:40
* @route '/settings/push-subscriptions'
*/
export const unsubscribe = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: unsubscribe.url(options),
    method: 'delete',
})

unsubscribe.definition = {
    methods: ["delete"],
    url: '/settings/push-subscriptions',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::unsubscribe
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:40
* @route '/settings/push-subscriptions'
*/
unsubscribe.url = (options?: RouteQueryOptions) => {
    return unsubscribe.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::unsubscribe
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:40
* @route '/settings/push-subscriptions'
*/
unsubscribe.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: unsubscribe.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::unsubscribe
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:40
* @route '/settings/push-subscriptions'
*/
const unsubscribeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: unsubscribe.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\PushSubscriptionController::unsubscribe
* @see app/Http/Controllers/Settings/PushSubscriptionController.php:40
* @route '/settings/push-subscriptions'
*/
unsubscribeForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: unsubscribe.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

unsubscribe.form = unsubscribeForm

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

const push = {
    subscribe: Object.assign(subscribe, subscribe),
    unsubscribe: Object.assign(unsubscribe, unsubscribe),
    test: Object.assign(test, test),
}

export default push