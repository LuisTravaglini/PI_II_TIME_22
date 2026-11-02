//Criador: Gabriel Souza
export const PERFIS = {
    ADMINISTRADOR: "administrador",
    LIDER: "lider",
    MEMBRO: "membro"
};

export const NOMES_PERFIS = {
    administrador: "Administrador",
    lider: "Líder de Projeto",
    membro: "Membro da Equipe"
};

export const PERMISSOES = {
    administrador: [
        "ver_demandas",
        "criar_demanda",
        "editar_demanda",
        "alterar_status",
        "cancelar_demanda",
        "gerenciar_usuarios"
    ],
    lider: [
        "ver_demandas",
        "criar_demanda",
        "editar_demanda",
        "alterar_status",
        "cancelar_demanda"
    ],
    membro: [
        "ver_demandas",
        "criar_demanda",
        "alterar_status"
    ]
};

export function perfilTemPermissao(perfil, permissao) {
    const lista = PERMISSOES[perfil] || [];
    return lista.includes(permissao);
}