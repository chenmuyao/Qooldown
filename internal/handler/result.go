package handler

const (
	CodeOK         = 2
	CodeRedirect   = 3
	CodeUserSide   = 4
	CodeServerSide = 5
)

type Result struct {
	Data any    `json:"data"`
	Msg  string `json:"message"`
	Code int    `json:"code"`
}

var InternalServerErrorResult = Result{
	Code: CodeServerSide,
	Msg:  "internal server error",
}
