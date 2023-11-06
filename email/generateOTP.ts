import speakeasy from 'speakeasy'

export const generateOtp = (Length: number) => {
        const secret = speakeasy.generateSecret({ length: Length})

        const otp = speakeasy.totp({
            secret: secret.base32,
            encoding: 'base32',
        })

        console.log('Generated OTP:', otp)
        return otp
}



