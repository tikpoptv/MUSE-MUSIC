export interface AdminUser {
  userID: string;
  username: string;
  email: string;
  fullName: string | null;
  role: 'admin' | 'super_admin';
  registerDate: string;
  createdAt: string;
}

