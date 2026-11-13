import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\SurveyController::store
* @see app/Http/Controllers/SurveyController.php:13
* @route '/survey'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/survey',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SurveyController::store
* @see app/Http/Controllers/SurveyController.php:13
* @route '/survey'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SurveyController::store
* @see app/Http/Controllers/SurveyController.php:13
* @route '/survey'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SurveyController::store
* @see app/Http/Controllers/SurveyController.php:13
* @route '/survey'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SurveyController::store
* @see app/Http/Controllers/SurveyController.php:13
* @route '/survey'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const SurveyController = { store }

export default SurveyController