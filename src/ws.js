const WebSocket = require("ws");

module.exports = (server, connection) => {
    const wss = new WebSocket.Server({ server });

    const clients = new Map(); // Map para rastrear usuários conectados

    wss.on("connection", (ws) => {
        console.log("Novo cliente conectado!");

        ws.on("message", (message) => {
            try {
                const data = JSON.parse(message);

                if (data.type === "login") {
                    // Rastrear cliente com ID de usuário
                    clients.set(data.userId, ws);
                    connection.query(
                        "UPDATE Users SET is_online = TRUE WHERE id_user = ?",
                        [data.userId],
                        (err) => {
                            if (err) console.error("Erro ao atualizar status online:", err);
                        }
                    );
                } else if (data.type === "message") {
                    console.log("Mensagem recebida:", data);
                    connection.query(
                        "INSERT INTO Talk (id_sender, id_receiver, message, sending_time) VALUES (?, ?, ?, NOW())",
                        [data.userId, data.receiverId, data.message],
                        (err) => {
                            if (err) console.error("Erro ao salvar mensagem:", err);
                        }
                    );
                
                    // Buscar o nome do remetente no banco de dados
                    connection.query(
                        "SELECT user_name FROM Users WHERE id_user = ?",
                        [data.userId],
                        (err, results) => {
                            if (err) {
                                console.error("Erro ao buscar nome do remetente:", err);
                                return;
                            }
                
                            const senderName = results[0]?.user_name || "Desconhecido";
                
                            // Enviar mensagem para o destinatário
                            const recipient = clients.get(data.receiverId);
                            if (recipient && recipient.readyState === WebSocket.OPEN) {
                                recipient.send(JSON.stringify({
                                    type: "message",
                                    userId: data.userId,
                                    senderName: senderName, // Nome do remetente
                                    message: data.message,
                                }));
                            }
                        }
                    );
                }
                
            } catch (err) {
                console.error("Erro ao processar mensagem:", err.message);
            }
        });

        ws.on("close", () => {
            console.log("Cliente desconectado.");
            for (const [userId, client] of clients.entries()) {
                if (client === ws) {
                    clients.delete(userId);
                    connection.query(
                        "UPDATE Users SET is_online = FALSE WHERE id_user = ?",
                        [userId],
                        (err) => {
                            if (err) console.error("Erro ao atualizar status offline:", err);
                        }
                    );
                    break;
                }
            }
        });
    });
};
