// Autor: Luís Felipe Travaglini
// Usuário autenticado pelo servidor, disponível nas rotas protegidas.
import "express";

declare global {
  namespace Express {
    interface Request {
      usuario: { id: number; nome: string; email: string; perfil: string };
    }
  }
}

export {};
