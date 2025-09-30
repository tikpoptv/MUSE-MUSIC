class User {
  constructor(data) {
    this.userID = data.userID;
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.fullName = data.fullName;
    this.profilePicture = data.profilePicture;
    this.provider = data.provider;
    this.providerID = data.providerID;
    this.providerEmail = data.providerEmail;
    this.role = data.role;
    this.loginStatus = data.loginStatus;
    this.setupCompleted = data.setupCompleted;
    this.setupSkipped = data.setupSkipped;
    this.registerDate = data.registerDate;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toJSON() {
    return {
      userID: this.userID,
      username: this.username,
      email: this.email,
      fullName: this.fullName,
      profilePicture: this.profilePicture,
      provider: this.provider,
      providerID: this.providerID,
      providerEmail: this.providerEmail,
      role: this.role,
      loginStatus: this.loginStatus,
      setupCompleted: this.setupCompleted,
      setupSkipped: this.setupSkipped,
      registerDate: this.registerDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // รับข้อมูล user สำหรับ public (ไม่รวมข้อมูลส่วนตัว)
  toPublicJSON() {
    return {
      userID: this.userID,
      username: this.username,
      fullName: this.fullName,
      profilePicture: this.profilePicture,
      role: this.role,
      registerDate: this.registerDate
    };
  }
}

module.exports = User;