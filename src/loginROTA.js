// Arquivo temporario de rotas de login
import { Router } from "express";
const router = Router();

router.get("/login", (req, res) => {
    res.json({ mensagem: "Rota de login temporaria" });
});

export default router;