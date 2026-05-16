/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useEffect, useMemo, useState } from 'react'
import type { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useStatus } from '@/hooks/use-status'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/password-input'
import { Turnstile } from '@/components/turnstile'
import { register, wechatLoginByCode } from '@/features/auth/api'
import { LegalConsent } from '@/features/auth/components/legal-consent'
import { OAuthProviders } from '@/features/auth/components/oauth-providers'
import { registerFormSchema } from '@/features/auth/constants'
import { useAuthRedirect } from '@/features/auth/hooks/use-auth-redirect'
import { useEmailVerification } from '@/features/auth/hooks/use-email-verification'
import { useTurnstile } from '@/features/auth/hooks/use-turnstile'
import { getAffiliateCode } from '@/features/auth/lib/storage'

/** Derive a username from an email address, e.g. "alice@example.com" → "alice_a1b2" */
function usernameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? 'user'
  const safe = local.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 16)
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${safe}_${suffix}`
}

export function SignUpForm({
  className,
  onSuccess,
  ...props
}: React.HTMLAttributes<HTMLFormElement> & { onSuccess?: () => void }) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [agreedToLegal, setAgreedToLegal] = useState(false)
  const [wechatCode, setWeChatCode] = useState('')
  const [isWeChatDialogOpen, setIsWeChatDialogOpen] = useState(false)
  const [isWeChatSubmitting, setIsWeChatSubmitting] = useState(false)
  const legalConsentErrorMessage = t('Please agree to the legal terms first')

  const { status } = useStatus()
  const {
    isTurnstileEnabled,
    turnstileSiteKey,
    turnstileToken,
    setTurnstileToken,
    validateTurnstile,
  } = useTurnstile()
  const { redirectToLogin, handleLoginSuccess } = useAuthRedirect()
  const {
    isSending: isSendingCode,
    secondsLeft,
    isActive,
    sendCode,
  } = useEmailVerification({
    turnstileToken,
    validateTurnstile,
  })

  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const emailValue = form.watch('email')
  // Email verification is always required in APiBay
  const emailVerificationEnabled = !!status?.email_verification
  const hasUserAgreement = Boolean(status?.user_agreement_enabled)
  const hasPrivacyPolicy = Boolean(status?.privacy_policy_enabled)
  const requiresLegalConsent = hasUserAgreement || hasPrivacyPolicy
  const oauthRegisterEnabled =
    status?.oauth_register_enabled ??
    status?.data?.oauth_register_enabled ??
    true
  const hasWeChatLogin = Boolean(status?.wechat_login)

  const wechatQrCodeUrl = useMemo(() => {
    return (
      status?.wechat_qrcode ||
      status?.wechat_qr_code ||
      status?.wechat_qrcode_image_url ||
      status?.wechat_qr_code_image_url ||
      status?.wechat_account_qrcode_image_url ||
      status?.WeChatAccountQRCodeImageURL ||
      status?.data?.wechat_qrcode ||
      status?.data?.WeChatAccountQRCodeImageURL ||
      ''
    )
  }, [status])

  useEffect(() => {
    if (requiresLegalConsent) {
      setAgreedToLegal(false)
    } else {
      setAgreedToLegal(true)
    }
  }, [requiresLegalConsent])

  async function onSubmit(data: z.infer<typeof registerFormSchema>) {
    if (requiresLegalConsent && !agreedToLegal) {
      toast.error(legalConsentErrorMessage)
      return
    }

    // When backend email verification is enabled, code is mandatory
    if (emailVerificationEnabled && !verificationCode) {
      toast.error(t('Please enter the verification code'))
      return
    }

    setIsLoading(true)
    try {
      const res = await register({
        username: usernameFromEmail(data.email),
        password: data.password,
        email: data.email,
        verification_code: verificationCode || undefined,
        aff: getAffiliateCode(),
        turnstile: turnstileToken,
      })

      if (res?.success) {
        toast.success(t('Account created! Please sign in'))
        if (onSuccess) {
          onSuccess()
        } else {
          redirectToLogin()
        }
      }
    } catch (_error) {
      // Errors are handled by global interceptor
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSendVerificationCode() {
    const email = emailValue?.trim()
    if (!email) {
      toast.error(t('Please enter your email first'))
      return
    }
    await sendCode(email)
  }

  const handleOpenWeChatDialog = () => {
    if (requiresLegalConsent && !agreedToLegal) {
      toast.error(legalConsentErrorMessage)
      return
    }
    setIsWeChatDialogOpen(true)
  }

  const handleWeChatDialogChange = (open: boolean) => {
    setIsWeChatDialogOpen(open)
    if (!open) {
      setWeChatCode('')
      setIsWeChatSubmitting(false)
    }
  }

  async function handleWeChatLogin() {
    if (!wechatCode.trim()) {
      toast.error(t('Please enter the verification code'))
      return
    }

    setIsWeChatSubmitting(true)
    try {
      const res = await wechatLoginByCode(wechatCode)
      if (res?.success) {
        await handleLoginSuccess(res.data as { id?: number } | null)
        toast.success(t('Signed in via WeChat'))
        handleWeChatDialogChange(false)
      } else {
        toast.error(res?.message || t('Login failed'))
      }
    } catch (_error) {
      toast.error(t('Login failed'))
    } finally {
      setIsWeChatSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-4', className)}
        {...props}
      >
        {/* Email Field — primary identifier */}
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Email')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('name@example.com')}
                  type='email'
                  autoComplete='email'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email Verification Code — always shown */}
        <div className='space-y-1.5'>
          <Label>{t('Verification code')}</Label>
          <div className='flex items-center gap-2'>
            <Input
              placeholder={t('Enter the code sent to your email')}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              autoComplete='one-time-code'
              className='flex-1'
            />
            <Button
              variant='outline'
              type='button'
              disabled={isLoading || isSendingCode || isActive || !emailValue}
              onClick={handleSendVerificationCode}
              className='shrink-0'
            >
              {isActive ? (
                t('Resend ({{seconds}}s)', { seconds: secondsLeft })
              ) : isSendingCode ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                t('Send code')
              )}
            </Button>
          </div>
          {!emailVerificationEnabled && (
            <p className='text-muted-foreground text-xs'>
              {t('Email verification is not enabled. You may leave this blank.')}
            </p>
          )}
        </div>

        {/* Turnstile */}
        {isTurnstileEnabled && (
          <div className='mt-1'>
            <Turnstile
              siteKey={turnstileSiteKey}
              onVerify={setTurnstileToken}
            />
          </div>
        )}

        {/* Password Field */}
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Password')}</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={t('Enter password (8-20 characters)')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Confirm Password Field */}
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Confirm password')}</FormLabel>
              <FormControl>
                <PasswordInput placeholder={t('Confirm password')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <LegalConsent
          status={status}
          checked={agreedToLegal}
          onCheckedChange={setAgreedToLegal}
          className='mt-1'
        />

        {/* Submit */}
        <Button
          type='submit'
          className='mt-2 w-full justify-center gap-2'
          disabled={isLoading || (requiresLegalConsent && !agreedToLegal)}
        >
          {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
          {t('Create account')}
        </Button>

        {oauthRegisterEnabled && (
          <OAuthProviders
            status={status}
            disabled={isLoading || (requiresLegalConsent && !agreedToLegal)}
            onWeChatLogin={hasWeChatLogin ? handleOpenWeChatDialog : undefined}
            isWeChatLoading={isWeChatSubmitting}
            className='pt-2'
          />
        )}
      </form>

      {hasWeChatLogin && (
        <Dialog
          open={isWeChatDialogOpen}
          onOpenChange={handleWeChatDialogChange}
        >
          <DialogContent className='max-w-sm'>
            <DialogHeader className='text-left'>
              <DialogTitle>{t('WeChat sign in')}</DialogTitle>
              <DialogDescription>
                {t(
                  'Scan the QR code to follow the official account and reply with "验证码" to receive your verification code.'
                )}
              </DialogDescription>
            </DialogHeader>

            {wechatQrCodeUrl ? (
              <div className='flex justify-center'>
                <img
                  src={wechatQrCodeUrl}
                  alt={t('WeChat login QR code')}
                  className='h-40 w-40 rounded-md border object-contain'
                />
              </div>
            ) : (
              <p className='text-muted-foreground text-sm'>
                {t('QR code is not configured. Please contact support.')}
              </p>
            )}

            <div className='grid gap-2'>
              <Label htmlFor='wechat-code'>{t('Verification code')}</Label>
              <Input
                id='wechat-code'
                placeholder={t('Enter the verification code')}
                value={wechatCode}
                onChange={(event) => setWeChatCode(event.target.value)}
                autoComplete='one-time-code'
              />
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleWeChatDialogChange(false)}
                disabled={isWeChatSubmitting}
              >
                {t('Cancel')}
              </Button>
              <Button
                type='button'
                onClick={handleWeChatLogin}
                disabled={
                  isWeChatSubmitting ||
                  !wechatCode.trim() ||
                  (requiresLegalConsent && !agreedToLegal)
                }
                className='gap-2'
              >
                {isWeChatSubmitting ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : null}
                {t('Confirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Form>
  )
}
