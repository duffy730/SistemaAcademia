using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApiAcademia.Business.DTOs.Criar;

public class CriarProdutoDTO
{
    public string Nome { get; set; }
    public string Tipo { get; set; }
    public decimal Preco { get; set; }
    public int Estoque { get; set; }
}
