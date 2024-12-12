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
                } else if (data.type === "start_chat") {
                    const { userId, otherUserId } = data;
                
                    // Verificar se já existe um chat entre os dois usuários
                    connection.query(
                        `SELECT id_chat FROM chats 
                         WHERE (id_user1 = ? AND id_user2 = ?) 
                            OR (id_user1 = ? AND id_user2 = ?)`,
                        [userId, otherUserId, otherUserId, userId],
                        (err, results) => {
                            if (err) {
                                console.error("Erro ao verificar chat:", err);
                                return ws.send(JSON.stringify({ type: "error", message: "Erro ao verificar chat." }));
                            }
                
                            let chatId;
                            if (results.length > 0) {
                                // Chat já existe, usar o id_chat existente
                                chatId = results[0].id_chat;
                            } else {
                                // Chat não existe, criar um novo
                                connection.query(
                                    "INSERT INTO chats (id_user1, id_user2, data_criacao) VALUES (?, ?, NOW())",
                                    [userId, otherUserId],
                                    (err, result) => {
                                        if (err) {
                                            console.error("Erro ao criar chat:", err);
                                            return ws.send(JSON.stringify({ type: "error", message: "Erro ao criar chat." }));
                                        }
                                        chatId = result.insertId;
                
                                        // Retornar o ID do chat para o cliente
                                        ws.send(JSON.stringify({
                                            type: "chat_created",
                                            chatId: chatId,
                                            userId: otherUserId
                                        }));
                                    }
                                );
                            }
                
                            // Buscar mensagens históricas para o chat
                            connection.query(
                                `SELECT t.id_sender, t.id_receiver, t.message, t.sending_time, u.user_name AS senderName
                                 FROM Talk t
                                 JOIN Users u ON t.id_sender = u.id_user
                                 WHERE t.fk_chat = ?
                                 ORDER BY t.sending_time ASC`,
                                [chatId],
                                (err, messages) => {
                                    if (err) {
                                        console.error("Erro ao buscar histórico do chat:", err);
                                        return ws.send(JSON.stringify({ type: "error", message: "Erro ao buscar histórico do chat." }));
                                    }
                                    // Inclua o `sending_time` no formato ISO 8601
                                    const formattedMessages = messages.map(msg => ({
                                        ...msg,
                                        sending_time: new Date(msg.sending_time).toISOString()
                                    }));
                                    // Retornar histórico de mensagens
                                    ws.send(JSON.stringify({
                                        type: "chat_history",
                                        chatId: chatId,
                                        messages: messages
                                    }));
                                }
                            );
                        }
                    );
                }else if (data.type === "message") {
                    console.log("Mensagem recebida:", data);
                    connection.query(
                        "INSERT INTO Talk (id_sender, id_receiver, message, sending_time, fk_chat) VALUES (?, ?, ?, NOW(), ?)",
                        [data.userId, data.receiverId, data.message,data.chatId],
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
                            const sendingTime = new Date();
                            const senderName = results[0]?.user_name || "Desconhecido";
                
                            // Enviar mensagem para o destinatário
                            const recipient = clients.get(data.receiverId);
                            if (recipient && recipient.readyState === WebSocket.OPEN) {
                                recipient.send(JSON.stringify({
                                    type: "message",
                                    userId: data.userId,
                                    senderName: senderName, 
                                    message: data.message,
                                    timestamp: sendingTime.toISOString()
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
