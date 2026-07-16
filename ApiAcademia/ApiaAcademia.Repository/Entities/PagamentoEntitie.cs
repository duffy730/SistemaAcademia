using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApiAcademia.Repository.Entities;

public class PagamentoEntitie
{
    public int Id { get; set; }

    public int MatriculaId { get; set; }

    public string Descricao { get; set; }

    public decimal Valor { get; set; }

    public DateOnly DataPagamento { get; set; }

    public string MetodoPagamento { get; set; }

    public int? ProdutoId { get; set; }
    public ProdutosEntitie? Produto { get; set; }
    public int Quantidade { get; set; }
}