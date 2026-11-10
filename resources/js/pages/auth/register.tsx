import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { show as legal } from '@/routes/legal';
import { SensitiveCheckbox } from '@/pages/consent';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useT } from '@/lib/i18n';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    const { t } = useT();

    return (
        <>
            <Head title={t('auth.create')} />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t('auth.name')}</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder={t('auth.name')}
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">{t('auth.email')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    {t('auth.password')}
                                </Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder={t('auth.password')}
                                    passwordrules={passwordRules}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    {t('auth.confirm_password')}
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder={t('auth.confirm_password')}
                                    passwordrules={passwordRules}
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <div className="grid gap-1">
                                <SensitiveCheckbox />
                                <InputError message={errors.sensitive} />
                            </div>

                            <label className="flex items-start gap-3 rounded-[calc(var(--radius)-2px)] bg-paper-2 p-3 text-sm text-ink">
                                <input
                                    type="checkbox"
                                    name="analytics"
                                    value="1"
                                    className="mt-0.5 size-5 shrink-0 accent-[var(--stamp)]"
                                />
                                <span className="flex flex-col gap-0.5">
                                    <span className="font-medium">
                                        {t('signup.analytics_label')}
                                    </span>
                                    <span className="text-xs text-ink-soft">
                                        {t('signup.analytics_help')}
                                    </span>
                                </span>
                            </label>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                {t('auth.create')}
                            </Button>
                        </div>

                        <p className="text-center text-xs text-ink-soft">
                            {t('signup.agree_before')}{' '}
                            <a
                                href={legal.url('terms')}
                                target="_blank"
                                className="underline"
                            >
                                {t('legal.terms')}
                            </a>{' '}
                            {t('signup.agree_and')}{' '}
                            <a
                                href={legal.url('privacy')}
                                target="_blank"
                                className="underline"
                            >
                                {t('legal.privacy')}
                            </a>
                            {t('signup.agree_after')}
                        </p>

                        <div className="text-center text-sm text-ink-soft">
                            {t('auth.have_account')}{' '}
                            <TextLink href={login()} tabIndex={6}>
                                {t('auth.login')}
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'auth.register.title',
    description: 'auth.register.description',
};
