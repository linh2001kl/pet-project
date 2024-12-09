const bcrypt = require("bcryptjs");

class User {
  constructor() {
    this.users = []; // Tạm thời lưu dữ liệu ở bộ nhớ (thay DB sau)
  }

  async createUser(email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { email, password: hashedPassword };
    this.users.push(user);
    return user;
  }

  findUser(email) {
    return this.users.find((user) => user.email === email);
  }

  async validatePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}

module.exports = new User();
