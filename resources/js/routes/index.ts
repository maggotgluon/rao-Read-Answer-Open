import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../wayfinder'
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
export const login = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

login.definition = {
    methods: ["get","head"],
    url: '/login',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
login.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
login.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: login.url(options),
    method: 'head',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
loginForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
loginForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

login.form = loginForm

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
export const logout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

logout.definition = {
    methods: ["post"],
    url: '/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
const logoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: logout.url(options),
    method: 'post',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
logoutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: logout.url(options),
    method: 'post',
})

logout.form = logoutForm

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
export const register = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: register.url(options),
    method: 'get',
})

register.definition = {
    methods: ["get","head"],
    url: '/register',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
register.url = (options?: RouteQueryOptions) => {
    return register.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
register.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: register.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
register.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: register.url(options),
    method: 'head',
})

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
const registerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: register.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
registerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: register.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
registerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: register.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

register.form = registerForm

/**
* @see routes/web.php:35
* @route '/'
*/
export const home = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

home.definition = {
    methods: ["get","head"],
    url: '/',
} satisfies RouteDefinition<["get","head"]>

/**
* @see routes/web.php:35
* @route '/'
*/
home.url = (options?: RouteQueryOptions) => {
    return home.definition.url + queryParams(options)
}

/**
* @see routes/web.php:35
* @route '/'
*/
home.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

/**
* @see routes/web.php:35
* @route '/'
*/
home.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: home.url(options),
    method: 'head',
})

/**
* @see routes/web.php:35
* @route '/'
*/
const homeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url(options),
    method: 'get',
})

/**
* @see routes/web.php:35
* @route '/'
*/
homeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url(options),
    method: 'get',
})

/**
* @see routes/web.php:35
* @route '/'
*/
homeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

home.form = homeForm

/**
* @see routes/web.php:41
* @route '/offline'
*/
export const offline = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: offline.url(options),
    method: 'get',
})

offline.definition = {
    methods: ["get","head"],
    url: '/offline',
} satisfies RouteDefinition<["get","head"]>

/**
* @see routes/web.php:41
* @route '/offline'
*/
offline.url = (options?: RouteQueryOptions) => {
    return offline.definition.url + queryParams(options)
}

/**
* @see routes/web.php:41
* @route '/offline'
*/
offline.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: offline.url(options),
    method: 'get',
})

/**
* @see routes/web.php:41
* @route '/offline'
*/
offline.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: offline.url(options),
    method: 'head',
})

/**
* @see routes/web.php:41
* @route '/offline'
*/
const offlineForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: offline.url(options),
    method: 'get',
})

/**
* @see routes/web.php:41
* @route '/offline'
*/
offlineForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: offline.url(options),
    method: 'get',
})

/**
* @see routes/web.php:41
* @route '/offline'
*/
offlineForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: offline.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

offline.form = offlineForm

/**
* @see \App\Http\Controllers\ChangelogController::__invoke
* @see app/Http/Controllers/ChangelogController.php:13
* @route '/changelog'
*/
export const changelog = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: changelog.url(options),
    method: 'get',
})

changelog.definition = {
    methods: ["get","head"],
    url: '/changelog',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChangelogController::__invoke
* @see app/Http/Controllers/ChangelogController.php:13
* @route '/changelog'
*/
changelog.url = (options?: RouteQueryOptions) => {
    return changelog.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChangelogController::__invoke
* @see app/Http/Controllers/ChangelogController.php:13
* @route '/changelog'
*/
changelog.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: changelog.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChangelogController::__invoke
* @see app/Http/Controllers/ChangelogController.php:13
* @route '/changelog'
*/
changelog.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: changelog.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChangelogController::__invoke
* @see app/Http/Controllers/ChangelogController.php:13
* @route '/changelog'
*/
const changelogForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: changelog.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChangelogController::__invoke
* @see app/Http/Controllers/ChangelogController.php:13
* @route '/changelog'
*/
changelogForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: changelog.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChangelogController::__invoke
* @see app/Http/Controllers/ChangelogController.php:13
* @route '/changelog'
*/
changelogForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: changelog.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

changelog.form = changelogForm

/**
* @see \App\Http\Controllers\SpaceController::dashboard
* @see app/Http/Controllers/SpaceController.php:35
* @route '/dashboard'
*/
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SpaceController::dashboard
* @see app/Http/Controllers/SpaceController.php:35
* @route '/dashboard'
*/
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SpaceController::dashboard
* @see app/Http/Controllers/SpaceController.php:35
* @route '/dashboard'
*/
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SpaceController::dashboard
* @see app/Http/Controllers/SpaceController.php:35
* @route '/dashboard'
*/
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SpaceController::dashboard
* @see app/Http/Controllers/SpaceController.php:35
* @route '/dashboard'
*/
const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboard.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SpaceController::dashboard
* @see app/Http/Controllers/SpaceController.php:35
* @route '/dashboard'
*/
dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboard.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SpaceController::dashboard
* @see app/Http/Controllers/SpaceController.php:35
* @route '/dashboard'
*/
dashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboard.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

dashboard.form = dashboardForm

/**
* @see \App\Http\Controllers\OpsController::__invoke
* @see app/Http/Controllers/OpsController.php:27
* @route '/_ops/{action}'
*/
export const ops = (args: { action: string | number } | [action: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ops.url(args, options),
    method: 'get',
})

ops.definition = {
    methods: ["get","head"],
    url: '/_ops/{action}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::__invoke
* @see app/Http/Controllers/OpsController.php:27
* @route '/_ops/{action}'
*/
ops.url = (args: { action: string | number } | [action: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { action: args }
    }

    if (Array.isArray(args)) {
        args = {
            action: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        action: args.action,
    }

    return ops.definition.url
            .replace('{action}', parsedArgs.action.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::__invoke
* @see app/Http/Controllers/OpsController.php:27
* @route '/_ops/{action}'
*/
ops.get = (args: { action: string | number } | [action: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ops.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OpsController::__invoke
* @see app/Http/Controllers/OpsController.php:27
* @route '/_ops/{action}'
*/
ops.head = (args: { action: string | number } | [action: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ops.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\OpsController::__invoke
* @see app/Http/Controllers/OpsController.php:27
* @route '/_ops/{action}'
*/
const opsForm = (args: { action: string | number } | [action: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ops.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OpsController::__invoke
* @see app/Http/Controllers/OpsController.php:27
* @route '/_ops/{action}'
*/
opsForm.get = (args: { action: string | number } | [action: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ops.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\OpsController::__invoke
* @see app/Http/Controllers/OpsController.php:27
* @route '/_ops/{action}'
*/
opsForm.head = (args: { action: string | number } | [action: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ops.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

ops.form = opsForm
