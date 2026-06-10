import crypto from "crypto";

const algorithm = "aes-256-gcm";
const key = Buffer.from(process.env.TWO_FACTOR_ENCRYPTION_KEY!, "hex");

export function encrypt(text: string) {
  //initializaton vector to make every plain text with new cipher text. even same plain text will give different cipher text.
  const iv = crypto.randomBytes(16);

  //fed all of them  and encrypt
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  //merge all of them and end encryption
  const encrypted = Buffer.concat([
    cipher.update(text, "utf-8"),
    cipher.final(),
  ]);

  //this tag will help if encrypted data in db is changed or not
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
    tag: tag.toString("hex"),
  };
}

//now decrypt
export function decrypt(encryptedData: any) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(encryptedData.iv, "hex"),
  );

  //   check if someone modified the encrypted data?
  decipher.setAuthTag(Buffer.from(encryptedData.tag, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedData.content, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf-8");
}
