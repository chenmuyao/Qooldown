package handler

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type WebSocketHandler struct{}

func NewWebSocketHandler() *WebSocketHandler {
	return &WebSocketHandler{}
}

func (h *WebSocketHandler) RegisterRoutes(server *gin.Engine) {
	server.GET("/ws", h.WsEndPoint)
}

type WebSocketConnection struct {
	*websocket.Conn
}

type WsPayload struct {
	Conn   WebSocketConnection `json:"-"`
	Action string              `json:"action"`
	// UserID int                 `json:"user_id"`
	// Message     string              `json:"message"`
	// UserName    string              `json:"user_name"`
	// MessageType string              `json:"message_type"`
}

type WsJSONResponse struct {
	Action  string `json:"action"`
	Message string `json:"message"`
	// UserID  int    `json:"user_id"`
}

var upgradeConnection = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// XXX:  hack
	CheckOrigin: func(r *http.Request) bool { return true },
}

var clients = make(map[WebSocketConnection]string)

var wsChan = make(chan WsPayload)

func (h *WebSocketHandler) WsEndPoint(ctx *gin.Context) {
	ws, err := upgradeConnection.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		slog.Error("ws upgrade connection error", "err", err)
		return
	}

	slog.Info("ws client connected", "addr", ctx.Request.RemoteAddr)
	var response WsJSONResponse
	response.Message = "Connected to server"

	err = ws.WriteJSON(response)
	if err != nil {
		slog.Error("ws writejson error", "err", err)
		return
	}

	conn := WebSocketConnection{Conn: ws}
	clients[conn] = ""

	go h.ListenForWS(&conn)
}

func (h *WebSocketHandler) ListenForWS(conn *WebSocketConnection) {
	defer func() {
		if r := recover(); r != nil {
			slog.Error("ws panic", "err", r)
		}
	}()

	var payload WsPayload

	for {
		err := conn.ReadJSON(&payload)
		if err != nil {
			// do nothing
			slog.Error("ws read json error", "err", err)
			break
		}
		payload.Conn = *conn
		wsChan <- payload
	}
}

func (h *WebSocketHandler) ListenToWsChannel() {
	var response WsJSONResponse
	for {
		e := <-wsChan
		response.Action = e.Action
		slog.Info("ws server received", "action", e.Action)
		h.broadcastToAll(response)

		// switch e.Action {
		// case "deleteUser":
		// 	response.Action = "logout"
		// 	response.Message = "Your account has ben deleted"
		// 	response.UserID = e.UserID
		// 	h.broadcastToAll(response)
		// default:
		// }
	}
}

func (app *WebSocketHandler) broadcastToAll(response WsJSONResponse) {
	for client := range clients {
		// broadcast to every connected client
		err := client.WriteJSON(response)
		if err != nil {
			slog.Error("ws error on action", "action", response.Action, "err", err)
			_ = client.Close()
			delete(clients, client)
		}
	}
}
