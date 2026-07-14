using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApiAcademia.Business.DTOs.Response;

public class LoginDTO
{
    public string Usuario { get; set; }
    public string Senha { get; set; }
}