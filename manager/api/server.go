package managerapi

import (
    "fmt"
    "log"
    "net/http"
    "encoding/json"
    "strings"
    "io"

    "github.com/gorilla/mux"
    managerdb "github.com/lumjjb/tornjak/manager/db"
)

type Server struct {
    listenAddr string
    db managerdb.ManagerDB
}

func (_ *Server) homePage(w http.ResponseWriter, r *http.Request){
    fmt.Fprintf(w, "Welcome to the HomePage!")
    fmt.Println("Endpoint Hit: homePage")
    cors(w,r)
}

func cors(w http.ResponseWriter, _ *http.Request) {
  w.Header().Set("Content-Type", "text/html; charset=ascii")
  w.Header().Set("Access-Control-Allow-Origin", "*")
  w.Header().Set("Access-Control-Allow-Headers","Content-Type,access-control-allow-origin, access-control-allow-headers")
  w.WriteHeader(http.StatusOK)
}


func (s *Server) entryList(w http.ResponseWriter, r *http.Request) {
  cors(w,r)
  vars := mux.Vars(r)
  serverName := vars["server"]

  fmt.Println(serverName)

  // Get server info
  sinfo, err := s.db.GetServer(serverName)
  if err != nil {
      emsg := fmt.Sprintf("Error getting server info: %v", err.Error())
      http.Error(w, emsg, http.StatusBadRequest)
      return
  }
  fmt.Printf("%+v\n", sinfo)

  client := sinfo.HttpClient()

  // Tornjak path to entry list api
  resp, err := client.Get(strings.TrimSuffix(sinfo.Address, "/") + "/api/entry/list")
  if err != nil {
      emsg := fmt.Sprintf("Error making api call to server: %v", err.Error())
      http.Error(w, emsg, http.StatusBadRequest)
      return
  }
  defer resp.Body.Close()
  copyHeader(w.Header(), resp.Header)
  w.WriteHeader(resp.StatusCode)
  io.Copy(w, resp.Body)
  //fileName := varId + ".html"
  //http.ServeFile(w,r,fileName)
}

func copyHeader(dst, src http.Header) {
    for k, vv := range src {
        for _, v := range vv {
            dst.Add(k, v)
        }
    }
}

func (s *Server) HandleRequests() {
    // TO implement
    rtr := mux.NewRouter()

    rtr.HandleFunc("/manager-api/server/list", s.serverList)
    rtr.HandleFunc("/manager-api/server/register", s.serverRegister)
    rtr.HandleFunc("/manager-api/entry/list/{server:.*}", s.entryList)

    //http.HandleFunc("/manager-api/get-server-info", s.agentList)
    //http.HandleFunc("/manager-api/agent/list/:id", s.agentList)
    
    http.Handle("/", rtr)
    fmt.Println("Starting to listen...")
    log.Fatal(http.ListenAndServe(s.listenAddr, nil))
}

/*

func main() {
  rtr := mux.NewRouter()
  rtr.HandleFunc("/number/{id:[0-9]+}", pageHandler)
  http.Handle("/", rtr)
  http.ListenAndServe(PORT, nil)
}
*/

// NewManagerServer returns a new manager server, given a listening address for the 
// server, and a DB connection string
func NewManagerServer(listenAddr, dbString string) (*Server, error) {
    db, err := managerdb.NewLocalSqliteDB(dbString)
    if err != nil {
        return nil, err
    }
    return &Server{
        listenAddr: listenAddr,
        db: db,
    }, nil
}


func (s *Server) serverList (w http.ResponseWriter, r *http.Request) {
    fmt.Println("Endpoint Hit: Server List")

    buf := new(strings.Builder)

    n, err := io.Copy(buf, r.Body)
    if err != nil {
        emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
        http.Error(w, emsg, http.StatusBadRequest)
        return
    }
    data := buf.String()

    var input ListServersRequest
    if n == 0 {
        input = ListServersRequest{}
    } else {
        err := json.Unmarshal([]byte(data), &input)
        if err != nil {
            emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
            http.Error(w, emsg, http.StatusBadRequest)
            return
        }
    }

    ret, err := s.ListServers(input)
    if err != nil {
        emsg := fmt.Sprintf("Error: %v", err.Error())
        http.Error(w, emsg, http.StatusBadRequest)
        return
    }

    je := json.NewEncoder(w)
    err = je.Encode(ret)
    if err != nil {
        emsg := fmt.Sprintf("Error encoding output: %v", err.Error())
        http.Error(w, emsg, http.StatusBadRequest)
        return
    }
    cors(w,r)
}

func (s *Server) serverRegister (w http.ResponseWriter, r *http.Request) {
    fmt.Println("Endpoint Hit: Server Create")

    buf := new(strings.Builder)

    n, err := io.Copy(buf, r.Body)
    if err != nil {
        emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
        http.Error(w, emsg, http.StatusBadRequest)
        return
    }
    data := buf.String()

    var input RegisterServerRequest
    if n == 0 {
        input = RegisterServerRequest{}
    } else {
        err := json.Unmarshal([]byte(data), &input)
        if err != nil {
            emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
            http.Error(w, emsg, http.StatusBadRequest)
            return
        }
    }

    err = s.RegisterServer(input)
    if err != nil {
        emsg := fmt.Sprintf("Error: %v", err.Error())
        http.Error(w, emsg, http.StatusBadRequest)
        return
    }

    w.Write([]byte("SUCCESS"))
    cors(w,r)
}

