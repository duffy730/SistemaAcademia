using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApiAcademia.Business.DTOs.Criar;

public class CriarPlanoDTO
{
    public string Nome { get; set; }
    public decimal Valor { get; set; }
    public int DuracaoDias { get; set; }
    public string Descricao { get; set; }
}
