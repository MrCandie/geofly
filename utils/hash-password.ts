import bcrypt from "bcryptjs";

export const hashPin = async (pin: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pin, salt);
};
