// Preparação da conexão compartilhada com o banco Oracle da equipe.
// As credenciais devem ser definidas no ambiente e nunca no código.
import oracledb from "oracledb";

export async function conectarOracle() {
    const { TRAK_DB_USER, TRAK_DB_PASSWORD, TRAK_DB_CONNECT_STRING } = process.env;
    if (!TRAK_DB_USER || !TRAK_DB_PASSWORD || !TRAK_DB_CONNECT_STRING) {
        throw new Error("Configure TRAK_DB_USER, TRAK_DB_PASSWORD e TRAK_DB_CONNECT_STRING.");
    }
    return oracledb.getConnection({
        user: TRAK_DB_USER,
        password: TRAK_DB_PASSWORD,
        connectString: TRAK_DB_CONNECT_STRING
    });
}
