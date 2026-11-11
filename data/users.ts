/** Esquema da tabela de autenticação conforme migrations/010_autenticacao_admin.mjs. */
export const USERS_TABLE = 'users' as const;

export type UserRole = 'admin' | 'user';

/** Representação dos campos persistidos em `users`. */
export interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export const USERS_COLUMNS = [
  'id',
  'username',
  'password_hash',
  'role',
  'is_active',
  'created_at',
  'updated_at',
  'last_login_at',
] as const satisfies readonly (keyof UserRow)[];
