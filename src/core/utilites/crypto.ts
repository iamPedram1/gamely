import bcryptjs from 'bcryptjs';

const crypto = {
  async hash(value: string, saltRounds = 10): Promise<string> {
    return await bcryptjs.hash(value, saltRounds);
  },

  async compare(value: string, hashed: string): Promise<boolean> {
    return await bcryptjs.compare(value, hashed);
  },
};

export default crypto;
