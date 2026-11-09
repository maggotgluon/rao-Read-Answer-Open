import { Form, Head, router } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useT } from '@/lib/i18n';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import PasskeyVerify from '@/components/passkey-verify';

type DemoAccount = { name: string; email: string; note: string };

type Props = {
    status?: string;
    canResetPassword: boolean;
    demoAccounts?: DemoAccount[];
};

export default function Login({
    status,
    canResetPassword,
    demoAccounts = [],
}: Props) {
    const { t } = useT();

    return (
        <>
            <Head title={t('auth.login')} />

            <PasskeyVerify />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">{t('auth.email')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">
                                        {t('auth.password')}
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            {t('auth.forgot')}
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder={t('auth.password')}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">
                                    {t('auth.remember')}
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                {t('auth.login')}
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            {t('auth.no_account')}{' '}
                            <TextLink href={register()} tabIndex={5}>
                                {t('auth.signup')}
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {demoAccounts.length > 0 && <DemoLogins accounts={demoAccounts} />}

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'auth.login.title',
    description: 'auth.login.description',
};

/** Local dev only — the server sends no accounts outside APP_ENV=local. */
function DemoLogins({ accounts }: { accounts: DemoAccount[] }) {
    return (
        <div className="grid gap-2 rounded-xl border border-dashed border-amber-500/60 p-3">
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                DEV · demo accounts (password: password)
            </p>
            {accounts.map((a) => (
                <button
                    key={a.email}
                    type="button"
                    // Plain URL on purpose: the route only exists when dev tools are on,
                    // so Wayfinder doesn't generate it in CI/production builds.
                    onClick={() =>
                        router.post('/dev/login', { email: a.email })
                    }
                    className="flex flex-col items-start rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
                >
                    <span className="font-medium">
                        {a.name}{' '}
                        <span className="font-normal text-muted-foreground">
                            {a.email}
                        </span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {a.note}
                    </span>
                </button>
            ))}
        </div>
    );
}
