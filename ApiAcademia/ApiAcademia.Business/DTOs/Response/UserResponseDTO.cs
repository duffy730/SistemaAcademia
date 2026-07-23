using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApiAcademia.Business.DTOs.Response;

public class UserResponseDTO
{
    public int Id { get; set; }

    public string Nome { get; set; } = string.Empty;

    public string Usuario { get; set; } = string.Empty;

    public string Perfil { get; set; } = string.Empty;

    public string Senha { get; set; } = string.Empty;
}