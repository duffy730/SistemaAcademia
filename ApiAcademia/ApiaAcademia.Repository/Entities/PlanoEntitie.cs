using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiAcademia.Repository.Entities;

public class PlanoEntitie
{
    public int Id { get; set; }
    public string Nome { get; set; }
    public decimal Valor { get; set; }
    public string Descricao { get; set; }
    public int DuracaoDias { get; set; }
    public ICollection<MatriculaEntitie> Matriculas { get; set; }
    = new List<MatriculaEntitie>();
    [NotMapped]
    public int MatriculasAtivas { get; set; }
}
