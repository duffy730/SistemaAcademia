using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;

namespace ApiAcademia.Repository.Entities;

public class MatriculaEntitie
{
    public int Id { get; set; }
    public int AlunoId { get; set; }
    public int? PlanoId { get; set; }
    public bool Ativa { get; set; }
    public AlunoEntitie Aluno { get; set; }
    public PlanoEntitie Plano { get; set; }
    public string? Descricao { get; set; }
}
