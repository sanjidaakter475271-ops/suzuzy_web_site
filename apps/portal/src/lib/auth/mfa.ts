import { authenticator } from "otplib";
import QRCode from "qrcode";

export function generateMFASecret() {
    return authenticator.generateSecret();
}

export function generateOTPAuthUrl(email: string, secret: string) {
    const issuer = "Royal Suzuky";
    return authenticator.keyuri(email, issuer, secret);
}

export async function generateQRCode(otpauthUrl: string) {
    return await QRCode.toDataURL(otpauthUrl);
}

export function verifyTOTP(token: string, secret: string) {
    return authenticator.verify({ token, secret });
}
