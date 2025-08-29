import { UserRole } from "../enums/user.enum";

export type ICreateUser = {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
};

export type IUser ={
    id: number;
    username: string;
    email: string;
    role: UserRole;
}