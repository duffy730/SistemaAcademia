using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApiAcademia.Business.DTOs.Response;

public class ProdutoResponseDTO
{
    public int Id { get; set; }
    public string Nome { get; set; }
    public string Tipo { get; set; }
    public decimal Preco { get; set; }
    public int Estoque { get; set; }
}
