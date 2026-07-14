using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApiAcademia.Business.DTOs.Response;

public class EstatisticaResponseDTO
{
    public int AlunosAtivos { get; set; }
    public int QtdMatriculas { get; set; }
    public decimal Faturamento { get; set; }
}
