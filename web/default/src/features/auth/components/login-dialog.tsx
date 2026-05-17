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
import { useTranslation } from 'react-i18next'
import { useStatus } from '@/hooks/use-status'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { TermsFooter } from './terms-footer'
import { UserAuthForm } from '../sign-in/components/user-auth-form'

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSignUpClick?: () => void
}

export function LoginDialog({
  open,
  onOpenChange,
  onSignUpClick,
}: LoginDialogProps) {
  const { t } = useTranslation()
  const { status } = useStatus()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-md overflow-y-auto'>
        <DialogHeader className='text-left'>
          <DialogTitle className='text-xl font-semibold'>
            {t('Sign in')}
          </DialogTitle>
          {!status?.self_use_mode_enabled && (
            <DialogDescription>
              {t("Don't have an account?")}{' '}
              {onSignUpClick ? (
                <button
                  type='button'
                  onClick={onSignUpClick}
                  className='hover:text-primary font-medium underline underline-offset-4'
                >
                  {t('Sign up')}
                </button>
              ) : null}
            </DialogDescription>
          )}
        </DialogHeader>

        <UserAuthForm onSuccess={() => onOpenChange(false)} />

        <TermsFooter variant='sign-in' status={status} className='text-center' />
      </DialogContent>
    </Dialog>
  )
}
