using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApiAcademia.Business.DTOs.Response;

public class AlunoImcResponseDTO
{
    public string Nome { get; set; }

    public double Peso { get; set; }

    public double Altura { get; set; }

    public double Imc { get; set; }

    public string Classificacao { get; set; }
}
