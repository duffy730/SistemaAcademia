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

    public int? ProdutoId { get; set; }

    public int Quantidade { get; set; }

    public string Descricao { get; set; } =
        string.Empty;

    public decimal Valor { get; set; }

    public string MetodoPagamento { get; set; } =
        string.Empty;

    public DateOnly DataPagamento { get; set; }
    public string Status { get; set; } =
    string.Empty;
}