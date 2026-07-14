using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApiAcademia.Business.DTOs.Response;

public class PagamentoResponseDTO
{
    public int Id { get; set; }
    public int MatriculaId { get; set; }
    public string Descricao { get; set; }
    public decimal Valor { get; set; }
    public DateOnly DataPagamento { get; set; }
    public string MetodoPagamento { get; set; }
}
