import Qrcode from "qrcode";

const otpAuthUrl = process.argv[2];

if (!otpAuthUrl) {
  throw new Error("pass otpauth as arguments.");
}

async function main() {
  try {
    await Qrcode.toFile("totp.png", otpAuthUrl);
    console.log("Qr saved");
  } catch (error) {
    console.log(error);
  }
}

main();
