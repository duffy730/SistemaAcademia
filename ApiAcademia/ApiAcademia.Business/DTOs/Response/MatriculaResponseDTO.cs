using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApiAcademia.Business.DTOs.Response;

public class MatriculaResponseDTO
{
    public int Id { get; set; }

    public int AlunoId { get; set; }

    public int? PlanoId { get; set; }

    public string Aluno { get; set; }

    public string Plano { get; set; }

    public bool Ativa { get; set; }

    public string Descricao { get; set; }

    public string Status { get; set; } =
    string.Empty;

    public bool TemPagamentoPendente { get; set; }
}
