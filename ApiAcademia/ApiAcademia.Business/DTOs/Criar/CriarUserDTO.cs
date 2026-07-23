using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApiAcademia.Business.DTOs.Criar;

public enum Roles
{
    User = 0,
    Admin = 1,
    Recepcionista = 2,
    Nutri = 3,
    Aluno = 4
}
public class CriarUserDTO
{
    public string Nome { get; set; }
    public string Usuario { get; set; }
    public string Senha { get; set; }
    public Roles Role { get; set; }
}
