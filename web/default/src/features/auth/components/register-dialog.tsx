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
import { Link } from '@tanstack/react-router'
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
import { SignUpForm } from '../sign-up/components/sign-up-form'

interface RegisterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSignInClick?: () => void
}

export function RegisterDialog({
  open,
  onOpenChange,
  onSignInClick,
}: RegisterDialogProps) {
  const { t } = useTranslation()
  const { status } = useStatus()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-md overflow-y-auto'>
        <DialogHeader className='text-left'>
          <DialogTitle className='text-xl font-semibold'>
            {t('Create an account')}
          </DialogTitle>
          <DialogDescription>
            {t('Already have an account?')}{' '}
            {onSignInClick ? (
              <button
                type='button'
                onClick={onSignInClick}
                className='hover:text-primary font-medium underline underline-offset-4'
              >
                {t('Sign in')}
              </button>
            ) : (
              <Link
                to='/sign-in'
                onClick={() => onOpenChange(false)}
                className='hover:text-primary font-medium underline underline-offset-4'
              >
                {t('Sign in')}
              </Link>
            )}
          </DialogDescription>
        </DialogHeader>

        <SignUpForm onSuccess={() => onOpenChange(false)} />

        <TermsFooter variant='sign-up' status={status} className='text-center' />
      </DialogContent>
    </Dialog>
  )
}
