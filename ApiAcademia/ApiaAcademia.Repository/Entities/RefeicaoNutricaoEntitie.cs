using System.ComponentModel.DataAnnotations;

namespace ApiAcademia.Repository.Entities;

public class RefeicaoNutricaoEntitie
{
    public int Id { get; set; }

    public int PlanoNutricaoId { get; set; }

    public PlanoNutricaoEntitie? PlanoNutricao { get; set; }

    [MaxLength(100)]
    public string Nome { get; set; } = string.Empty;

    [MaxLength(5)]
    public string Horario { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Alimentos { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Quantidades { get; set; } = string.Empty;

    public int Calorias { get; set; }

    public int Ordem { get; set; }
}
